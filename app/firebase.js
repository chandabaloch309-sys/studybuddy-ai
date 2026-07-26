import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBDq246-XFItHRC-63sqkvejcfgZR2y6eQ",
  authDomain: "studybuddy-ai-b574f.firebaseapp.com",
  projectId: "studybuddy-ai-b574f",
  storageBucket: "studybuddy-ai-b574f.firebasestorage.app",
  messagingSenderId: "392517877508",
  appId: "1:392517877508:web:e54f38749f87fee16d5a51",
  measurementId: "G-SM9TPG2SS1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);