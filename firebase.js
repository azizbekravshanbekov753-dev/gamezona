// ═══════════════════════════════════════════════
//  SUPABASE CONFIG
// ═══════════════════════════════════════════════
const SUPABASE_URL = 'https://xoyepmshnnmgvsqkmbfa.supabase.co';
const SUPABASE_KEY = 'sb_publishable_c2LUkQ0QeTxCIqzHmFmYtA_lf_5Rm5x';

let _sb = null;
function getSB() {
  if (_sb) return _sb;
  if (typeof supabase === 'undefined') { console.error('Supabase yuklanmagan'); return null; }
  _sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  return _sb;
}

// ═══════════════════════════════════════════════
//  USER — Supabase + localStorage cache
// ═══════════════════════════════════════════════
function getUsers()   { return JSON.parse(localStorage.getItem('gz_users') || '{}'); }
function saveUsers(u) { localStorage.setItem('gz_users', JSON.stringify(u)); }
function getCurrentKey()  { return localStorage.getItem('gz_current_user'); }
function getCurrentUser() {
  const k = getCurrentKey();
  return k ? getUsers()[k] : null;
}

// Supabase dan foydalanuvchi olish
async function fetchUser(username) {
  const sb = getSB(); if (!sb) return null;
  const { data } = await sb.from('users').select('*').eq('id', username).single();
  return data;
}

// Supabase ga foydalanuvchi saqlash
async function saveUserToSB(userObj) {
  const sb = getSB(); if (!sb) return;
  await sb.from('users').upsert({
    id:         userObj.username.toLowerCase(),
    username:   userObj.username,
    password:   userObj.password,
    coins:      userObj.coins || 100,
    wins:       userObj.wins || 0,
    losses:     userObj.losses || 0,
    skin_color: userObj.skinColor || '#6366f1'
  });
}

// Supabase dan localStorage ga sync
async function syncUserFromSB(username) {
  const data = await fetchUser(username.toLowerCase());
  if (!data) return null;
  const users = getUsers();
  const userObj = {
    username:   data.username,
    password:   data.password,
    coins:      data.coins,
    wins:       data.wins,
    losses:     data.losses,
    skinColor:  data.skin_color,
    skin:       'default',
    ownedSkins: ['default']
  };
  users[data.id] = userObj;
  saveUsers(users);
  return userObj;
}

// ═══════════════════════════════════════════════
//  PRESENCE — Online o'yinchilar
// ═══════════════════════════════════════════════
async function goOnline() {
  const sb = getSB(); if (!sb) return;
  const u = getCurrentUser(); if (!u) return;
  const key = getCurrentKey();
  await sb.from('presence').upsert({
    id:         key,
    username:   u.username,
    skin_color: u.skinColor || '#6366f1',
    wins:       u.wins || 0,
    last_seen:  new Date().toISOString()
  });
  // Har 30 sekundda yangilab tur
  setInterval(async () => {
    const fresh = getCurrentUser();
    await sb.from('presence').upsert({
      id:        key,
      username:  fresh?.username || u.username,
      skin_color:fresh?.skinColor || '#6366f1',
      wins:      fresh?.wins || 0,
      last_seen: new Date().toISOString()
    });
  }, 30000);
}

async function goOffline() {
  const sb = getSB(); if (!sb) return;
  const key = getCurrentKey(); if (!key) return;
  await sb.from('presence').delete().eq('id', key);
}

async function getOnlinePlayers() {
  const sb = getSB(); if (!sb) return [];
  const myKey = getCurrentKey();
  // 2 daqiqadan kam bo'lganlar = online
  const cutoff = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  const { data } = await sb.from('presence')
    .select('*')
    .neq('id', myKey)
    .gte('last_seen', cutoff);
  return data || [];
}

function listenOnlinePlayers(callback) {
  const sb = getSB(); if (!sb) return () => {};
  const ch = sb.channel('presence-changes')
    .on('postgres_changes', {
      event: '*', schema: 'public', table: 'presence'
    }, async () => {
      const players = await getOnlinePlayers();
      callback(players);
    })
    .subscribe();
  return () => sb.removeChannel(ch);
}

// ═══════════════════════════════════════════════
//  ROOM — Multiplayer
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

  // Xona bormi?
  const { data: existing } = await sb.from('rooms')
    .select('*').eq('id', roomId).single();

  if (existing && existing.status === 'waiting' && existing.player1 !== myKey) {
    // Guest sifatida kir
    await sb.from('rooms').update({ player2: myKey, status: 'playing' }).eq('id', roomId);
    finish(existing.player1, myKey);
    return () => {};
  }

  if (!existing) {
    // Host sifatida xona qil
    const { error } = await sb.from('rooms').insert({
      id: roomId, game: gameType,
      player1: myKey, player2: null,
      status: 'waiting', state: {}
    });
    if (error) { finish(null, null); return () => {}; }
  }

  // Real-time: xona o'zgarishini kuzat
  channel = sb.channel(`room-watch-${roomId}`)
    .on('postgres_changes', {
      event: 'UPDATE', schema: 'public', table: 'rooms',
      filter: `id=eq.${roomId}`
    }, (payload) => {
      const r = payload.new;
      if (r.status === 'playing' && r.player2) {
        finish(r.player1, r.player2);
      }
    })
    .subscribe();

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

