"use client";

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  type Firestore,
} from "firebase/firestore";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Whether a real (or emulator) Firebase project is configured.
 * Auth + the data repository both branch on this — see AuthProvider and
 * src/lib/data/index.ts. When false, the app runs in Demo Mode.
 */
export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId);

export const useFirebaseEmulator =
  process.env.NEXT_PUBLIC_FIREBASE_EMULATOR === "1" ||
  process.env.NEXT_PUBLIC_FIREBASE_EMULATOR === "true";

let emulatorConnected = false;

function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured) return null;
  if (!getApps().length) {
    initializeApp({
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId,
    });
  }
  return getApp();
}

function connectEmulatorsIfNeeded(auth: Auth, db: Firestore) {
  if (!useFirebaseEmulator || emulatorConnected || typeof window === "undefined") {
    return;
  }
  emulatorConnected = true;
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}

export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp();
  if (!app) return null;
  const auth = getAuth(app);
  connectEmulatorsIfNeeded(auth, getFirestore(app));
  return auth;
}

export function getFirebaseDb(): Firestore | null {
  const app = getFirebaseApp();
  if (!app) return null;
  const db = getFirestore(app);
  connectEmulatorsIfNeeded(getAuth(app), db);
  return db;
}
