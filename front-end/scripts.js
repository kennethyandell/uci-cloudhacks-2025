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

  // Wire up each menu-item to swap pages
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
  // TODO: generateIdea(prompt)
}

function onGuideMe(evt) {
  console.log('Guide Me clicked');
  // TODO: guideMe()
}

function onOrganizeIdeas(evt) {
  console.log('Organize Ideas clicked');
  // TODO: organizeIdeas()
}