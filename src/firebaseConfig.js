import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  checkActionCode,
  onAuthStateChanged
} from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCYALR8j_nuJJJXougEp-KLk7j2fBhH2mc",
  authDomain: "waste-to-wealth-9caf3.firebaseapp.com",
  projectId: "waste-to-wealth-9caf3",
  storageBucket: "waste-to-wealth-9caf3.appspot.com",
  messagingSenderId: "1029583503588",
  appId: "1:1029583503588:web:f7873fa449fe23a70cacf1",
  measurementId: "G-1HH3YXGC2Y"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export {
  auth,
  db,
  storage,
  googleProvider,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  checkActionCode,
  onAuthStateChanged,
  doc,
  getDoc
};