// src/firebase/config.ts
// This file initializes Firebase for our Next.js application.
// We are using the standard Firebase Web SDK approach here.

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// The configuration object containing our specific Firebase project keys.
// These are safe to expose in the client side for Firebase.
const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
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
