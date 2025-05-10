// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

// Your Firebase config (from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyAa1EX1N6av29rLkkFOHeDCHSiY1El9d40",
  authDomain: "iso-hosting-88c54.firebaseapp.com",
  projectId: "iso-hosting-88c54",
  storageBucket: "iso-hosting-88c54.firebasestorage.app",
  messagingSenderId: "807836563867",
  appId: "1:807836563867:web:4a1d655bcb3ae22dd4093e",
  measurementId: "G-4FYLPHND06"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collections
const collections = {
  servers: collection(db, "servers"),
  friends: collection(db, "friends"),
  files: collection(db, "files")
};

export { db, collections, doc, getDoc, setDoc, onSnapshot };