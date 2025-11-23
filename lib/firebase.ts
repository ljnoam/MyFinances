import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuration Firebase fournie
const firebaseConfig = {
  apiKey: "AIzaSyCn-2wGhjD7wFzs0AcYzD55BDr1goEBdzA",
  authDomain: "myfinance-e2caf.firebaseapp.com",
  projectId: "myfinance-e2caf",
  storageBucket: "myfinance-e2caf.firebasestorage.app",
  messagingSenderId: "91297891158",
  appId: "1:91297891158:web:5c94279cb4975003fc8cf7",
  measurementId: "G-KWTM108LQT"
};

// Initialisation de l'application
const app = initializeApp(firebaseConfig);

// Export des services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Configuration explicite de la persistance pour éviter les déconnexions
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Erreur lors de la configuration de la persistance :", error);
});

// Note: Analytics est souvent bloqué par les ad-blockers ou environnements sandbox
// nous l'initialiserons conditionnellement si nécessaire dans le futur.
export default app;