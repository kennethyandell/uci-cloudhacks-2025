// sticky-notes.js
const SVG_NS = 'http://www.w3.org/2000/svg';
const canvas  = document.getElementById('canvas-svg');
const addBtn  = document.getElementById('add-note-btn');

// 1) Text-wrapping (greedy)
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
        ? word.slice(0, maxCharsPerLine)
        : word;
    }
  });

  if (line) lines.push(line);
  return lines;
}

// 2) Fit font size & wrap into the SVG note bounds
function fitTextToNote(note, rawText) {
  const rectW   = +note.getAttribute('width');
  const rectH   = +note.getAttribute('height');
  const padding = 10;
  let fontSize  = 16;
  let lines, lineHeight;

  do {
    const maxChars  = Math.floor((rectW - padding*2) / (fontSize * 0.6));
    lines           = wrapTextGreedy(rawText, maxChars);
    lineHeight      = fontSize * 1.2;
    if (lines.length * lineHeight > (rectH - padding*2)) {
      fontSize--;
    } else {
      break;
    }
  } while (fontSize >= 8);

  return { fontSize, lines, lineHeight, padding };
}

// 3) Create a new SVG “sticky note”
function createStickyNote() {
  const note = document.createElementNS(SVG_NS, 'svg');
  note.classList.add('sticky-note');
  note.setAttribute('x', 50);
  note.setAttribute('y', 50);
  note.setAttribute('width', 150);
  note.setAttribute('height', 150);
  note.style.pointerEvents = 'all';

  const rect = document.createElementNS(SVG_NS, 'rect');
  rect.setAttribute('width', 150);
  rect.setAttribute('height', 150);
  rect.setAttribute('fill', '#fff59d');
  rect.setAttribute('stroke', '#fbc02d');
  note.appendChild(rect);

  const textEl = document.createElementNS(SVG_NS, 'text');
  textEl.setAttribute('x', 10);
  textEl.setAttribute('y', 20);
  textEl.setAttribute('font-size', '14');
  textEl.setAttribute('fill', '#000');
  note.appendChild(textEl);

  note.addEventListener('dblclick', () => openNoteEditor(note));

  canvas.appendChild(note);
  makeDraggable(note);
}

addBtn.addEventListener('click', createStickyNote);

// 4) Double-click editor overlay
function openNoteEditor(note) {
  const container = document.querySelector('.main-content');
  const noteRect  = note.getBoundingClientRect();
  const contRect  = container.getBoundingClientRect();

  const ta = document.createElement('textarea');
  ta.value = note.getAttribute('data-text') || '';
  Object.assign(ta.style, {
    position:  'absolute',
    left:      `${noteRect.left - contRect.left}px`,
    top:       `${noteRect.top  - contRect.top }px`,
    width:     `${noteRect.width}px`,
    height:    `${noteRect.height}px`,
    fontSize:  '14px',
    resize:    'none',
    padding:   '4px',
    boxSizing: 'border-box',
    border:    '1px solid #fbc02d',
    background:'#fff59d',
    zIndex:    1000
  });
  container.appendChild(ta);
  ta.focus();

  function finish() {
    const text = ta.value.trim();
    note.setAttribute('data-text', text);
    const { fontSize, lines, lineHeight, padding } = fitTextToNote(note, text);

    const textEl = note.querySelector('text');
    textEl.setAttribute('font-size', fontSize);
    while (textEl.firstChild) textEl.removeChild(textEl.firstChild);

    lines.forEach((line, i) => {
      const tspan = document.createElementNS(SVG_NS, 'tspan');
      tspan.setAttribute('x', padding);
      tspan.setAttribute('dy', i === 0 ? `${fontSize}` : `${lineHeight}`);
      tspan.textContent = line;
      textEl.appendChild(tspan);
    });

    container.removeChild(ta);
  }

  ta.addEventListener('blur', finish);
  ta.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      finish();
    }
  });
}

// 5) Enable dragging on an SVG element
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
    window.addEventListener('mouseup',   endDrag);
    window.addEventListener('touchend',  endDrag);
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
    window.removeEventListener('mouseup',   endDrag);
    window.removeEventListener('touchend',  endDrag);
  };

  el.addEventListener('mousedown', startDrag);
  el.addEventListener('touchstart', startDrag);
}
