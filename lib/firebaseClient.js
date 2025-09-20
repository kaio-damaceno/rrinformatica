import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

/** @typedef {import('firebase/app').FirebaseApp} FirebaseApp */
/** @typedef {import('firebase/firestore').Firestore} Firestore */
/** @typedef {import('firebase/auth').Auth} Auth */
/** @typedef {import('firebase/storage').FirebaseStorage} FirebaseStorage */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Verifique se todas as variáveis de configuração necessárias estão presentes
const isConfigValid = Object.values(firebaseConfig).every(Boolean);

/** @type {FirebaseApp | null} */
let app = null;
/** @type {Firestore | null} */
let db = null;
/** @type {Auth | null} */
let auth = null;
/** @type {FirebaseStorage | null} */
let storage = null;

if (isConfigValid) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
  } catch (error) {
     console.error("Falha ao inicializar o Firebase. Verifique sua configuração:", error);
  }
} else {
    // Apenas para desenvolvimento, para que a aplicação não quebre totalmente
    console.warn("Atenção: As credenciais do Firebase não foram encontradas. A aplicação pode não funcionar como esperado.");
}

export { db, auth, storage };