// ============================================================
// 不再是陌生人 lite — bilingual group edition
// - Global top-right lang toggle (UI chrome switches between zh/en)
// - Theme + question content always shown in BOTH languages
// - No skip, no empty state — Start instantly deals the first card
// ============================================================

import { pickQuestion, themeLabels } from "./questions.js";
import { isFirebaseConfigured } from "./firebase-config.js";
import {
  initFirebase,
  getUid,
  roomExists,
  createRoom,
  joinRoom,
  leaveRoom,
  deleteRoom,
  subscribeRoom,
  updateMeta,
  updateTurn,
  markUsed,
  cleanupOldRooms,
  stopHostConnectionWatch,
  HOST_GRACE_MS,
} from "./firebase.js";

// ============================================================
// I18N — UI chrome strings only (card content is always bilingual)
// ============================================================
const I18N = {
  brand_title: { zh: "不再是陌生人", en: "We Are Not Strangers" },
  tagline: {
    zh: "一個讓你慢慢靠近的房間",
    en: "A room to slowly come closer",
  },
  name_title_create: { zh: "你叫什麼名字?", en: "What's your name?" },
  name_title_join_url: { zh: "輸入名字加入", en: "Enter your name to join" },
  name_label: { zh: "暱稱 / Your name", en: "Your name / 暱稱" },
  name_placeholder: { zh: "輸入 1–14 字", en: "1–14 characters" },
  pin_title: { zh: "輸入房間 PIN", en: "Enter the room PIN" },
  pin_tagline: { zh: "朋友給你的 4 位數字", en: "The 4 digits your friend shared" },
  pin_checking: { zh: "確認中…", en: "Checking…" },
  pin_invalid: { zh: "找不到這個房間", en: "Room not found" },
  room_pin_label: { zh: "房間", en: "Room" },
  back: { zh: "返回", en: "Back" },
  confirm: { zh: "確認", en: "Confirm" },
  lobby_title: { zh: "等待大家進來…", en: "Waiting for everyone…" },
  lobby_hint: { zh: "用 PIN 加入房間", en: "Join room with the PIN" },
  lobby_hint_offline: {
    zh: "本機 demo,大家圍著一台手機玩",
    en: "Local demo — pass one phone around",
  },
  pin_label_lobby: { zh: "房間 PIN", en: "Room PIN" },
  players_label: { zh: "玩家", en: "Players" },
  start: { zh: "開始", en: "Start" },
  leave: { zh: "離開房間", en: "Leave room" },
  game_leave: { zh: "離開", en: "Leave" },
  btn_next: { zh: "下一題 →", en: "Next →" },
  waiting_next: {
    zh: "等待房主出下一題…",
    en: "Waiting for the host's next card…",
  },
  room_closed: { zh: "房間已關閉", en: "Room closed" },
  room_not_found: {
    zh: "找不到這個房間,PIN 是不是打錯了?",
    en: "Room not found — check the PIN?",
  },
  need_name: { zh: "先告訴大家你的名字 :)", en: "Tell us your name first :)" },
  need_pin: { zh: "PIN 是 4 位數字", en: "PIN is 4 digits" },
  add_seat: { zh: "+ 新增一位玩家", en: "+ Add a player" },
  add_seat_prompt: { zh: "玩家名字?", en: "Player name?" },
  create_room_failed: {
    zh: "建立房間失敗,請重試",
    en: "Couldn't create the room — please retry",
  },
  join_failed: { zh: "加入失敗,請重試", en: "Couldn't join — please retry" },
  conn_failed_offline: {
    zh: "連線失敗,以離線模式啟動",
    en: "Connection failed — starting in offline mode",
  },
  host_label: { zh: "主持", en: "Host" },
  me_label: { zh: "我", en: "Me" },
};

function t(key) {
  const entry = I18N[key];
  if (!entry) return "";
  return entry[state.lang] ?? entry.zh ?? "";
}
function otherLang(l) {
  return l === "zh" ? "en" : "zh";
}

function applyI18n() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const txt = t(el.dataset.i18n);
    if (txt !== "") el.textContent = txt;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const txt = t(el.dataset.i18nPlaceholder);
    if (txt) el.setAttribute("placeholder", txt);
  });
  document.querySelectorAll("[data-i18n-dynamic]").forEach((el) => {
    const txt = t(el.dataset.i18nDynamic);
    if (txt !== "") el.textContent = txt;
  });
  const lbl = document.getElementById("lang-toggle-label");
  if (lbl) lbl.textContent = state.lang === "zh" ? "EN" : "中";
  document.documentElement.lang = state.lang === "zh" ? "zh-Hant" : "en";
}

