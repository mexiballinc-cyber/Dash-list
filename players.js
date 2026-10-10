import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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

/**
 * Guardar usuario de Discord en Firebase cuando se autentica en la web
 */
export async function saveDiscordUserToFirebase(userResponse) {
  try {
    const userId = userResponse.id;
    const avatarUrl = userResponse.avatar
      ? `https://cdn.discordapp.com/avatars/${userId}/${userResponse.avatar}.png`
      : `https://cdn.discordapp.com/embed/avatars/0.png`;

    const userData = {
      discordId: userId,
      username: userResponse.username,
      discriminator: userResponse.discriminator || '0',
      avatar: avatarUrl,
      registeredAt: Date.now(),
      lastLogin: Date.now()
    };

    // Guardar en users/
    await set(ref(db, `users/${userId}`), userData);

    // Crear o actualizar en leaderboard/
    const leaderboardRef = ref(db, `leaderboard/${userId}`);
    const existingSnapshot = await new Promise((resolve) => {
      const unsubscribe = onValue(leaderboardRef, (snapshot) => {
        unsubscribe();
        resolve(snapshot);
      }, { onlyOnce: true });
    });

    if (!existingSnapshot.exists()) {
      await set(leaderboardRef, {
        name: userResponse.username,
        discordId: userId,
        avatar: avatarUrl,
        createdCount: 0,
        verifiedCount: 0,
        points: 0,
        country: 'N/A',
        createdAt: Date.now()
      });
    } else {
      const current = existingSnapshot.val();
      await set(leaderboardRef, {
        ...current,
        lastLogin: Date.now()
      });
    }

    return userData;
  } catch (error) {
    console.error('❌ Error al guardar usuario en Firebase:', error);
    throw error;
  }
}

/**
 * Obtener todos los jugadores desde leaderboard ordenados por puntos
 */
export async function fetchPlayersFromFirebase() {
  return new Promise((resolve) => {
    try {
      const leaderboardRef = ref(db, 'leaderboard');
      const unsubscribe = onValue(leaderboardRef, (snapshot) => {
        unsubscribe();

        if (!snapshot.exists()) {
          resolve([]);
          return;
        }

        const data = snapshot.val();
        const players = Object.entries(data).map(([id, value]) => ({ id, ...value }));
        players.sort((a, b) => (b.points || 0) - (a.points || 0));
        resolve(players);
      }, { onlyOnce: true });
    } catch (error) {
      console.error('❌ Error cargando jugadores de Firebase:', error);
      resolve([]);
    }
  });
}

/**
 * Obtener un usuario específico desde la colección users
 */
export async function getUserFromFirebase(userId) {
  return new Promise((resolve) => {
    try {
      const userRef = ref(db, `users/${userId}`);
      const unsubscribe = onValue(userRef, (snapshot) => {
        unsubscribe();
        resolve(snapshot.exists() ? snapshot.val() : null);
      }, { onlyOnce: true });
    } catch (error) {
      console.error('❌ Error obteniendo usuario:', error);
      resolve(null);
    }
  });
}

/**
 * Actualizar datos del usuario
 */
export async function updateUserInFirebase(userId, updates) {
  try {
    const userRef = ref(db, `users/${userId}`);
    const currentSnapshot = await new Promise((resolve) => {
      const unsubscribe = onValue(userRef, (snapshot) => {
        unsubscribe();
        resolve(snapshot);
      }, { onlyOnce: true });
    });

    if (currentSnapshot.exists()) {
      await set(userRef, {
        ...currentSnapshot.val(),
        ...updates,
        updatedAt: Date.now()
      });
    }
  } catch (error) {
    console.error('❌ Error actualizando usuario:', error);
  }
}

export { db };
