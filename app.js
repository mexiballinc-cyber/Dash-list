import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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

// Configuración Discord OAuth2
const DISCORD_CLIENT_ID = "1234567890123456789"; // <--- CAMBIA ESTO POR TU CLIENT ID REAL DE DISCORD
const REDIRECT_URI = encodeURIComponent("https://mexiballinc-cyber.github.io/Dash-list/");
const AUTH_URL = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=token&scope=identify`;

document.addEventListener('DOMContentLoaded', () => {
  updateUIImages();
  checkDiscordAuth();

  // Escuchar cambio de tema global desde Discord
  const themeRef = ref(db, 'settings/config/currentSeason');
  onValue(themeRef, (snapshot) => {
    if (snapshot.exists() && typeof setSeason === 'function') {
      setSeason(snapshot.val());
      updateUIImages();
      refreshActiveTab();
    }
  });

  // Login Discord
  const discordLoginBtn = document.getElementById('discordLoginBtn');
  discordLoginBtn?.addEventListener('click', () => {
    window.location.href = AUTH_URL;
  });

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

  // Toggle Tema Sol / Luna
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

  openSubmitModalBtn?.addEventListener('click', () => { closeMenu(); submitModal?.classList.remove('hidden'); });
  navSubmitRecordBtn?.addEventListener('click', () => { closeMenu(); submitModal?.classList.remove('hidden'); });
  closeSubmitModalBtn?.addEventListener('click', () => submitModal?.classList.add('hidden'));

  navAddLevelBtn?.addEventListener('click', () => { closeMenu(); addLevelModal?.classList.remove('hidden'); });
  closeAddLevelModalBtn?.addEventListener('click', () => addLevelModal?.classList.add('hidden'));

  submitModal?.addEventListener('click', (e) => { if (e.target === submitModal) submitModal?.classList.add('hidden'); });
  addLevelModal?.addEventListener('click', (e) => { if (e.target === addLevelModal) addLevelModal?.classList.add('hidden'); });

  // Formulario: Enviar Nivel a Firebase
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

  // Formulario: Enviar Récord a Firebase
  const recordForm = document.getElementById('recordForm');
  recordForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      levelName: document.getElementById('recordLevel').value,
      playerName: document.getElementById('recordPlayer').value,
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

  // Pestañas
  const btnTabLista = document.getElementById('btnTabLista');
  const btnTabLeaderboard = document.getElementById('btnTabLeaderboard');
  const levelsContainer = document.getElementById('levelsContainer');

  let currentTab = 'lista';

  function refreshActiveTab() {
    if (currentTab === 'lista') {
      const lvlRef = ref(db, 'levels');
      onValue(lvlRef, (snapshot) => {
        const levels = snapshot.val() || {};
        renderLevels(levels, levelsContainer);
        populateRecordSelect(levels);
      });
    } else {
      const lbRef = ref(db, 'leaderboard');
      onValue(lbRef, (snapshot) => {
        renderLeaderboard(snapshot.val() || {}, levelsContainer);
      });
    }
  }

  btnTabLeaderboard?.addEventListener('click', () => {
    currentTab = 'leaderboard';
    btnTabLeaderboard.className = "px-6 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 text-white shadow-lg transition";
    btnTabLista.className = "px-6 py-2.5 rounded-xl font-bold text-sm text-zinc-400 hover:text-white transition";
    refreshActiveTab();
  });

  btnTabLista?.addEventListener('click', () => {
    currentTab = 'lista';
    btnTabLista.className = "px-6 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 text-white shadow-lg transition";
    btnTabLeaderboard.className = "px-6 py-2.5 rounded-xl font-bold text-sm text-zinc-400 hover:text-white transition";
    refreshActiveTab();
  });

  refreshActiveTab();
});

function checkDiscordAuth() {
  const fragment = new URLSearchParams(window.location.hash.slice(1));
  const accessToken = fragment.get('access_token') || localStorage.getItem('discord_token');

  if (accessToken) {
    const tokenType = fragment.get('token_type') || 'Bearer';
    localStorage.setItem('discord_token', accessToken);

    if (window.location.hash) {
      window.history.replaceState(null, null, window.location.pathname);
    }

    fetch('https://discord.com/api/users/@me', {
      headers: { authorization: `${tokenType} ${accessToken}` },
    })
    .then(res => res.json())
    .then(response => {
      if (response.id) {
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
      } else {
        localStorage.removeItem('discord_token');
      }
    })
    .catch(() => localStorage.removeItem('discord_token'));
  }
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

  levels.forEach(lvl => {
    const opt = document.createElement('option');
    opt.value = lvl.name;
    opt.textContent = lvl.name;
    select.appendChild(opt);
  });
}

function renderLeaderboard(data, container) {
  if (!container) return;
  container.innerHTML = '';

  const players = Object.values(data).sort((a, b) => (b.points || 0) - (a.points || 0));

  if (players.length === 0) {
    container.innerHTML = `<p class="text-center text-zinc-500 py-8">Aún no hay jugadores en la Leaderboard.</p>`;
    return;
  }

  players.forEach((player, index) => {
    const card = document.createElement('div');
    card.className = "glass-nav p-4 rounded-2xl flex items-center justify-between border border-white/10 mb-2 transition hover:border-indigo-500/50";
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
    container.appendChild(card);
  });
}

function renderLevels(data, container) {
  if (!container) return;
  container.innerHTML = '';

  const levels = Object.values(data);

  if (levels.length === 0) {
    container.innerHTML = `<p class="text-center text-zinc-500 py-8">No hay niveles en la lista todavía.</p>`;
    return;
  }

  const activePack = typeof getActivePack === 'function' ? getActivePack() : {};

  levels.forEach((lvl, index) => {
    const diffKey = (lvl.difficulty || 'demon').toLowerCase();
    const faceUrl = activePack[diffKey] || activePack.demon || '';

    const card = document.createElement('div');
    card.className = "glass-nav p-4 rounded-2xl flex items-center justify-between border border-white/10 mb-3 shadow-lg transition hover:border-indigo-500/50";
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
    container.appendChild(card);
  });
}

window.addEventListener('resize', updateUIImages);
window.addEventListener('orientationchange', updateUIImages);
