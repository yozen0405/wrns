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
  brand_title: { zh: "當我們不再是陌生人", en: "We Are Not Strangers" },
  tagline: {
    zh: "一個快速拉近距離的小遊戲",
    en: "A quick game for getting closer",
  },
  name_title_create: { zh: "你叫什麼名字?", en: "What's your name?" },
  name_title_join_url: { zh: "輸入名字加入", en: "Enter your name to join" },
  name_label: { zh: "暱稱 / Your name", en: "Your name / 暱稱" },
  name_placeholder: { zh: "輸入 1–14 字", en: "1–14 characters" },
  pin_title: { zh: "輸入房間 PIN", en: "Enter the room PIN" },
  pin_tagline: { zh: "四位數字", en: "4 digits from the host" },
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
  confirm_leave_title: { zh: "確認離開?", en: "Leave?" },
  confirm_leave_host_body: {
    zh: "你是房主,離開後房間會被解散,其他人會被踢回主畫面。",
    en: "You're the host — leaving will close the room and send everyone home.",
  },
  confirm_leave_guest_body: {
    zh: "你會離開這個房間,其他人繼續玩。",
    en: "You'll leave this room. Everyone else keeps playing.",
  },
  confirm_leave_offline_body: {
    zh: "確認結束這場本機 demo?",
    en: "End this local demo session?",
  },
  confirm_leave_yes: { zh: "離開", en: "Leave" },
  confirm_leave_cancel: { zh: "取消", en: "Cancel" },
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
  updateNavBack();
}

// Show the top-left back arrow only on screens where "back" makes sense.
function updateNavBack() {
  const back = document.getElementById("nav-back");
  if (!back) return;
  const current = document.querySelector(".screen:not(.hidden)")?.dataset.screen;
  back.hidden = !(current === "pin" || current === "name");
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
// Confirm modal — generic yes/cancel dialog
// ============================================================
let modalEscapeHandler = null;

function showModal({ titleKey, bodyKey, confirmKey = "confirm_leave_yes",
                     cancelKey = "confirm_leave_cancel", danger = true,
                     onConfirm }) {
  const backdrop = $("#modal-backdrop");
  if (!backdrop) return;

  setI18n($("#modal-title"), titleKey);
  setI18n($("#modal-body"), bodyKey);
  setI18n($("#modal-confirm"), confirmKey);
  setI18n($("#modal-cancel"), cancelKey);
  $("#modal-confirm").classList.toggle("danger", !!danger);
  backdrop.hidden = false;

  const close = () => {
    backdrop.hidden = true;
    if (modalEscapeHandler) {
      document.removeEventListener("keydown", modalEscapeHandler);
      modalEscapeHandler = null;
    }
  };

  modalEscapeHandler = (e) => {
    if (e.key === "Escape") close();
  };
  document.addEventListener("keydown", modalEscapeHandler);

  $("#modal-cancel").onclick = close;
  $("#modal-confirm").onclick = () => {
    close();
    onConfirm?.();
  };
  // Click backdrop (but not the card) cancels
  backdrop.onclick = (e) => {
    if (e.target === backdrop) close();
  };
}

function confirmLeave(onConfirm) {
  let bodyKey;
  if (state.mode === "offline") {
    bodyKey = "confirm_leave_offline_body";
  } else if (state.mode === "host") {
    bodyKey = "confirm_leave_host_body";
  } else {
    bodyKey = "confirm_leave_guest_body";
  }
  showModal({
    titleKey: "confirm_leave_title",
    bodyKey,
    confirmKey: "confirm_leave_yes",
    cancelKey: "confirm_leave_cancel",
    onConfirm,
  });
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
      setTimeout(() => $("#otp-input")?.focus(), 150);
    })
  );

  $$('[data-action="submit-name"]').forEach((b) =>
    b.addEventListener("click", onSubmitName)
  );

  $("#input-name").addEventListener("keydown", (e) => {
    if (e.key === "Enter") onSubmitName();
  });

  // Top-left back arrow — context-aware
  document.getElementById("nav-back").addEventListener("click", () => {
    const current = document.querySelector(".screen:not(.hidden)")?.dataset.screen;
    if (current === "pin") {
      showScreen("landing");
    } else if (current === "name") {
      if (state.pendingAction === "join") {
        resetOtp();
        showScreen("pin");
        setTimeout(() => $("#otp-input")?.focus(), 150);
      } else {
        showScreen("landing");
      }
    }
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
      setTimeout(() => $("#otp-input")?.focus(), 150);
      return;
    }
    await startAsGuest(pin, name);
  }
}