// O'yin holatini yuborish
async function sendState(gameType, code, stateObj) {
  const sb = getSB(); if (!sb) return;
  await sb.from('rooms').update({
    state: { ...stateObj, _from: getCurrentKey(), _ts: Date.now() }
  }).eq('id', `${gameType}-${code}`);
}

// O'yin holatini tinglash
function listenState(gameType, code, callback) {
  const sb = getSB(); if (!sb) return () => {};
  const myKey = getCurrentKey();
  const roomId = `${gameType}-${code}`;

  const ch = sb.channel(`state-${roomId}-${Date.now()}`)
    .on('postgres_changes', {
      event: 'UPDATE', schema: 'public', table: 'rooms',
      filter: `id=eq.${roomId}`
    }, (payload) => {
      const state = payload.new?.state;
      if (state && state._from !== myKey) callback(state);
    })
    .subscribe();

  return () => { if (sb) sb.removeChannel(ch); };
}

async function sendGameOver(gameType, code, winner) {
  const sb = getSB(); if (!sb) return;
  await sb.from('rooms').update({ status: 'finished', state: { winner } })
    .eq('id', `${gameType}-${code}`);
}

// ═══════════════════════════════════════════════
//  QUEUE — Tasodifiy raqib
// ═══════════════════════════════════════════════
async function findRandom(gameType, myKey, onMatch) {
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
//  INVITE
// ═══════════════════════════════════════════════
async function sendInvite(toKey, fromKey, gameType, code) {
  const sb = getSB(); if (!sb) return;
  await sb.from('rooms').insert({
    id: `invite-${toKey}-${Date.now()}`,
    game: gameType,
    player1: fromKey,
    player2: toKey,
    status: 'invite',
    state: { code, from: fromKey, to: toKey, ts: Date.now() }
  }).catch(() => {});
}

function listenInvites(myKey, callback) {
  const sb = getSB(); if (!sb) return () => {};
  const ch = sb.channel(`invites-${myKey}`)
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'rooms',
      filter: `player2=eq.${myKey}`
    }, (payload) => {
      const r = payload.new;
      if (r.status === 'invite' && r.state) {
        const d = r.state;
        if (Date.now() - d.ts < 120000) {
          callback({ from: d.from, gameType: r.game, code: d.code, ts: d.ts });
        }
      }
    })
    .subscribe();
  return () => sb.removeChannel(ch);
}

// ═══════════════════════════════════════════════
//  COINS & STATS
// ═══════════════════════════════════════════════
function addCoins(amount) {
  const key = getCurrentKey(); if (!key) return;
  const users = getUsers(); if (!users[key]) return;
  users[key].coins = (users[key].coins || 0) + amount;
  saveUsers(users);
  // Supabase ga sync
  getSB()?.from('users').update({ coins: users[key].coins }).eq('id', key);
  refreshCoinDisplay();
}

function addResult(win) {
  const key = getCurrentKey(); if (!key) return;
  const users = getUsers(); if (!users[key]) return;
  if (win) users[key].wins   = (users[key].wins   || 0) + 1;
  else     users[key].losses = (users[key].losses || 0) + 1;
  saveUsers(users);
  getSB()?.from('users').update({
    wins: users[key].wins, losses: users[key].losses
  }).eq('id', key);
}

function refreshCoinDisplay() {
  const u = getCurrentUser(); if (!u) return;
  document.querySelectorAll('#nav-coins,#shop-coins').forEach(el => {
    if (el) el.textContent = u.coins || 0;
  });
}

async function getLeaderboard(limit = 10) {
  const sb = getSB();
  if (sb) {
    const { data } = await sb.from('users').select('*')
      .order('wins', { ascending: false }).limit(limit);
    if (data && data.length) return data.map(u => ({
      username: u.username, wins: u.wins,
      coins: u.coins, skinColor: u.skin_color
    }));
  }
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
      padding:12px 28px;font-size:15px;font-family:Arial,sans-serif;font-weight:600;
      color:#fff;z-index:9999;transition:opacity .3s;box-shadow:0 8px 32px rgba(0,0,0,.5);
      white-space:nowrap;`;
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.borderColor = type==='error'?'rgba(239,68,68,.6)':'rgba(99,102,241,.6)';
  t.style.opacity='1'; t.style.display='block';
  clearTimeout(t._t);
  t._t = setTimeout(()=>{t.style.opacity='0';setTimeout(()=>t.style.display='none',300);},3500);
}
