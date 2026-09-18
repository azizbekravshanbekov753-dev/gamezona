// ── SKIN CATALOGUE ──
const SKINS = [
  { id:'default',   name:'Default',    color:'#6366f1', price:0,    emoji:'💜' },
  { id:'fire',      name:'Olov',       color:'#ef4444', price:200,  emoji:'🔴' },
  { id:'ocean',     name:'Okean',      color:'#0ea5e9', price:200,  emoji:'🔵' },
  { id:'forest',    name:'O\'rmon',    color:'#10b981', price:200,  emoji:'🟢' },
  { id:'gold',      name:'Oltin',      color:'#f59e0b', price:400,  emoji:'🟡' },
  { id:'rose',      name:'Atirgul',    color:'#f43f5e', price:400,  emoji:'🌸' },
  { id:'cyber',     name:'Cyber',      color:'#06b6d4', price:600,  emoji:'🩵' },
  { id:'galaxy',    name:'Galaktika',  color:'#8b5cf6', price:600,  emoji:'🌌' },
  { id:'lava',      name:'Lava',       color:'#f97316', price:800,  emoji:'🟠' },
  { id:'midnight',  name:'Tungi',      color:'#1e1b4b', price:800,  emoji:'🌙' },
  { id:'neon',      name:'Neon',       color:'#84cc16', price:1000, emoji:'💚' },
  { id:'diamond',   name:'Olmoz',      color:'#e0f2fe', price:1500, emoji:'💎' },
];

// ── HELPERS ──
function getUsers()  { return JSON.parse(localStorage.getItem('gz_users') || '{}'); }
function saveUsers(u){ localStorage.setItem('gz_users', JSON.stringify(u)); }
function getCurrentKey() { return localStorage.getItem('gz_current_user'); }
function getCurrentUser() {
  const k = getCurrentKey();
  if (!k) return null;
  return getUsers()[k] || null;
}

// Add coins to current user
function addCoins(amount) {
  const key = getCurrentKey();
  if (!key) return;
  const users = getUsers();
  if (!users[key]) return;
  users[key].coins = (users[key].coins || 0) + amount;
  saveUsers(users);
  refreshCoinDisplay();
}

// Add win/loss record
function addResult(win) {
  const key = getCurrentKey();
  if (!key) return;
  const users = getUsers();
  if (!users[key]) return;
  if (win) { users[key].wins = (users[key].wins||0)+1; }
  else      { users[key].losses = (users[key].losses||0)+1; }
  saveUsers(users);
}

// Refresh coin display in navbar
function refreshCoinDisplay() {
  const u = getCurrentUser();
  if (!u) return;
  const el = document.getElementById('nav-coins');
  if (el) el.textContent = u.coins || 0;
  const sc = document.getElementById('shop-coins');
  if (sc) sc.textContent = u.coins || 0;
}

// ── SHOP FUNCTIONS ──
function openShop() {
  closeDropdown();
  const modal = document.getElementById('shop-modal');
  if (modal) { modal.classList.add('open'); renderShop(); }
}
function closeShop() {
  const modal = document.getElementById('shop-modal');
  if (modal) modal.classList.remove('open');
}

function renderShop() {
  const u = getCurrentUser();
  if (!u) return;
  refreshCoinDisplay();
  const grid = document.getElementById('skins-grid');
  if (!grid) return;
  const ownedSkins = u.ownedSkins || ['default'];

  grid.innerHTML = SKINS.map(skin => {
    const owned    = ownedSkins.includes(skin.id);
    const equipped = u.skin === skin.id;
    let badgeHtml = '';
    if (equipped) badgeHtml = '<div class="skin-badge badge-equipped">✓ Kiyilgan</div>';
    else if (owned) badgeHtml = '<div class="skin-badge badge-owned">Mavjud</div>';
    else badgeHtml = `<div class="skin-price">🪙 ${skin.price}</div>`;

    return `
      <div class="skin-card ${equipped?'equipped':owned?'owned':''}"
           onclick="handleSkin('${skin.id}')">
        <div class="skin-preview" style="background:${skin.color}"></div>
        <div class="skin-name">${skin.emoji} ${skin.name}</div>
        ${badgeHtml}
      </div>`;
  }).join('');
}

function handleSkin(skinId) {
  const key = getCurrentKey();
  if (!key) return;
  const users = getUsers();
  const u = users[key];
  if (!u) return;
  if (!u.ownedSkins) u.ownedSkins = ['default'];

  const skin = SKINS.find(s => s.id === skinId);
  if (!skin) return;

  if (u.ownedSkins.includes(skinId)) {
    // Already owned → equip
    u.skin = skinId;
    u.skinColor = skin.color;
    saveUsers(users);
    updateAvatarColor(skin.color);
    renderShop();
    showToast(`✅ "${skin.name}" kiyildi!`);
  } else {
    // Buy
    if ((u.coins||0) < skin.price) {
      showToast('❌ Yetarli tanga yo\'q!', 'error');
      return;
    }
    u.coins -= skin.price;
    u.ownedSkins.push(skinId);
    u.skin = skinId;
    u.skinColor = skin.color;
    saveUsers(users);
    updateAvatarColor(skin.color);
    renderShop();
    refreshCoinDisplay();
    showToast(`🎉 "${skin.name}" sotib olindi va kiyildi!`);
  }
}

function updateAvatarColor(color) {
  document.querySelectorAll('.avatar, .big-avatar, .lb-avatar').forEach(el => {
    const u = getCurrentUser();
    if (el.dataset.isCurrentUser === 'true' || el.classList.contains('avatar')) {
      el.style.background = color;
    }
  });
}

// ── TOAST NOTIFICATION ──
function showToast(msg, type='success') {
  let toast = document.getElementById('gz-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'gz-toast';
    toast.style.cssText = `
      position:fixed; bottom:28px; left:50%; transform:translateX(-50%);
      background:#1e1e3a; border:1px solid rgba(255,255,255,.15);
      border-radius:12px; padding:12px 24px; font-size:15px;
      font-family:'Rajdhani',sans-serif; font-weight:600;
      color:#fff; z-index:9999; transition:all .3s;
      box-shadow:0 8px 32px rgba(0,0,0,.4);
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.borderColor = type==='error' ? 'rgba(239,68,68,.4)' : 'rgba(99,102,241,.4)';
  toast.style.opacity = '1';
  toast.style.display = 'block';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity='0'; setTimeout(()=>toast.style.display='none',300); }, 2800);
}
