// app.js - Control de interfaz, orientación, menú lateral y modales
document.addEventListener('DOMContentLoaded', () => {
  // Carga inicial de imágenes
  updateUIImages();

  // Menú Lateral
  const menuToggleBtn = document.getElementById('menuToggleBtn');
  const closeMenuBtn = document.getElementById('closeMenuBtn');
  const menuOverlay = document.getElementById('menuOverlay');
  const sideMenu = document.getElementById('sideMenu');

  function openMenu() {
    sideMenu?.classList.remove('translate-x-full');
    menuOverlay?.classList.remove('hidden');
  }

  function closeMenu() {
    sideMenu?.classList.add('translate-x-full');
    menuOverlay?.classList.add('hidden');
  }

  menuToggleBtn?.addEventListener('click', openMenu);
  closeMenuBtn?.addEventListener('click', closeMenu);
  menuOverlay?.addEventListener('click', closeMenu);

  // Toggle Tema
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  themeToggleBtn?.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    document.body.classList.toggle('light-theme');
    
    const sunIcon = document.getElementById('sunIcon');
    const moonIcon = document.getElementById('moonIcon');
    if (sunIcon && moonIcon) {
      sunIcon.classList.toggle('hidden');
      moonIcon.classList.toggle('hidden');
    }

    updateUIImages();
  });

  // Modales
  const submitModal = document.getElementById('submitModal');
  const openSubmitModalBtn = document.getElementById('openSubmitModalBtn');
  const navSubmitRecordBtn = document.getElementById('navSubmitRecordBtn');
  const closeSubmitModalBtn = document.getElementById('closeSubmitModalBtn');

  const addLevelModal = document.getElementById('addLevelModal');
  const navAddLevelBtn = document.getElementById('navAddLevelBtn');
  const closeAddLevelModalBtn = document.getElementById('closeAddLevelModalBtn');

  function openSubmitModal() {
    closeMenu();
    submitModal?.classList.remove('hidden');
  }

  function closeSubmitModal() {
    submitModal?.classList.add('hidden');
  }

  function openAddLevelModal() {
    closeMenu();
    addLevelModal?.classList.remove('hidden');
  }

  function closeAddLevelModal() {
    addLevelModal?.classList.add('hidden');
  }

  openSubmitModalBtn?.addEventListener('click', openSubmitModal);
  navSubmitRecordBtn?.addEventListener('click', openSubmitModal);
  closeSubmitModalBtn?.addEventListener('click', closeSubmitModal);

  navAddLevelBtn?.addEventListener('click', openAddLevelModal);
  closeAddLevelModalBtn?.addEventListener('click', closeAddLevelModal);

  submitModal?.addEventListener('click', (e) => { if (e.target === submitModal) closeSubmitModal(); });
  addLevelModal?.addEventListener('click', (e) => { if (e.target === addLevelModal) closeAddLevelModal(); });
});

function updateUIImages() {
  if (typeof getActivePack !== 'function') return;

  const pack = getActivePack();
  const isDark = document.documentElement.classList.contains('dark');

  const mainLogo = document.getElementById('mainLogo');
  if (mainLogo) {
    mainLogo.src = isDark ? pack.logoDark : pack.logoLight;
  }

  const isLandscape = window.innerWidth > window.innerHeight;
  const orientationKey = isLandscape ? 'landscape' : 'portrait';

  const borderLeft = document.getElementById('borderLeft');
  const borderRight = document.getElementById('borderRight');

  if (borderLeft && borderRight && pack.borders) {
    borderLeft.style.backgroundImage = `url('${pack.borders[orientationKey].left}')`;
    borderRight.style.backgroundImage = `url('${pack.borders[orientationKey].right}')`;
  }
}

window.addEventListener('resize', updateUIImages);
window.addEventListener('orientationchange', updateUIImages);