function setI18n(el, key) {
  if (!el) return;
  el.dataset.i18nDynamic = key;
  el.textContent = t(key);
}

// ============================================================
// Local state
// ============================================================
const state = {
  online: false,
  mode: null,
  pin: null,
  myUid: null,
  myName: null,
  pendingAction: null,
  pendingJoinPin: null,
  room: null,
  lang: "zh",
  unsubscribe: null,
  lastCardId: 0,
  animating: false,
  offline: {
    players: [],
    used: [],
    cardId: 0,
  },
};

const INTRO_HOLD_MS = 2800;
const INTRO_FADE_OUT_MS = 260;
const QUESTION_FADE_DELAY = 120;

// ============================================================
// DOM helpers
// ============================================================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function showScreen(name) {
  $$(".screen").forEach((el) => {
    el.classList.toggle("hidden", el.dataset.screen !== name);
  });
}

function toast(msgOrKey, ms = 2200) {
  const el = $("#toast");
  const txt = I18N[msgOrKey] ? t(msgOrKey) : msgOrKey;
  el.textContent = txt;
  el.classList.remove("hidden");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.add("hidden"), ms);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c]);
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ============================================================
// PIN
// ============================================================
function generatePin() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

// ============================================================
// Landing / name entry
// ============================================================
function bindLanding() {
  $$('[data-action="create"]').forEach((b) =>
    b.addEventListener("click", () => {
      state.pendingAction = "create";
      state.pendingJoinPin = null;
      setI18n($("#name-screen-title"), "name_title_create");
      $("#room-pin-pill").hidden = true;
      $("#input-name").value = state.myName || "";
      showScreen("name");
      setTimeout(() => $("#input-name").focus(), 100);
    })
  );

  $$('[data-action="join"]').forEach((b) =>
    b.addEventListener("click", () => {
      state.pendingAction = "join";
      state.pendingJoinPin = null;
      resetOtp();
      showScreen("pin");
      setTimeout(() => $$(".otp-box")[0]?.focus(), 150);
    })
  );

  $$('[data-action="back-landing"]').forEach((b) =>
    b.addEventListener("click", () => showScreen("landing"))
  );

  // "Back" on name screen: join flow returns to pin, create flow returns to landing
  $$('[data-action="name-back"]').forEach((b) =>
    b.addEventListener("click", () => {
      if (state.pendingAction === "join") {
        resetOtp();
        showScreen("pin");
        setTimeout(() => $$(".otp-box")[0]?.focus(), 150);
      } else {
        showScreen("landing");
      }
    })
  );

  $$('[data-action="submit-name"]').forEach((b) =>
    b.addEventListener("click", onSubmitName)
  );

  $("#input-name").addEventListener("keydown", (e) => {
    if (e.key === "Enter") onSubmitName();
  });

  bindOtp();

  // Global lang toggle
  $("#lang-toggle").addEventListener("click", () => {
    state.lang = otherLang(state.lang);
    try {
      localStorage.setItem("wrns_lang", state.lang);
    } catch {}
    applyI18n();
    // re-render dynamic widgets (player list, lobby hint, etc.)
    if (state.room) renderFromRoom();
    if (state.mode === "offline") {
      if (!$('.screen[data-screen="lobby"]').classList.contains("hidden")) {
        renderOfflineLobby();
      }
    }
  });
}

async function onSubmitName() {
  const name = $("#input-name").value.trim();
  if (!name) {
    toast("need_name");
    $("#input-name").focus();
    return;
  }
  state.myName = name;

  if (state.pendingAction === "create") {
    await startAsHost(name);
  } else if (state.pendingAction === "join") {
    const pin = state.pendingJoinPin;
    if (!pin || !/^\d{4}$/.test(pin)) {
      // PIN got lost somehow — bounce back to PIN screen
      resetOtp();
      showScreen("pin");
      setTimeout(() => $$(".otp-box")[0]?.focus(), 150);
      return;
    }
    await startAsGuest(pin, name);
  }
}

// ============================================================
// OTP input — 4-box PIN entry
// ============================================================
function resetOtp() {
  $$(".otp-box").forEach((box) => {
    box.value = "";
    box.classList.remove("filled");
  });
  const status = $("#otp-status");
  if (status) {
    status.hidden = true;
    status.textContent = "";
    status.classList.remove("checking", "error");
  }
  const row = $("#otp-row");
  if (row) row.classList.remove("shake");
}

