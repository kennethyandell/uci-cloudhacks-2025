// Simple JS to demonstrate interactivity:
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('actionBtn');
    btn.addEventListener('click', () => {
    alert('Button clicked!');
    });
    document.getElementById('menu1').addEventListener('click', menu1Click);
    document.getElementById('menu2').addEventListener('click', menu2Click);
    document.getElementById('menu3').addEventListener('click', menu3Click);
});
function menu1Click(event) {
  console.log('Menu 1 clicked');
  // TODO: put your code here
}

function menu2Click(event) {
  console.log('Menu 2 clicked');
  // TODO: put your code here
}

function menu3Click(event) {
  console.log('Menu 3 clicked');
  // TODO: put your code here
}
