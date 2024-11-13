// Import des fonctions nécessaires depuis Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { enableIndexedDbPersistence } from "firebase/firestore";

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyARn2H8PLXCc-ujeumAxC2VchBDg3UZMo8",
  authDomain: "polymat-1478f.firebaseapp.com",
  projectId: "polymat-1478f",
  storageBucket: "polymat-1478f.firebasestorage.app",
  messagingSenderId: "193379774861",
  appId: "1:193379774861:web:b8379d6f4030919a9e8dc4",
  measurementId: "G-QZZYBWMYSL"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Initialisation des services Firebase
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Activer la persistance hors ligne
enableIndexedDbPersistence(db).catch((err) => {
  console.error("Erreur de persistance Firebase:", err);
});

// Export des services pour utilisation dans d'autres fichiers
export { db, auth, storage };
export default app;