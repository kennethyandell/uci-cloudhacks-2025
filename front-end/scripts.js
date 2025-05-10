// Simple JS to demonstrate interactivity:
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('actionBtn');
    btn.addEventListener('click', () => {
    alert('Button clicked!');
    });
    console.log('Page loaded – sidebar width:', document.querySelector('.sidebar').offsetWidth);
});
