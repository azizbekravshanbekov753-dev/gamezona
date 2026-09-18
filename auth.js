// Tab switching
function showTab(tab) {
  document.querySelectorAll('.tab-content').forEach(function(t) { t.classList.remove('active'); });
  document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
  document.getElementById(tab + '-tab').classList.add('active');
  document.querySelectorAll('.tab-btn')[tab === 'login' ? 0 : 1].classList.add('active');
  document.getElementById('login-error').textContent = '';
  document.getElementById('reg-error').textContent = '';
  document.getElementById('reg-success').textContent = '';
}

function togglePass(inputId, btn) {
  var input = document.getElementById(inputId);
  if (input.type === 'password') { input.type = 'text'; btn.textContent = 'X'; }
  else { input.type = 'password'; btn.textContent = 'O'; }
}

// localStorage helpers (coins.js dan oldin yuklanganda xato bolmasin)
function _getUsers() { return JSON.parse(localStorage.getItem('gz_users') || '{}'); }
function _saveUsers(u) { localStorage.setItem('gz_users', JSON.stringify(u)); }

// ── LOGIN ──
async function handleLogin(e) {
  e.preventDefault();
  var username = document.getElementById('login-username').value.trim().toLowerCase();
  var password = document.getElementById('login-password').value;
  var errorEl  = document.getElementById('login-error');
  errorEl.style.color = 'rgba(255,255,255,.5)';
  errorEl.textContent = 'Tekshirilmoqda...';

  // 1. localStorage dan tekshir
  var users = _getUsers();
  if (users[username]) {
    if (users[username].password !== btoa(password)) {
      errorEl.style.color = '#f87171';
      errorEl.textContent = 'Parol noto\'g\'ri!';
      return;
    }
    _loginSuccess(username, errorEl);
    return;
  }

  // 2. Supabase dan tekshir
  try {
    var sb = getSB();
    if (sb) {
      var res = await sb.from('users').select('*').eq('id', username).single();
      if (res.data) {
        if (res.data.password !== btoa(password)) {
          errorEl.style.color = '#f87171';
          errorEl.textContent = 'Parol noto\'g\'ri!';
          return;
        }
        // localStorage ga saqlash
        users[username] = {
          username:   res.data.username,
          password:   res.data.password,
          coins:      res.data.coins || 0,
          wins:       res.data.wins || 0,
          losses:     res.data.losses || 0,
          skinColor:  res.data.skin_color || '#6366f1',
          skin:       'default',
          ownedSkins: ['default']
        };
        _saveUsers(users);
        _loginSuccess(username, errorEl);
        return;
      }
    }
  } catch(err) { console.log('Supabase xato:', err); }

  errorEl.style.color = '#f87171';
  errorEl.textContent = 'Foydalanuvchi topilmadi!';
}

function _loginSuccess(username, errorEl) {
  localStorage.setItem('gz_current_user', username);
  errorEl.style.color = '#34d399';
  errorEl.textContent = 'Muvaffaqiyatli! Yuklanmoqda...';
  setTimeout(function() { window.location.href = 'dashboard.html'; }, 800);
}

// ── REGISTER ──
async function handleRegister(e) {
  e.preventDefault();
  var username  = document.getElementById('reg-username').value.trim();
  var password  = document.getElementById('reg-password').value;
  var confirm   = document.getElementById('reg-confirm').value;
  var errorEl   = document.getElementById('reg-error');
  var successEl = document.getElementById('reg-success');
  errorEl.textContent = '';
  successEl.textContent = '';

  if (!/^[a-zA-Z0-9_]{3,16}$/.test(username)) {
    errorEl.textContent = 'Username: 3-16 ta harf yoki raqam';
    return;
  }
  if (password.length < 6) {
    errorEl.textContent = 'Parol kamida 6 ta belgi';
    return;
  }
  if (password !== confirm) {
    errorEl.textContent = 'Parollar mos kelmadi!';
    return;
  }

  var key   = username.toLowerCase();
  var users = _getUsers();

  if (users[key]) {
    errorEl.textContent = 'Bu username band!';
    return;
  }

  errorEl.style.color = 'rgba(255,255,255,.5)';
  errorEl.textContent = 'Saqlanmoqda...';

  // Supabase da ham tekshir
  try {
    var sb = getSB();
    if (sb) {
      var chk = await sb.from('users').select('id').eq('id', key).single();
      if (chk.data) {
        errorEl.style.color = '#f87171';
        errorEl.textContent = 'Bu username band!';
        return;
      }
    }
  } catch(err) {}

  // Saqlash
  var newUser = {
    username:   username,
    password:   btoa(password),
    coins:      100,
    wins:       0,
    losses:     0,
    skinColor:  '#6366f1',
    skin:       'default',
    ownedSkins: ['default']
  };

  users[key] = newUser;
  _saveUsers(users);

  // Supabase ga saqlash
  try {
    var sb2 = getSB();
    if (sb2) {
      await sb2.from('users').insert({
        id:         key,
        username:   username,
        password:   btoa(password),
        coins:      100,
        wins:       0,
        losses:     0,
        skin_color: '#6366f1'
      });
    }
  } catch(err) { console.log('Supabase saqlash xato:', err); }

  localStorage.setItem('gz_current_user', key);
  errorEl.textContent = '';
  successEl.textContent = 'Muvaffaqiyatli! Yuklanmoqda...';
  setTimeout(function() { window.location.href = 'dashboard.html'; }, 800);
}

// Auto-redirect
window.addEventListener('DOMContentLoaded', function() {
  var current = localStorage.getItem('gz_current_user');
  if (current) {
    var users = _getUsers();
    if (users[current]) {
      window.location.href = 'dashboard.html';
    }
  }
});
