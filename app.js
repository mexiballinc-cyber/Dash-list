import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { saveDiscordUserToFirebase, fetchPlayersFromFirebase } from "./players.js";

const firebaseConfig = {
  apiKey: "AIzaSyAMnhmifHanGHh9lwmm-2Xydchim61CfBA",
  authDomain: "dashlist-3fbec.firebaseapp.com",
  databaseURL: "https://dashlist-3fbec-default-rtdb.firebaseio.com",
  projectId: "dashlist-3fbec",
  storageBucket: "dashlist-3fbec.firebasestorage.app",
  messagingSenderId: "686035908732",
  appId: "1:686035908732:web:0c8cb42e630718479131f9"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const DISCORD_CLIENT_ID = "1557609625904357436";
const REDIRECT_URI = "https://mexiballinc-cyber.github.io/Dash-list/";
const AUTH_URL = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=identify`;

let globalLevelsCache = {};
let globalPlayersCache = [];
let currentTab = 'lista';

// Función para calcular puntos de un nivel según su posición en la lista (#1 = 100pts)
function getPointsForRank(rank, totalLevels) {
  if (rank <= 0) return 0;
  const maxPoints = 100;
  const minPoints = 10;
  if (totalLevels <= 1) return maxPoints;
  const step = (maxPoints - minPoints) / (totalLevels - 1);
  return Math.round(maxPoints - step * (rank - 1));
}

document.addEventListener('DOMContentLoaded', () => {
  updateUIImages();
  checkDiscordAuth();

  const themeRef = ref(db, 'settings/config/currentSeason');
  onValue(themeRef, (snapshot) => {
    if (snapshot.exists() && typeof setSeason === 'function') {
      setSeason(snapshot.val());
      updateUIImages();
      refreshActiveTab();
    }
  });

  const mainLogo = document.getElementById('mainLogo');
  mainLogo?.addEventListener('click', showMainList);

  const discordLoginBtn = document.getElementById('discordLoginBtn');
  discordLoginBtn?.addEventListener('click', () => { window.location.href = AUTH_URL; });

  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn?.addEventListener('click', () => {
    localStorage.removeItem('discord_token');
    localStorage.removeItem('discord_user_id');
    localStorage.removeItem('discord_username');
    document.getElementById('userInfo')?.classList.add('hidden');
    document.getElementById('discordLoginBtn')?.classList.remove('hidden');
    window.location.hash = '';
    const recordPlayer = document.getElementById('recordPlayer');
    if (recordPlayer) recordPlayer.value = '';
  });

  const menuToggleBtn = document.getElementById('menuToggleBtn');
  const closeMenuBtn = document.getElementById('closeMenuBtn');
  const menuOverlay = document.getElementById('menuOverlay');
  const sideMenu = document.getElementById('sideMenu');

  function openMenu() { sideMenu?.classList.remove('translate-x-full'); menuOverlay?.classList.remove('hidden'); }
  function closeMenu() { sideMenu?.classList.add('translate-x-full'); menuOverlay?.classList.add('hidden'); }

  menuToggleBtn?.addEventListener('click', openMenu);
  closeMenuBtn?.addEventListener('click', closeMenu);
  menuOverlay?.addEventListener('click', closeMenu);

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

  submitModal?.addEventListener('click', (e) => { if (e.target === submitModal) submitModal?.classList.add('hidden'); });
  addLevelModal?.addEventListener('click', (e) => { if (e.target === addLevelModal) addLevelModal?.classList.add('hidden'); });

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
      song: document.getElementById('lvlSong').value,
      createdAt: Date.now(),
      notified: false
    };

    try {
      const pendingRef = ref(db, 'pending_levels');
      const newRef = push(pendingRef);
      await set(newRef, data);
      alert('¡Nivel enviado a revisión en Discord!');
      addLevelForm.reset();
      addLevelModal?.classList.add('hidden');
    } catch (err) {
      console.error(err);
      alert('Error al enviar el nivel.');
    }
  });

  const recordForm = document.getElementById('recordForm');
  recordForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      levelName: document.getElementById('recordLevel').value,
      playerName: document.getElementById('recordPlayer').value,
      userId: localStorage.getItem('discord_user_id') || null,
      progress: parseInt(document.getElementById('recordProgress').value),
      videoUrl: document.getElementById('recordVideo').value,
      country: document.getElementById('recordCountry').value || 'N/A',
      createdAt: Date.now(),
      notified: false
    };

    try {
      const pendingRef = ref(db, 'pending_records');
      const newRef = push(pendingRef);
      await set(newRef, data);
      alert('¡Récord enviado a revisión!');
      recordForm.reset();
      submitModal?.classList.add('hidden');
    } catch (err) {
      console.error(err);
      alert('Error al enviar el récord.');
    }
  });

  const btnTabLista = document.getElementById('btnTabLista');
  const btnTabLeaderboard = document.getElementById('btnTabLeaderboard');
  const searchInput = document.getElementById('searchInput');

  btnTabLeaderboard?.addEventListener('click', () => {
    currentTab = 'leaderboard';
    btnTabLeaderboard.className = "px-6 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 text-white shadow-lg transition";
    btnTabLista.className = "px-6 py-2.5 rounded-xl font-bold text-sm text-zinc-400 hover:text-white transition";
    searchInput.placeholder = "🔍 Buscar jugadores...";
    searchInput.value = "";
    showMainList();
    refreshActiveTab();
  });

  btnTabLista?.addEventListener('click', () => {
    currentTab = 'lista';
    btnTabLista.className = "px-6 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 text-white shadow-lg transition";
    btnTabLeaderboard.className = "px-6 py-2.5 rounded-xl font-bold text-sm text-zinc-400 hover:text-white transition";
    searchInput.placeholder = "🔍 Buscar niveles...";
    searchInput.value = "";
    showMainList();
    refreshActiveTab();
  });

  searchInput?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const levelsContainer = document.getElementById('levelsContainer');

    if (currentTab === 'lista') {
      const filtered = Object.values(globalLevelsCache).filter(lvl => 
        (lvl.name && lvl.name.toLowerCase().includes(query)) ||
        (lvl.creatorId && lvl.creatorId.toLowerCase().includes(query)) ||
        (lvl.verifierId && lvl.verifierId.toLowerCase().includes(query))
      );
      renderLevelsList(filtered, levelsContainer);
    } else {
      const filtered = globalPlayersCache.filter(p => 
        p.name && p.name.toLowerCase().includes(query)
      );
      renderLeaderboardList(filtered, levelsContainer);
    }
  });

  document.getElementById('btnBackToList')?.addEventListener('click', showMainList);
  document.getElementById('btnBackToLeaderboard')?.addEventListener('click', showMainList);

  refreshActiveTab();
});

function showMainList() {
  document.getElementById('levelsContainer')?.classList.remove('hidden');
  document.getElementById('searchContainer')?.classList.remove('hidden');
  document.getElementById('levelDetailView')?.classList.add('hidden');
  document.getElementById('playerDetailView')?.classList.add('hidden');
}

function refreshActiveTab() {
  const levelsContainer = document.getElementById('levelsContainer');
  if (currentTab === 'lista') {
    const lvlRef = ref(db, 'levels');
    onValue(lvlRef, (snapshot) => {
      globalLevelsCache = snapshot.val() || {};
      renderLevelsList(Object.values(globalLevelsCache), levelsContainer);
      populateRecordSelect(globalLevelsCache);
    });
  } else {
    loadLeaderboardData(levelsContainer);
  }
}

async function loadLeaderboardData(container) {
  if (!container) return;
  container.innerHTML = '<p class="text-center text-zinc-500 py-8">Cargando leaderboard...</p>';
  try {
    globalPlayersCache = await fetchPlayersFromFirebase();
    renderLeaderboardList(globalPlayersCache, container);
  } catch (error) {
    console.error(error);
    container.innerHTML = '<p class="text-center text-red-500 py-8">Error al cargar leaderboard.</p>';
  }
}

function renderLevelsList(levels, container) {
  if (!container) return;
  container.innerHTML = '';

  if (!levels || levels.length === 0) {
    container.innerHTML = '<p class="text-center text-zinc-500 py-8">No se encontraron niveles.</p>';
    return;
  }

  const activePack = typeof getActivePack === 'function' ? getActivePack() : {};

  levels.forEach((lvl, index) => {
    const diffKey = (lvl.difficulty || 'demon').toLowerCase();
    const faceUrl = activePack[diffKey] || activePack.demon || '';

    const card = document.createElement('div');
    card.className = 'glass-nav p-4 rounded-2xl flex items-center justify-between border border-white/10 mb-3 shadow-lg transition hover:border-indigo-500/50 cursor-pointer';
    card.innerHTML = `
      <div class="flex items-center gap-4">
        <span class="font-black text-xl text-indigo-400">#${index + 1}</span>
        <div class="relative">
          <img src="${lvl.imgurUrl || ''}" class="w-16 h-12 object-cover rounded-lg border border-white/10" alt="${lvl.name}">
          ${faceUrl ? `<img src="${faceUrl}" class="w-6 h-6 absolute -bottom-1 -right-1 drop-shadow-md" title="${lvl.difficulty}">` : ''}
        </div>
        <div>
          <h3 class="font-bold text-white text-base">${lvl.name}</h3>
          <p class="text-xs text-zinc-400">Por: <span class="text-white font-semibold">${lvl.creatorId}</span> | Verificado: <span class="text-white font-semibold">${lvl.verifierId}</span></p>
        </div>
      </div>
      <div class="text-right">
        <span class="text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 uppercase">${lvl.difficulty}</span>
      </div>
    `;

    card.addEventListener('click', () => openLevelDetail(lvl, index + 1));
    container.appendChild(card);
  });
}

function renderLeaderboardList(players, container) {
  if (!container) return;
  container.innerHTML = '';

  if (!players || players.length === 0) {
    container.innerHTML = '<p class="text-center text-zinc-500 py-8">Aún no hay jugadores registrados.</p>';
    return;
  }

  players.forEach((player, index) => {
    const card = document.createElement('div');
    card.className = 'glass-nav p-4 rounded-2xl flex items-center justify-between border border-white/10 mb-2 transition hover:border-indigo-500/50 cursor-pointer';
    card.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="font-bold text-lg ${index === 0 ? 'text-amber-400' : 'text-indigo-400'}">#${index + 1}</span>
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

    card.addEventListener('click', () => openPlayerDetail(player, index + 1));
    container.appendChild(card);
  });
}

function getEmbedYoutubeUrl(url) {
  if (!url) return '';
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

function openLevelDetail(lvl, rank) {
  document.getElementById('levelsContainer')?.classList.add('hidden');
  document.getElementById('searchContainer')?.classList.add('hidden');
  document.getElementById('playerDetailView')?.classList.add('hidden');
  
  const detailView = document.getElementById('levelDetailView');
  const detailContent = document.getElementById('levelDetailContent');
  detailView?.classList.remove('hidden');

  const activePack = typeof getActivePack === 'function' ? getActivePack() : {};
  const diffKey = (lvl.difficulty || 'demon').toLowerCase();
  const faceUrl = activePack[diffKey] || activePack.demon || '';

  const verificationEmbed = getEmbedYoutubeUrl(lvl.verificationUrl);
  const showcaseEmbed = getEmbedYoutubeUrl(lvl.showcaseUrl);

  const totalLevels = Object.keys(globalLevelsCache).length;
  const levelPoints = getPointsForRank(rank, totalLevels);

  // Obtener récords asociados a este nivel
  const levelRecords = lvl.records ? Object.values(lvl.records) : [];

  detailContent.innerHTML = `
    <div class="text-center mb-6">
      <h1 class="text-3xl font-black text-white">#${rank} ${lvl.name}</h1>
      <p class="text-sm text-zinc-400 mt-1">
        Creado por: <span class="text-indigo-400 font-bold">${lvl.creatorId}</span> | 
        Verificado por: <span class="text-indigo-400 font-bold">${lvl.verifierId}</span>
      </p>
    </div>

    <!-- BOTONES CONMUTADORES DE VIDEO -->
    <div class="flex justify-center gap-2 mb-4">
      <button id="btnVideoVerif" class="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-lg transition">Verification</button>
      <button id="btnVideoShowcase" class="px-5 py-2 rounded-xl text-xs font-bold bg-zinc-800 text-zinc-400 hover:text-white transition">Showcase</button>
    </div>

    <!-- REPRODUCTOR DE VIDEO EMBEBIDO -->
    <div class="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black mb-6">
      <iframe id="levelVideoFrame" src="${verificationEmbed}" class="w-full h-full" frameborder="0" allowfullscreen></iframe>
    </div>

    <!-- INFORMACIÓN / ESTADÍSTICAS DEL NIVEL -->
    <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center mb-6">
      <div class="p-3 bg-white/5 rounded-xl border border-white/10 flex flex-col items-center justify-center">
        <span class="text-xs text-zinc-400 uppercase font-semibold">Dificultad</span>
        <div class="flex items-center gap-1.5 mt-1">
          ${faceUrl ? `<img src="${faceUrl}" class="w-5 h-5 drop-shadow-md">` : ''}
          <span class="font-bold text-white uppercase text-xs">${lvl.difficulty}</span>
        </div>
      </div>
      <div class="p-3 bg-white/5 rounded-xl border border-white/10">
        <span class="text-xs text-zinc-400 uppercase font-semibold">Puntos</span>
        <p class="font-black text-amber-400 mt-1 text-sm">${levelPoints} pts</p>
      </div>
      <div class="p-3 bg-white/5 rounded-xl border border-white/10">
        <span class="text-xs text-zinc-400 uppercase font-semibold">ID de GD</span>
        <p class="font-bold text-indigo-400 mt-1 text-sm font-mono">${lvl.gdId || 'N/A'}</p>
      </div>
      <div class="p-3 bg-white/5 rounded-xl border border-white/10">
        <span class="text-xs text-zinc-400 uppercase font-semibold">Duración</span>
        <p class="font-bold text-white mt-1 text-sm">${lvl.duration || 'N/A'}</p>
      </div>
      <div class="p-3 bg-white/5 rounded-xl border border-white/10">
        <span class="text-xs text-zinc-400 uppercase font-semibold">Objetos</span>
        <p class="font-bold text-white mt-1 text-sm">${lvl.objects || 'N/A'}</p>
      </div>
    </div>

    <div class="p-3 bg-white/5 rounded-xl border border-white/10 text-center mb-6">
      <span class="text-xs text-zinc-400 uppercase font-semibold">Canción / Sonido: </span>
      <span class="font-semibold text-white text-sm">${lvl.song || 'N/A'}</span>
    </div>

    <!-- BARRITA DE RÉCORDS VERIFICADOS (SECCIÓN ESTILO WEONLIST) -->
    <div class="p-5 bg-black/40 rounded-2xl border border-white/10">
      <h3 class="text-base font-extrabold text-white mb-1 text-center uppercase tracking-wider">Records</h3>
      <p class="text-xs text-zinc-400 text-center mb-4">100% requerido para calificar en la lista</p>

      <div class="space-y-2">
        ${levelRecords.length === 0 ? `
          <p class="text-center text-zinc-500 text-xs py-4 italic">No hay récords registrados aún para este nivel.</p>
        ` : levelRecords.map(rec => `
          <div class="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between text-sm">
            <div class="flex items-center gap-2">
              <span class="font-bold text-white">${rec.playerName || 'Jugador'}</span>
              <span class="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">${rec.progress || 100}%</span>
            </div>
            ${rec.videoUrl ? `
              <a href="${rec.videoUrl}" target="_blank" class="px-3 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-bold transition border border-indigo-500/30 flex items-center gap-1">
                Video ↗
              </a>
            ` : '<span class="text-xs text-zinc-500">Sin Video</span>'}
          </div>
        `).join('')}
      </div>
    </div>
  `;

  const btnVideoVerif = document.getElementById('btnVideoVerif');
  const btnVideoShowcase = document.getElementById('btnVideoShowcase');
  const levelVideoFrame = document.getElementById('levelVideoFrame');

  btnVideoVerif?.addEventListener('click', () => {
    btnVideoVerif.className = "px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-lg transition";
    btnVideoShowcase.className = "px-5 py-2 rounded-xl text-xs font-bold bg-zinc-800 text-zinc-400 hover:text-white transition";
    if (levelVideoFrame) levelVideoFrame.src = verificationEmbed;
  });

  btnVideoShowcase?.addEventListener('click', () => {
    btnVideoShowcase.className = "px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-lg transition";
    btnVideoVerif.className = "px-5 py-2 rounded-xl text-xs font-bold bg-zinc-800 text-zinc-400 hover:text-white transition";
    if (levelVideoFrame) levelVideoFrame.src = showcaseEmbed;
  });
}

function openPlayerDetail(player, rank) {
  document.getElementById('levelsContainer')?.classList.add('hidden');
  document.getElementById('searchContainer')?.classList.add('hidden');
  document.getElementById('levelDetailView')?.classList.add('hidden');

  const detailView = document.getElementById('playerDetailView');
  const detailContent = document.getElementById('playerDetailContent');
  detailView?.classList.remove('hidden');

  const verifiedLevels = Object.values(globalLevelsCache).filter(lvl => 
    lvl.verifierId && lvl.verifierId.trim().toLowerCase() === player.name.trim().toLowerCase()
  );

  const createdLevels = Object.values(globalLevelsCache).filter(lvl => 
    lvl.creatorId && lvl.creatorId.trim().toLowerCase() === player.name.trim().toLowerCase()
  );

  // Buscar todos los récords completados por este jugador en todos los niveles
  const completedRecords = [];
  Object.values(globalLevelsCache).forEach(lvl => {
    if (lvl.records) {
      Object.values(lvl.records).forEach(rec => {
        if (rec.playerName && rec.playerName.trim().toLowerCase() === player.name.trim().toLowerCase()) {
          completedRecords.push({ ...rec, levelName: lvl.name });
        }
      });
    }
  });

  detailContent.innerHTML = `
    <div class="flex items-center gap-4 pb-6 border-b border-white/10 mb-6">
      <img src="${player.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}" class="w-16 h-16 rounded-full border-2 border-indigo-500 object-cover shadow-lg" />
      <div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-600 text-white">#${rank}</span>
          <h1 class="text-2xl font-black text-white">${player.name}</h1>
        </div>
        <p class="text-xs text-zinc-400 mt-1">Puntos Totales: <span class="font-extrabold text-indigo-400 text-sm">${player.points || 0} pts</span></p>
      </div>
    </div>

    <!-- SECCIÓN DE NIVELES VERIFICADOS -->
    <div class="mb-6">
      <h3 class="text-sm font-bold text-zinc-300 uppercase mb-3 flex items-center justify-between">
        <span>Niveles Verificados (${verifiedLevels.length})</span>
      </h3>
      <div class="space-y-2">
        ${verifiedLevels.length === 0 ? '<p class="text-xs text-zinc-500 italic">Ningún nivel verificado.</p>' : ''}
        ${verifiedLevels.map(lvl => `
          <div class="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
            <div>
              <span class="font-bold text-white text-sm">${lvl.name}</span>
              <p class="text-xs text-zinc-400">Verificador Oficial</p>
            </div>
            ${lvl.verificationUrl ? `
              <a href="${lvl.verificationUrl}" target="_blank" class="px-3 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-bold transition border border-indigo-500/30 flex items-center gap-1">
                Ver Video ↗
              </a>
            ` : '<span class="text-xs text-zinc-500">Sin Video</span>'}
          </div>
        `).join('')}
      </div>
    </div>

    <!-- SECCIÓN DE RÉCORDS COMPLETADOS -->
    <div class="mb-6">
      <h3 class="text-sm font-bold text-zinc-300 uppercase mb-3 flex items-center justify-between">
        <span>Récords Completados (${completedRecords.length})</span>
      </h3>
      <div class="space-y-2">
        ${completedRecords.length === 0 ? '<p class="text-xs text-zinc-500 italic">Ningún récord registrado.</p>' : ''}
        ${completedRecords.map(rec => `
          <div class="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
            <div>
              <span class="font-bold text-white text-sm">${rec.levelName}</span>
              <span class="ml-2 text-xs font-semibold text-indigo-400">${rec.progress || 100}%</span>
            </div>
            ${rec.videoUrl ? `
              <a href="${rec.videoUrl}" target="_blank" class="px-3 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-bold transition border border-indigo-500/30 flex items-center gap-1">
                Ver Video ↗
              </a>
            ` : '<span class="text-xs text-zinc-500">Sin Video</span>'}
          </div>
        `).join('')}
      </div>
    </div>

    <!-- SECCIÓN DE NIVELES CREADOS -->
    <div>
      <h3 class="text-sm font-bold text-zinc-300 uppercase mb-3 flex items-center justify-between">
        <span>Niveles Creados (${createdLevels.length})</span>
      </h3>
      <div class="space-y-2">
        ${createdLevels.length === 0 ? '<p class="text-xs text-zinc-500 italic">Ningún nivel creado.</p>' : ''}
        ${createdLevels.map(lvl => `
          <div class="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
            <span class="font-bold text-white text-sm">${lvl.name}</span>${lvl.showcaseUrl ? `
              <a href="${lvl.showcaseUrl}" target="_blank" class="px-3 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-bold transition border border-indigo-500/30 flex items-center gap-1">
                Ver Showcase ↗
              </a>
            ` : '<span class="text-xs text-zinc-500">Sin Video</span>'}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function checkDiscordAuth() {
  const fragment = new URLSearchParams(window.location.hash.slice(1));
  const accessToken = fragment.get('access_token') || localStorage.getItem('discord_token');

  if (!accessToken) return;

  const tokenType = fragment.get('token_type') || 'Bearer';
  localStorage.setItem('discord_token', accessToken);

  if (window.location.hash) {
    window.history.replaceState(null, null, window.location.pathname);
  }

  fetch('https://discord.com/api/users/@me', {
    headers: { authorization: `${tokenType} ${accessToken}` },
  })
    .then(res => res.json())
    .then(async (response) => {
      if (!response.id) {
        localStorage.removeItem('discord_token');
        return;
      }

      document.getElementById('discordLoginBtn')?.classList.add('hidden');
      document.getElementById('userInfo')?.classList.remove('hidden');

      const userName = document.getElementById('userName');
      const userId = document.getElementById('userId');
      const userAvatar = document.getElementById('userAvatar');

      if (userName) userName.textContent = response.username;
      if (userId) userId.textContent = `ID: ${response.id}`;
      if (userAvatar) {
        userAvatar.src = response.avatar
          ? `https://cdn.discordapp.com/avatars/${response.id}/${response.avatar}.png`
          : `https://cdn.discordapp.com/embed/avatars/0.png`;
      }

      const recordPlayer = document.getElementById('recordPlayer');
      if (recordPlayer) recordPlayer.value = response.username;

      localStorage.setItem('discord_user_id', response.id);
      localStorage.setItem('discord_username', response.username);

      try {
        await saveDiscordUserToFirebase(response);
      } catch (error) {
        console.error('❌ Error guardando usuario en Firebase:', error);
      }
    })
    .catch(() => localStorage.removeItem('discord_token'));
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

function populateRecordSelect(levelsData) {
  const select = document.getElementById('recordLevel');
  if (!select) return;
  select.innerHTML = '';

  const levels = Object.values(levelsData);
  if (levels.length === 0) {
    select.innerHTML = `<option value="">No hay niveles disponibles</option>`;
    return;
  }

  levels.forEach((lvl) => {
    const opt = document.createElement('option');
    opt.value = lvl.name;
    opt.textContent = lvl.name;
    select.appendChild(opt);
  });
}

window.addEventListener('resize', updateUIImages);
window.addEventListener('orientationchange', updateUIImages);
