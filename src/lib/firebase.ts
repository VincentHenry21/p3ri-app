// Firebase modular SDK init.
// Sources, in order: (1) a config JSON pasted in Settings (stored only
// in this browser's localStorage), (2) Vite env variables VITE_FIREBASE_*
// at build time, (3) the built-in config below, added by the developer
// so sign-in works out of the box with no setup from the user.
// The built-in config is the Firebase web client config, the same public
// config already shipped on the Summit live site. It is not a private
// server key: Firebase web apiKeys are public client identifiers, and
// access is governed by the project's Auth settings and Firestore rules.

import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth, type Auth, GoogleAuthProvider, signInWithPopup,
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut,
  onAuthStateChanged, type User,
} from 'firebase/auth';
import { getFirestore, type Firestore, doc, setDoc } from 'firebase/firestore';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let initError: string | null = null;

function envConfig(): FirebaseConfig | null {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID as string | undefined;
  if (!apiKey || !authDomain || !projectId || !appId) return null;
  return {
    apiKey, authDomain, projectId, appId,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  };
}

/** Built-in developer config: sign-in works with no user setup. */
function builtInConfig(): FirebaseConfig {
  return {
    apiKey: 'AIzaSyC5UfJnl5ygcUSeQihGdQfXOBscocYs8_w',
    authDomain: 'summit-academy-b8968.firebaseapp.com',
    projectId: 'summit-academy-b8968',
    storageBucket: 'summit-academy-b8968.firebasestorage.app',
    messagingSenderId: '532362317311',
    appId: '1:532362317311:web:2d391346ec89a5215cebca',
  };
}

function browserConfig(): FirebaseConfig | null {
  try {
    const raw = localStorage.getItem('p3ri-firebase-config');
    if (!raw) return null;
    const cfg = JSON.parse(raw) as FirebaseConfig;
    if (!cfg.apiKey || !cfg.authDomain || !cfg.projectId || !cfg.appId) return null;
    return cfg;
  } catch {
    return null;
  }
}

/** Initialise Firebase if a config is available. Safe to call repeatedly. */
export function initFirebase(): { configured: boolean; error: string | null } {
  if (app) return { configured: true, error: null };
  const cfg = browserConfig() || envConfig() || builtInConfig();
  if (!cfg) return { configured: false, error: null };
  try {
    app = initializeApp(cfg);
    auth = getAuth(app);
    db = getFirestore(app);
    initError = null;
    return { configured: true, error: null };
  } catch (e) {
    initError = e instanceof Error ? e.message : 'Firebase init failed';
    app = null; auth = null; db = null;
    return { configured: false, error: initError };
  }
}

/** Forget the current app so a newly pasted config takes effect on reload. */
export function firebaseStatus(): { configured: boolean; projectId: string | null; error: string | null } {
  const cfg = browserConfig() || envConfig() || builtInConfig();
  return { configured: Boolean(app), projectId: cfg?.projectId ?? null, error: initError };
}

export function getAuthInstance(): Auth | null { return auth; }
export function isFirebaseConfigured(): boolean { return Boolean(app); }

export function onUserChanged(cb: (user: User | null) => void): () => void {
  if (!auth) { cb(null); return () => undefined; }
  return onAuthStateChanged(auth, cb);
}

export async function signInWithGoogle(): Promise<void> {
  if (!auth) throw new Error('Firebase is not configured yet. Add your Firebase config in Settings first.');
  await signInWithPopup(auth, new GoogleAuthProvider());
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  if (!auth) throw new Error('Firebase is not configured yet.');
  await signInWithEmailAndPassword(auth, email, password);
}

export async function signUpWithEmail(email: string, password: string): Promise<void> {
  if (!auth) throw new Error('Firebase is not configured yet.');
  await createUserWithEmailAndPassword(auth, email, password);
}

export async function signOutUser(): Promise<void> {
  if (auth) await signOut(auth);
}

/** Best-effort Firestore sync. Failures are swallowed: local data is truth. */
export async function syncDocToFirestore(uid: string, collection: string, docId: string, data: unknown): Promise<void> {
  if (!db) return;
  try {
    await setDoc(doc(db, 'users', uid, collection, docId), data as Record<string, unknown>, { merge: true });
  } catch {
    // Offline, bad rules, or unconfigured project: local-first keeps working.
  }
}
