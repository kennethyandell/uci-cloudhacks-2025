const SVG_NS = 'http://www.w3.org/2000/svg';
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

function createStickyNote() {
  const note = document.createElementNS(SVG_NS, 'svg');
  note.setAttribute('class', 'sticky-note');
  note.setAttribute('x', 50);  // initial position
  note.setAttribute('y', 50);
  note.setAttribute('width', 150);
  note.setAttribute('height', 150);

  const rect = document.createElementNS(SVG_NS, 'rect');
  rect.setAttribute('width', 150);
  rect.setAttribute('height', 150);
  rect.setAttribute('fill', '#fff59d');
  rect.setAttribute('stroke', '#fbc02d');
  note.appendChild(rect);

  canvas.appendChild(note);
  makeDraggable(note);
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
