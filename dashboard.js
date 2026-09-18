// ── AUTH GUARD ──
var _curKey = localStorage.getItem('gz_current_user');
if (!_curKey || !getUsers()[_curKey]) {
  window.location.href = 'index.html';
}

// ── CHAT STATE ──
var _chatPartnerKey  = null;
var _chatPartnerName = null;
var _chatUnsub       = null;
var _chatUnread      = {}; // { playerKey: unreadCount }

// ── INIT ──
document.addEventListener('DOMContentLoaded', function() {
  loadProfile();
  renderLeaderboardAsync();
  goOnline();
  loadOnlinePlayers();
  listenInvites(getCurrentKey(), showInvitePopup2);
  startChatListener();
  setInterval(loadOnlinePlayers, 30000);
});

// ── PROFILE ──
function loadProfile() {
  var u = getCurrentUser();
  if (!u) return;
  var color   = u.skinColor || '#6366f1';
  var initial = u.username.charAt(0).toUpperCase();

  document.getElementById('nav-username').textContent = u.username;
  document.getElementById('nav-coins').textContent    = u.coins || 0;
  var navAv = document.getElementById('nav-avatar');
  if (navAv) { navAv.textContent = initial; navAv.style.background = color; }
  var heroU = document.getElementById('hero-username');
  if (heroU) heroU.textContent = u.username;
  var dropU = document.getElementById('drop-username');
  if (dropU) dropU.textContent = u.username;
  var dropW = document.getElementById('drop-wins');
  if (dropW) dropW.textContent = u.wins || 0;
  var dropL = document.getElementById('drop-losses');
  if (dropL) dropL.textContent = u.losses || 0;
  var dropAv = document.getElementById('drop-avatar');
  if (dropAv) { dropAv.textContent = initial; dropAv.style.background = color; }
}

// ── LEADERBOARD ──
async function renderLeaderboardAsync() {
  var lb = document.getElementById('leaderboard');
  if (!lb) return;
  var list = await getLeaderboard(10);
  if (!list.length) {
    lb.innerHTML = '<div style="padding:18px;text-align:center;color:rgba(255,255,255,.3)">Hali oyinchilar yoq</div>';
    return;
  }
  lb.innerHTML = list.map(function(u, i) {
    var color = u.skinColor || u.skin_color || '#6366f1';
    var name  = u.username || '?';
    return '<div class="lb-row">' +
      '<div class="lb-rank">#' + (i+1) + '</div>' +
      '<div class="lb-avatar" style="background:' + color + '">' + name.charAt(0).toUpperCase() + '</div>' +
      '<div class="lb-name">' + name + '</div>' +
      '<div class="lb-wins">W: ' + (u.wins||0) + '</div>' +
      '<div class="lb-coins">C: ' + (u.coins||0) + '</div>' +
      '</div>';
  }).join('');
}

// ── ONLINE O'YINCHILAR ──
async function loadOnlinePlayers() {
  var players = await getOnlinePlayers();
  renderOnlinePlayers(players);
  listenOnlinePlayers(renderOnlinePlayers);
}

function renderOnlinePlayers(players) {
  var wrap = document.getElementById('online-players-wrap');
  if (!wrap) return;

  if (!players || !players.length) {
    wrap.innerHTML = '<div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);' +
      'border-radius:14px;padding:18px;text-align:center;color:rgba(255,255,255,.3);font-size:14px;">' +
      'Hozir boshqa online oyinchi yoq</div>';
    return;
  }

  var html = '<div style="display:flex;flex-wrap:wrap;gap:12px;">';
  players.forEach(function(p) {
    var color  = p.skin_color || '#6366f1';
    var name   = p.username || p.id || '?';
    var unread = _chatUnread[p.id] || 0;

    html += '<div class="player-card-wrap">' +
      (unread > 0 ? '<div class="chat-badge">' + unread + '</div>' : '') +
      '<div style="background:rgba(255,255,255,.05);border:1px solid rgba(16,185,129,.3);' +
        'border-radius:14px;padding:12px 16px;display:flex;align-items:center;gap:10px;min-width:190px;">' +
        '<div style="position:relative;cursor:pointer;" onclick="openChat(\'' + p.id + '\',\'' + name + '\',\'' + color + '\')">' +
          '<div style="width:40px;height:40px;border-radius:50%;background:' + color + ';' +
            'display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:17px;">' +
            name.charAt(0).toUpperCase() + '</div>' +
          '<span style="position:absolute;bottom:0;right:0;width:11px;height:11px;' +
            'background:#10b981;border-radius:50%;border:2px solid #0a0a1a;"></span>' +
        '</div>' +
        '<div style="flex:1;">' +
          '<div style="font-size:15px;font-weight:700;color:#fff;margin-bottom:6px;cursor:pointer;" ' +
            'onclick="openChat(\'' + p.id + '\',\'' + name + '\',\'' + color + '\')">' + name + '</div>' +
          '<div style="display:flex;gap:6px;">' +
            '<button onclick="openChat(\'' + p.id + '\',\'' + name + '\',\'' + color + '\')" ' +
              'style="padding:5px 12px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);' +
              'border-radius:8px;color:#fff;font-size:12px;cursor:pointer;font-weight:600;">' +
              '&#128172; Chat' + (unread > 0 ? ' (' + unread + ')' : '') + '</button>' +
            '<button onclick="challengePlayer(\'' + p.id + '\',\'' + name + '\')" ' +
              'style="padding:5px 12px;background:rgba(99,102,241,.2);border:1px solid rgba(99,102,241,.4);' +
              'border-radius:8px;color:#a78bfa;font-size:12px;cursor:pointer;font-weight:600;">&#9654; Oyna</button>' +
          '</div>' +
        '</div>' +
      '</div></div>';
  });
  html += '</div>';
  wrap.innerHTML = html;
}

