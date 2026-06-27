// ============================================================
// Firebase configuration
// ============================================================

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAqISUQd9ILfqsJCrVtp3gu1hEpc7HUUIk",
  authDomain: "wrns-18c36.firebaseapp.com",
  databaseURL: "https://wrns-18c36-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "wrns-18c36",
  storageBucket: "wrns-18c36.firebasestorage.app",
  messagingSenderId: "1010655830614",
  appId: "1:1010655830614:web:55c3a38cc4016aa28d11f7",
  measurementId: "G-ZWPVXE5PFG",
};

export function isFirebaseConfigured() {
  return !Object.values(FIREBASE_CONFIG).some(
    (v) => typeof v === "string" && v.includes("REPLACE_ME")
  );
}
