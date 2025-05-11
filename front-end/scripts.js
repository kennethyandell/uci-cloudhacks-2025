const SVG_NS = 'http://www.w3.org/2000/svg';
function wrapTextGreedy(text, maxCharsPerLine) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';

  words.forEach(word => {
    const test = line ? line + ' ' + word : word;
    if (test.length <= maxCharsPerLine) {
      line = test;
    } else {
      if (line) lines.push(line);
      line = word.length > maxCharsPerLine
        ? word.slice(0, maxCharsPerLine)  // force-break very long words
        : word;
    }
  });

  if (line) lines.push(line);
  return lines;
}
/**
 * Given an SVG note and raw text, find the largest integer fontSize
 * such that all wrapped lines fit within the note’s width/height.
 */
function fitTextToNote(note, rawText) {
  const rectW = +note.getAttribute('width');
  const rectH = +note.getAttribute('height');
  const padding = 10;             // px inset inside the note
  let fontSize = 16;              // start a bit larger
  let lines, lineHeight;

  do {
    // estimate max chars per line (approx 0.6*fontSize pixels per char)
    const maxChars  = Math.floor((rectW - padding*2) / (fontSize * 0.6));
    lines           = wrapTextGreedy(rawText, maxChars);
    lineHeight      = fontSize * 1.2;
    // shrink font if total height exceeds available space
    if (lines.length * lineHeight > (rectH - padding*2)) {
      fontSize--;
    } else {
      break;
    }
  } while (fontSize >= 8);

  return { fontSize, lines, lineHeight, padding };
}
const canvas = document.getElementById('canvas-svg');
const addBtn = document.getElementById('add-note-btn');
document.addEventListener('DOMContentLoaded', () => {
    // Cache menu items and pages
    const menuItems = document.querySelectorAll('.sidebar .menu-item');
    const pages     = document.querySelectorAll('.sidebar-page');

    // Helper to show a page by its ID
    function showPage(pageId) {
        pages.forEach(p => {
        p.classList.toggle('active', p.id === pageId);
      });
      
      document.getElementById('generateIdeaBtn').addEventListener('click', onGenerateIdea);
      document.getElementById('guideMeBtn').addEventListener('click', onGuideMe);
      document.getElementById('organizeIdeasBtn').addEventListener('click', onOrganizeIdeas);
      }
    menuItems.forEach(item => {
    item.addEventListener('click', () => {
        const target = item.getAttribute('data-page');
        showPage(target);
        console.log(`${item.textContent} → ${target}`);
    })
  });
});

// Placeholder handlers — replace with real logic later:
function onGenerateIdea(evt) {
    const prompt = document.getElementById('generateInput').value;
    console.log('Generate Idea clicked – prompt:', prompt);
    requestGenerateIdea()
}

function onGuideMe(evt) {
    console.log('Guide Me clicked');
  // TODO: guideMe()
}

function onOrganizeIdeas(evt) {
  console.log('Organize Ideas clicked');
  // TODO: organizeIdeas()
}

function requestGenerateIdea() {
    const apiUrl = "https://z97z0fx1md.execute-api.us-west-2.amazonaws.com/default/generate-ideas-claude";
    const data = {}
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Access-Control-Allow-Origin": "*",
            'origin': 'https://main.d1zfh5jl8g0um5.amplifyapp.com/',
            "Access-Control-Request-Method": "*"

        },
        body: JSON.stringify(data),
    }

    fetch(apiUrl, requestOptions)
        .then(response => {
            return response.json();
        })
        .then(data => {
            console.log(JSON.stringify(data, null, 2))
        })
}