function setOtpStatus(state, key) {
  const status = $("#otp-status");
  if (!status) return;
  status.classList.remove("checking", "error");
  if (!state) {
    status.hidden = true;
    status.textContent = "";
    return;
  }
  status.hidden = false;
  status.classList.add(state);
  status.textContent = t(key);
}

function shakeOtp() {
  const row = $("#otp-row");
  if (!row) return;
  row.classList.remove("shake");
  void row.offsetWidth;
  row.classList.add("shake");
}

function bindOtp() {
  const boxes = $$(".otp-box");
  if (!boxes.length) return;

  boxes.forEach((box, idx) => {
    box.addEventListener("input", () => {
      // Strip non-digits, keep only the last digit
      const v = box.value.replace(/\D/g, "").slice(-1);
      box.value = v;
      box.classList.toggle("filled", !!v);

      // Clear any previous error state once user starts retyping
      setOtpStatus(null);

      if (v && idx < boxes.length - 1) {
        boxes[idx + 1].focus();
        boxes[idx + 1].select?.();
      }

      // All filled? submit
      const allFilled = boxes.every((b) => b.value);
      if (allFilled) {
        const pin = boxes.map((b) => b.value).join("");
        // small blur lets the last digit visually "land" before transition
        box.blur();
        onOtpComplete(pin);
      }
    });

    box.addEventListener("keydown", (e) => {
      if (e.key === "Backspace") {
        if (!box.value && idx > 0) {
          e.preventDefault();
          const prev = boxes[idx - 1];
          prev.value = "";
          prev.classList.remove("filled");
          prev.focus();
        }
      } else if (e.key === "ArrowLeft" && idx > 0) {
        e.preventDefault();
        boxes[idx - 1].focus();
      } else if (e.key === "ArrowRight" && idx < boxes.length - 1) {
        e.preventDefault();
        boxes[idx + 1].focus();
      }
    });

    box.addEventListener("paste", (e) => {
      e.preventDefault();
      const clip = (e.clipboardData || window.clipboardData).getData("text") || "";
      const digits = clip.replace(/\D/g, "").slice(0, boxes.length - idx);
      if (!digits) return;
      digits.split("").forEach((d, i) => {
        if (idx + i < boxes.length) {
          boxes[idx + i].value = d;
          boxes[idx + i].classList.add("filled");
        }
      });
      const last = Math.min(idx + digits.length, boxes.length - 1);
      boxes[last].focus();
      if (boxes.every((b) => b.value)) {
        const pin = boxes.map((b) => b.value).join("");
        onOtpComplete(pin);
      }
    });

    box.addEventListener("focus", () => box.select?.());
  });
}

async function onOtpComplete(pin) {
  if (!/^\d{4}$/.test(pin)) return;

  // Online: validate the room actually exists before advancing
  if (state.online) {
    setOtpStatus("checking", "pin_checking");
    try {
      const exists = await roomExists(pin);
      if (!exists) {
        setOtpStatus("error", "pin_invalid");
        shakeOtp();
        setTimeout(() => {
          resetOtp();
          $$(".otp-box")[0]?.focus();
        }, 600);
        return;
      }
    } catch (e) {
      // Network issue — let them try anyway, name screen will surface errors
    }
    setOtpStatus(null);
  }

  state.pendingJoinPin = pin;
  // Pre-fill room pill on the name screen
  setI18n($("#name-screen-title"), "name_title_join_url");
  $("#room-pin-pill-value").textContent = pin;
  $("#room-pin-pill").hidden = false;
  $("#input-name").value = state.myName || "";
  showScreen("name");
  setTimeout(() => $("#input-name").focus(), 150);
}

// ============================================================
// Host / Guest
// ============================================================
async function startAsHost(name) {
  if (state.online) {
    const pin = await pickUniquePin();
    try {
      await createRoom(pin, name, state.lang);
      state.pin = pin;
      state.mode = "host";
      attachRoomSubscription(pin);
      enterLobby();
    } catch (e) {
      console.error(e);
      toast("create_room_failed");
    }
  } else {
    state.pin = "0000";
    state.mode = "offline";
    state.offline.players = [{ id: "p0", name, isHost: true }];
    enterLobby();
  }
}

