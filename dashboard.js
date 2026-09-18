// Auth guard
const _key = localStorage.getItem('gz_current_user');
if (!_key || !getUsers()[_key]) {
  window.location.href = 'index.html';
}

// ── INIT DASHBOARD ──
document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  renderLeaderboard();
  checkInvites();
});

function loadProfile() {
  const u = getCurrentUser();
  if (!u) return;

  const color = u.skinColor || '#6366f1';
  const initial = u.username.charAt(0).toUpperCase();

  // Navbar
  document.getElementById('nav-username').textContent = u.username;
  document.getElementById('nav-coins').textContent    = u.coins || 0;
  const navAv = document.getElementById('nav-avatar');
  navAv.textContent = initial;
  navAv.style.background = color;

  // Hero
  document.getElementById('hero-username').textContent = u.username;

  // Dropdown
  document.getElementById('drop-username').textContent = u.username;
  document.getElementById('drop-wins').textContent     = u.wins || 0;
  document.getElementById('drop-losses').textContent   = u.losses || 0;
  const dropAv = document.getElementById('drop-avatar');
  dropAv.textContent = initial;
  dropAv.style.background = color;
}

function renderLeaderboard() {
  const users = getUsers();
  const lb = document.getElementById('leaderboard');
  if (!lb) return;

  const list = Object.values(users)
    .sort((a,b) => (b.wins||0) - (a.wins||0))
    .slice(0, 10);

  if (list.length === 0) {
    lb.innerHTML = '<div style="padding:24px;text-align:center;color:rgba(255,255,255,.3)">Hali o\'yin o\'ynamagan</div>';
    return;
  }

  const medals = ['🥇','🥈','🥉'];
  lb.innerHTML = list.map((u,i) => {
    const color = u.skinColor || '#6366f1';
    const initial = u.username.charAt(0).toUpperCase();
    const rank = medals[i] || `#${i+1}`;
    return `
      <div class="lb-row">
        <div class="lb-rank">${rank}</div>
        <div class="lb-avatar" style="background:${color}">${initial}</div>
        <div class="lb-name">${u.username}</div>
        <div class="lb-wins">🏆 ${u.wins||0}</div>
        <div class="lb-coins">🪙 ${u.coins||0}</div>
      </div>`;
  }).join('');
}

// ── CHECK INVITES ──
function checkInvites() {
  const key = getCurrentKey();
  if (!key) return;
  const notifKey = `gz_invite_${key}`;
  const notifs = JSON.parse(localStorage.getItem(notifKey)||'[]');
  const fresh = notifs.filter(n => Date.now()-n.ts < 120000); // 2 min window

  if (fresh.length > 0) {
    const n = fresh[0];
    const remaining = fresh.slice(1);
    localStorage.setItem(notifKey, JSON.stringify(remaining));

    const meta = { tictactoe:'Tic-Tac-Toe', connect4:'Connect Four', quiz:'Quiz Battle' };
    showInvitePopup(n.from, meta[n.game]||n.game, n.code, n.game);
  }
}

function showInvitePopup(from, gameName, code, gameId) {
  const popup = document.createElement('div');
  popup.style.cssText = `
    position:fixed; bottom:28px; right:24px; z-index:9998;
    background:#1e1e3a; border:1px solid rgba(99,102,241,.4);
    border-radius:18px; padding:20px 22px; width:300px;
    box-shadow:0 12px 48px rgba(0,0,0,.5);
    font-family:'Rajdhani',sans-serif; color:#fff;
    animation:slideUp .3s ease;
  `;
  popup.innerHTML = `
    <div style="font-size:13px;color:rgba(255,255,255,.5);margin-bottom:4px">📨 Do'stdan taklif</div>
    <div style="font-size:17px;font-weight:700;margin-bottom:4px">
      <span style="color:#a78bfa">${from}</span> seni ${gameName} o'yiniga chaqiryapti!
    </div>
    <div style="font-size:13px;color:rgba(255,255,255,.4);margin-bottom:16px">Xona kodi: <b style="color:#fbbf24">#${code}</b></div>
    <div style="display:flex;gap:8px">
      <button onclick="acceptInvite('${gameId}','${code}',this.closest('div').parentElement)"
        style="flex:1;padding:10px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border:none;border-radius:10px;color:#fff;font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;cursor:pointer">
        ✅ Qabul
      </button>
      <button onclick="this.closest('div').parentElement.remove()"
        style="flex:1;padding:10px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:#fff;font-family:'Rajdhani',sans-serif;font-size:14px;cursor:pointer">
        ❌ Rad
      </button>
    </div>`;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 60000);
}

function acceptInvite(gameId, code, popup) {
  if (popup) popup.remove();
  currentGame = gameId;
  currentMode = 'room';
  document.getElementById('room-input').value = code;
  document.getElementById('room-modal').classList.add('open');
  joinRoom();
}