// Simple tab switching for sidebar pages
document.querySelectorAll('.menu-item').forEach(item => {
  item.addEventListener('click', () => {
    // hide all pages
    document.querySelectorAll('.sidebar-page').forEach(p => p.classList.remove('active'));
    // show target
    const page = document.getElementById(item.dataset.page);
    if (page) page.classList.add('active');
  });
});
// 1) Replace createStickyNote() with this:
function createStickyNote() {
  const note = document.createElementNS(SVG_NS, 'svg');
  note.classList.add('sticky-note');
  note.setAttribute('x', 50);   // initial position
  note.setAttribute('y', 50);
  note.setAttribute('width', 150);
  note.setAttribute('height', 150);
  note.style.pointerEvents = 'all';

  // background rectangle
  const rect = document.createElementNS(SVG_NS, 'rect');
  rect.setAttribute('width', 150);
  rect.setAttribute('height', 150);
  rect.setAttribute('fill', '#fff59d');
  rect.setAttribute('stroke', '#fbc02d');
  note.appendChild(rect);

  // placeholder SVG <text> for displaying note text
  const textEl = document.createElementNS(SVG_NS, 'text');
  textEl.setAttribute('x', 10);
  textEl.setAttribute('y', 20);
  textEl.setAttribute('font-size', '14');
  textEl.setAttribute('fill', '#000');
  note.appendChild(textEl);

  // on double-click, open the HTML editor
  note.addEventListener('dblclick', () => openNoteEditor(note));

  canvas.appendChild(note);
  makeDraggable(note);
}

addBtn.addEventListener('click', createStickyNote);


// 2) Add this helper below:
function openNoteEditor(note) {
  const container = document.querySelector('.main-content');
  const noteRect  = note.getBoundingClientRect();
  const contRect  = container.getBoundingClientRect();

  // create a <textarea> over the note
  const ta = document.createElement('textarea');
  ta.value = note.getAttribute('data-text') || '';
  Object.assign(ta.style, {
    position:   'absolute',
    left:       `${noteRect.left - contRect.left}px`,
    top:        `${noteRect.top  - contRect.top }px`,
    width:      `${noteRect.width}px`,
    height:     `${noteRect.height}px`,
    fontSize:   '14px',
    resize:     'none',
    padding:    '4px',
    boxSizing:  'border-box',
    border:     '1px solid #fbc02d',
    background: '#fff59d',
    zIndex:     1000,
  });

  container.appendChild(ta);
  ta.focus();

  // When done editing (blur or Enter), write back and remove the textarea
  function finish() {
  const text = ta.value.trim();
  note.setAttribute('data-text', text);

  // 1) Compute best font & wrapping
  const { fontSize, lines, lineHeight, padding } = fitTextToNote(note, text);

  // 2) Update the SVG <text> element
  const textEl = note.querySelector('text');
  textEl.setAttribute('font-size', fontSize);
  // clear old content
  while (textEl.firstChild) textEl.removeChild(textEl.firstChild);
  // paint new lines
  lines.forEach((line, i) => {
    const tspan = document.createElementNS(SVG_NS, 'tspan');
    tspan.setAttribute('x', padding);
    tspan.setAttribute('dy', i === 0 ? `${fontSize}` : `${lineHeight}`);
    tspan.textContent = line;
    textEl.appendChild(tspan);
  });

  // 3) Tear down the editor overlay
  container.removeChild(ta);
}

  ta.addEventListener('blur', finish);
  ta.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      ta.blur();
    }
  });
}


addBtn.addEventListener('click', createStickyNote);

function makeDraggable(el) {
  let offsetX, offsetY;
  const startDrag = e => {
    e.preventDefault();
    const pt = canvas.createSVGPoint();
    pt.x = (e.touches ? e.touches[0].clientX : e.clientX);
    pt.y = (e.touches ? e.touches[0].clientY : e.clientY);
    const svgP = pt.matrixTransform(canvas.getScreenCTM().inverse());
    offsetX = svgP.x - +el.getAttribute('x');
    offsetY = svgP.y - +el.getAttribute('y');
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('touchmove', onDrag);
    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchend', endDrag);
  };
  const onDrag = e => {
    const pt = canvas.createSVGPoint();
    pt.x = (e.touches ? e.touches[0].clientX : e.clientX);
    pt.y = (e.touches ? e.touches[0].clientY : e.clientY);
    const svgP = pt.matrixTransform(canvas.getScreenCTM().inverse());
    el.setAttribute('x', svgP.x - offsetX);
    el.setAttribute('y', svgP.y - offsetY);
  };
  const endDrag = () => {
    window.removeEventListener('mousemove', onDrag);
    window.removeEventListener('touchmove', onDrag);
    window.removeEventListener('mouseup', endDrag);
    window.removeEventListener('touchend', endDrag);
  };
  el.addEventListener('mousedown', startDrag);
  el.addEventListener('touchstart', startDrag);
}
