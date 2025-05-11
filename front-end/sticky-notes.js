// sticky-notes.js (updated with larger trashcan & shake effect)
const SVG_NS = 'http://www.w3.org/2000/svg';
const canvas  = document.getElementById('canvas-svg');
const addBtn  = document.getElementById('add-note-btn');

// — Inject shake animation styles —
(function injectShakeStyle() {
  const style = document.createElement('style');
  style.textContent = `
    .sticky-note.shake {
      animation: iphone-jiggle 0.12s infinite alternate;
      transform-origin: center center;
    }
    @keyframes iphone-jiggle {
      0%   { transform: rotate(-1.5deg); }
      100% { transform: rotate(1.5deg); }
    }
  `;
  document.head.appendChild(style);
})();

// --- Trashcan setup (bigger) ---
let trashcanFO = null;
(function createTrashcan() {
  const size = 60;            // increased from 40
  const padding = 10;
  const x = canvas.clientWidth - size - padding;
  const y = padding;

  trashcanFO = document.createElementNS(SVG_NS, 'foreignObject');
  trashcanFO.setAttribute('x', x);
  trashcanFO.setAttribute('y', y);
  trashcanFO.setAttribute('width', size);
  trashcanFO.setAttribute('height', size);

  const div = document.createElement('div');
  div.style.width = '100%';
  div.style.height = '100%';
  div.style.display = 'flex';
  div.style.alignItems = 'center';
  div.style.justifyContent = 'center';

  const icon = document.createElement('i');
  icon.classList.add('fa-solid', 'fa-trash-can');
  icon.style.fontSize = '32px';  // larger icon
  icon.style.color = '#333';
  div.appendChild(icon);

  trashcanFO.appendChild(div);
  canvas.appendChild(trashcanFO);
})();

// Greedy text wrapping
function wrapTextGreedy(text, maxCharsPerLine) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  words.forEach(word => {
    const test = line ? line + ' ' + word : word;
    if (test.length <= maxCharsPerLine) line = test;
    else {
      if (line) lines.push(line);
      line = word.length > maxCharsPerLine
        ? word.slice(0, maxCharsPerLine)
        : word;
    }
  });
  if (line) lines.push(line);
  return lines;
}

// Fit text inside note
function fitTextToNote(note, rawText) {
  const rectW = +note.getAttribute('width');
  const rectH = +note.getAttribute('height');
  const padding = 10;
  let fontSize = 16;
  let lines, lineHeight;

  do {
    const maxChars = Math.floor((rectW - padding*2) / (fontSize * 0.6));
    lines = wrapTextGreedy(rawText, maxChars);
    lineHeight = fontSize * 1.2;
    if (lines.length * lineHeight > (rectH - padding*2)) fontSize--;
    else break;
  } while (fontSize >= 8);

  return { fontSize, lines, lineHeight, padding };
}

// Create a new sticky note
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

// Double-click editor overlay
function openNoteEditor(note) {
  const container = document.querySelector('.main-content');
  const noteRect = note.getBoundingClientRect();
  const contRect = container.getBoundingClientRect();
  const ta = document.createElement('textarea');
  ta.value = note.getAttribute('data-text') || '';
  Object.assign(ta.style, {
    position: 'absolute',
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
    lines.forEach((l, i) => {
      const tspan = document.createElementNS(SVG_NS, 'tspan');
      tspan.setAttribute('x', padding);
      tspan.setAttribute('dy', i === 0 ? `${fontSize}` : `${lineHeight}`);
      tspan.textContent = l;
      textEl.appendChild(tspan);
    });
    container.removeChild(ta);
  }
  ta.addEventListener('blur', finish);
  ta.addEventListener('keydown', e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); finish(); } });
}

// Draggable notes with proximity-based shake & trash
function makeDraggable(el) {
  let offsetX, offsetY;
  let trashRect;

  const startDrag = e => {
    e.preventDefault();
    const pt = canvas.createSVGPoint();
    pt.x = (e.touches ? e.touches[0].clientX : e.clientX);
    pt.y = (e.touches ? e.touches[0].clientY : e.clientY);
    const svgP = pt.matrixTransform(canvas.getScreenCTM().inverse());
    offsetX = svgP.x - +el.getAttribute('x');
    offsetY = svgP.y - +el.getAttribute('y');
    trashRect = trashcanFO.getBoundingClientRect();
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

    // proximity check for shake
    const noteRect = el.getBoundingClientRect();
    const centerX  = noteRect.left + noteRect.width/2;
    const centerY  = noteRect.top  + noteRect.height/2;
    const margin   = 20;
    if (
      centerX >= trashRect.left - margin && centerX <= trashRect.right + margin &&
      centerY >= trashRect.top  - margin && centerY <= trashRect.bottom + margin
    ) {
      el.classList.add('shake');
    } else {
      el.classList.remove('shake');
    }
  };

  const endDrag = () => {
    window.removeEventListener('mousemove', onDrag);
    window.removeEventListener('touchmove', onDrag);
    window.removeEventListener('mouseup',   endDrag);
    window.removeEventListener('touchend',  endDrag);

    el.classList.remove('shake');
    const noteRect  = el.getBoundingClientRect();
    const centerX   = noteRect.left + noteRect.width/2;
    const centerY   = noteRect.top  + noteRect.height/2;
    if (
      centerX >= trashRect.left && centerX <= trashRect.right &&
      centerY >= trashRect.top  && centerY <= trashRect.bottom
    ) {
      canvas.removeChild(el);
    }
  };

  el.addEventListener('mousedown', startDrag);
  el.addEventListener('touchstart', startDrag);
}

// initial note
createStickyNote();
