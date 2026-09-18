// ═══════════════════════════════════════════════
//  GAME.JS — Dashboard multiplayer controller
// ═══════════════════════════════════════════════

var currentGame   = null;
var _cancelSearch = null; // cancel funksiyasi saqlanadi

var GAME_META = {
  tictactoe: { icon:'O', title:'Tic-Tac-Toe',  desc:'3x3 klassik oyini!',           reward:50,  file:'tictactoe.html' },
  connect4:  { icon:'4', title:'Connect Four',  desc:'4 tani qatorga joylashtiring!', reward:75,  file:'connect4.html'  },
  quiz:      { icon:'?', title:'Quiz Battle',   desc:'Savol-javob bellashuvi!',       reward:60,  file:'quiz.html'      },
};

// ── O'yin tanlash ──
function openGameModal(game) {
  currentGame = game;
  var m = GAME_META[game];
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
    openWaiting('Tasodifiy raqib qidirilmoqda...', 'Iltimos kuting...');
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

async function joinRoomAction() {
  var code = document.getElementById('room-input').value.trim();
  var st   = document.getElementById('room-status');

  if (!code || code.length < 4) {
    st.style.color = '#f87171';
    st.textContent = 'Kamida 4 raqam kiriting';
    return;
  }

  var myKey = getCurrentKey();
  if (!myKey) { window.location.href = 'index.html'; return; }

  st.style.color = 'rgba(255,255,255,.5)';
  st.textContent = 'Ulanilmoqda...';

  closeRoomModal();
  openWaiting('Xona #' + code, 'Raqib kutilmoqda...');

  // enterRoom Promise qaytaradi — await bilan cancel funksiyasini olamiz
  var cancelFn = await enterRoom(currentGame, code, myKey, function(p1, p2) {
    _cancelSearch = null;
    if (!p1) {
      closeWaiting();
      showToast('Vaqt tugadi. Qayta urining.', 'error');
      return;
    }
    closeWaiting();
    launchGame(p1, p2, code);
  });
  _cancelSearch = cancelFn;
}

// ══════════════════════════════════════════
//  DO'ST CHAQIRISH
// ══════════════════════════════════════════
function closeFriendModal() {
  document.getElementById('friend-modal').classList.remove('open');
}

async function inviteFriend() {
  var friendName = document.getElementById('friend-input').value.trim().toLowerCase();
  var st = document.getElementById('friend-status');

  if (!friendName) { st.style.color='#f87171'; st.textContent='Username kiriting'; return; }

  var myKey = getCurrentKey();
  var users = getUsers();

  // localStorage dan tekshir
  var friendExists = !!users[friendName];

  // Supabase dan ham tekshir
  if (!friendExists) {
    var sb = getSB();
    if (sb) {
      var res = await sb.from('users').select('id').eq('id', friendName).single();
      friendExists = !!res.data;
    }
  }

  if (!friendExists) {
    st.style.color = '#f87171';
    st.textContent = 'Bu username topilmadi!';
    return;
  }
  if (friendName === myKey) {
    st.style.color = '#f87171';
    st.textContent = 'Ozingizni chaqira olmaysiz!';
    return;
  }

  var code = Math.floor(1000 + Math.random() * 9000).toString();
  sendInvite(friendName, myKey, currentGame, code);

  st.style.color = '#34d399';
  st.textContent = 'Taklif yuborildi! Xona: #' + code;

  setTimeout(async function() {
    closeFriendModal();
    openWaiting('Dostingiz kutilmoqda', 'Xona kodi: #' + code);

    var cancelFn = await enterRoom(currentGame, code, myKey, function(p1, p2) {
      _cancelSearch = null;
      if (!p1) { closeWaiting(); showToast('Dost qoshilmadi.', 'error'); return; }
      closeWaiting();
      launchGame(p1, p2, code);
    });
    _cancelSearch = cancelFn;
  }, 1200);
}

// ══════════════════════════════════════════
//  TASODIFIY RAQIB
// ══════════════════════════════════════════
async function doRandom() {
  var myKey = getCurrentKey();
  var cancelFn = await findRandom(currentGame, myKey, function(p1, p2, code) {
    _cancelSearch = null;
    if (!p1) {
      closeWaiting();
      showToast('Raqib topilmadi. Qayta urining.', 'error');
      return;
    }
    closeWaiting();
    launchGame(p1, p2, code);
  });
  _cancelSearch = cancelFn;
}

// ══════════════════════════════════════════
//  WAITING MODAL — BEKOR QILISH
// ══════════════════════════════════════════
function openWaiting(title, desc) {
  document.getElementById('waiting-title').textContent = title || 'Kutilmoqda...';
  document.getElementById('waiting-desc').textContent  = desc  || '';
  document.getElementById('waiting-modal').classList.add('open');
}

function closeWaiting() {
  document.getElementById('waiting-modal').classList.remove('open');
}

function cancelWaiting() {
  // _cancelSearch ni to'g'ri chaqirish
  if (_cancelSearch) {
    try {
      if (typeof _cancelSearch === 'function') {
        _cancelSearch();
      } else if (_cancelSearch && typeof _cancelSearch.then === 'function') {
        // Promise bo'lsa — resolve bo'lganda cancel qilamiz
        _cancelSearch.then(function(fn) { if (typeof fn === 'function') fn(); });
      }
    } catch(e) {}
    _cancelSearch = null;
  }
  closeWaiting();
  showToast('Bekor qilindi');
}

// ══════════════════════════════════════════
//  O'YIN ISHGA TUSHIRISH
// ══════════════════════════════════════════
function launchGame(p1, p2, code) {
  var meta = GAME_META[currentGame];
  if (!meta) return;
  localStorage.setItem('gz_session', JSON.stringify({
    game:     currentGame,
    player1:  p1,
    player2:  p2,
    roomCode: code,
    reward:   meta.reward
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
document.addEventListener('click', function(e) {
  if (!e.target.closest('.profile-btn') && !e.target.closest('.profile-dropdown')) {
    closeDropdown();
  }
});
function logout() {
  goOffline();
  localStorage.removeItem('gz_current_user');
  window.location.href = 'index.html';
}
