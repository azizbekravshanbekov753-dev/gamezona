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

// Show/hide password
function togglePass(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁️';
  }
}

// Get all users
function getUsers() {
  return JSON.parse(localStorage.getItem('gz_users') || '{}');
}

// Save users
function saveUsers(users) {
  localStorage.setItem('gz_users', JSON.stringify(users));
}

// Handle Login
function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');

  const users = getUsers();
  const key = username.toLowerCase();

  if (!users[key]) {
    errorEl.textContent = '❌ Bunday username topilmadi!';
    return;
  }
  if (users[key].password !== btoa(password)) {
    errorEl.textContent = '❌ Parol noto\'g\'ri!';
    return;
  }

  // Login success
  localStorage.setItem('gz_current_user', key);
  errorEl.style.color = '#34d399';
  errorEl.textContent = '✅ Muvaffaqiyatli kirdingiz!';
  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 800);
}

// Handle Register
function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById('reg-username').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirm  = document.getElementById('reg-confirm').value;
  const errorEl   = document.getElementById('reg-error');
  const successEl = document.getElementById('reg-success');
  errorEl.textContent = '';
  successEl.textContent = '';

  // Validations
  if (!/^[a-zA-Z0-9_]{3,16}$/.test(username)) {
    errorEl.textContent = '❌ Username faqat harf, raqam va _ bo\'lishi kerak (3-16 belgi)';
    return;
  }
  if (password.length < 6) {
    errorEl.textContent = '❌ Parol kamida 6 belgidan iborat bo\'lishi kerak';
    return;
  }
  if (password !== confirm) {
    errorEl.textContent = '❌ Parollar mos kelmadi!';
    return;
  }

  const users = getUsers();
  const key = username.toLowerCase();

  if (users[key]) {
    errorEl.textContent = '❌ Bu username band! Boshqasini tanlang.';
    return;
  }

  // Create user
  users[key] = {
    username: username,
    password: btoa(password),
    coins: 100,            // boshlang'ich tanga
    skin: 'default',
    skinColor: '#6366f1',
    wins: 0,
    losses: 0,
    createdAt: Date.now()
  };
  saveUsers(users);

  successEl.textContent = '✅ Ro\'yxatdan o\'tdingiz! Kirish amalga oshirilmoqda...';
  localStorage.setItem('gz_current_user', key);
  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 1200);
}

// Auto-redirect if already logged in
window.addEventListener('DOMContentLoaded', () => {
  const current = localStorage.getItem('gz_current_user');
  if (current) {
    const users = getUsers();
    if (users[current]) {
      window.location.href = 'dashboard.html';
    }
  }
});
