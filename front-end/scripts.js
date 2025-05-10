document.addEventListener('DOMContentLoaded', () => {
  // Cache menu items and pages
  const menuItems = document.querySelectorAll('.sidebar .menu-item');
  const pages     = document.querySelectorAll('.sidebar-page');

  // Helper to show a page by its ID
  function showPage(pageId) {
    pages.forEach(p => {
      p.classList.toggle('active', p.id === pageId);
    });
  }

  // Wire up each menu-item to swap pages
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      const target = item.getAttribute('data-page');
      showPage(target);
      console.log(`${item.textContent} → ${target}`);
    });
  });

  // Your existing button logic
  document.getElementById('actionBtn')
    .addEventListener('click', () => alert('Button clicked!'));
});
