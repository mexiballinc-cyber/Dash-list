// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAMnhmifHanGHh9lwmm-2Xydchim61CfBA",
  authDomain: "dashlist-3fbec.firebaseapp.com",
  databaseURL: "https://dashlist-3fbec-default-rtdb.firebaseio.com",
  projectId: "dashlist-3fbec",
  storageBucket: "dashlist-3fbec.firebasestorage.app",
  messagingSenderId: "686035908732",
  appId: "1:686035908732:web:0c8cb42e630718479131f9"
};

// Inicializar Firebase en la Web
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// Función para enviar niveles pendientes desde el formulario
export async function submitPendingLevel(levelData) {
  const pendingRef = ref(db, 'pending_levels');
  const newRef = push(pendingRef);
  await set(newRef, {
    ...levelData,
    createdAt: Date.now(),
    notified: false
  });
}
