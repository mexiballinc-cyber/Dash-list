// app.js - Control de interfaz, envío a Firebase y Leaderboard
import { submitPendingLevel, submitPendingRecord, listenTheme, listenLeaderboard } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
  updateUIImages();

  // Escuchar cambio de tema global desde el Bot de Discord
  listenTheme((seasonName) => {
    if (typeof setSeason === 'function') {
      setSeason(seasonName);
    }
  });

  // Menú Lateral y Overlay
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

  // Modales
  const submitModal = document.getElementById('submitModal');
  const openSubmitModalBtn = document.getElementById('openSubmitModalBtn');
  const navSubmitRecordBtn = document.getElementById('navSubmitRecordBtn');
  const closeSubmitModalBtn = document.getElementById('closeSubmitModalBtn');

  const addLevelModal = document.getElementById('addLevelModal');
  const navAddLevelBtn = document.getElementById('navAddLevelBtn');
  const closeAddLevelModalBtn = document.getElementById('closeAddLevelModalBtn');

  openSubmitModalBtn?.addEventListener('click', () => { closeMenu(); submitModal?.classList.remove('hidden'); });
  navSubmitRecordBtn?.addEventListener('click', () => { closeMenu(); submitModal?.classList.remove('hidden'); });
  closeSubmitModalBtn?.addEventListener('click', () => submitModal?.classList.add('hidden'));

  navAddLevelBtn?.addEventListener('click', () => { closeMenu(); addLevelModal?.classList.remove('hidden'); });
  closeAddLevelModalBtn?.addEventListener('click', () => addLevelModal?.classList.add('hidden'));

  // Formulario: Enviar Nivel Novedoso
  const addLevelForm = document.getElementById('addLevelForm');
  addLevelForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      name: document.getElementById('lvlName').value,
      creatorId: document.getElementById('lvlCreatorId').value,
      verifierId: document.getElementById('lvlVerifierId').value,
      difficulty: document.getElementById('lvlDifficulty').value,
      gdId: document.getElementById('lvlGdId').value,
      showcaseUrl: document.getElementById('lvlShowcase').value,
      verificationUrl: document.getElementById('lvlVerification').value,
      imgurUrl: document.getElementById('lvlImgur').value,
      duration: document.getElementById('lvlDuration').value,
      objects: document.getElementById('lvlObjects').value,
      song: document.getElementById('lvlSong').value
    };

    try {
      await submitPendingLevel(data);
      alert('¡Nivel enviado a revisión en Discord!');
      addLevelForm.reset();
      addLevelModal?.classList.add('hidden');
    } catch (err) {
      console.error(err);
      alert('Error al enviar el nivel.');
    }
  });

  // Formulario: Enviar Récord
  const recordForm = document.getElementById('recordForm');
  recordForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      levelName: document.getElementById('recordLevel').value,
      playerName: document.getElementById('recordPlayer').value,
      progress: parseInt(document.getElementById('recordProgress').value),
      videoUrl: document.getElementById('recordVideo').value,
      country: document.getElementById('recordCountry').value || 'N/A'
    };

    try {
      await submitPendingRecord(data);
      alert('¡Récord enviado a revisión!');
      recordForm.reset();
      submitModal?.classList.add('hidden');
    } catch (err) {
      console.error(err);
      alert('Error al enviar el récord.');
    }
  });

  // Tabs: Lista vs Leaderboard
  const btnTabLista = document.getElementById('btnTabLista');
  const btnTabLeaderboard = document.getElementById('btnTabLeaderboard');
  const levelsContainer = document.getElementById('levelsContainer');

  btnTabLeaderboard?.addEventListener('click', () => {
    btnTabLeaderboard.className = "px-6 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 text-white shadow-lg transition";
    btnTabLista.className = "px-6 py-2.5 rounded-xl font-bold text-sm text-zinc-400 hover:text-white transition";

    listenLeaderboard((lbData) => {
      renderLeaderboard(lbData, levelsContainer);
    });
  });

  btnTabLista?.addEventListener('click', () => {
    btnTabLista.className = "px-6 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 text-white shadow-lg transition";
    btnTabLeaderboard.className = "px-6 py-2.5 rounded-xl font-bold text-sm text-zinc-400 hover:text-white transition";
    // Aquí puedes llamar la función que renderiza los niveles
  });
});

// Renderizar la Leaderboard en la pantalla
function renderLeaderboard(data, container) {
  if (!container) return;
  container.innerHTML = '';

  const players = Object.values(data).sort((a, b) => (b.points || 0) - (a.points || 0));

  if (players.length === 0) {
    container.innerHTML = `<p class="text-center text-zinc-500 py-8">Aún no hay jugadores registrados en la Leaderboard.</p>`;
    return;
  }

  players.forEach((player, index) => {
    const card = document.createElement('div');
    card.className = "glass-nav p-4 rounded-2xl flex items-center justify-between border border-white/10 mb-2";
    card.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="font-bold text-lg text-indigo-400">#${index + 1}</span>
        <div>
          <h3 class="font-bold text-white text-base">${player.name}</h3>
          <p class="text-xs text-zinc-400">
            Creados: <span class="text-white font-semibold">${player.createdCount || 0}</span> | 
            Verificados: <span class="text-white font-semibold">${player.verifiedCount || 0}</span>
          </p>
        </div>
      </div>
      <div class="text-right">
        <span class="font-extrabold text-lg text-indigo-400">${player.points || 0} pts</span>
      </div>
    `;
    container.appendChild(card);
  });
}

function updateUIImages() {
  if (typeof getActivePack !== 'function') return;
  const pack = getActivePack();
  const isDark = document.documentElement.classList.contains('dark');

  const mainLogo = document.getElementById('mainLogo');
  if (mainLogo) mainLogo.src = isDark ? pack.logoDark : pack.logoLight;

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
