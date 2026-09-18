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
//  USER — localStorage
// ═══════════════════════════════════════
function getUsers()   { return JSON.parse(localStorage.getItem('gz_users') || '{}'); }
function saveUsers(u) { localStorage.setItem('gz_users', JSON.stringify(u)); }
function getCurrentKey()  { return localStorage.getItem('gz_current_user'); }
function getCurrentUser() {
  var k = getCurrentKey();
  return k ? getUsers()[k] : null;
}

// ═══════════════════════════════════════
//  ROOM — enterRoom (ikki tomonda ishlaydi)
//
//  Qanday ishlaydi:
//  1. Har ikki o'yinchi enterRoom chaqiradi
//  2. Kim birinchi kirsa — host (xona yaratadi)
//  3. Ikkinchisi — guest (xonaga kiradi)
//  4. Ikkalasi ham real-time orqali bilib oladi
// ═══════════════════════════════════════
async function enterRoom(gameType, code, myKey, onReady) {
  var sb = getSB();
  if (!sb) { setTimeout(function() { onReady(null, null); }, 100); return function() {}; }

  var roomId = gameType + '-' + code;
  var settled = false;
  var ch = null;
  var timer = null;

  function done(p1, p2) {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    if (ch) { try { sb.removeChannel(ch); } catch(e) {} }
    onReady(p1, p2);
  }

  // Avval real-time listener o'rnatamiz (missed event uchun)
  ch = sb.channel('room-' + roomId + '-' + Date.now())
    .on('postgres_changes', {
      event: '*', schema: 'public', table: 'rooms',
      filter: 'id=eq.' + roomId
    }, function(payload) {
      var r = payload.new;
      if (!r) return;
      if (r.status === 'playing' && r.player1 && r.player2) {
        done(r.player1, r.player2);
      }
    })
    .subscribe(async function(status) {
      if (status !== 'SUBSCRIBED') return;

      // Subscribe bo'lgandan keyin xonani tekshir
      var res = await sb.from('rooms').select('*').eq('id', roomId).single();
      var room = res.data;

      if (room && room.status === 'playing' && room.player1 && room.player2) {
        // Xona allaqachon to'la — ikkalasi ham kirgan
        done(room.player1, room.player2);
        return;
      }

      if (room && room.status === 'waiting' && room.player1 !== myKey) {
        // Xona bor, host kutmoqda — biz guest
        await sb.from('rooms').update({
          player2: myKey, status: 'playing'
        }).eq('id', roomId);
        done(room.player1, myKey);
        return;
      }

      if (room && room.player1 === myKey) {
        // Biz host — kutamiz (listener ishlaydi)
        return;
      }

      if (!room) {
        // Xona yo'q — biz host
        var ins = await sb.from('rooms').insert({
          id: roomId, game: gameType,
          player1: myKey, player2: null,
          status: 'waiting', state: {}
        });
        if (ins.error) { done(null, null); }
        // Kutamiz (listener ishlaydi)
      }
    });

  // 2 daqiqa timeout
  timer = setTimeout(async function() {
    if (!settled) {
      await sb.from('rooms').delete().eq('id', roomId).catch(function(){});
      done(null, null);
    }
  }, 120000);

  return function() {
    settled = true;
    clearTimeout(timer);
    if (ch) { try { sb.removeChannel(ch); } catch(e) {} }
    // Xonani o'chir (host ketsa)
    sb.from('rooms').delete().eq('id', roomId).catch(function(){});
  };
}

// ═══════════════════════════════════════
//  GAME STATE
// ═══════════════════════════════════════
function sendState(gameType, code, stateObj) {
  var sb = getSB(); if (!sb) return;
  var data = {};
  Object.keys(stateObj).forEach(function(k) { data[k] = stateObj[k]; });
  data._from = getCurrentKey();
  data._ts   = Date.now();
  sb.from('rooms').update({ state: data }).eq('id', gameType + '-' + code).then(function(){});
}

