// ═══════════════════════════════════════════════
//  AUTH.JS — Login/Register (Supabase)
// ═══════════════════════════════════════════════

// Tab switching
function showTab(tab) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(tab + '-tab').classList.add('active');
  document.querySelectorAll('.tab-btn')[tab === 'login' ? 0 : 1].classList.add('active');
  clearMessages();
}

function clearMessages() {
  ['login-error','reg-error','reg-success'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
}

function togglePass(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') { input.type = 'text'; btn.textContent = 'X'; }
  else { input.type = 'password'; btn.textContent = 'O'; }
}

// ── LOGIN ──
async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;
  const errorEl  = document.getElementById('login-error');
  errorEl.textContent = 'Tekshirilmoqda...';
  errorEl.style.color = 'rgba(255,255,255,.5)';

  const sb = getSB();

  // 1. Avval Supabase dan tekshir
  if (sb) {
    const { data: sbUser } = await sb.from('users').select('*').eq('id', username).single();
    if (sbUser) {
      if (sbUser.password !== btoa(password)) {
        errorEl.style.color = '#f87171';
        errorEl.textContent = 'Parol noto\'g\'ri!';
        return;
      }
      // Login muvaffaqiyatli
      const userObj = {
        username:   sbUser.username,
        password:   sbUser.password,
        coins:      sbUser.coins,
        wins:       sbUser.wins,
        losses:     sbUser.losses,
        skinColor:  sbUser.skin_color || '#6366f1',
        skin:       'default',
        ownedSkins: ['default']
      };
      const users = getUsers();
      users[username] = userObj;
      saveUsers(users);
      localStorage.setItem('gz_current_user', username);
      errorEl.style.color = '#34d399';
      errorEl.textContent = 'Muvaffaqiyatli kirdingiz!';
      setTimeout(() => window.location.href = 'dashboard.html', 800);
      return;
    }
  }

  // 2. localStorage dan tekshir (offline fallback)
  const users = getUsers();
  if (users[username]) {
    if (users[username].password !== btoa(password)) {
      errorEl.style.color = '#f87171';
      errorEl.textContent = 'Parol noto\'g\'ri!';
      return;
    }
    localStorage.setItem('gz_current_user', username);
    errorEl.style.color = '#34d399';
    errorEl.textContent = 'Muvaffaqiyatli kirdingiz!';
    setTimeout(() => window.location.href = 'dashboard.html', 800);
    return;
  }

  errorEl.style.color = '#f87171';
  errorEl.textContent = 'Bunday foydalanuvchi topilmadi!';
}

// ── REGISTER ──
async function handleRegister(e) {
  e.preventDefault();
  const username  = document.getElementById('reg-username').value.trim();
  const password  = document.getElementById('reg-password').value;
  const confirm   = document.getElementById('reg-confirm').value;
  const errorEl   = document.getElementById('reg-error');
  const successEl = document.getElementById('reg-success');
  errorEl.textContent = ''; successEl.textContent = '';

  // Validatsiya
  if (!/^[a-zA-Z0-9_]{3,16}$/.test(username)) {
    errorEl.textContent = 'Username: 3-16 ta harf, raqam yoki _ bo\'lishi kerak';
    return;
  }
  if (password.length < 6) {
    errorEl.textContent = 'Parol kamida 6 ta belgi bo\'lishi kerak';
    return;
  }
  if (password !== confirm) {
    errorEl.textContent = 'Parollar mos kelmadi!';
    return;
  }

  const key = username.toLowerCase();
  errorEl.textContent = 'Tekshirilmoqda...';
  errorEl.style.color = 'rgba(255,255,255,.5)';

  const sb = getSB();

  // Supabase da bor-yoqligini tekshir
  if (sb) {
    const { data: existing } = await sb.from('users').select('id').eq('id', key).single();
    if (existing) {
      errorEl.style.color = '#f87171';
      errorEl.textContent = 'Bu username band! Boshqasini tanlang.';
      return;
    }
  } else {
    // localStorage da tekshir
    const users = getUsers();
    if (users[key]) {
      errorEl.style.color = '#f87171';
      errorEl.textContent = 'Bu username band! Boshqasini tanlang.';
      return;
    }
  }

  // Yangi foydalanuvchi
  const newUser = {
    username:   username,
    password:   btoa(password),
    coins:      100,
    wins:       0,
    losses:     0,
    skinColor:  '#6366f1',
    skin:       'default',
    ownedSkins: ['default']
  };

  // localStorage ga saqlash
  const users = getUsers();
  users[key] = newUser;
  saveUsers(users);

  // Supabase ga saqlash
  if (sb) {
    await sb.from('users').insert({
      id:         key,
      username:   username,
      password:   btoa(password),
      coins:      100,
      wins:       0,
      losses:     0,
      skin_color: '#6366f1'
    });
  }

  localStorage.setItem('gz_current_user', key);
  errorEl.textContent = '';
  successEl.textContent = 'Ro\'yxatdan o\'tdingiz! Kirish amalga oshirilmoqda...';
  setTimeout(() => window.location.href = 'dashboard.html', 1000);
}

// Auto-redirect
window.addEventListener('DOMContentLoaded', async () => {
  const current = localStorage.getItem('gz_current_user');
  if (current) {
    const users = getUsers();
    if (users[current]) {
      window.location.href = 'dashboard.html';
      return;
    }
    // Supabase dan tekshir
    const sb = getSB();
    if (sb) {
      const { data } = await sb.from('users').select('id').eq('id', current).single();
      if (data) { window.location.href = 'dashboard.html'; }
    }
  }
});
