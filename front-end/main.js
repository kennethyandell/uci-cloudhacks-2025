// main.js
document.addEventListener('DOMContentLoaded', () => {
  // — Sidebar tab switching —
  const menuItems = document.querySelectorAll('.sidebar .menu-item');
  const pages     = document.querySelectorAll('.sidebar-page');

  function showPage(pageId) {
    pages.forEach(p => p.classList.toggle('active', p.id === pageId));
    console.log(`Switched to ${pageId}`);
  }

  menuItems.forEach(item => {
    item.addEventListener('click', () => showPage(item.dataset.page));
  });

  // — Subpage button handlers —
  document.getElementById('generateIdeaBtn').addEventListener('click', onGenerateIdea);
  document.getElementById('guideMeBtn').addEventListener('click', onGuideMe);
  document.getElementById('organizeIdeasBtn').addEventListener('click', onOrganizeIdeas);
});

// Placeholder logic—swap in your real implementations:
function onGenerateIdea(evt) {
  const prompt = document.getElementById('generateInput').value;
  console.log('Generate Idea → prompt:', prompt);
  requestGenerateIdea(prompt);
}

function onGuideMe(evt) {
  console.log('Guide Me clicked');
  // TODO: implement guideMe()
}

function onOrganizeIdeas(evt) {
  console.log('Organize Ideas clicked');
  // TODO: implement organizeIdeas()
}


function requestGenerateIdea(prompt) {
    const whiteBoard = document.getElementById('canvas-svg').outerHTML
    const apiUrl = 'https://z97z0fx1md.execute-api.us-west-2.amazonaws.com/default/generate-ideas-claude';
    const data = {
        "whiteboard": whiteBoard
    };
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://main.d1zfh5jl8g0um5.amplifyapp.com',
            'origin': 'https://main.d1zfh5jl8g0um5.amplifyapp.com/',
            'Access-Control-Request-Method': '*'
    },
    body: JSON.stringify(data)
  };

  console.log(data)
  fetch(apiUrl, requestOptions)
    .then(res => res.json())
    .then(json => console.log('API response:', json.body))
    .catch(err => console.error('API error:', err));
}