// ══════════════════════════════════════════
//  CHAT
// ══════════════════════════════════════════
var _chatHistory = {}; // { partnerKey: [{from, msg, ts}] }

function openChat(partnerKey, partnerName, partnerColor) {
  _chatPartnerKey  = partnerKey;
  _chatPartnerName = partnerName;
  // Unread tozala
  _chatUnread[partnerKey] = 0;

  // Header
  var av = document.getElementById('chat-avatar');
  if (av) { av.textContent = partnerName.charAt(0).toUpperCase(); av.style.background = partnerColor || '#6366f1'; }
  var nm = document.getElementById('chat-partner-name');
  if (nm) nm.textContent = partnerName;

  document.getElementById('chat-overlay').classList.add('open');
  renderChatMessages(partnerKey);

  var inp = document.getElementById('chat-input');
  if (inp) inp.focus();
}

function closeChat() {
  document.getElementById('chat-overlay').classList.remove('open');
  _chatPartnerKey = null;
}

function renderChatMessages(partnerKey) {
  var msgs = _chatHistory[partnerKey] || [];
  var myKey = getCurrentKey();
  var el = document.getElementById('chat-messages');
  if (!el) return;

  if (!msgs.length) {
    el.innerHTML = '<div style="text-align:center;color:rgba(255,255,255,.3);font-size:13px;margin-top:20px;">' +
      'Hozircha xabar yoq. Birinchi siz boshlang! :)</div>';
    return;
  }

  el.innerHTML = msgs.map(function(m) {
    var mine = m.from === myKey;
    var time = new Date(m.ts).toLocaleTimeString('uz-UZ', {hour:'2-digit', minute:'2-digit'});
    if (m.type === 'invite') {
      return '<div class="chat-invite-msg">' +
        '&#127918; <b>' + (mine ? 'Siz' : m.from) + '</b> ' + m.game + ' oyiniga chaqiryapti!<br>' +
        '<small>Xona: #' + m.code + '</small>' +
        (!mine ? '<br><button onclick="acceptChatInvite(\'' + m.game + '\',\'' + m.code + '\')">Qabul qilish</button>' : '') +
        '</div>';
    }
    return '<div class="chat-msg ' + (mine ? 'mine' : 'theirs') + '">' +
      m.msg +
      '<div class="chat-msg-time">' + time + '</div>' +
      '</div>';
  }).join('');

  el.scrollTop = el.scrollHeight;
}

function sendChat() {
  var inp = document.getElementById('chat-input');
  if (!inp) return;
  var msg = inp.value.trim();
  if (!msg || !_chatPartnerKey) return;

  var myKey = getCurrentKey();
  var ts    = Date.now();

  // Lokal tarixga qo'sh
  if (!_chatHistory[_chatPartnerKey]) _chatHistory[_chatPartnerKey] = [];
  _chatHistory[_chatPartnerKey].push({ from: myKey, msg: msg, ts: ts });
  renderChatMessages(_chatPartnerKey);
  inp.value = '';

  // Supabase orqali yuborish
  sendChatMessage(_chatPartnerKey, myKey, msg);
}

// Chat invite
function chatChallenge() {
  if (!_chatPartnerKey) return;
  closeChat();
  challengePlayer(_chatPartnerKey, _chatPartnerName);
}