async function startAsGuest(pin, name) {
  if (state.online) {
    try {
      await joinRoom(pin, name);
      state.pin = pin;
      state.mode = "guest";
      attachRoomSubscription(pin);
      enterLobby();
    } catch (e) {
      if (e.message === "ROOM_NOT_FOUND") {
        toast("room_not_found");
      } else {
        console.error(e);
        toast("join_failed");
      }
    }
  } else {
    if (!state.offline.players.length) {
      state.pin = "0000";
      state.mode = "offline";
      state.offline.players = [{ id: "p0", name, isHost: true }];
    } else {
      const id = "p" + state.offline.players.length;
      state.offline.players.push({ id, name, isHost: false });
    }
    enterLobby();
  }
}

async function pickUniquePin() {
  for (let i = 0; i < 8; i++) {
    const pin = generatePin();
    const exists = await roomExists(pin);
    if (!exists) return pin;
  }
  throw new Error("Could not pick unique PIN");
}

// ============================================================
// Room subscription
// ============================================================
let hostLeaveTimer = null;

function clearHostLeaveTimer() {
  if (hostLeaveTimer) {
    clearTimeout(hostLeaveTimer);
    hostLeaveTimer = null;
  }
}

function attachRoomSubscription(pin) {
  if (state.unsubscribe) state.unsubscribe();
  state.unsubscribe = subscribeRoom(pin, (room) => {
    if (!room) {
      clearHostLeaveTimer();
      toast("room_closed");
      goHome();
      return;
    }
    state.room = room;

    // Host-disconnect grace handling.
    // If meta.hostLeftAt is set, schedule a deleteRoom for when grace expires.
    // If it gets cleared (host reconnected), cancel the pending deletion.
    const hostLeftAt = room.meta?.hostLeftAt;
    if (typeof hostLeftAt === "number" && hostLeftAt > 0) {
      const age = Date.now() - hostLeftAt;
      const remaining = HOST_GRACE_MS - age;
      if (remaining <= 0) {
        clearHostLeaveTimer();
        deleteRoom(pin).catch(() => {});
        return;
      }
      clearHostLeaveTimer();
      hostLeaveTimer = setTimeout(() => {
        hostLeaveTimer = null;
        // Re-check before nuking: host may have come back at the last second
        const stillGone = state.room?.meta?.hostLeftAt;
        if (typeof stillGone === "number" && stillGone > 0 &&
            Date.now() - stillGone >= HOST_GRACE_MS) {
          deleteRoom(pin).catch(() => {});
        }
      }, remaining + 200);
    } else {
      clearHostLeaveTimer();
    }

    renderFromRoom();
  });
}

// ============================================================
// Lobby
// ============================================================
function enterLobby() {
  showScreen("lobby");
  $("#pin-display").textContent = state.pin;

  $("#start-btn").onclick = onStartGame;
  $("#leave-lobby").onclick = () => goHome(true);

  if (state.mode === "offline") {
    renderOfflineLobby();
  } else {
    renderFromRoom();
  }
}

function renderOfflineLobby() {
  setI18n($("#lobby-hint"), "lobby_hint_offline");
  // Keep PIN card visible (shows "OFFLINE" so user always sees something here)
  const pinCard = $("#pin-card");
  if (pinCard) pinCard.style.display = "";
  $("#pin-display").textContent = "OFFLINE";

  const list = $("#players-list");
  list.innerHTML = "";
  state.offline.players.forEach((p) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="player-dot"></span>
      <span>${escapeHtml(p.name)}</span>
      ${p.isHost ? `<span class="host-badge">${escapeHtml(t("host_label"))}</span>` : ""}
    `;
    list.appendChild(li);
  });
  $("#player-count").textContent = state.offline.players.length;

  const addLi = document.createElement("li");
  const addText = t("add_seat");
  addLi.innerHTML = `<button class="ghost-btn small" id="add-seat">${escapeHtml(addText)}</button>`;
  list.appendChild(addLi);
  $("#add-seat").onclick = () => {
    const name = prompt(t("add_seat_prompt"));
    if (!name || !name.trim()) return;
    const id = "p" + state.offline.players.length;
    state.offline.players.push({ id, name: name.trim(), isHost: false });
    renderOfflineLobby();
  };

  $("#start-btn").disabled = state.offline.players.length < 1;
}

function renderFromRoom() {
  const room = state.room;
  if (!room) return;

  const myUid = getUid();
  const players = room.players || {};
  const playerArr = orderedPlayers(players);
  const isHost = room.meta?.hostId === myUid;
  state.mode = isHost ? "host" : "guest";

  if (room.meta?.state === "playing") {
    if ($('.screen[data-screen="game"]').classList.contains("hidden")) {
      showScreen("game");
    }
    renderGame(room, isHost);
    return;
  }

  if ($('.screen[data-screen="lobby"]').classList.contains("hidden")) {
    showScreen("lobby");
  }

  // Online lobby — make sure PIN card is visible AND PIN value is set
  const pinCard = $("#pin-card");
  if (pinCard) pinCard.style.display = "";
  if (state.pin) $("#pin-display").textContent = state.pin;

  const list = $("#players-list");
  list.innerHTML = "";
  playerArr.forEach((p) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="player-dot"></span>
      <span>${escapeHtml(p.name)}</span>
      ${p.isHost ? `<span class="host-badge">${escapeHtml(t("host_label"))}</span>` : ""}
      ${p.id === myUid ? `<span class="me-badge">${escapeHtml(t("me_label"))}</span>` : ""}
    `;
    list.appendChild(li);
  });
  $("#player-count").textContent = playerArr.length;

  // Only host with at least 1 player can start
  $("#start-btn").disabled = !(isHost && playerArr.length >= 1);
}

