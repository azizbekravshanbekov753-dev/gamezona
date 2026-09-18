# 🔥 Firebase Sozlash Yo'riqnomasi

## 1-qadam: Firebase loyiha yaratish

1. **https://console.firebase.google.com** ga kiring
2. **"Add project"** bosing
3. Loyiha nomini kiriting (masalan: `gamezone-uz`)
4. Google Analytics: o'chirib qo'ying (ixtiyoriy)
5. **"Create project"** bosing

---

## 2-qadam: Realtime Database yaratish

1. Chap menuda **"Build" → "Realtime Database"** bosing
2. **"Create Database"** bosing
3. **Region**: `United States (us-central1)` tanlang
4. **Security rules**: `"Start in test mode"` tanlang (bepul sinov uchun)
5. **"Enable"** bosing

---

## 3-qadam: Config olish

1. Chap menuda tishli g'ildirak (**Project settings**) bosing
2. **"Your apps"** bo'limida `</>` (Web) ikonasini bosing
3. App nickname kiriting: `GameZone Web`
4. **"Register app"** bosing
5. Quyidagi kabi **firebaseConfig** ko'rasiz:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "gamezone-uz.firebaseapp.com",
  databaseURL: "https://gamezone-uz-default-rtdb.firebaseio.com",
  projectId: "gamezone-uz",
  storageBucket: "gamezone-uz.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

---

## 4-qadam: firebase.js ni yangilash

`firebase.js` faylini oching va **FIREBASE_CONFIG** ni o'z ma'lumotlaringiz bilan to'ldiring:

```javascript
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX",   // ← o'zgartiring
  authDomain:        "gamezone-uz.firebaseapp.com",          // ← o'zgartiring
  databaseURL:       "https://gamezone-uz-default-rtdb.firebaseio.com", // ← o'zgartiring
  projectId:         "gamezone-uz",                          // ← o'zgartiring
  storageBucket:     "gamezone-uz.appspot.com",              // ← o'zgartiring
  messagingSenderId: "123456789012",                         // ← o'zgartiring
  appId:             "1:123456789012:web:abcdef1234567890"   // ← o'zgartiring
};
```

---

## 5-qadam: Database Rules sozlash

Firebase Console → Realtime Database → **"Rules"** tabiga o'ting va quyidagini qo'ying:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": true,
        ".write": true
      }
    },
    "rooms": {
      "$gameType": {
        "$roomCode": {
          ".read": true,
          ".write": true
        }
      }
    },
    "queue": {
      "$gameType": {
        ".read": true,
        ".write": true
      }
    },
    "invites": {
      "$userId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

**"Publish"** bosing.

---

## 6-qadam: Saytni ishga tushirish

### Localhost bilan (tavsiya)
```bash
# Node.js o'rnatilgan bo'lsa:
npx serve .

# yoki Python bilan:
python -m http.server 8080
```
Keyin brauzerda: **http://localhost:8080**

### To'g'ridan-to'g'ri fayl ochish
`index.html` ni brauzerda oching.
> ⚠️ Ba'zi brauzerlar `file://` protokolida Firebase ni bloklaydi. Localhost ishlatish afzal.

---

## 7-qadam: Ikki qurilmada sinash

1. **1-qurilma** (telefon yoki noutbuk): `index.html` oching → Ro'yxatdan o'ting
2. **2-qurilma** (boshqa telefon yoki noutbuk): `index.html` oching → Ro'yxatdan o'ting
3. Har ikki qurilmada **dashboard** ga kiring
4. O'yin tanlang → **"Xona Raqami"** bosing
5. **1-qurilma**: 4 xonali raqam kiriting (masalan: `1234`) → Kirish
6. **2-qurilma**: Bir xil raqamni kiriting (`1234`) → Kirish
7. O'yin boshlanadi! 🎮

---

## Muammolar

| Muammo | Yechim |
|--------|--------|
| `Firebase is not defined` | HTML `<head>` da Firebase SDK mavjudligini tekshiring |
| `Permission denied` | Database Rules ni yuqoridagi kabi sozlang |
| Raqib ko'rinmaydi | Ikki qurilma internet ga ulanganini tekshiring |
| `databaseURL` xatosi | Firebase config dagi `databaseURL` ni to'g'ri kiriting |

---

## Bepul limit

Firebase Spark (bepul) rejimida:
- **100 ta** bir vaqtdagi ulanish
- **1 GB** ma'lumot saqlash
- **10 GB/oy** trafik

Bu kichik o'yin sayti uchun **yetarli**! 🚀
