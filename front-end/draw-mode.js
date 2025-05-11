// draw-mode.js
// Implements Draw Mode features: draggable headers, intuitive line drawing, header placement, sticky-note selection indicator, and color selection

document.addEventListener('DOMContentLoaded', () => {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const canvas = document.getElementById('canvas-svg');
  const drawPage = document.getElementById('page3');

  // State variables
  let lineToolActive = false;
  let addingHeader = false;

  // Line-drawing state
  let isDrawing = false;
  let lineStart = null;
  let previewLine = null;

  // Header-dragging state
  let draggingEl = null;
  let dragOffset = { x: 0, y: 0 };

  // Currently selected sticky note
  let selectedNote = null;

  // --- Helper functions ---
  function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function rgbToHex(rgb) {
    if (rgb.startsWith('#')) return rgb;
    const nums = rgb.match(/(\d+),\s*(\d+),\s*(\d+)/);
    if (!nums) return '#000000';
    return '#'+[1,2,3].map(i => {
      const h = parseInt(nums[i]).toString(16);
      return h.length === 1 ? '0'+h : h;
    }).join('');
  }

  // --- UI Controls ---
  const lineToolBtn = document.createElement('button');
  lineToolBtn.id = 'draw-line-btn';
  lineToolBtn.className = 'subpage-btn';
  lineToolBtn.textContent = 'Line Tool';

  const colorPickerLabel = document.createElement('label');
  colorPickerLabel.htmlFor = 'note-color-picker';
  colorPickerLabel.textContent = 'Sticky Note Color:';
  colorPickerLabel.style.display = 'block';
  colorPickerLabel.style.margin = '10px 0 4px';

  const colorPicker = document.createElement('input');
  colorPicker.type = 'color';
  colorPicker.id = 'note-color-picker';
  colorPicker.value = '#fff59d';

  const headerTextInput = document.createElement('input');
  headerTextInput.id = 'header-text-input';
  headerTextInput.className = 'subpage-input';
  headerTextInput.placeholder = 'Enter header text…';

  const addHeaderBtn = document.createElement('button');
  addHeaderBtn.id = 'add-header-btn';
  addHeaderBtn.className = 'subpage-btn';
  addHeaderBtn.textContent = 'Add Header';

  [lineToolBtn, colorPickerLabel, colorPicker, headerTextInput, addHeaderBtn]
    .forEach(el => drawPage.appendChild(el));

  // --- Event Listeners ---

  // Toggle Line Tool
  lineToolBtn.addEventListener('click', () => {
    lineToolActive = !lineToolActive;
    lineToolBtn.classList.toggle('active', lineToolActive);
    if (!lineToolActive && previewLine) {
      canvas.removeChild(previewLine);
      previewLine = null;
      isDrawing = false;
      lineStart = null;
    }
  });

  // Begin Header Placement
  addHeaderBtn.addEventListener('click', () => {
    addingHeader = true;
    addHeaderBtn.textContent = 'Click Canvas';
  });

  // Canvas: mousedown handles header dragging and line start
  canvas.addEventListener('mousedown', e => {
    const { x, y } = getMousePos(e);
    const target = e.target;

    // Header dragging start
    if (target.nodeName === 'text' && !lineToolActive && !addingHeader) {
      draggingEl = target;
      const tx = parseFloat(draggingEl.getAttribute('x'));
      const ty = parseFloat(draggingEl.getAttribute('y'));
      dragOffset.x = x - tx;
      dragOffset.y = y - ty;
      return;
    }

    // Line drawing start
    if (lineToolActive) {
      isDrawing = true;
      lineStart = { x, y };
      previewLine = document.createElementNS(SVG_NS, 'line');
      previewLine.setAttribute('x1', x);
      previewLine.setAttribute('y1', y);
      previewLine.setAttribute('x2', x);
      previewLine.setAttribute('y2', y);
      previewLine.setAttribute('stroke', '#000');
      previewLine.setAttribute('stroke-width', '2');
      previewLine.setAttribute('stroke-dasharray', '4');
      canvas.appendChild(previewLine);
    }
  });

  // Canvas: mousemove updates dragging or preview line
  canvas.addEventListener('mousemove', e => {
    const { x, y } = getMousePos(e);
    if (draggingEl) {
      draggingEl.setAttribute('x', x - dragOffset.x);
      draggingEl.setAttribute('y', y - dragOffset.y);
      return;
    }
    if (lineToolActive && isDrawing && previewLine) {
      previewLine.setAttribute('x2', x);
      previewLine.setAttribute('y2', y);
    }
  });

  // Canvas: mouseup finalizes drag or line
  canvas.addEventListener('mouseup', e => {
    const { x, y } = getMousePos(e);
    if (draggingEl) {
      draggingEl = null;
      return;
    }
    if (lineToolActive && isDrawing) {
      isDrawing = false;
      canvas.removeChild(previewLine);
      const line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('x1', lineStart.x);
      line.setAttribute('y1', lineStart.y);
      line.setAttribute('x2', x);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', '#000');
      line.setAttribute('stroke-width', '2');
      canvas.appendChild(line);
      previewLine = null;
      lineStart = null;
    }
  });

  // Canvas: click handles header placement and note selection
  canvas.addEventListener('click', e => {
    const { x, y } = getMousePos(e);

    // Header placement
    if (addingHeader) {
      const textEl = document.createElementNS(SVG_NS, 'text');
      textEl.setAttribute('x', x);
      textEl.setAttribute('y', y);
      textEl.setAttribute('font-size', '24');
      textEl.setAttribute('font-family', 'Roboto, sans-serif');
      textEl.setAttribute('fill', '#333');
      textEl.setAttribute('cursor', 'move');
      textEl.textContent = headerTextInput.value;
      canvas.appendChild(textEl);
      addingHeader = false;
      addHeaderBtn.textContent = 'Add Header';
      headerTextInput.value = '';
      return;
    }

    // Sticky note selection indicator
    const noteEl = e.target.closest('.sticky-note');
    if (noteEl) {
      // Deselect previous notes
      document.querySelectorAll('.sticky-note.selected').forEach(n => {
        n.classList.remove('selected');
        const r = n.querySelector('rect');
        r.removeAttribute('stroke');
        r.removeAttribute('stroke-width');
      });
      // Select this note
      noteEl.classList.add('selected');
      selectedNote = noteEl;
      const rectNode = noteEl.querySelector('rect');
      rectNode.setAttribute('stroke', '#333');
      rectNode.setAttribute('stroke-width', '3');
      // Sync color picker
      colorPicker.value = rgbToHex(rectNode.getAttribute('fill'));
    }
  });

  // Color picker: apply to selected note
  colorPicker.addEventListener('input', () => {
    if (selectedNote) {
      const rectNode = selectedNote.querySelector('rect');
      rectNode.setAttribute('fill', colorPicker.value);
      selectedNote.setAttribute('data-color', colorPicker.value);
    }
  });
});