function orderedPlayers(players) {
  return Object.entries(players || {})
    .map(([id, p]) => ({ id, ...p }))
    .sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));
}

// ============================================================
// Game render
// ============================================================
function renderGame(room, isHost) {
  const turn = room.turn || {};
  const cardId = turn.cardId || 0;

  if (cardId > state.lastCardId && turn.question && !state.animating) {
    state.lastCardId = cardId;
    playCardIntro(turn.question);
  }

  // Buttons: only btn-next (host) or waiting note (guest)
  $("#btn-next").hidden = !isHost;
  if (!isHost) {
    $("#waiting-note").hidden = false;
    setI18n($("#waiting-note"), "waiting_next");
  } else {
    $("#waiting-note").hidden = true;
  }

  const guarded = () => {
    if (state.animating) return;
    dealNextCard(room);
  };
  $("#btn-next").onclick = guarded;
  $("#game-leave").onclick = () => goHome(true);
}

async function dealNextCard(room) {
  const used = Object.keys(room.usedQuestions || {});
  const q = pickQuestion(used);
  const cardId = (room.turn?.cardId || 0) + 1;
  await updateTurn(state.pin, {
    cardId,
    question: q,
    dealtAt: Date.now(),
  });
  await markUsed(state.pin, q.id);
}

// ============================================================
// Theme intro animation
// ============================================================
function getOrCreateBackdrop() {
  let bd = document.getElementById("theme-backdrop");
  if (!bd) {
    bd = document.createElement("div");
    bd.id = "theme-backdrop";
    bd.className = "theme-backdrop";
    document.body.appendChild(bd);
  }
  return bd;
}

async function playCardIntro(question) {
  const themes = themeLabels(question.themeId);

  state.animating = true;

  const overlay = $("#theme-overlay");
  const overlayZh = $("#theme-overlay-zh");
  const overlayEn = $("#theme-overlay-en");
  const themeSmall = $("#qcard-theme");
  const themeSmallZh = $("#qcard-theme-zh");
  const themeSmallEn = $("#qcard-theme-en");
  const qTextWrap = $("#qcard-text");
  const qTextZh = $("#qcard-text-zh");
  const qTextEn = $("#qcard-text-en");
  const backdrop = getOrCreateBackdrop();

  // 1. Fade out previous content (if any)
  const hadContent =
    qTextWrap.classList.contains("visible") ||
    themeSmall.classList.contains("visible");
  themeSmall.classList.remove("visible");
  qTextWrap.classList.remove("visible");
  if (hadContent) await wait(380);

  // 2. Swap content
  themeSmallZh.textContent = themes.zh;
  themeSmallEn.textContent = themes.en;
  qTextZh.textContent = question.zh;
  qTextEn.textContent = question.en;

  // 3. Simple centered topic intro
  overlayZh.textContent = themes.zh;
  overlayEn.textContent = themes.en;
  overlay.classList.remove("fade-out");
  overlay.classList.add("show");
  void overlay.offsetWidth;
  backdrop.classList.remove("fade-out");
  backdrop.classList.add("show");

  await wait(INTRO_HOLD_MS);

  // 4. Hide overlay, then reveal the normal card with its top-left topic
  overlay.classList.add("fade-out");
  backdrop.classList.add("fade-out");
  await wait(INTRO_FADE_OUT_MS);
  themeSmall.classList.add("visible");

  await wait(QUESTION_FADE_DELAY);
  qTextWrap.classList.add("visible");

  await wait(450);
  overlay.classList.remove("show", "fade-out");
  backdrop.classList.remove("show", "fade-out");

  state.animating = false;
}