// ============================================================
// OTP input — 4 display cells + 1 transparent input
// Users can only type / backspace. Clicking a specific cell does nothing,
// because the cells aren't focusable — taps land on the single input.
// ============================================================
const OTP_LENGTH = 4;

function getOtpInput() {
  return document.getElementById("otp-input");
}
function getOtpCells() {
  return $$(".otp-cell");
}

function renderOtp() {
  const input = getOtpInput();
  const cells = getOtpCells();
  if (!input || !cells.length) return;
  const v = input.value.replace(/\D/g, "").slice(0, OTP_LENGTH);
  if (v !== input.value) input.value = v;

  const focused = document.activeElement === input;
  cells.forEach((cell, i) => {
    cell.textContent = v[i] || "";
    cell.classList.toggle("filled", !!v[i]);
    // Active = the next empty cell (or the last one once full) when focused
    const isActive =
      focused && (i === v.length || (v.length === OTP_LENGTH && i === OTP_LENGTH - 1));
    cell.classList.toggle("active", !!isActive);
  });
}

function resetOtp() {
  const input = getOtpInput();
  if (input) input.value = "";
  getOtpCells().forEach((c) => c.classList.remove("filled", "active"));
  const status = $("#otp-status");
  if (status) {
    status.hidden = true;
    status.textContent = "";
    status.classList.remove("checking", "error");
  }
  const row = $("#otp-cells");
  if (row) row.classList.remove("shake");
}

function setOtpStatus(kind, key) {
  const status = $("#otp-status");
  if (!status) return;
  status.classList.remove("checking", "error");
  if (!kind) {
    status.hidden = true;
    status.textContent = "";
    return;
  }
  status.hidden = false;
  status.classList.add(kind);
  status.textContent = t(key);
}

function shakeOtp() {
  const row = $("#otp-cells");
  if (!row) return;
  row.classList.remove("shake");
  void row.offsetWidth;
  row.classList.add("shake");
}

function bindOtp() {
  const input = getOtpInput();
  const row = $("#otp-cells");
  if (!input || !row) return;

  // Any tap on the cell row focuses the input.
  row.addEventListener("mousedown", (e) => {
    // Avoid double-firing on the input itself
    if (e.target === input) return;
    e.preventDefault();
    input.focus();
  });
  row.addEventListener("touchstart", (e) => {
    if (e.target === input) return;
    // Don't preventDefault — iOS needs the tap to open the keyboard
    setTimeout(() => input.focus(), 0);
  }, { passive: true });

  input.addEventListener("input", () => {
    // Strip non-digits, cap at OTP_LENGTH
    const cleaned = input.value.replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (cleaned !== input.value) input.value = cleaned;
    // Keep cursor pinned at the end
    try {
      input.setSelectionRange(input.value.length, input.value.length);
    } catch {}
    // Clear any previous error state once user starts retyping
    setOtpStatus(null);
    renderOtp();
    if (input.value.length === OTP_LENGTH) {
      input.blur();
      onOtpComplete(input.value);
    }
  });

  // Prevent cursor movement so backspace always deletes from the right
  input.addEventListener("keydown", (e) => {
    if (
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "ArrowUp" ||
      e.key === "ArrowDown" ||
      e.key === "Home" ||
      e.key === "End"
    ) {
      e.preventDefault();
    }
  });

  // Cursor pin on focus / click
  input.addEventListener("focus", () => {
    try {
      input.setSelectionRange(input.value.length, input.value.length);
    } catch {}
    renderOtp();
  });
  input.addEventListener("blur", renderOtp);
  input.addEventListener("click", () => {
    try {
      input.setSelectionRange(input.value.length, input.value.length);
    } catch {}
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
          $("#otp-input")?.focus();
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
  $("#leave-lobby").onclick = () => confirmLeave(() => goHome(true));

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
  $("#game-leave").onclick = () => confirmLeave(() => goHome(true));
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
  backdrop.classList.remove("fade-out");
  backdrop.classList.add("show");
  await new Promise((resolve) => requestAnimationFrame(resolve));
  overlay.classList.add("show");

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
  $("#game-leave").onclick = () => confirmLeave(() => goHome(true));
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