function listenState(gameType, code, callback) {
  var sb = getSB(); if (!sb) return function() {};
  var myKey = getCurrentKey();
  var ch = sb.channel('state-' + gameType + '-' + code + '-' + Date.now())
    .on('postgres_changes', {
      event: 'UPDATE', schema: 'public', table: 'rooms',
      filter: 'id=eq.' + gameType + '-' + code
    }, function(payload) {
      var st = payload.new && payload.new.state;
      if (st && st._from && st._from !== myKey) callback(st);
    })
    .subscribe();
  return function() { try { sb.removeChannel(ch); } catch(e) {} };
}

// ═══════════════════════════════════════
//  RANDOM OPPONENT
// ═══════════════════════════════════════
async function findRandom(gameType, myKey, onMatch) {
  var settled = false;
  var cancel = await enterRoom(gameType, 'random', myKey, function(p1, p2) {
    if (settled) return;
    settled = true;
    if (!p1) { onMatch(null, null, null); return; }
    onMatch(p1, p2, 'random');
  });
  return function() { settled = true; if (cancel) cancel(); };
}

// ═══════════════════════════════════════
//  INVITE
// ═══════════════════════════════════════
function sendInvite(toKey, fromKey, gameType, code) {
  var sb = getSB(); if (!sb) return;
  sb.from('rooms').insert({
    id: 'inv-' + toKey + '-' + Date.now(),
    game: gameType, player1: fromKey, player2: toKey,
    status: 'invite',
    state: { code: code, from: fromKey, ts: Date.now() }
  }).then(function(){});
}

function listenInvites(myKey, callback) {
  var sb = getSB(); if (!sb) return function() {};
  var ch = sb.channel('inv-' + myKey + '-' + Date.now())
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'rooms',
      filter: 'player2=eq.' + myKey
    }, function(payload) {
      var r = payload.new;
      if (r && r.status === 'invite' && r.state) {
        var d = r.state;
        if (Date.now() - d.ts < 120000) {
          callback({ from: d.from, gameType: r.game, code: d.code, ts: d.ts });
        }
      }
    })
    .subscribe();
  return function() { try { sb.removeChannel(ch); } catch(e) {} };
}

// ═══════════════════════════════════════
//  CHAT — Supabase real-time
// ═══════════════════════════════════════
function sendChatMessage(toKey, fromKey, message) {
  var sb = getSB(); if (!sb) return;
  sb.from('rooms').insert({
    id: 'chat-' + fromKey + '-' + Date.now(),
    game: 'chat', player1: fromKey, player2: toKey,
    status: 'chat',
    state: { from: fromKey, to: toKey, msg: message, ts: Date.now() }
  }).then(function(){});
}

function listenChatMessages(myKey, callback) {
  var sb = getSB(); if (!sb) return function() {};
  var ch = sb.channel('chat-' + myKey + '-' + Date.now())
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'rooms',
      filter: 'player2=eq.' + myKey
    }, function(payload) {
      var r = payload.new;
      if (r && r.status === 'chat' && r.state) {
        callback(r.state);
      }
    })
    .subscribe();
  return function() { try { sb.removeChannel(ch); } catch(e) {} };
}

// ═══════════════════════════════════════
//  ONLINE PLAYERS
// ═══════════════════════════════════════
async function goOnline() {
  var sb = getSB(); if (!sb) return;
  var key = getCurrentKey();
  var u   = getCurrentUser();
  if (!key || !u) return;

  await sb.from('presence').upsert({
    id: key, username: u.username,
    skin_color: u.skinColor || '#6366f1',
    wins: u.wins || 0,
    last_seen: new Date().toISOString()
  });

  setInterval(async function() {
    var fresh = getCurrentUser();
    await sb.from('presence').upsert({
      id: key,
      username:   fresh ? fresh.username   : u.username,
      skin_color: fresh ? (fresh.skinColor || '#6366f1') : '#6366f1',
      wins:       fresh ? (fresh.wins || 0) : 0,
      last_seen:  new Date().toISOString()
    });
  }, 30000);
}

async function goOffline() {
  var sb = getSB(); if (!sb) return;
  var key = getCurrentKey(); if (!key) return;
  await sb.from('presence').delete().eq('id', key);
}

