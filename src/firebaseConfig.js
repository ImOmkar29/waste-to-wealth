// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // ✅ Import Firebase Storage

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCYALR8j_nuJJJXougEp-KLk7j2fBhH2mc",
    authDomain: "waste-to-wealth-9caf3.firebaseapp.com",
    projectId: "waste-to-wealth-9caf3",
    storageBucket: "waste-to-wealth-9caf3.appspot.com",
    messagingSenderId: "1029583503588",
    appId: "1:1029583503588:web:f7873fa449fe23a70cacf1",
    measurementId: "G-1HH3YXGC2Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export Firebase services
export const auth = getAuth(app); // ✅ Make sure app is initialized before auth
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app); // ✅ Export Firebase Storage
