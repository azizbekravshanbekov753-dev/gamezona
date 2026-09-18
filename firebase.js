// ═══════════════════════════════════════════════
//  MULTIPLAYER — PeerJS (Browser-to-Browser)
//  GitHub Pages da to'liq ishlaydi!
// ═══════════════════════════════════════════════

// ═══════════════════════════════════════════════
//  USER — localStorage
// ═══════════════════════════════════════════════
function getUsers()   { return JSON.parse(localStorage.getItem('gz_users') || '{}'); }
function saveUsers(u) { localStorage.setItem('gz_users', JSON.stringify(u)); }
function getCurrentKey()  { return localStorage.getItem('gz_current_user'); }
function getCurrentUser() { const k = getCurrentKey(); return k ? getUsers()[k] : null; }

// ═══════════════════════════════════════════════
//  ROOM SYSTEM — PeerJS asosida
//
//  Qanday ishlaydi:
//  1. Har ikki o'yinchi "gz-{game}-{code}" ID bilan Peer yaratadi
//  2. Birinchi kirgan = HOST (ID = gz-{game}-{code}-host)
//  3. Ikkinchi kirgan = GUEST, hostga ulanadi
//  4. Ular P2P orqali o'ynaydi
// ═══════════════════════════════════════════════

let _peer = null;
let _conn = null;
let _stateCallback = null;

function makePeerId(gameType, code, role) {
  // Faqat harf va raqamdan iborat bo'lishi kerak
  const clean = (gameType + code).replace(/[^a-zA-Z0-9]/g, '');
  return `gz${clean}${role}`;
}

function enterRoom(gameType, code, myKey, onReady) {
  const hostId  = makePeerId(gameType, code, 'h');
  const guestId = makePeerId(gameType, code, 'g') + Date.now().toString().slice(-4);

  let settled = false;
  let timeoutId;
  let tryGuestInterval;

  function finish(p1, p2) {
    if (settled) return;
    settled = true;
    clearTimeout(timeoutId);
    clearInterval(tryGuestInterval);
    onReady(p1, p2);
  }

  // Birinchi host sifatida urinib ko'r
  const hostPeer = new Peer(hostId, { debug: 0 });

  hostPeer.on('open', () => {
    // Host bo'ldik — guest kutamiz
    _peer = hostPeer;

    hostPeer.on('connection', (conn) => {
      _conn = conn;
      conn.on('open', () => {
        conn.send({ type: 'ready', p1: myKey, p2: conn.metadata });
        finish(myKey, conn.metadata);
      });
      conn.on('data', (data) => {
        if (_stateCallback) _stateCallback(data);
      });
    });
  });

  hostPeer.on('error', (err) => {
    // Host ID band — guest sifatida ulanamiz
    hostPeer.destroy();

    const guestPeer = new Peer(guestId, { debug: 0 });
    _peer = guestPeer;

    guestPeer.on('open', () => {
      function tryConnect() {
        if (settled) return;
        const conn = guestPeer.connect(hostId, { metadata: myKey, reliable: true });
        conn.on('open', () => {
          _conn = conn;
          conn.on('data', (data) => {
            if (data.type === 'ready') {
              finish(data.p1, data.p2);
            } else if (_stateCallback) {
              _stateCallback(data);
            }
          });
        });
        conn.on('error', () => {});
      }

      tryConnect();
      tryGuestInterval = setInterval(tryConnect, 2000);
    });

    guestPeer.on('error', () => {});
  });

  timeoutId = setTimeout(() => finish(null, null), 120000);

  return () => {
    settled = true;
    clearTimeout(timeoutId);
    clearInterval(tryGuestInterval);
    try { if (_conn) _conn.close(); } catch(e) {}
    try { if (_peer) _peer.destroy(); } catch(e) {}
    _peer = null; _conn = null;
  };
}

// ═══════════════════════════════════════════════
//  GAME STATE — P2P yuborish
// ═══════════════════════════════════════════════
function sendState(gameType, code, stateObj) {
  if (_conn && _conn.open) {
    try { _conn.send({ ...stateObj, _type: 'state' }); } catch(e) {}
  }
}

