// ═══════════════════════════════════════════════
//  SUPABASE — Real-time Multiplayer
// ═══════════════════════════════════════════════
const SUPABASE_URL = 'https://xoyepmshnnmgvsqkmbfa.supabase.co';
const SUPABASE_KEY = 'sb_publishable_c2LUkQ0QeTxCIqzHmFmYtA_lf_5Rm5x';

let _sb = null;

function getSB() {
  if (_sb) return _sb;
  if (typeof supabase === 'undefined') { console.error('Supabase SDK yuklanmagan'); return null; }
  _sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  return _sb;
}

// ═══════════════════════════════════════════════
//  USER — localStorage
// ═══════════════════════════════════════════════
function getUsers()   { return JSON.parse(localStorage.getItem('gz_users') || '{}'); }
function saveUsers(u) { localStorage.setItem('gz_users', JSON.stringify(u)); }
function getCurrentKey()  { return localStorage.getItem('gz_current_user'); }
function getCurrentUser() { const k = getCurrentKey(); return k ? getUsers()[k] : null; }

// ═══════════════════════════════════════════════
//  ROOM SYSTEM — Supabase Realtime
// ═══════════════════════════════════════════════
async function enterRoom(gameType, code, myKey, onReady) {
  const sb = getSB();
  if (!sb) { onReady(null, null); return () => {}; }

  const roomId = `${gameType}-${code}`;
  let settled = false;
  let channel = null;
  let timeoutId = null;

  function finish(p1, p2) {
    if (settled) return;
    settled = true;
    clearTimeout(timeoutId);
    onReady(p1, p2);
  }

  // 1. Xona bormi tekshir
  const { data: existing } = await sb
    .from('rooms')
    .select('*')
    .eq('id', roomId)
    .single();

  if (existing && existing.status === 'waiting' && existing.player1 !== myKey) {
    // Guest sifatida kir
    await sb.from('rooms').update({
      player2: myKey,
      status: 'playing'
    }).eq('id', roomId);

    finish(existing.player1, myKey);
    return () => {};
  }

  if (!existing) {
    // Host sifatida xona ochish
    await sb.from('rooms').insert({
      id: roomId,
      game: gameType,
      player1: myKey,
      player2: null,
      status: 'waiting',
      state: {}
    });
  }

  // Real-time: o'zgarishni kuzat
  channel = sb
    .channel(`room-${roomId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'rooms',
      filter: `id=eq.${roomId}`
    }, (payload) => {
      const room = payload.new;
      if (room.status === 'playing' && room.player2) {
        finish(room.player1, room.player2);
      }
    })
    .subscribe();

  // 2 daqiqa timeout
  timeoutId = setTimeout(async () => {
    if (!settled) {
      settled = true;
      await sb.from('rooms').delete().eq('id', roomId);
      finish(null, null);
    }
  }, 120000);

  return () => {
    settled = true;
    clearTimeout(timeoutId);
    if (channel) sb.removeChannel(channel);
  };
}

// ═══════════════════════════════════════════════
//  GAME STATE — Real-time yuborish
// ═══════════════════════════════════════════════
function sendState(gameType, code, stateObj) {
  const sb = getSB();
  if (!sb) return;
  const roomId = `${gameType}-${code}`;
  sb.from('rooms').update({
    state: { ...stateObj, _from: getCurrentKey(), ts: Date.now() },
    updated_at: new Date().toISOString()
  }).eq('id', roomId);
}

function listenState(gameType, code, callback) {
  const sb = getSB();
  if (!sb) return () => {};
  const myKey = getCurrentKey();
  const roomId = `${gameType}-${code}`;

  const channel = sb
    .channel(`state-${roomId}-${Date.now()}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'rooms',
      filter: `id=eq.${roomId}`
    }, (payload) => {
      const state = payload.new.state;
      if (state && state._from !== myKey) {
        callback(state);
      }
    })
    .subscribe();

  return () => { if (sb) sb.removeChannel(channel); };
}

function sendGameOver(gameType, code, winner) {
  const sb = getSB();
  if (!sb) return;
  sb.from('rooms').update({ status: 'finished', state: { winner } })
    .eq('id', `${gameType}-${code}`);
}

// ═══════════════════════════════════════════════
//  QUEUE — Tasodifiy raqib
// ═══════════════════════════════════════════════
async function findRandom(gameType, myKey, onMatch) {
  const sb = getSB();
  if (!sb) { onMatch(null, null, null); return () => {}; }

  const code = 'random';
  let settled = false;

  const cancel = await enterRoom(gameType, code, myKey, (p1, p2) => {
    if (settled) return;
    settled = true;
    if (!p1) { onMatch(null, null, null); return; }
    onMatch(p1, p2, code);
  });

  return () => { settled = true; if (cancel) cancel(); };
}

// ═══════════════════════════════════════════════
//  INVITE — Do'st chaqirish
// ═══════════════════════════════════════════════
function sendInvite(toKey, fromKey, gameType, code) {
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
  return Object.values(getUsers())
    .sort((a,b) => (b.wins||0) - (a.wins||0))
    .slice(0, limit);
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
