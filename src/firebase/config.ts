// src/firebase/config.ts
// This file initializes Firebase for our Next.js application.
// We are using the standard Firebase Web SDK approach here.

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// The configuration object containing our specific Firebase project keys.
// These are safe to expose in the client side for Firebase.
const firebaseConfig = {
  projectId: "patagilid-a37cb",
  appId: "1:369922125368:web:48d282d889b560c27d40cd",
  storageBucket: "patagilid-a37cb.firebasestorage.app",
  apiKey: "AIzaSyD3RJQgb8SDAJ3Af27BtRNsndECYFV4ai4",
  authDomain: "patagilid-a37cb.firebaseapp.com",
  messagingSenderId: "369922125368",
  measurementId: "G-GBCVG800FT",
};

// Next.js can sometimes run code on the server-side multiple times during development.
// This check ensures we only initialize the Firebase app once, avoiding "app already exists" errors.
// getApps() returns an array of initialized apps. If empty, we initialize. Otherwise, we get the existing app.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// We get the Auth instance to manage user logins.
const auth = getAuth(app);

// We get the Firestore database instance to read and write data.
const db = getFirestore(app);

// Exporting these instances so they can be imported and used anywhere in our app.
export { app, auth, db };
