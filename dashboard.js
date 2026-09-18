// Auth guard
const _key = localStorage.getItem('gz_current_user');
if (!_key || !getUsers()[_key]) {
  window.location.href = 'index.html';
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  renderLeaderboard();
  renderOnlinePlayers([]); // bo'sh holda ko'rsatib qo'y
  startOnlinePresence();   // Supabase bilan to'ldiradi
  listenInvites(getCurrentKey(), showInvitePopup2);
});

// ── PROFILE ──
function loadProfile() {
  const u = getCurrentUser();
  if (!u) return;
  const color = u.skinColor || '#6366f1';
  const initial = u.username.charAt(0).toUpperCase();
  document.getElementById('nav-username').textContent = u.username;
  document.getElementById('nav-coins').textContent    = u.coins || 0;
  const navAv = document.getElementById('nav-avatar');
  navAv.textContent = initial;
  navAv.style.background = color;
  document.getElementById('hero-username').textContent = u.username;
  document.getElementById('drop-username').textContent = u.username;
  document.getElementById('drop-wins').textContent     = u.wins || 0;
  document.getElementById('drop-losses').textContent   = u.losses || 0;
  const dropAv = document.getElementById('drop-avatar');
  dropAv.textContent = initial;
  dropAv.style.background = color;
}

// ── LEADERBOARD ──
function renderLeaderboard() {
  const users = getUsers();
  const lb = document.getElementById('leaderboard');
  if (!lb) return;
  const list = Object.values(users).sort((a,b)=>(b.wins||0)-(a.wins||0)).slice(0,10);
  if (!list.length) {
    lb.innerHTML = '<div style="padding:24px;text-align:center;color:rgba(255,255,255,.3)">Hali o\'yin o\'ynamagan</div>';
    return;
  }
  const medals = ['#1','#2','#3'];
  lb.innerHTML = list.map((u,i) => {
    const color = u.skinColor || '#6366f1';
    return `
      <div class="lb-row">
        <div class="lb-rank">${medals[i]||'#'+(i+1)}</div>
        <div class="lb-avatar" style="background:${color}">${u.username.charAt(0).toUpperCase()}</div>
        <div class="lb-name">${u.username}</div>
        <div class="lb-wins">W: ${u.wins||0}</div>
        <div class="lb-coins">C: ${u.coins||0}</div>
      </div>`;
  }).join('');
}

// ══════════════════════════════════════════════
//  ONLINE PLAYERS — Supabase Realtime Presence
// ══════════════════════════════════════════════
let _presenceChannel = null;

function startOnlinePresence() {
  const sb = getSB();
  if (!sb) return;
  const myKey = getCurrentKey();
  const u = getCurrentUser();
  if (!myKey || !u) return;

  _presenceChannel = sb.channel('online-players', {
    config: { presence: { key: myKey } }
  });

  _presenceChannel
    .on('presence', { event: 'sync' }, () => {
      const state = _presenceChannel.presenceState();
      renderOnlineFromPresence(state);
    })
    .on('presence', { event: 'join' }, () => {
      const state = _presenceChannel.presenceState();
      renderOnlineFromPresence(state);
    })
    .on('presence', { event: 'leave' }, () => {
      const state = _presenceChannel.presenceState();
      renderOnlineFromPresence(state);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await _presenceChannel.track({
          username: u.username,
          skinColor: u.skinColor || '#6366f1',
          wins: u.wins || 0,
          ts: Date.now()
        });
      }
    });
}

function renderOnlineFromPresence(state) {
  const myKey = getCurrentKey();
  const players = [];
  Object.entries(state).forEach(([key, metas]) => {
    if (key === myKey) return;
    const meta = metas[0];
    if (meta) players.push({ key, ...meta });
  });
  renderOnlinePlayers(players);
}

function renderOnlinePlayers(players) {
  const wrap = document.getElementById('online-players-wrap');
  if (!wrap) return;

  if (!players || !players.length) {
    wrap.innerHTML = `
      <div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);
        border-radius:14px;padding:18px;text-align:center;color:rgba(255,255,255,.3);font-size:14px;">
        Hozir boshqa online o'yinchi yo'q — do'stingizni taklif qiling!
      </div>`;
    return;
  }

  wrap.innerHTML = `
    <div style="display:flex;flex-wrap:wrap;gap:12px;">
      ${players.map(p => `
        <div onclick="challengePlayer('${p.key}','${p.username}')"
          style="background:rgba(255,255,255,.05);border:1px solid rgba(16,185,129,.3);
          border-radius:14px;padding:14px 18px;display:flex;align-items:center;gap:12px;
          cursor:pointer;transition:all .2s;min-width:180px;"
          onmouseover="this.style.background='rgba(16,185,129,.12)';this.style.transform='translateY(-2px)'"
          onmouseout="this.style.background='rgba(255,255,255,.05)';this.style.transform='translateY(0)'">
          <div style="position:relative;">
            <div style="width:40px;height:40px;border-radius:50%;background:${p.skinColor||'#6366f1'};
              display:flex;align-items:center;justify-content:center;
              font-weight:700;color:#fff;font-size:17px;">
              ${p.username.charAt(0).toUpperCase()}
            </div>
            <span style="position:absolute;bottom:0;right:0;width:11px;height:11px;
              background:#10b981;border-radius:50%;border:2px solid #0a0a1a;"></span>
          </div>
          <div>
            <div style="font-size:15px;font-weight:700;color:#fff;margin-bottom:2px;">
              ${p.username}
            </div>
            <div style="font-size:12px;color:rgba(255,255,255,.4);">
              &#127942; ${p.wins||0} &nbsp;&#9654; O'ynash
            </div>
          </div>
        </div>
      `).join('')}
    </div>`;
}

