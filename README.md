# 🎮 GameZone — Mini O'yinlar Platformasi

O'zbek tilida yaratilgan **multiplayer va yakkama-yakka mini o'yinlar** sayti.  
Login, tanga tizimi, skin do'koni va real-time online o'yin imkoniyatlari mavjud.

---

## 🚀 Jonli Ko'rinish

> `index.html` faylini brauzerda oching yoki GitHub Pages orqali hosting qiling.

---

## 🎯 O'yinlar Ro'yxati

### 🌐 Multiplayer (2 qurilma, real-time)
| O'yin | Tavsif | Mukofot |
|-------|--------|---------|
| ⭕ Tic-Tac-Toe | 3×3 klassik o'yin | +50 🪙 |
| 🔴 Connect Four | 4 tani qatorga tizing | +75 🪙 |
| 🧠 Quiz Battle | 50 savol, kim bilimli | +60 🪙 |

### 🕹️ Yakkama-yakka (CPU ga qarshi)
| O'yin | Tavsif | Mukofot |
|-------|--------|---------|
| 🟩 Wordle | 5 harfli so'z topish, 6 urinish | +100 🪙 |
| 🐍 Snake | Ilon boshqarish, daraja tizimi | +20 🪙 |
| 🃏 Memory | Juft kartalarni eslash | +80 🪙 |
| 🏓 Pong | To'p urish o'yini | +75 🪙 |
| 💣 Minalar | Minasweeper, 3 daraja | +90 🪙 |
| ✊ Tosh-Qaychi-Qog'oz | 5 raund duel | +60 🪙 |
| 🧮 Math Duel | Tezkor matematika | +80 🪙 |
| ⌨️ Typing Race | Yozish poygasi, WPM | +50 🪙 |

---

## ✨ Imkoniyatlar

- 🔐 **Login / Ro'yxat** — username + parol tizimi
- 🌐 **Real-time Multiplayer** — Ably orqali ikki qurilmada o'ynash
- 🪙 **Tanga Tizimi** — g'alaba qozonib tanga yig'ish
- 🎨 **Skin Do'koni** — 12 ta rang skini sotib olish
- 🏆 **Reyting** — eng yaxshi o'yinchilar ro'yxati
- 📱 **Responsive** — telefon va noutbukda ishlaydi

---

## 🛠️ Texnologiyalar

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Real-time:** [Ably Realtime](https://ably.com) (WebSocket)
- **Ma'lumotlar:** localStorage (foydalanuvchilar)
- **Fonts:** Google Fonts (Orbitron, Rajdhani)

---

## ⚙️ O'rnatish

### 1. Repo ni clone qiling
```bash
git clone https://github.com/YOUR_USERNAME/gamezone.git
cd gamezone
```

### 2. Ably API key sozlash
`firebase.js` faylini oching va `ABLY_KEY` ni o'zgartiring:
```javascript
const ABLY_KEY = 'YOUR_ABLY_API_KEY';
```
> **Bepul key olish:** [ably.com](https://ably.com) → Sign up → API Keys

### 3. Ishga tushirish
```bash
# Node.js bilan:
npx serve .

# Python bilan:
python -m http.server 8080
```
Yoki `index.html` ni to'g'ridan-to'g'ri brauzerda oching.

---

## 🌍 GitHub Pages Hosting

1. GitHub da repo yarating
2. Barcha fayllarni yuklang
3. **Settings → Pages → Branch: main → Save**
4. `https://YOUR_USERNAME.github.io/gamezone/` manzili tayyor!

---

## 🎮 O'ynash Yo'riqnomasi

### Multiplayer (2 qurilma)
1. Har ikki qurilmada `index.html` oching
2. Har biri ro'yxatdan o'tsin
3. O'yin tanlang → **Xona Raqami** → masalan `1234`
4. Ikkinchi qurilmada ham `1234` kiriting
5. O'yin boshlanadi! 🚀

### Yakkama-yakka
1. O'yinni bosing → to'g'ridan-to'g'ri ochiladi
2. CPU ga qarshi o'ynang va tanga yig'ing

---

## 📁 Fayl Tuzilishi

```
gamezone/
├── index.html          # Login / Ro'yxat
├── dashboard.html      # Asosiy sahifa
├── auth.css            # Login stillari
├── auth.js             # Login logikasi
├── dashboard.css       # Dashboard stillari
├── dashboard.js        # Dashboard logikasi
├── firebase.js         # Ably real-time backend
├── coins.js            # Tanga + skin tizimi
├── game.js             # Multiplayer controller
├── tictactoe.html      # Tic-Tac-Toe
├── connect4.html       # Connect Four
├── quiz.html           # Quiz Battle
├── wordle.html         # Wordle
├── snake.html          # Snake
├── memory.html         # Memory Karta
├── pong.html           # Pong
├── minesweeper.html    # Minalar
├── rps.html            # Tosh-Qaychi-Qog'oz
├── math_duel.html      # Math Duel
├── typing_race.html    # Typing Race
└── README.md           # Shu fayl
```

---

## 📜 Litsenziya

MIT License — istalgan maqsadda foydalanish mumkin.

---

**⭐ Yoqsa — GitHub da star qo'ying!**
