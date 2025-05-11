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

    // Your existing button logic
    document.getElementById('actionBtn')
        .addEventListener('click', () => alert('Button clicked!'));
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
    const apiUrl = "https://qz31d41psl.execute-api.us-west-2.amazonaws.com/default/generate-ideas-claude";
    const data = {}
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify(data),
    }

    fetch(apiUrl, requestOptions)
        .then(response => {
            return response.json();
        })
        .then(data => {
            outputElement.textContent = JSON.stringify(data, null, 2);
            console.log(outputElement)
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