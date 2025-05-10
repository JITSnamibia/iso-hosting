// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react"; // Add missing imports [[1]]

// Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Collections
const collections = {
  servers: collection(db, "servers"),
  friends: collection(db, "friends"),
  files: collection(db, "files")
};

export { app, db, auth, collections, doc, getDoc, setDoc, onSnapshot, signInAnonymously, onAuthStateChanged };