function acceptChatInvite(gameType, code) {
  closeChat();
  currentGame = gameType;
  openWaiting("O'yinga ulanilmoqda...", 'Xona: #' + code);
  enterRoom(gameType, code, getCurrentKey(), function(p1, p2) {
    if (!p1) { closeWaiting(); showToast('Xona topilmadi', 'error'); return; }
    closeWaiting();
    launchGame(p1, p2, code);
  });
}

// Kelgan xabarlarni tinglash
function startChatListener() {
  var myKey = getCurrentKey();
  if (!myKey) return;

  listenChatMessages(myKey, function(data) {
    var fromKey = data.from;
    if (!fromKey) return;

    // Tarix ga qo'sh
    if (!_chatHistory[fromKey]) _chatHistory[fromKey] = [];
    _chatHistory[fromKey].push({ from: fromKey, msg: data.msg, ts: data.ts, type: data.type, game: data.game, code: data.code });

    // Chat ochiq bo'lsa yangilash
    if (_chatPartnerKey === fromKey) {
      renderChatMessages(fromKey);
    } else {
      // Bildirishnoma
      _chatUnread[fromKey] = (_chatUnread[fromKey] || 0) + 1;
      showChatNotification(fromKey, data.from, data.msg);
      loadOnlinePlayers(); // badge yangilash
    }
  });
}

function showChatNotification(fromKey, fromName, msg) {
  var old = document.getElementById('chat-notif');
  if (old) old.remove();

  var n = document.createElement('div');
  n.id = 'chat-notif';
  n.style.cssText = 'position:fixed;bottom:28px;left:28px;z-index:9997;' +
    'background:#1e1e3a;border:2px solid rgba(99,102,241,.4);' +
    'border-radius:16px;padding:14px 18px;max-width:280px;' +
    'box-shadow:0 8px 32px rgba(0,0,0,.5);cursor:pointer;';
  n.innerHTML = '<div style="font-size:12px;color:rgba(255,255,255,.4);margin-bottom:4px">&#128172; Yangi xabar</div>' +
    '<div style="font-size:14px;font-weight:700;color:#a78bfa;margin-bottom:2px;">' + fromName + '</div>' +
    '<div style="font-size:13px;color:rgba(255,255,255,.7);">' + (msg.length > 50 ? msg.slice(0,50)+'...' : msg) + '</div>';
  n.onclick = function() {
    n.remove();
    var users = getUsers();
    var u = users[fromKey];
    openChat(fromKey, fromName, u ? (u.skinColor || '#6366f1') : '#6366f1');
  };
  document.body.appendChild(n);
  setTimeout(function() { if (n.parentNode) n.remove(); }, 5000);
}

// ── O'YINCHIGA MUSOBAQA ──
function challengePlayer(playerKey, playerName) {
  var old = document.getElementById('challenge-modal');
  if (old) old.remove();

  var modal = document.createElement('div');
  modal.id = 'challenge-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);' +
    'backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;z-index:300;';
  modal.onclick = function(e) { if (e.target === modal) modal.remove(); };

  var games = [
    { id:'tictactoe', icon:'O', name:'Tic-Tac-Toe' },
    { id:'connect4',  icon:'4', name:'Connect Four' },
    { id:'quiz',      icon:'?', name:'Quiz Battle'  }
  ];

  var gHtml = '';
  games.forEach(function(g) {
    gHtml += '<div onclick="startChallenge(\'' + playerKey + '\',\'' + playerName + '\',\'' + g.id + '\')" ' +
      'style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);' +
      'border-radius:12px;padding:16px 10px;cursor:pointer;text-align:center;" ' +
      'onmouseover="this.style.background=\'rgba(99,102,241,.2)\'" ' +
      'onmouseout="this.style.background=\'rgba(255,255,255,.06)\'">' +
      '<div style="font-size:28px;margin-bottom:6px;">' + g.icon + '</div>' +
      '<div style="font-size:12px;font-weight:700;color:#fff;">' + g.name + '</div></div>';
  });

  modal.innerHTML = '<div style="background:#13132a;border:1px solid rgba(255,255,255,.12);' +
    'border-radius:24px;padding:36px 32px;text-align:center;max-width:380px;width:90%;">' +
    '<div style="font-size:44px;margin-bottom:12px;">VS</div>' +
    '<h2 style="font-size:18px;font-weight:900;margin-bottom:6px;color:#fff;">' +
      playerName + ' ga qarshi!</h2>' +
    '<p style="color:rgba(255,255,255,.5);font-size:14px;margin-bottom:22px;">Oyinni tanlang:</p>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:20px;">' +
      gHtml + '</div>' +
    '<button onclick="document.getElementById(\'challenge-modal\').remove()" ' +
      'style="padding:10px 24px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);' +
      'border-radius:10px;color:#fff;font-size:14px;cursor:pointer;">Bekor</button></div>';

  document.body.appendChild(modal);
}

