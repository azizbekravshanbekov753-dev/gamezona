// ═══════════════════════════════════════
//  SUPABASE CONFIG
// ═══════════════════════════════════════
const SUPABASE_URL = 'https://xoyepmshnnmgvsqkmbfa.supabase.co';
const SUPABASE_KEY = 'sb_publishable_c2LUkQ0QeTxCIqzHmFmYtA_lf_5Rm5x';

let _sb = null;
function getSB() {
  if (_sb) return _sb;
  if (typeof supabase === 'undefined') return null;
  _sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  return _sb;
}

// ═══════════════════════════════════════
//  ROOM — Multiplayer
// ═══════════════════════════════════════
async function enterRoom(gameType, code, myKey, onReady) {
  const sb = getSB();
  if (!sb) { onReady(null, null); return () => {}; }

  const roomId = gameType + '-' + code;
  let settled = false;
  let ch = null;
  let timer = null;

  function done(p1, p2) {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    if (ch) sb.removeChannel(ch);
    onReady(p1, p2);
  }

  // Xona bormi?
  const { data: room } = await sb.from('rooms').select('*').eq('id', roomId).single();

  if (room && room.status === 'waiting' && room.player1 !== myKey) {
    // Guest — xonaga kir
    await sb.from('rooms').update({ player2: myKey, status: 'playing' }).eq('id', roomId);
    done(room.player1, myKey);
    return () => {};
  }

  if (!room) {
    // Host — xona ochish
    const { error } = await sb.from('rooms').insert({
      id: roomId, game: gameType,
      player1: myKey, player2: null,
      status: 'waiting', state: {}
    });
    if (error) { done(null, null); return () => {}; }
  }

  // Xona o'zgarishini kuzat
  ch = sb.channel('room-' + roomId)
    .on('postgres_changes', {
      event: 'UPDATE', schema: 'public', table: 'rooms',
      filter: 'id=eq.' + roomId
    }, (payload) => {
      const r = payload.new;
      if (r.status === 'playing' && r.player2) {
        done(r.player1, r.player2);
      }
    })
    .subscribe();

  timer = setTimeout(async () => {
    if (!settled) {
      await sb.from('rooms').delete().eq('id', roomId);
      done(null, null);
    }
  }, 120000);

  return () => {
    settled = true;
    clearTimeout(timer);
    if (ch) sb.removeChannel(ch);
  };
}

function sendState(gameType, code, stateObj) {
  const sb = getSB(); if (!sb) return;
  sb.from('rooms').update({
    state: Object.assign({}, stateObj, { _from: getCurrentKey(), _ts: Date.now() })
  }).eq('id', gameType + '-' + code);
}

function listenState(gameType, code, callback) {
  const sb = getSB(); if (!sb) return () => {};
  const myKey = getCurrentKey();
  const ch = sb.channel('state-' + gameType + '-' + code + '-' + Date.now())
    .on('postgres_changes', {
      event: 'UPDATE', schema: 'public', table: 'rooms',
      filter: 'id=eq.' + gameType + '-' + code
    }, (payload) => {
      const st = payload.new && payload.new.state;
      if (st && st._from !== myKey) callback(st);
    })
    .subscribe();
  return () => { try { sb.removeChannel(ch); } catch(e) {} };
}

// ═══════════════════════════════════════
//  RANDOM OPPONENT
// ═══════════════════════════════════════
async function findRandom(gameType, myKey, onMatch) {
  let settled = false;
  const cancel = await enterRoom(gameType, 'random', myKey, (p1, p2) => {
    if (settled) return;
    settled = true;
    if (!p1) { onMatch(null, null, null); return; }
    onMatch(p1, p2, 'random');
  });
  return () => { settled = true; if (cancel) cancel(); };
}

// ═══════════════════════════════════════
//  INVITE
// ═══════════════════════════════════════
function sendInvite(toKey, fromKey, gameType, code) {
  const sb = getSB(); if (!sb) return;
  sb.from('rooms').insert({
    id: 'inv-' + toKey + '-' + Date.now(),
    game: gameType, player1: fromKey, player2: toKey,
    status: 'invite',
    state: { code: code, from: fromKey, ts: Date.now() }
  }).then(() => {});
}

