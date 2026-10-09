// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, set, get, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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
export const db = getDatabase(app);

// Guardar Solicitud de Nivel Pendiente
export async function submitPendingLevel(levelData) {
  const pendingRef = ref(db, 'pending_levels');
  const newRef = push(pendingRef);
  await set(newRef, {
    ...levelData,
    createdAt: Date.now(),
    notified: false
  });
}

// Guardar Solicitud de Récord Pendiente
export async function submitPendingRecord(recordData) {
  const pendingRef = ref(db, 'pending_records');
  const newRef = push(pendingRef);
  await set(newRef, {
    ...recordData,
    createdAt: Date.now(),
    notified: false
  });
}

// Listener en vivo para el Tema Global
export function listenTheme(callback) {
  const themeRef = ref(db, 'settings/config/currentSeason');
  onValue(themeRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    }
  });
}

// Listener en vivo para la Leaderboard
export function listenLeaderboard(callback) {
  const lbRef = ref(db, 'leaderboard');
  onValue(lbRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback({});
    }

    // Listener en vivo para la Lista Oficial de Niveles
export function listenLevels(callback) {
  const levelsRef = ref(db, 'levels');
  onValue(levelsRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback({});
    }
  });
}
  });
}
