# 不再是陌生人 lite (WRNS-lite)

一個輕量版的《We Are Not Strangers》多人連線網頁遊戲。
朋友掃 QR code 或輸入 4 位數 PIN 就能加入,輪流抽題,逐層深入。

## 功能

- **多人連線**:Firebase Realtime Database 即時同步,不限地點
- **三層深度題目**:Level 1 開場 → Level 2 靠近 → Level 3 深處
- **中文 / English** 題庫各 90 題
- **跳過 / 反問** 機制
- **房主控制節奏**:房主按「下一題」推進
- **離線 demo 模式**:沒設定 Firebase 也能在同一台裝置上玩 (pass-and-play)

## 快速開始 (離線 demo)

直接打開 `index.html` 就能玩單機版,不用任何設定。

```bash
# 本機簡單起一個 server
cd wrns
python3 -m http.server 8080
# 開 http://localhost:8080
```

> ESM 載入需要透過 http server,不能直接 file:// 開。

## 設定 Firebase (啟用多人連線)

### 1. 建立 Firebase 專案
1. 進入 https://console.firebase.google.com/
2. 點「Add project」,取個名字,跳過 Analytics 也行
3. 進入專案後,左側 menu → **Build → Realtime Database** → Create Database
   - 位置選離你最近的 (例如 asia-southeast1)
   - Start in **test mode** (我們等下會改規則)

### 2. 設定資料庫規則
進入 Realtime Database → **Rules** 頁籤,貼上:

```json
{
  "rules": {
    "rooms": {
      "$pin": {
        ".read": true,
        ".write": true,
        ".validate": "$pin.matches(/^[0-9]{4}$/)"
      }
    }
  }
}
```

按 **Publish**。

### 3. 啟用匿名登入
左側 menu → **Build → Authentication** → Get Started
→ **Sign-in method** 頁籤 → 啟用 **Anonymous**

### 4. 拿到設定 (config)
左側 menu → **齒輪 → Project settings**
→ 滑到下方 "Your apps" → 點 `</>` (Web) 圖示新增一個 Web app
→ 取個暱稱 (不用啟用 Firebase Hosting) → Register app
→ 會看到一段 `const firebaseConfig = {...}` — 把整個物件複製下來

### 5. 貼到 `firebase-config.js`
打開 `firebase-config.js`,把 `FIREBASE_CONFIG` 內的 `REPLACE_ME` 通通換成你的值:

```js
export const FIREBASE_CONFIG = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcd...",
};
```

存檔,重新整理頁面。右下角會從「離線模式」變成「已連線」。

## 部署上線

### Vercel (最快)
1. 把這個資料夾上傳到 GitHub
2. https://vercel.com/new → 選那個 repo → Deploy
3. 完成,拿到 `xxx.vercel.app` 的網址

### Netlify
1. https://app.netlify.com/drop → 把整個資料夾拖進去
2. 完成,拿到 `xxx.netlify.app` 的網址

### GitHub Pages
1. push 到 GitHub
2. repo Settings → Pages → Branch: main / root → Save
3. `https://你的帳號.github.io/wrns/`

> 部署完之後,QR code 會自動帶上你的網址 + PIN 參數,朋友掃了就直接進房間。

## 怎麼玩

1. **房主** 在自己的裝置上點「建立房間」,輸入名字
2. 螢幕上會顯示 **4 位數 PIN** 和 **QR code**
3. **朋友** 掃 QR(或自己手機開網站輸入 PIN),輸入名字加入
4. 至少 2 人到齊,房主按「開始」
5. 系統會輪流指定一位玩家回答一題
   - **跳過**:不想答這題,換一題同等級
   - **反問**:把這題丟給房主回答
   - **下一題**:房主按下,進入下一輪
6. 每答 6 題,題目深度自動 +1 (最多到 Level 3)

## 檔案結構

```
wrns/
├── index.html          # 主頁面
├── style.css           # 樣式
├── app.js              # 主邏輯
├── firebase.js         # Firebase 包裝
├── firebase-config.js  # 你的金鑰 (要編輯)
├── questions.js        # 題庫
└── README.md
```

## 安全性說明

Firebase 規則目前是「任何人知道 PIN 就能讀寫」,適合朋友聚會。
正式上線要鎖更嚴的話,可以加入:
- PIN 長度增加 / 加 token
- 房間 TTL (一段時間自動清掉)
- 規則裡用 `auth.uid` 驗證身份

## 致謝

題目原創,風格啟發自 *We Are Not Strangers* 卡牌遊戲。本專案非官方、未授權,僅供個人使用。
