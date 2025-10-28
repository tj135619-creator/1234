// src/lib/firebase.ts
import { initializeApp, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Firebase config using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBNCXIOAX2HUdeLvUxkTJh7DVbv8JU485s",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "goalgrid-c5e9c.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "goalgrid-c5e9c",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "goalgrid-c5e9c.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "544004357501",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:544004357501:web:4b81a3686422b28534e014",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-BJQMLK9JJ1",
};

// Initialize Firebase
let app: FirebaseApp;
try {
  app = getApp();
} catch (error: any) {
  app = initializeApp(firebaseConfig);
}

// Auth and Firestore instances
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

// Google auth provider
const provider = new GoogleAuthProvider();

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Sign out
export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};