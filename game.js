// ═══════════════════════════════════════════════
//  GAME.JS — Dashboard multiplayer controller
// ═══════════════════════════════════════════════

let currentGame = null;
let _cancelSearch = null;

const GAME_META = {
  tictactoe: { icon:'⭕', title:'Tic-Tac-Toe',  desc:'3x3 klassik o\'yin!',           reward:50,  file:'tictactoe.html' },
  connect4:  { icon:'🔴', title:'Connect Four',  desc:'4 tani qatorga joylashtiring!', reward:75,  file:'connect4.html'  },
  quiz:      { icon:'🧠', title:'Quiz Battle',   desc:'Savol-javob bellashuvi!',       reward:60,  file:'quiz.html'      },
};

// ── O'yin tanlash ──
function openGameModal(game) {
  currentGame = game;
  const m = GAME_META[game];
  document.getElementById('modal-icon').textContent  = m.icon;
  document.getElementById('modal-title').textContent = m.title;
  document.getElementById('modal-desc').textContent  = m.desc;
  document.getElementById('game-modal').classList.add('open');
}
function closeGameModal() {
  document.getElementById('game-modal').classList.remove('open');
}

// ── Rejim tanlash ──
function startGame(mode) {
  closeGameModal();
  if (mode === 'random') {
    openWaiting('🎲 Tasodifiy raqib qidirilmoqda...', 'Iltimos kuting...');
    doRandom();
  } else if (mode === 'room') {
    document.getElementById('room-input').value = '';
    document.getElementById('room-status').textContent = '';
    document.getElementById('room-modal').classList.add('open');
  } else if (mode === 'friend') {
    document.getElementById('friend-input').value = '';
    document.getElementById('friend-status').textContent = '';
    document.getElementById('friend-modal').classList.add('open');
  }
}

// ══════════════════════════════════════════
//  XONA RAQAMI
// ══════════════════════════════════════════
function closeRoomModal() {
  document.getElementById('room-modal').classList.remove('open');
}

function joinRoomAction() {
  const code = document.getElementById('room-input').value.trim();
  const st   = document.getElementById('room-status');

  if (!code || code.length < 4) {
    st.style.color = '#f87171';
    st.textContent = '❌ Kamida 4 raqam kiriting';
    return;
  }

  const myKey = getCurrentKey();
  if (!myKey) { window.location.href = 'index.html'; return; }

  st.style.color = 'rgba(255,255,255,.5)';
  st.textContent = '⏳ Ulanilmoqda...';

  closeRoomModal();
  openWaiting(`🔢 Xona #${code}`, 'Raqib kutilmoqda... Raqibingiz ham shu kodni kiriting!');

  _cancelSearch = enterRoom(currentGame, code, myKey, (p1, p2) => {
    _cancelSearch = null;
    if (!p1) {
      closeWaiting();
      showToast('⏰ Vaqt tugadi. Qayta urining.', 'error');
      return;
    }
    closeWaiting();
    launchGame(p1, p2, code);
  });
}

// ══════════════════════════════════════════
//  DO'ST CHAQIRISH
// ══════════════════════════════════════════
function closeFriendModal() {
  document.getElementById('friend-modal').classList.remove('open');
}

function inviteFriend() {
  const friendName = document.getElementById('friend-input').value.trim().toLowerCase();
  const st = document.getElementById('friend-status');

  if (!friendName) { st.style.color='#f87171'; st.textContent='❌ Username kiriting'; return; }

  const myKey = getCurrentKey();
  const users = getUsers();

  if (!users[friendName]) {
    st.style.color = '#f87171';
    st.textContent = '❌ Bu username topilmadi!';
    return;
  }
  if (friendName === myKey) {
    st.style.color = '#f87171';
    st.textContent = '❌ O\'zingizni chaqira olmaysiz!';
    return;
  }

  // Random kod yasash
  const code = Math.floor(1000 + Math.random() * 9000).toString();

  // Do'stga invite yuborish
  sendInvite(friendName, myKey, currentGame, code);

  st.style.color = '#34d399';
  st.textContent = `✅ Taklif yuborildi! Xona kodi: #${code}`;

  setTimeout(() => {
    closeFriendModal();
    openWaiting(`👥 Do'stingiz kutilmoqda`, `Xona kodi: #${code} — do'stingiz shu kodni kiriting`);

    _cancelSearch = enterRoom(currentGame, code, myKey, (p1, p2) => {
      _cancelSearch = null;
      if (!p1) { closeWaiting(); showToast('⏰ Do\'st qo\'shilmadi.', 'error'); return; }
      closeWaiting();
      launchGame(p1, p2, code);
    });
  }, 1500);
}