async function getOnlinePlayers() {
  var sb = getSB(); if (!sb) return [];
  var myKey   = getCurrentKey();
  var cutoff  = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  var res = await sb.from('presence').select('*')
    .neq('id', myKey || '').gte('last_seen', cutoff);
  return res.data || [];
}

function listenOnlinePlayers(callback) {
  var sb = getSB(); if (!sb) return function() {};
  var ch = sb.channel('presence-watch-' + Date.now())
    .on('postgres_changes', {
      event: '*', schema: 'public', table: 'presence'
    }, async function() {
      var players = await getOnlinePlayers();
      callback(players);
    })
    .subscribe();
  return function() { try { sb.removeChannel(ch); } catch(e) {} };
}

// ═══════════════════════════════════════
//  USER SYNC
// ═══════════════════════════════════════
async function syncUserFromSB(username) {
  var sb = getSB(); if (!sb) return null;
  var res = await sb.from('users').select('*').eq('id', username.toLowerCase()).single();
  if (!res.data) return null;
  var d = res.data;
  var users = getUsers();
  users[d.id] = {
    username: d.username, password: d.password,
    coins: d.coins || 0, wins: d.wins || 0, losses: d.losses || 0,
    skinColor: d.skin_color || '#6366f1', skin: 'default', ownedSkins: ['default']
  };
  saveUsers(users);
  return users[d.id];
}

// ═══════════════════════════════════════
//  LEADERBOARD
// ═══════════════════════════════════════
async function getLeaderboard(limit) {
  limit = limit || 10;
  var sb = getSB();
  if (sb) {
    var res = await sb.from('users').select('*')
      .order('wins', { ascending: false }).limit(limit);
    if (res.data && res.data.length) {
      return res.data.map(function(u) {
        return { username: u.username, wins: u.wins, coins: u.coins, skinColor: u.skin_color };
      });
    }
  }
  return Object.values(getUsers())
    .sort(function(a,b){ return (b.wins||0)-(a.wins||0); }).slice(0, limit);
}

// ═══════════════════════════════════════
//  COINS & STATS
// ═══════════════════════════════════════
function addCoins(amount) {
  var key = getCurrentKey(); if (!key) return;
  var users = getUsers(); if (!users[key]) return;
  users[key].coins = (users[key].coins || 0) + amount;
  saveUsers(users);
  try { getSB()?.from('users').update({ coins: users[key].coins }).eq('id', key); } catch(e){}
  refreshCoinDisplay();
}

function addResult(win) {
  var key = getCurrentKey(); if (!key) return;
  var users = getUsers(); if (!users[key]) return;
  if (win) users[key].wins   = (users[key].wins   || 0) + 1;
  else     users[key].losses = (users[key].losses || 0) + 1;
  saveUsers(users);
  try { getSB()?.from('users').update({ wins: users[key].wins, losses: users[key].losses }).eq('id', key); } catch(e){}
}

function refreshCoinDisplay() {
  var u = getCurrentUser(); if (!u) return;
  document.querySelectorAll('#nav-coins,#shop-coins').forEach(function(el) {
    if (el) el.textContent = u.coins || 0;
  });
}

// ═══════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════
function showToast(msg, type) {
  type = type || 'success';
  var t = document.getElementById('gz-toast');
  if (!t) {
    t = document.createElement('div'); t.id = 'gz-toast';
    t.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);' +
      'background:#1e1e3a;border:1px solid rgba(255,255,255,.2);border-radius:12px;' +
      'padding:12px 28px;font-size:15px;font-weight:600;color:#fff;z-index:9999;' +
      'transition:opacity .3s;box-shadow:0 8px 32px rgba(0,0,0,.5);white-space:nowrap;';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.borderColor = type === 'error' ? 'rgba(239,68,68,.6)' : 'rgba(99,102,241,.6)';
  t.style.opacity = '1'; t.style.display = 'block';
  clearTimeout(t._t);
  t._t = setTimeout(function() {
    t.style.opacity = '0';
    setTimeout(function() { t.style.display = 'none'; }, 300);
  }, 3500);
}