// ============================================================
// Start game — deals first card immediately
// ============================================================
async function onStartGame() {
  if (state.mode === "offline") {
    state.offline.used = [];
    state.offline.cardId = 0;
    showScreen("game");
    enterGameOffline();
    // immediately deal first card
    await offlineNextCard();
    return;
  }

  if (!state.room) return;
  const players = orderedPlayers(state.room.players);
  if (players.length < 1) return;

  // Deal first card BEFORE flipping state → playing, so guests see
  // both atomically (turn already populated when state arrives)
  const q = pickQuestion([]);
  await updateTurn(state.pin, {
    cardId: 1,
    question: q,
    dealtAt: Date.now(),
  });
  await markUsed(state.pin, q.id);
  await updateMeta(state.pin, { state: "playing" });
}

// ============================================================
// Offline game
// ============================================================
function enterGameOffline() {
  $("#btn-next").hidden = false;
  $("#waiting-note").hidden = true;

  $("#btn-next").onclick = () => {
    if (state.animating) return;
    offlineNextCard();
  };
  $("#game-leave").onclick = () => goHome(true);
}

async function offlineNextCard() {
  if (state.animating) return;
  const q = pickQuestion(state.offline.used);
  state.offline.used.push(q.id);
  state.offline.cardId += 1;
  await playCardIntro(q);
}

// ============================================================
// Misc
// ============================================================
async function goHome(removeMe = false) {
  clearHostLeaveTimer();
  if (state.mode === "host") {
    // Stop watching connection so reconnect won't re-arm onDisconnect on a
    // room we're abandoning.
    stopHostConnectionWatch();
  }
  if (removeMe && state.online && state.pin) {
    if (state.mode === "host") {
      // Host leaving disbands the entire room.
      await deleteRoom(state.pin);
    } else {
      await leaveRoom(state.pin);
    }
  }
  if (state.unsubscribe) {
    state.unsubscribe();
    state.unsubscribe = null;
  }
  state.pin = null;
  state.mode = null;
  state.room = null;
  state.lastCardId = 0;
  state.animating = false;
  state.offline = { players: [], used: [], cardId: 0 };

  // reset card visuals
  $("#qcard-theme-zh").textContent = "";
  $("#qcard-theme-en").textContent = "";
  $("#qcard-theme").classList.remove("visible");
  $("#qcard-text-zh").textContent = "";
  $("#qcard-text-en").textContent = "";
  $("#qcard-text").classList.remove("visible");

  const overlay = $("#theme-overlay");
  if (overlay) {
    overlay.classList.remove("show", "fade-out");
  }
  const bd = document.getElementById("theme-backdrop");
  if (bd) bd.classList.remove("show", "fade-out");

  showScreen("landing");
}

// ============================================================
// Boot
// ============================================================
async function boot() {
  try {
    const saved = localStorage.getItem("wrns_lang");
    if (saved === "zh" || saved === "en") state.lang = saved;
  } catch {}

  bindLanding();
  showScreen("landing");
  applyI18n();

  const urlPin = new URLSearchParams(location.search).get("pin");

  if (isFirebaseConfigured()) {
    try {
      const r = await initFirebase();
      if (r) {
        state.myUid = r.uid;
        state.online = true;
        // Fire-and-forget: scrub stale rooms in the background.
        cleanupOldRooms();
        if (urlPin && /^\d{4}$/.test(urlPin)) {
          // QR-scan / link entry: PIN already known, skip OTP screen
          state.pendingAction = "join";
          state.pendingJoinPin = urlPin;
          setI18n($("#name-screen-title"), "name_title_join_url");
          $("#room-pin-pill-value").textContent = urlPin;
          $("#room-pin-pill").hidden = false;
          showScreen("name");
          setTimeout(() => $("#input-name").focus(), 150);
        }
      }
    } catch (e) {
      console.error("Firebase init failed:", e);
      toast("conn_failed_offline");
      state.online = false;
    }
  } else {
    state.online = false;
  }
}

boot();
