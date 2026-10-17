// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
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

function copyToClipboard(text, message = '¡ID copiado al portapapeles!') {
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    showToast(message);
  }).catch(err => {
    console.error('Error al copiar:', err);
  });
}

function showToast(message) {
  const toast = document.getElementById('toastNotification');
  const toastText = document.getElementById('toastText');
  if (!toast || !toastText) return;
  
  toastText.textContent = message;
  toast.classList.remove('translate-y-16', 'opacity-0');
  
  setTimeout(() => {
    toast.classList.add('translate-y-16', 'opacity-0');
  }, 2200);
}

function getPointsForRank(rank, totalLevels) {
  if (rank <= 0) return 0;
  const maxPoints = 100;
  const minPoints = 10;
  if (totalLevels <= 1) return maxPoints;
  const step = (maxPoints - minPoints) / (totalLevels - 1);
  return Math.round(maxPoints - step * (rank - 1));
}

function calculateAverageRating(ratings) {
  if (!ratings) return null;
  const values = Object.values(ratings);
  if (values.length === 0) return null;
  const sum = values.reduce((acc, curr) => acc + Number(curr), 0);
  return (sum / values.length).toFixed(1);
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

  document.getElementById('mainLogo')?.addEventListener('click', showMainList);
  document.getElementById('discordLoginBtn')?.addEventListener('click', () => { window.location.href = AUTH_URL; });

  document.getElementById('logoutBtn')?.addEventListener('click', () => {
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

  document.getElementById('themeToggleBtn')?.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    document.body.classList.toggle('light-theme');
    document.getElementById('sunIcon')?.classList.toggle('hidden');
    document.getElementById('moonIcon')?.classList.toggle('hidden');
    updateUIImages();
    refreshActiveTab();
  });

  const submitModal = document.getElementById('submitModal');
  const addLevelModal = document.getElementById('addLevelModal');

  document.getElementById('openSubmitModalBtn')?.addEventListener('click', () => { closeMenu(); submitModal?.classList.remove('hidden'); });
  document.getElementById('navSubmitRecordBtn')?.addEventListener('click', () => { closeMenu(); submitModal?.classList.remove('hidden'); });
  document.getElementById('closeSubmitModalBtn')?.addEventListener('click', () => submitModal?.classList.add('hidden'));

  document.getElementById('navAddLevelBtn')?.addEventListener('click', () => { closeMenu(); addLevelModal?.classList.remove('hidden'); });
  document.getElementById('closeAddLevelModalBtn')?.addEventListener('click', () => addLevelModal?.classList.add('hidden'));

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
      rawFootageUrl: document.getElementById('lvlRawFootage').value || '',
      imgurUrl: document.getElementById('lvlImgur').value,
      duration: document.getElementById('lvlDuration').value,
      objects: document.getElementById('lvlObjects').value,
      song: document.getElementById('lvlSong').value,
      createdAt: Date.now(),
      notified: false
    };

    try {
      await set(push(ref(db, 'pending_levels')), data);
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
      rawFootageUrl: document.getElementById('recordRawFootage').value || '',
      country: document.getElementById('recordCountry').value || 'N/A',
      createdAt: Date.now(),
      notified: false
    };

    try {
      await set(push(ref(db, 'pending_records')), data);
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
    btnTabLeaderboard.className = "tab-active px-6 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 text-white shadow-lg transition";
    btnTabLista.className = "tab-inactive px-6 py-2.5 rounded-xl font-bold text-sm text-zinc-400 hover:text-white transition";
    searchInput.placeholder = "🔍 Buscar jugadores...";
    searchInput.value = "";
    showMainList();
    refreshActiveTab();
  });

  btnTabLista?.addEventListener('click', () => {
    currentTab = 'lista';
    btnTabLista.className = "tab-active px-6 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 text-white shadow-lg transition";
    btnTabLeaderboard.className = "tab-inactive px-6 py-2.5 rounded-xl font-bold text-sm text-zinc-400 hover:text-white transition";
    searchInput.placeholder = "🔍 Buscar niveles...";
    searchInput.value = "";
    showMainList();
    refreshActiveTab();
  });

  searchInput?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const levelsContainer = document.getElementById('levelsContainer');

    if (currentTab === 'lista') {
      const filtered = Object.entries(globalLevelsCache)
        .map(([key, val]) => ({ key, ...val }))
        .filter(lvl => 
          (lvl.name && lvl.name.toLowerCase().includes(query)) ||
          (lvl.creatorId && lvl.creatorId.toLowerCase().includes(query)) ||
          (lvl.verifierId && lvl.verifierId.toLowerCase().includes(query))
        );
      renderLevelsList(filtered, levelsContainer);
    } else {
      const filtered = globalPlayersCache.filter(p => p.name && p.name.toLowerCase().includes(query));
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
    onValue(ref(db, 'levels'), (snapshot) => {
      globalLevelsCache = snapshot.val() || {};
      const levelsArray = Object.entries(globalLevelsCache).map(([key, val]) => ({ key, ...val }));
      levelsArray.sort((a, b) => (a.order || a.createdAt || 0) - (b.order || b.createdAt || 0));
      renderLevelsList(levelsArray, levelsContainer);
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
    const avgRating = calculateAverageRating(lvl.ratings);

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
          <div class="flex items-center gap-2">
            <h3 class="font-bold text-level-title text-base">${lvl.name}</h3>
            ${lvl.gdId ? `
              <button data-id="${lvl.gdId}" class="btn-copy-id text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800/90 hover:bg-indigo-600 text-zinc-400 hover:text-white border border-white/10 transition flex items-center gap-1" title="Clic para copiar ID">
                <span>📋</span> ${lvl.gdId}
              </button>
            ` : ''}
          </div>
          <p class="text-xs text-level-sub mt-0.5">Por: <span class="font-semibold text-level-author">${lvl.creatorId}</span> | Verificado: <span class="font-semibold text-level-author">${lvl.verifierId}</span></p>
        </div>
      </div>
      <div class="text-right flex items-center gap-2">
        ${avgRating ? `<span class="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">⭐ ${avgRating}/100</span>` : ''}
        <span class="text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 uppercase">${lvl.difficulty}</span>
      </div>
    `;

    // Evento de clic en el botón de copiar ID
    const copyBtn = card.querySelector('.btn-copy-id');
    if (copyBtn) {
      copyBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Evita abrir los detalles del nivel
        copyToClipboard(lvl.gdId, `¡ID ${lvl.gdId} copiado!`);
      });
    }

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
          <h3 class="font-bold text-level-title text-base">${player.name}</h3>
          <p class="text-xs text-level-sub">
            Creados: <span class="font-semibold text-level-author">${player.createdCount || 0}</span> |
            Verificados: <span class="font-semibold text-level-author">${player.verifiedCount || 0}</span>
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
  const levelRecords = lvl.records ? Object.values(lvl.records) : [];

  const currentUserId = localStorage.getItem('discord_user_id');
  const userRating = (lvl.ratings && currentUserId && lvl.ratings[currentUserId]) ? lvl.ratings[currentUserId] : '';
  const avgRating = calculateAverageRating(lvl.ratings);

  detailContent.innerHTML = `
    <div class="text-center mb-6">
      <h1 class="text-3xl font-black text-level-title">#${rank} ${lvl.name}</h1>
      
      ${lvl.gdId ? `
        <div class="my-2">
          <button id="btnCopyDetailId" class="text-xs font-mono px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 transition items-center gap-1.5 inline-flex font-bold">
            <span>📋</span> ID GD: ${lvl.gdId} (Clic para copiar)
          </button>
        </div>
      ` : ''}

      <p class="text-sm text-level-sub mt-1">
        Creado por: <span class="text-indigo-400 font-bold">${lvl.creatorId}</span> | 
        Verificado por: <span class="text-indigo-400 font-bold">${lvl.verifierId}</span>
      </p>
    </div>

    <!-- BOTONES CONMUTADORES DE VIDEO -->
    <div class="flex justify-center gap-2 mb-4">
      <button id="btnVideoVerif" class="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-lg transition">Verification</button>
      <button id="btnVideoShowcase" class="px-5 py-2 rounded-xl text-xs font-bold bg-zinc-800 text-zinc-400 hover:text-white transition">Showcase</button>
    </div>

    <!-- REPRODUCTOR DE VIDEO -->
    <div class="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black mb-6">
      <iframe id="levelVideoFrame" src="${verificationEmbed}" class="w-full h-full" frameborder="0" allowfullscreen></iframe>
    </div>

    <!-- ESTADÍSTICAS -->
    <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center mb-6">
      <div class="p-3 bg-white/5 rounded-xl border border-white/10 flex flex-col items-center justify-center">
        <span class="text-xs text-level-sub uppercase font-semibold">Dificultad</span>
        <div class="flex items-center gap-1.5 mt-1">
          ${faceUrl ? `<img src="${faceUrl}" class="w-5 h-5 drop-shadow-md">` : ''}
          <span class="font-bold text-level-title uppercase text-xs">${lvl.difficulty}</span>
        </div>
      </div>
      <div class="p-3 bg-white/5 rounded-xl border border-white/10">
        <span class="text-xs text-level-sub uppercase font-semibold">Puntos Top</span>
        <p class="font-black text-amber-400 mt-1 text-sm">${levelPoints} pts</p>
      </div>
      <div class="p-3 bg-white/5 rounded-xl border border-white/10">
        <span class="text-xs text-level-sub uppercase font-semibold">Rating Web</span>
        <p class="font-black text-indigo-400 mt-1 text-sm">${avgRating ? `⭐ ${avgRating}/100` : 'S/C'}</p>
      </div>
      <div class="p-3 bg-white/5 rounded-xl border border-white/10">
        <span class="text-xs text-level-sub uppercase font-semibold">Duración</span>
        <p class="font-bold text-level-title mt-1 text-sm">${lvl.duration || 'N/A'}</p>
      </div>
      <div class="p-3 bg-white/5 rounded-xl border border-white/10">
        <span class="text-xs text-level-sub uppercase font-semibold">Objetos</span>
        <p class="font-bold text-level-title mt-1 text-sm">${lvl.objects || 'N/A'}</p>
      </div>
    </div>

    <!-- SISTEMA DE CALIFICACIÓN (1 AL 100) ESTILO AREDL -->
    <div class="p-4 bg-white/5 rounded-xl border border-white/10 text-center mb-6">
      <h3 class="text-xs font-bold text-level-sub uppercase mb-2">Calificar Nivel (1 - 100)</h3>
      ${currentUserId ? `
        <div class="flex justify-center items-center gap-2 max-w-xs mx-auto">
          <input type="number" id="inputRatingScore" min="1" max="100" value="${userRating}" placeholder="1-100" class="w-24 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-center text-level-title text-sm font-bold focus:border-indigo-500 focus:outline-none" />
          <button id="btnSubmitRating" class="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition">Guardar</button>
        </div>
      ` : `
        <p class="text-xs text-zinc-500">Inicia sesión con Discord para calificar este nivel.</p>
      `}
    </div>

    <!-- SECCIÓN DE RÉCORDS -->
    <div class="p-5 bg-black/40 rounded-2xl border border-white/10">
      <h3 class="text-base font-extrabold text-level-title mb-1 text-center uppercase tracking-wider">Records</h3>
      <p class="text-xs text-level-sub text-center mb-4">100% requerido para calificar en la lista</p>

      <div class="space-y-2">
        ${levelRecords.length === 0 ? `
          <p class="text-center text-zinc-500 text-xs py-4 italic">No hay récords registrados aún para este nivel.</p>
        ` : levelRecords.map(rec => `
          <div class="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between text-sm">
            <div class="flex items-center gap-2">
              <span class="font-bold text-level-title">${rec.playerName || 'Jugador'}</span>
              <span class="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">${rec.progress || 100}%</span>
            </div>
            <div class="flex items-center gap-2">
              ${rec.videoUrl ? `<a href="${rec.videoUrl}" target="_blank" class="px-3 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-bold transition border border-indigo-500/30">Video ↗</a>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  document.getElementById('btnCopyDetailId')?.addEventListener('click', () => {
    copyToClipboard(lvl.gdId, `¡ID ${lvl.gdId} copiado!`);
  });

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

  document.getElementById('btnSubmitRating')?.addEventListener('click', async () => {
    const scoreVal = parseInt(document.getElementById('inputRatingScore').value);
    if (isNaN(scoreVal) || scoreVal < 1 || scoreVal > 100) {
      alert('Ingresa una calificación válida entre 1 y 100.');
      return;
    }

    try {
      if (lvl.key) {
        await update(ref(db, `levels/${lvl.key}/ratings`), { [currentUserId]: scoreVal });
        alert('¡Calificación guardada!');
        openLevelDetail({ ...lvl, ratings: { ...(lvl.ratings || {}), [currentUserId]: scoreVal } }, rank);
      }
    } catch (err) {
      console.error(err);
      alert('Error al guardar la calificación.');
    }
  });
}

function matchesPlayer(rawField, player) {
  if (!rawField || !player) return false;
  const str = String(rawField).trim().toLowerCase();
  const name = player.name ? player.name.trim().toLowerCase() : '';
  const discordId = player.discordId ? player.discordId.trim().toLowerCase() : '';
  const id = player.id ? player.id.trim().toLowerCase() : '';
  return str === name || str === discordId || str === id;
}

function openPlayerDetail(player, rank) {
  document.getElementById('levelsContainer')?.classList.add('hidden');
  document.getElementById('searchContainer')?.classList.add('hidden');
  document.getElementById('levelDetailView')?.classList.add('hidden');

  const detailView = document.getElementById('playerDetailView');
  const detailContent = document.getElementById('playerDetailContent');
  detailView?.classList.remove('hidden');

  const verifiedLevels = Object.values(globalLevelsCache).filter(lvl => matchesPlayer(lvl.verifierId, player));
  const createdLevels = Object.values(globalLevelsCache).filter(lvl => matchesPlayer(lvl.creatorId, player));

  const completedRecords = [];
  Object.values(globalLevelsCache).forEach(lvl => {
    if (lvl.records) {
      Object.values(lvl.records).forEach(rec => {
        if (matchesPlayer(rec.playerName || rec.userId, player)) {
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
          <h1 class="text-2xl font-black text-level-title">${player.name}</h1>
        </div>
        <p class="text-xs text-level-sub mt-1">Puntos Totales: <span class="font-extrabold text-indigo-400 text-sm">${player.points || 0} pts</span></p>
      </div>
    </div>

    <!-- NIVELES VERIFICADOS -->
    <div class="mb-6">
      <h3 class="text-sm font-bold text-level-sub uppercase mb-3">Niveles Verificados (${verifiedLevels.length})</h3>
      <div class="space-y-2">
        ${verifiedLevels.length === 0 ? '<p class="text-xs text-zinc-500 italic">Ningún nivel verificado.</p>' : ''}
        ${verifiedLevels.map(lvl => `
          <div class="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
            <span class="font-bold text-level-title text-sm">${lvl.name}</span>${lvl.verificationUrl ? `<a href="${lvl.verificationUrl}" target="_blank" class="px-3 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-bold transition border border-indigo-500/30">Ver Video ↗</a>` : ''}
          </div>
        `).join('')}
      </div>
    </div>

    <!-- RÉCORDS COMPLETADOS -->
    <div class="mb-6">
      <h3 class="text-sm font-bold text-level-sub uppercase mb-3">Récords Completados (${completedRecords.length})</h3>
      <div class="space-y-2">
        ${completedRecords.length === 0 ? '<p class="text-xs text-zinc-500 italic">Ningún récord registrado.</p>' : ''}
        ${completedRecords.map(rec => `
          <div class="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
            <div>
              <span class="font-bold text-level-title text-sm">${rec.levelName}</span>
              <span class="ml-2 text-xs font-semibold text-indigo-400">${rec.progress || 100}%</span>
            </div>
            ${rec.videoUrl ? `<a href="${rec.videoUrl}" target="_blank" class="px-3 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-bold transition border border-indigo-500/30">Ver Video ↗</a>` : ''}
          </div>
        `).join('')}
      </div>
    </div>

    <!-- NIVELES CREADOS -->
    <div>
      <h3 class="text-sm font-bold text-level-sub uppercase mb-3">Niveles Creados (${createdLevels.length})</h3>
      <div class="space-y-2">
        ${createdLevels.length === 0 ? '<p class="text-xs text-zinc-500 italic">Ningún nivel creado.</p>' : ''}
        ${createdLevels.map(lvl => `
          <div class="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
            <span class="font-bold text-level-title text-sm">${lvl.name}</span>${lvl.showcaseUrl ? `<a href="${lvl.showcaseUrl}" target="_blank" class="px-3 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-bold transition border border-indigo-500/30">Showcase ↗</a>` : ''}
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