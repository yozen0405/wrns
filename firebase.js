// Thin wrapper around Firebase Realtime DB + anonymous auth.
// Uses ESM CDN imports so there's no build step.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  update,
  get,
  onValue,
  onDisconnect,
  serverTimestamp,
  remove,
  runTransaction,
  child,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

import { FIREBASE_CONFIG, isFirebaseConfigured } from "./firebase-config.js";

let app = null;
let db = null;
let auth = null;
let authUid = null;
// playerId is per-TAB (sessionStorage), so two tabs in the same browser
// don't clobber each other's player record. Firebase auth uid is shared
// across tabs via IndexedDB persistence, which is why we can't use it.
let playerId = null;

function getOrCreatePlayerId() {
  try {
    let id = sessionStorage.getItem("wrns_pid");
    if (!id) {
      id =
        "p_" +
        Math.random().toString(36).slice(2, 10) +
        Date.now().toString(36);
      sessionStorage.setItem("wrns_pid", id);
    }
    return id;
  } catch {
    // fallback if sessionStorage blocked
    return "p_" + Math.random().toString(36).slice(2, 12);
  }
}

export async function initFirebase() {
  if (!isFirebaseConfigured()) return null;
  if (app) return { db, uid: playerId };

  app = initializeApp(FIREBASE_CONFIG);
  auth = getAuth(app);
  db = getDatabase(app);

  await signInAnonymously(auth);
  authUid = await new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) resolve(user.uid);
    });
  });

  playerId = getOrCreatePlayerId();
  return { db, uid: playerId };
}

// Returns the per-tab player ID (NOT the Firebase auth uid).
// Kept under the name getUid() so callers don't have to change.
export function getUid() {
  return playerId;
}

export function roomRef(pin, path = "") {
  if (!db) throw new Error("Firebase not initialized");
  return ref(db, `rooms/${pin}${path ? "/" + path : ""}`);
}

export async function roomExists(pin) {
  const snap = await get(roomRef(pin, "meta"));
  return snap.exists();
}

export async function createRoom(pin, hostName, lang = "zh") {
  await set(roomRef(pin), {
    meta: {
      hostId: playerId,
      lang,
      state: "lobby",
      level: 1,
      questionsAnswered: 0,
      createdAt: serverTimestamp(),
    },
    players: {
      [playerId]: {
        name: hostName,
        joinedAt: serverTimestamp(),
        isHost: true,
      },
    },
  });
  // auto-clean if host disconnects (handled in app.js too)
  onDisconnect(roomRef(pin, `players/${playerId}`)).remove();
}

export async function joinRoom(pin, playerName) {
  const exists = await roomExists(pin);
  if (!exists) throw new Error("ROOM_NOT_FOUND");
  await update(roomRef(pin, `players/${playerId}`), {
    name: playerName,
    joinedAt: serverTimestamp(),
    isHost: false,
  });
  onDisconnect(roomRef(pin, `players/${playerId}`)).remove();
}

export async function leaveRoom(pin) {
  if (!pin || !playerId) return;
  try {
    await remove(roomRef(pin, `players/${playerId}`));
  } catch (e) {
    // ignore
  }
}

export function subscribeRoom(pin, cb) {
  const r = roomRef(pin);
  return onValue(r, (snap) => cb(snap.val()));
}

export async function updateMeta(pin, patch) {
  await update(roomRef(pin, "meta"), patch);
}

export async function updateTurn(pin, turn) {
  await set(roomRef(pin, "turn"), turn);
}

export async function markUsed(pin, questionId) {
  await update(roomRef(pin, "usedQuestions"), { [questionId]: true });
}

export { runTransaction };
