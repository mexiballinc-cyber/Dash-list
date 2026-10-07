// app.js - Control del estado y switch de packs
document.addEventListener('DOMContentLoaded', () => {
  updateUIImages();

  // Toggle de Menú Lateral
  const menuToggleBtn = document.getElementById('menuToggleBtn');
  const sideMenu = document.getElementById('sideMenu');
  
  menuToggleBtn?.addEventListener('click', () => {
    sideMenu.classList.toggle('translate-x-full');
  });

  // Toggle Tema Claro / Oscuro
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  themeToggleBtn?.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    document.body.classList.toggle('light-theme');
    updateUIImages();
  });
});

// Actualiza imágenes con base en la temporada e interfaz (Dark/Light)
function updateUIImages() {
  const pack = getActivePack();
  const isDark = document.documentElement.classList.contains('dark');
  
  const mainLogo = document.getElementById('mainLogo');
  if (mainLogo) {
    mainLogo.src = isDark ? pack.logoDark : pack.logoLight;
  }

  const borderLeft = document.getElementById('borderLeft');
  const borderRight = document.getElementById('borderRight');
  if (borderLeft && borderRight) {
    borderLeft.style.backgroundImage = `url('${pack.borders}')`;
    borderRight.style.backgroundImage = `url('${pack.borders}')`;
  }
}