// ══════════════════════════════════════════
//  TASODIFIY RAQIB
// ══════════════════════════════════════════
function doRandom() {
  const myKey = getCurrentKey();
  _cancelSearch = findRandom(currentGame, myKey, (p1, p2, code) => {
    _cancelSearch = null;
    if (!p1) {
      closeWaiting();
      showToast('⏰ Raqib topilmadi. Qayta urining.', 'error');
      return;
    }
    closeWaiting();
    launchGame(p1, p2, code);
  });
}

// ══════════════════════════════════════════
//  INVITE BILDIRISHNOMA (Dashboard da)
// ══════════════════════════════════════════
function startInviteListener() {
  const myKey = getCurrentKey();
  if (!myKey) return;
  const names = { tictactoe:'Tic-Tac-Toe', connect4:'Connect Four', quiz:'Quiz Battle' };

  listenInvites(myKey, (inv) => {
    showInvitePopup(inv.from, names[inv.gameType] || inv.gameType, inv.gameType, inv.code);
  });
}

function showInvitePopup(from, gameName, gameType, code) {
  // Eski popupni o'chir
  document.getElementById('inv-popup')?.remove();

  const popup = document.createElement('div');
  popup.id = 'inv-popup';
  popup.style.cssText = `
    position:fixed;bottom:28px;right:24px;z-index:9998;
    background:#1e1e3a;border:2px solid rgba(99,102,241,.5);
    border-radius:18px;padding:20px 22px;width:300px;
    box-shadow:0 12px 48px rgba(0,0,0,.6);
    font-family:'Rajdhani',sans-serif;color:#fff;
  `;
  popup.innerHTML = `
    <div style="font-size:12px;color:rgba(255,255,255,.4);margin-bottom:6px">📨 Do'stdan taklif!</div>
    <div style="font-size:16px;font-weight:700;margin-bottom:4px">
      <span style="color:#a78bfa">${from}</span> seni <b>${gameName}</b> ga chaqiryapti!
    </div>
    <div style="font-size:13px;color:rgba(255,255,255,.4);margin-bottom:14px">
      Xona kodi: <b style="color:#fbbf24">#${code}</b>
    </div>
    <div style="display:flex;gap:8px">
      <button onclick="acceptInvite('${gameType}','${code}')"
        style="flex:1;padding:10px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border:none;
        border-radius:10px;color:#fff;font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;cursor:pointer">
        ✅ Qabul
      </button>
      <button onclick="document.getElementById('inv-popup').remove()"
        style="flex:1;padding:10px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);
        border-radius:10px;color:#fff;font-family:'Rajdhani',sans-serif;font-size:14px;cursor:pointer">
        ❌ Rad
      </button>
    </div>`;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 60000);
}

function acceptInvite(gameType, code) {
  document.getElementById('inv-popup')?.remove();
  currentGame = gameType;
  document.getElementById('room-input').value = code;
  joinRoomAction();
}

// ══════════════════════════════════════════
//  WAITING MODAL
// ══════════════════════════════════════════
function openWaiting(title, desc) {
  document.getElementById('waiting-title').textContent = title;
  document.getElementById('waiting-desc').textContent  = desc;
  document.getElementById('waiting-modal').classList.add('open');
}
function closeWaiting() {
  document.getElementById('waiting-modal').classList.remove('open');
}
function cancelWaiting() {
  if (_cancelSearch) { _cancelSearch(); _cancelSearch = null; }
  closeWaiting();
}

// ══════════════════════════════════════════
//  O'YIN ISHGA TUSHIRISH
// ══════════════════════════════════════════
function launchGame(p1, p2, code) {
  const meta = GAME_META[currentGame];
  localStorage.setItem('gz_session', JSON.stringify({
    game: currentGame,
    player1: p1,
    player2: p2,
    roomCode: code,
    reward: meta.reward
  }));
  window.location.href = meta.file;
}

// ══════════════════════════════════════════
//  MODAL / DROPDOWN / LOGOUT
// ══════════════════════════════════════════
function closeModal(e) {
  if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
}
function toggleProfile() {
  document.getElementById('profile-dropdown').classList.toggle('open');
}
function closeDropdown() {
  document.getElementById('profile-dropdown').classList.remove('open');
}
document.addEventListener('click', (e) => {
  if (!e.target.closest('.profile-btn') && !e.target.closest('.profile-dropdown')) closeDropdown();
});
function logout() {
  localStorage.removeItem('gz_current_user');
  window.location.href = 'index.html';
}

window.GZ = { startInviteListener };