async function startChallenge(playerKey, playerName, gameId) {
  var old = document.getElementById('challenge-modal');
  if (old) old.remove();

  var code = Math.floor(1000 + Math.random() * 9000).toString();

  // Chat orqali ham invite yuborish
  if (!_chatHistory[playerKey]) _chatHistory[playerKey] = [];
  _chatHistory[playerKey].push({ from: getCurrentKey(), type:'invite', game: gameId, code: code, ts: Date.now() });

  sendInvite(playerKey, getCurrentKey(), gameId, code);
  showToast(playerName + ' ga taklif yuborildi! #' + code);

  currentGame = gameId;
  openWaiting(playerName + ' bilan oyinlar', 'Xona: #' + code);

  var cancelFn = await enterRoom(gameId, code, getCurrentKey(), function(p1, p2) {
    _cancelSearch = null;
    if (!p1) { closeWaiting(); showToast('Vaqt tugadi', 'error'); return; }
    closeWaiting();
    launchGame(p1, p2, code);
  });
  _cancelSearch = cancelFn;
}

// ── INVITE POPUP ──
function showInvitePopup2(inv) {
  var names = { tictactoe:'Tic-Tac-Toe', connect4:'Connect Four', quiz:'Quiz Battle' };
  var old = document.getElementById('inv-popup2');
  if (old) old.remove();

  // Chat tarixiga qo'sh
  var fromKey = inv.from;
  if (!_chatHistory[fromKey]) _chatHistory[fromKey] = [];
  _chatHistory[fromKey].push({ from: fromKey, type:'invite', game: inv.gameType, code: inv.code, ts: inv.ts || Date.now() });

  var popup = document.createElement('div');
  popup.id = 'inv-popup2';
  popup.style.cssText = 'position:fixed;bottom:28px;right:24px;z-index:9998;' +
    'background:#1e1e3a;border:2px solid rgba(99,102,241,.5);' +
    'border-radius:18px;padding:20px 22px;width:300px;' +
    'box-shadow:0 12px 48px rgba(0,0,0,.6);color:#fff;';
  popup.innerHTML =
    '<div style="font-size:12px;color:rgba(255,255,255,.4);margin-bottom:6px">&#127918; Oyinga taklif!</div>' +
    '<div style="font-size:15px;font-weight:700;margin-bottom:4px">' +
      '<span style="color:#a78bfa">' + inv.from + '</span> seni ' +
      '<b>' + (names[inv.gameType]||inv.gameType) + '</b> ga chaqiryapti!</div>' +
    '<div style="font-size:13px;color:rgba(255,255,255,.4);margin-bottom:14px">' +
      'Xona: <b style="color:#fbbf24">#' + inv.code + '</b></div>' +
    '<div style="display:flex;gap:8px;">' +
      '<button onclick="acceptInvite2(\'' + inv.gameType + '\',\'' + inv.code + '\')" ' +
        'style="flex:1;padding:10px;background:linear-gradient(135deg,#6366f1,#8b5cf6);' +
        'border:none;border-radius:10px;color:#fff;font-size:14px;font-weight:700;cursor:pointer;">Qabul</button>' +
      '<button onclick="document.getElementById(\'inv-popup2\').remove()" ' +
        'style="flex:1;padding:10px;background:rgba(255,255,255,.06);' +
        'border:1px solid rgba(255,255,255,.1);border-radius:10px;color:#fff;font-size:14px;cursor:pointer;">Rad</button>' +
    '</div>';
  document.body.appendChild(popup);
  setTimeout(function() { if (popup.parentNode) popup.remove(); }, 60000);
}

async function acceptInvite2(gameType, code) {
  var old = document.getElementById('inv-popup2');
  if (old) old.remove();
  currentGame = gameType;
  openWaiting("O'yinga ulanilmoqda...", 'Xona: #' + code);
  var cancelFn = await enterRoom(gameType, code, getCurrentKey(), function(p1, p2) {
    _cancelSearch = null;
    if (!p1) { closeWaiting(); showToast('Xona topilmadi', 'error'); return; }
    closeWaiting();
    launchGame(p1, p2, code);
  });
  _cancelSearch = cancelFn;
}

// Sahifadan chiqganda offline
window.addEventListener('beforeunload', function() { goOffline(); });
