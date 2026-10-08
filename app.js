// app.js - Control de interfaz, orientación y switch de temas
document.addEventListener('DOMContentLoaded', () => {
  // Carga inicial de imágenes
  updateUIImages();

  // Toggle del Menú Lateral (Hamburguesa)
  const menuToggleBtn = document.getElementById('menuToggleBtn');
  const sideMenu = document.getElementById('sideMenu');
  
  menuToggleBtn?.addEventListener('click', () => {
    sideMenu?.classList.toggle('translate-x-full');
  });

  // Toggle de Tema Claro / Oscuro
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  themeToggleBtn?.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    document.body.classList.toggle('light-theme');
    
    // Cambiar íconos de sol y luna en el botón
    const sunIcon = document.getElementById('sunIcon');
    const moonIcon = document.getElementById('moonIcon');
    if (sunIcon && moonIcon) {
      sunIcon.classList.toggle('hidden');
      moonIcon.classList.toggle('hidden');
    }

    updateUIImages();
  });
});

// Función principal para actualizar imágenes dinámicamente
function updateUIImages() {
  if (typeof getActivePack !== 'function') return;

  const pack = getActivePack();
  
  // Verificamos si la página TIENE la clase 'dark' activa
  const isDark = document.documentElement.classList.contains('dark');

  // 1. Corregir Logo:
  // Modo Oscuro (dark) -> Usa logoLight (imagen clara/blanca) para resaltar sobre fondo negro
  // Modo Claro (light) -> Usa logoDark (imagen oscura/negra) para resaltar sobre fondo claro
  const mainLogo = document.getElementById('mainLogo');
  if (mainLogo) {
    mainLogo.src = isDark ? pack.logoLight : pack.logoDark;
  }

  // 2. Detectar Orientación (Horizontal vs Vertical)
  const isLandscape = window.innerWidth > window.innerHeight;
  const orientationKey = isLandscape ? 'landscape' : 'portrait';

  // 3. Aplicar imágenes laterales
  const borderLeft = document.getElementById('borderLeft');
  const borderRight = document.getElementById('borderRight');

  if (borderLeft && borderRight && pack.borders) {
    borderLeft.style.backgroundImage = `url('${pack.borders[orientationKey].left}')`;
    borderRight.style.backgroundImage = `url('${pack.borders[orientationKey].right}')`;
  }
}

// Reaccionar en tiempo real al cambiar tamaño o girar el celular
window.addEventListener('resize', updateUIImages);
window.addEventListener('orientationchange', updateUIImages);