function listenInvites(myKey, callback) {
  const sb = getSB(); if (!sb) return () => {};
  const ch = sb.channel('inv-' + myKey)
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'rooms',
      filter: 'player2=eq.' + myKey
    }, (payload) => {
      const r = payload.new;
      if (r && r.status === 'invite' && r.state) {
        const d = r.state;
        if (Date.now() - d.ts < 120000) {
          callback({ from: d.from, gameType: r.game, code: d.code, ts: d.ts });
        }
      }
    })
    .subscribe();
  return () => { try { sb.removeChannel(ch); } catch(e) {} };
}

// ═══════════════════════════════════════
//  ONLINE PLAYERS
// ═══════════════════════════════════════
async function goOnline() {
  const sb = getSB(); if (!sb) return;
  const key = getCurrentKey();
  const u = getCurrentUser();
  if (!key || !u) return;

  const upsertData = {
    id: key,
    username: u.username,
    skin_color: u.skinColor || '#6366f1',
    wins: u.wins || 0,
    last_seen: new Date().toISOString()
  };
  await sb.from('presence').upsert(upsertData);

  // Har 30 sekundda yangilab tur
  setInterval(async () => {
    const fresh = getCurrentUser();
    await sb.from('presence').upsert({
      id: key,
      username: fresh ? fresh.username : u.username,
      skin_color: fresh ? (fresh.skinColor || '#6366f1') : '#6366f1',
      wins: fresh ? (fresh.wins || 0) : 0,
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
  const cutoff = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  const { data } = await sb.from('presence')
    .select('*')
    .neq('id', myKey || '')
    .gte('last_seen', cutoff);
  return data || [];
}

function listenOnlinePlayers(callback) {
  const sb = getSB(); if (!sb) return () => {};
  const ch = sb.channel('presence-watch')
    .on('postgres_changes', {
      event: '*', schema: 'public', table: 'presence'
    }, async () => {
      const players = await getOnlinePlayers();
      callback(players);
    })
    .subscribe();
  return () => { try { sb.removeChannel(ch); } catch(e) {} };
}

// ═══════════════════════════════════════
//  USER SYNC (Supabase <-> localStorage)
// ═══════════════════════════════════════
async function syncUserFromSB(username) {
  const sb = getSB(); if (!sb) return null;
  const { data } = await sb.from('users').select('*').eq('id', username.toLowerCase()).single();
  if (!data) return null;
  const users = getUsers();
  users[data.id] = {
    username:   data.username,
    password:   data.password,
    coins:      data.coins || 0,
    wins:       data.wins || 0,
    losses:     data.losses || 0,
    skinColor:  data.skin_color || '#6366f1',
    skin:       'default',
    ownedSkins: ['default']
  };
  saveUsers(users);
  return users[data.id];
}

// ═══════════════════════════════════════
//  LEADERBOARD
// ═══════════════════════════════════════
async function getLeaderboard(limit) {
  limit = limit || 10;
  const sb = getSB();
  if (sb) {
    const { data } = await sb.from('users').select('*')
      .order('wins', { ascending: false }).limit(limit);
    if (data && data.length) {
      return data.map(function(u) {
        return { username: u.username, wins: u.wins, coins: u.coins, skinColor: u.skin_color };
      });
    }
  }
  return Object.values(getUsers()).sort(function(a,b){ return (b.wins||0)-(a.wins||0); }).slice(0, limit);
}

// ═══════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════
function showToast(msg, type) {
  type = type || 'success';
  var t = document.getElementById('gz-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'gz-toast';
    t.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);' +
      'background:#1e1e3a;border:1px solid rgba(255,255,255,.2);border-radius:12px;' +
      'padding:12px 28px;font-size:15px;font-weight:600;color:#fff;z-index:9999;' +
      'transition:opacity .3s;box-shadow:0 8px 32px rgba(0,0,0,.5);white-space:nowrap;';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.borderColor = type === 'error' ? 'rgba(239,68,68,.6)' : 'rgba(99,102,241,.6)';
  t.style.opacity = '1';
  t.style.display = 'block';
  clearTimeout(t._t);
  t._t = setTimeout(function() {
    t.style.opacity = '0';
    setTimeout(function() { t.style.display = 'none'; }, 300);
  }, 3500);
}
