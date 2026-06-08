import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// ---------------------------------------------------------------------------
// Firebase init from environment variables (see .env.example).
// All VITE_ vars are baked into the build and visible in the browser — that's
// expected for a Firebase web app. Security for this private event is the
// open-but-temporary Firestore rules + the admin password gate.
// ---------------------------------------------------------------------------

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseApp = initializeApp(firebaseConfig)
export const db = getFirestore(firebaseApp)

/** Quick sanity flag — true once the basic config is present. */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId,
)
