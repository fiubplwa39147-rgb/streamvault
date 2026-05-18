import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
// To connect your own Firebase project, replace these values with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBerTLfdkR2Co7uFQ4uIgSSWiePszze6QM",
  authDomain: "streamvault-922af.firebaseapp.com",
  projectId: "streamvault-922af",
  storageBucket: "streamvault-922af.firebasestorage.app",
  messagingSenderId: "852106218258",
  appId: "1:852106218258:web:1fda3342901692a48441cb",
  measurementId: "G-EHPYC0S1T6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const isFirebaseAvailable = true;
