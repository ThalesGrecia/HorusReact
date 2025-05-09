import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // 🔹 Removido initializeAuth e getReactNativePersistence
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = { 
  apiKey: "AIzaSyCP4SzIvncE_sgHVwm5_pgyGsJScvI-nd8",
  authDomain: "horusreact.firebaseapp.com",
  projectId: "horusreact",
  databaseURL: "https://horusreact-default-rtdb.firebaseio.com",
  storageBucket: "horusreact.firebasestorage.app",
  messagingSenderId: "392822962785",
  appId: "1:392822962785:web:d9b506bf30e3a45c0e4820",
  measurementId: "G-JVBE5TTGPH"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // 🔹 Simples e compatível com as novas versões
export const db =  getDatabase(app);
