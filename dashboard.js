// ── AUTH GUARD ──
var _curKey = localStorage.getItem('gz_current_user');
if (!_curKey || !getUsers()[_curKey]) {
  window.location.href = 'index.html';
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', function() {
  loadProfile();
  renderLeaderboardAsync();
  goOnline();
  loadOnlinePlayers();
  listenInvites(getCurrentKey(), showInvitePopup2);
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
    lb.innerHTML = '<div style="padding:18px;text-align:center;color:rgba(255,255,255,.3)">Hali o\'yin o\'ynamagan</div>';
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
}

function renderOnlinePlayers(players) {
  var wrap = document.getElementById('online-players-wrap');
  if (!wrap) return;

  if (!players || !players.length) {
    wrap.innerHTML = '<div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);' +
      'border-radius:14px;padding:18px;text-align:center;color:rgba(255,255,255,.3);font-size:14px;">' +
      'Hozir boshqa online o\'yinchi yo\'q</div>';
    return;
  }

  var html = '<div style="display:flex;flex-wrap:wrap;gap:12px;">';
  players.forEach(function(p) {
    var color = p.skin_color || '#6366f1';
    var name  = p.username || p.id || '?';
    html += '<div onclick="challengePlayer(\'' + p.id + '\',\'' + name + '\')" ' +
      'style="background:rgba(255,255,255,.05);border:1px solid rgba(16,185,129,.3);' +
      'border-radius:14px;padding:14px 18px;display:flex;align-items:center;gap:12px;' +
      'cursor:pointer;transition:all .2s;min-width:180px;" ' +
      'onmouseover="this.style.background=\'rgba(16,185,129,.12)\'" ' +
      'onmouseout="this.style.background=\'rgba(255,255,255,.05)\'">' +
      '<div style="position:relative;">' +
        '<div style="width:40px;height:40px;border-radius:50%;background:' + color + ';' +
          'display:flex;align-items:center;justify-content:center;' +
          'font-weight:700;color:#fff;font-size:17px;">' + name.charAt(0).toUpperCase() + '</div>' +
        '<span style="position:absolute;bottom:0;right:0;width:11px;height:11px;' +
          'background:#10b981;border-radius:50%;border:2px solid #0a0a1a;"></span>' +
      '</div>' +
      '<div>' +
        '<div style="font-size:15px;font-weight:700;color:#fff;">' + name + '</div>' +
        '<div style="font-size:12px;color:rgba(255,255,255,.4);">W:' + (p.wins||0) + ' | Bosib o\'yna</div>' +
      '</div></div>';
  });
  html += '</div>';
  wrap.innerHTML = html;
}

// ── O'YINCHIGA MUSOBAQA TAKLIF ──
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
      '<div style="font-size:26px;margin-bottom:6px;">' + g.icon + '</div>' +
      '<div style="font-size:12px;font-weight:700;color:#fff;">' + g.name + '</div></div>';
  });

  modal.innerHTML = '<div style="background:#13132a;border:1px solid rgba(255,255,255,.12);' +
    'border-radius:24px;padding:36px 32px;text-align:center;max-width:380px;width:90%;">' +
    '<div style="font-size:44px;margin-bottom:12px;">VS</div>' +
    '<h2 style="font-size:18px;font-weight:900;margin-bottom:6px;color:#fff;">' +
      playerName + ' ga qarshi!</h2>' +
    '<p style="color:rgba(255,255,255,.5);font-size:14px;margin-bottom:22px;">O\'yin tanlang:</p>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:20px;">' +
      gHtml + '</div>' +
    '<button onclick="document.getElementById(\'challenge-modal\').remove()" ' +
      'style="padding:10px 24px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);' +
      'border-radius:10px;color:#fff;font-size:14px;cursor:pointer;">Bekor</button></div>';

  document.body.appendChild(modal);
}

function startChallenge(playerKey, playerName, gameId) {
  var old = document.getElementById('challenge-modal');
  if (old) old.remove();

  var code = Math.floor(1000 + Math.random() * 9000).toString();
  sendInvite(playerKey, getCurrentKey(), gameId, code);
  showToast(playerName + ' ga taklif yuborildi! #' + code);

  currentGame = gameId;
  openWaiting(playerName + ' bilan o\'yin', 'Xona: #' + code);

  _cancelSearch = enterRoom(gameId, code, getCurrentKey(), function(p1, p2) {
    _cancelSearch = null;
    if (!p1) { closeWaiting(); showToast('Vaqt tugadi', 'error'); return; }
    closeWaiting();
    launchGame(p1, p2, code);
  });
}

// ── INVITE POPUP ──
function showInvitePopup2(inv) {
  var names = { tictactoe:'Tic-Tac-Toe', connect4:'Connect Four', quiz:'Quiz Battle' };
  var old = document.getElementById('inv-popup2');
  if (old) old.remove();

  var popup = document.createElement('div');
  popup.id = 'inv-popup2';
  popup.style.cssText = 'position:fixed;bottom:28px;right:24px;z-index:9998;' +
    'background:#1e1e3a;border:2px solid rgba(99,102,241,.5);' +
    'border-radius:18px;padding:20px 22px;width:300px;' +
    'box-shadow:0 12px 48px rgba(0,0,0,.6);color:#fff;';

  popup.innerHTML =
    '<div style="font-size:12px;color:rgba(255,255,255,.4);margin-bottom:6px">O\'yinga taklif!</div>' +
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
  setTimeout(function() { popup.remove(); }, 60000);
}

function acceptInvite2(gameType, code) {
  var old = document.getElementById('inv-popup2');
  if (old) old.remove();
  currentGame = gameType;
  openWaiting("O'yinga ulanilmoqda...", 'Xona: #' + code);
  _cancelSearch = enterRoom(gameType, code, getCurrentKey(), function(p1, p2) {
    _cancelSearch = null;
    if (!p1) { closeWaiting(); showToast('Xona topilmadi', 'error'); return; }
    closeWaiting();
    launchGame(p1, p2, code);
  });
}

// Sahifadan chiqganda offline bo'l
window.addEventListener('beforeunload', function() { goOffline(); });