// O'yinchini tanlab o'yna
function challengePlayer(playerKey, playerName) {
  // O'yin tanlash modali
  let modal = document.getElementById('challenge-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'challenge-modal';
    modal.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,.8);backdrop-filter:blur(10px);
      display:flex;align-items:center;justify-content:center;z-index:300;`;
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div style="background:#13132a;border:1px solid rgba(255,255,255,.12);border-radius:24px;
      padding:36px 32px;text-align:center;max-width:400px;width:90%;animation:bounceIn .3s ease;">
      <div style="font-size:52px;margin-bottom:12px;">&#127918;</div>
      <h2 style="font-family:'Orbitron',sans-serif;font-size:18px;font-weight:900;margin-bottom:6px;">
        ${playerName} ga qarshi o'yna!
      </h2>
      <p style="color:rgba(255,255,255,.5);font-size:14px;margin-bottom:24px;">
        Qaysi o'yinni tanlaysiz?
      </p>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:20px;">
        ${[
          {id:'tictactoe',icon:'&#9898;',name:'Tic-Tac-Toe'},
          {id:'connect4', icon:'&#128308;',name:'Connect Four'},
          {id:'quiz',     icon:'&#129504;',name:'Quiz Battle'}
        ].map(g => `
          <div onclick="startChallenge('${playerKey}','${playerName}','${g.id}')"
            style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);
            border-radius:12px;padding:14px 8px;cursor:pointer;transition:all .2s;"
            onmouseover="this.style.background='rgba(99,102,241,.2)';this.style.borderColor='#6366f1'"
            onmouseout="this.style.background='rgba(255,255,255,.05)';this.style.borderColor='rgba(255,255,255,.1)'">
            <div style="font-size:28px;margin-bottom:6px;">${g.icon}</div>
            <div style="font-size:12px;font-weight:700;">${g.name}</div>
          </div>`).join('')}
      </div>
      <button onclick="document.getElementById('challenge-modal').remove()"
        style="padding:10px 24px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);
        border-radius:10px;color:#fff;font-family:'Rajdhani',sans-serif;font-size:14px;cursor:pointer;">
        Bekor qilish
      </button>
    </div>`;
}

function startChallenge(playerKey, playerName, gameId) {
  document.getElementById('challenge-modal')?.remove();

  // Random xona kodi yasash
  const code = Math.floor(1000 + Math.random() * 9000).toString();

  // Do'stga invite yuborish
  sendInvite(playerKey, getCurrentKey(), gameId, code);

  // O'zimiz xonaga kiramiz
  currentGame = gameId;
  showToast(`&#128232; ${playerName} ga taklif yuborildi! Xona: #${code}`);

  // Waiting modalini ochish
  openWaiting(`${playerName} bilan o'yin`, `Xona kodi: #${code}`);

  // Supabase enterRoom
  _cancelSearch = enterRoom(gameId, code, getCurrentKey(), (p1, p2) => {
    _cancelSearch = null;
    if (!p1) { closeWaiting(); showToast('Vaqt tugadi', 'error'); return; }
    closeWaiting();
    launchGame(p1, p2, code);
  });
}

// Invite popup (Supabase invite uchun)
function showInvitePopup2(inv) {
  const names = { tictactoe:'Tic-Tac-Toe', connect4:'Connect Four', quiz:'Quiz Battle' };
  const gameName = names[inv.gameType] || inv.gameType;

  document.getElementById('inv-popup2')?.remove();
  const popup = document.createElement('div');
  popup.id = 'inv-popup2';
  popup.style.cssText = `
    position:fixed;bottom:28px;right:24px;z-index:9998;
    background:#1e1e3a;border:2px solid rgba(99,102,241,.5);
    border-radius:18px;padding:20px 22px;width:300px;
    box-shadow:0 12px 48px rgba(0,0,0,.6);
    font-family:'Rajdhani',sans-serif;color:#fff;`;
  popup.innerHTML = `
    <div style="font-size:12px;color:rgba(255,255,255,.4);margin-bottom:6px">
      &#128232; O'yinga taklif!
    </div>
    <div style="font-size:16px;font-weight:700;margin-bottom:4px">
      <span style="color:#a78bfa">${inv.from}</span> seni <b>${gameName}</b> ga chaqiryapti!
    </div>
    <div style="font-size:13px;color:rgba(255,255,255,.4);margin-bottom:14px">
      Xona: <b style="color:#fbbf24">#${inv.code}</b>
    </div>
    <div style="display:flex;gap:8px;">
      <button onclick="acceptInvite2('${inv.gameType}','${inv.code}')"
        style="flex:1;padding:10px;background:linear-gradient(135deg,#6366f1,#8b5cf6);
        border:none;border-radius:10px;color:#fff;font-family:'Rajdhani',sans-serif;
        font-size:14px;font-weight:700;cursor:pointer;">
        Qabul &#10003;
      </button>
      <button onclick="document.getElementById('inv-popup2').remove()"
        style="flex:1;padding:10px;background:rgba(255,255,255,.06);
        border:1px solid rgba(255,255,255,.1);border-radius:10px;color:#fff;
        font-family:'Rajdhani',sans-serif;font-size:14px;cursor:pointer;">
        Rad &#10005;
      </button>
    </div>`;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 60000);
}

function acceptInvite2(gameType, code) {
  document.getElementById('inv-popup2')?.remove();
  currentGame = gameType;
  openWaiting('O\'yinga ulanilmoqda...', `Xona: #${code}`);
  _cancelSearch = enterRoom(gameType, code, getCurrentKey(), (p1, p2) => {
    _cancelSearch = null;
    if (!p1) { closeWaiting(); showToast('Xona topilmadi', 'error'); return; }
    closeWaiting();
    launchGame(p1, p2, code);
  });
}