function listenState(gameType, code, callback) {
  _stateCallback = (data) => {
    if (data && data._type === 'state') callback(data);
  };
  return () => { _stateCallback = null; };
}

function sendGameOver(gameType, code, winner) {
  if (_conn && _conn.open) {
    try { _conn.send({ _type: 'over', winner }); } catch(e) {}
  }
}

// ═══════════════════════════════════════════════
//  QUEUE — Tasodifiy raqib
//  Shared room code ishlatamiz
// ═══════════════════════════════════════════════
function findRandom(gameType, myKey, onMatch) {
  // Tasodifiy kod o'rniga — umumiy "random" xonasiga ulanamiz
  const code = 'rand0m';
  let settled = false;

  const cancel = enterRoom(gameType, code, myKey, (p1, p2) => {
    if (settled) return;
    settled = true;
    if (!p1) { onMatch(null, null, null); return; }
    onMatch(p1, p2, code);
  });

  return () => { settled = true; cancel(); };
}

// ═══════════════════════════════════════════════
//  INVITE — Do'st chaqirish (Ably orqali xabar)
// ═══════════════════════════════════════════════
function sendInvite(toKey, fromKey, gameType, code) {
  // localStorage orqali invite (bir xil qurilmada) + Ably
  const invKey = `gz_inv_${toKey}`;
  const invites = JSON.parse(localStorage.getItem(invKey) || '[]');
  invites.push({ from: fromKey, gameType, code, ts: Date.now() });
  localStorage.setItem(invKey, JSON.stringify(invites));
}

function listenInvites(myKey, callback) {
  const invKey = `gz_inv_${myKey}`;
  const check = setInterval(() => {
    const invites = JSON.parse(localStorage.getItem(invKey) || '[]');
    const fresh = invites.filter(i => Date.now() - i.ts < 120000);
    if (fresh.length > 0) {
      localStorage.removeItem(invKey);
      fresh.forEach(callback);
    }
  }, 1000);
  return () => clearInterval(check);
}

// ═══════════════════════════════════════════════
//  COINS & STATS
// ═══════════════════════════════════════════════
function addCoins(amount) {
  const key = getCurrentKey(); if (!key) return;
  const users = getUsers(); if (!users[key]) return;
  users[key].coins = (users[key].coins || 0) + amount;
  saveUsers(users); refreshCoinDisplay();
}

function addResult(win) {
  const key = getCurrentKey(); if (!key) return;
  const users = getUsers(); if (!users[key]) return;
  if (win) users[key].wins   = (users[key].wins   || 0) + 1;
  else     users[key].losses = (users[key].losses || 0) + 1;
  saveUsers(users);
}

function refreshCoinDisplay() {
  const u = getCurrentUser(); if (!u) return;
  document.querySelectorAll('#nav-coins,#shop-coins').forEach(el => {
    if (el) el.textContent = u.coins || 0;
  });
}

async function getLeaderboard(limit = 10) {
  return Object.values(getUsers()).sort((a,b)=>(b.wins||0)-(a.wins||0)).slice(0,limit);
}

// ═══════════════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════════════
function showToast(msg, type = 'success') {
  let t = document.getElementById('gz-toast');
  if (!t) {
    t = document.createElement('div'); t.id = 'gz-toast';
    t.style.cssText = `position:fixed;bottom:28px;left:50%;transform:translateX(-50%);
      background:#1e1e3a;border:1px solid rgba(255,255,255,.2);border-radius:12px;
      padding:12px 28px;font-size:15px;font-family:'Rajdhani',sans-serif;font-weight:600;
      color:#fff;z-index:9999;transition:opacity .3s;box-shadow:0 8px 32px rgba(0,0,0,.5);
      white-space:nowrap;`;
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.borderColor = type==='error'?'rgba(239,68,68,.6)':'rgba(99,102,241,.6)';
  t.style.opacity='1'; t.style.display='block';
  clearTimeout(t._t);
  t._t = setTimeout(()=>{ t.style.opacity='0'; setTimeout(()=>t.style.display='none',300); },3500);
}
