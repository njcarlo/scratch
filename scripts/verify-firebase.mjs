/**
 * Smoke-test Auth + Firestore against local emulators.
 * Start emulators first: npm run emulators
 */
import { initializeApp } from "firebase/app";
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  connectFirestoreEmulator,
  doc,
  getDoc,
  getFirestore,
  setDoc,
} from "firebase/firestore";

const app = initializeApp({
  apiKey: "demo",
  authDomain: "localhost",
  projectId: "demo-gabay",
});
const auth = getAuth(app);
const db = getFirestore(app);
connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
connectFirestoreEmulator(db, "127.0.0.1", 8080);

const email = `verify-${Date.now()}@example.com`;
const password = "test1234";

const cred = await createUserWithEmailAndPassword(auth, email, password);
const uid = cred.user.uid;
const profile = {
  id: uid,
  language: "en",
  pcosStatus: null,
  goals: [],
  trackWeight: false,
};
await setDoc(doc(db, "users", uid), profile);
await setDoc(doc(db, "users", uid, "cycle_logs", "c1"), {
  id: "c1",
  date: "2026-08-01",
  type: "period_start",
  createdAt: new Date().toISOString(),
});

const snap = await getDoc(doc(db, "users", uid));
if (!snap.exists() || snap.data().id !== uid) {
  throw new Error("owner profile read failed");
}

await signOut(auth);
await createUserWithEmailAndPassword(
  auth,
  `other-${Date.now()}@example.com`,
  password
);
try {
  const leaked = await getDoc(doc(db, "users", uid));
  if (leaked.exists()) {
    throw new Error("cross-user profile read should have been denied");
  }
  throw new Error("cross-user profile read returned empty instead of denying");
} catch (err) {
  const code = err && typeof err === "object" && "code" in err ? err.code : "";
  if (code !== "permission-denied") throw err;
}

await signInWithEmailAndPassword(auth, email, password);
const again = await getDoc(doc(db, "users", uid, "cycle_logs", "c1"));
if (!again.exists()) throw new Error("cycle log missing after re-login");

console.log("firebase emulator verify ok", { uid });
