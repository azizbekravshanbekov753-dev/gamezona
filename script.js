// ============================================================
//  TORT HOUSE — SCRIPT.JS (Zamonaviy Qandolatchilik Do'koni)
// ============================================================

// ===========================
//  CAKE DATA — Mazali va Yuqori Sifatli Tortlar
// ===========================
const CAKES = [
  {id:1,  name:"Spiderman Choco Dream",       price:175000, img:"https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=400&h=400&fit=crop", tags:["mashhur","bolalar"]},
  {id:2,  name:"Super Dadamga Qaymoqli",      price:180000, img:"https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop", tags:["mashhur","ota-ona"]},
  {id:3,  name:"Do'stlar Uchun Qulupnayli",   price:165000, img:"https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=400&fit=crop", tags:["mashhur","dostlar"]},
  {id:4,  name:"Red Velvet Love",              price:185000, img:"https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=400&h=400&fit=crop", tags:["mashhur","juft"]},
  {id:5,  name:"Pushti Malina Velvet",         price:170000, img:"https://images.unsplash.com/photo-1562777717-dc6984f65a63?w=400&h=400&fit=crop", tags:["pushti"]},
  {id:6,  name:"Marshmallow Princess",         price:175000, img:"https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=400&fit=crop", tags:["pushti"]},
  {id:7,  name:"Pushti Peoni Gullari",         price:190000, img:"https://images.unsplash.com/photo-1551404973-761c83cd8339?w=400&h=400&fit=crop", tags:["pushti"]},
  {id:8,  name:"Shokoladli Muhandis",          price:175000, img:"https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=400&h=400&fit=crop", tags:["kasblar"]},
  {id:9,  name:"Oltin HBD Royal",              price:185000, img:"https://images.unsplash.com/photo-1559620192-032c4bc4674e?w=400&h=400&fit=crop", tags:["kasblar"]},
  {id:10, name:"Doktor Sharafiga",             price:175000, img:"https://images.unsplash.com/photo-1587668178277-295251f900ce?w=400&h=400&fit=crop", tags:["kasblar"]},
  {id:11, name:"Mayin Pushti Ombre",           price:170000, img:"https://images.unsplash.com/photo-1562777717-dc6984f65a63?w=400&h=400&fit=crop", tags:["ombre"]},
  {id:12, name:"Moviy Dengiz Ombre",           price:175000, img:"https://images.unsplash.com/photo-1587668178277-295251f900ce?w=400&h=400&fit=crop", tags:["ombre"]},
  {id:13, name:"Pushti-Sariq Quyosh Ombre",    price:180000, img:"https://images.unsplash.com/photo-1615937657715-bc7b4b7962c8?w=400&h=400&fit=crop", tags:["ombre"]},
  {id:14, name:"Yovvoyi Mevalar Mix",          price:175000, img:"https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=400&fit=crop", tags:["mevalar"]},
  {id:15, name:"Yangilangan Qulupnayli Jannat",price:170000, img:"https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=400&fit=crop", tags:["mevalar"]},
  {id:16, name:"Limonli Sitrus Sufle",         price:165000, img:"https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop", tags:["mevalar"]},
  {id:17, name:"Kapalakli Sehr",               price:185000, img:"https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop", tags:["sanat"]},
  {id:18, name:"Oltin Marmar San'ati",         price:195000, img:"https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=400&h=400&fit=crop", tags:["sanat"]},
  {id:19, name:"Jonli Gullar Jilosi",          price:180000, img:"https://images.unsplash.com/photo-1551404973-761c83cd8339?w=400&h=400&fit=crop", tags:["sanat"]},
  {id:20, name:"Klassik San Sebastian",        price:180000, img:"https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=400&h=400&fit=crop", tags:["klassika"]},
  {id:21, name:"Karamelli Medovik Royal",      price:160000, img:"https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&h=400&fit=crop", tags:["klassika"]},
  {id:22, name:"Belgiya Trufel Shokoladi",     price:190000, img:"https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop", tags:["klassika"]},
  {id:23, name:"Avto Haydovchi Sharafiga",     price:175000, img:"https://images.unsplash.com/photo-1562777717-dc6984f65a63?w=400&h=400&fit=crop", tags:["haydash"]},
  {id:24, name:"Oltin Rul Karamel",            price:180000, img:"https://images.unsplash.com/photo-1587668178277-295251f900ce?w=400&h=400&fit=crop", tags:["haydash"]},
  {id:25, name:"Yangi Xonadon Fayzi",          price:170000, img:"https://images.unsplash.com/photo-1615937657715-bc7b4b7962c8?w=400&h=400&fit=crop", tags:["uy"]},
  {id:26, name:"Shirin Oila Davrasi",          price:175000, img:"https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=400&fit=crop", tags:["uy"]},
  {id:27, name:"Pistali Bahor Biskviti",       price:185000, img:"https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=400&fit=crop", tags:["dostlar"]},
  {id:28, name:"Yurakcha Romantikasi",         price:175000, img:"https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=400&h=400&fit=crop", tags:["juft"]},
  {id:29, name:"SpongeBob Sariq Biskvit",      price:170000, img:"https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop", tags:["bolalar"]},
  {id:30, name:"Donald Duck Bolalar Shodi",    price:170000, img:"https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=400&h=400&fit=crop", tags:["bolalar"]},
];

const EXTRAS = [
  {id:1, name:"Tug'ilgan kun qalpoqchasi", price:6000,  emoji:"🎩"},
  {id:2, name:"Yaltiroq sharli shamcha",  price:5000,  emoji:"🎈"},
  {id:3, name:"Qizil yurak shamchasi",    price:7000,  emoji:"❤️‍🔥"},
  {id:4, name:"Bengal favvora olovlar",   price:8000,  emoji:"✨"},
  {id:5, name:"Bayramona konfetti to'plami", price:4000, emoji:"🎊"},
];

const COLORS = [
  "#fde88a","#ffffff","#b3e5fc","#b2dfdb","#f8bbd0",
  "#ffe0b2","#d1c4e9","#4dd0e1","#66bb6a","#f48fb1",
  "#ff8a65","#80cbc4","#a5d6a7","#ef9a9a","#4a2810",
];

const TEXT_COLORS = ["#1a0e04","#c87e0a","#1a237e","#4a148c","#880e4f","#bf360c","#1b5e20","#ffffff"];

const TOPPINGS = {
  "Hammasi":    [
    {n:"Toppingsiz",e:"✖️",p:0},
    {n:"Qulupnaylar",e:"🍓",p:0},
    {n:"Shokolad",e:"🍫",p:10000},
    {n:"Spiderman",e:"🕷️",p:0},
    {n:"Super dada",e:"🦸",p:0},
    {n:"Ayroncha Stitch",e:"🧸",p:15000},
    {n:"Barbie Pushti",e:"👗",p:10000},
    {n:"Hello Kitty",e:"🐱",p:10000},
    {n:"Spongebob",e:"🧽",p:15000}
  ],
  "Ommabop":    [
    {n:"Toppingsiz",e:"✖️",p:0},
    {n:"Qulupnaylar",e:"🍓",p:0},
    {n:"Shokolad",e:"🍫",p:10000},
    {n:"Super dada",e:"🦸",p:0}
  ],
  "Mevali":     [
    {n:"Toppingsiz",e:"✖️",p:0},
    {n:"Qulupnaylar",e:"🍓",p:0},
    {n:"Yovvoyi rezavor",e:"🫐",p:15000}
  ],
  "Ona":        [
    {n:"Toppingsiz",e:"✖️",p:0},
    {n:"Gullar guldastasi",e:"💐",p:0},
    {n:"Nozik Sevgi",e:"💗",p:0}
  ],
  "Dada":       [
    {n:"Toppingsiz",e:"✖️",p:0},
    {n:"Super dada",e:"🦸",p:0},
    {n:"Eng zo'r ota kubogi",e:"🏆",p:0}
  ],
  "Pushti":     [
    {n:"Toppingsiz",e:"✖️",p:0},
    {n:"Barbie Pushti",e:"👗",p:0},
    {n:"Hello Kitty",e:"🐱",p:0}
  ],
  "Kasblar":    [
    {n:"Toppingsiz",e:"✖️",p:0},
    {n:"Muhandislik",e:"👷",p:0},
    {n:"Tibbiyot",e:"👨‍⚕️",p:0}
  ],
  "Ombre":      [
    {n:"Toppingsiz",e:"✖️",p:0},
    {n:"Mayin ko'k",e:"🩵",p:0},
    {n:"Mayin pushti",e:"🩷",p:0}
  ],
  "Multfilmlar":[
    {n:"Toppingsiz",e:"✖️",p:0},
    {n:"Spiderman",e:"🕷️",p:0},
    {n:"Ayroncha Stitch",e:"🧸",p:15000},
    {n:"Spongebob",e:"🧽",p:15000}
  ],
};

const KAT_CATS = ["Hammasi","Mashhur","Pushti","Kasblar","Ombre","Mevalar","San'at","Klassika","Haydash","Uy","Bolalar","Do'stlar","Ota-ona","Juft"];

const TAG_MAP = {
  "dostlar": "Do'stlar",
  "ota-ona": "Ota-ona",
  "juft": "Juft",
  "bolalar": "Bolalar",
  "kasblar": "Kasblar",
  "klassika": "Klassika",
  "pushti": "Pushti",
  "ombre": "Ombre",
  "mevalar": "Mevalar",
  "sanat": "San'at",
  "haydash": "Haydash",
  "uy": "Uy",
  "mashhur": "Mashhur"
};

// ===========================
//  STATE
// ===========================
let favs        = JSON.parse(localStorage.getItem("th_fav")    || "[]");
let cart        = JSON.parse(localStorage.getItem("th_cart")   || "[]");
let extras      = JSON.parse(localStorage.getItem("th_ext")    || "[]");
let user        = JSON.parse(localStorage.getItem("th_user")   || "null");
let orders      = JSON.parse(localStorage.getItem("th_orders") || "[]");
let promoUsed   = JSON.parse(localStorage.getItem("th_promo")  || "[]");
let savedAddrs  = JSON.parse(localStorage.getItem("th_addrs")  || '["Toshkent sh., Yunusobod 4-mavze, 12-uy","Toshkent sh., Chilonzor 9-kvartal, 5-uy"]');
let promoOn     = false;
let delivAddr   = savedAddrs[0] || "";
let activeCat   = "Hammasi";

const KS = {
  step: 1, basePrice: 225000, shapeName: "Klassik Aylana", shapeType: "round",
  tasteExtra: 0, cakeColor: "#fde88a",
  topExtra: 0, topName: "Toppingsiz", topEmoji: "",
  textExtra: 0, textColor: "#1a0e04", activeTCat: "Hammasi",
};

// ===========================
//  BOOT
// ===========================
window.addEventListener("load", () => {
  setTimeout(() => {
    const sp = document.getElementById("splash");
    if (sp) {
      sp.style.transition = "opacity .5s";
      sp.style.opacity = "0";
      setTimeout(() => {
        sp.style.display = "none";
        document.getElementById("app").style.display = "flex";
        boot();
      }, 500);
    } else {
      document.getElementById("app").style.display = "flex";
      boot();
    }
  }, 1200);
});

function boot() {
  renderAllLists();
  renderColorGrid();
  renderTextColorRow();
  renderToppings("Hammasi");
  renderExtras();
  renderKatalog("Hammasi");
  buildKatFilters();
  startTimer();
  refreshBadge();
  if (user) showUserProfile();
  if (delivAddr) {
    const el = document.getElementById("addr-txt");
    if (el) el.textContent = delivAddr;
  }
  setTimeout(() => {
    if (typeof initCake3D === 'function') {
      initCake3D();
    }
  }, 100);
}

// ===========================
//  TIMER
// ===========================
function startTimer() {
  function tick() {
    const now = new Date(), end = new Date();
    end.setHours(23,59,59,0);
    const d = end - now;
    const cd = document.getElementById("countdown");
    if (!cd) return;
    if (d <= 0) { cd.textContent = "00:00:00"; return; }
    const p = n => String(n).padStart(2,"0");
    cd.textContent = `${p(Math.floor(d/3600000))}:${p(Math.floor((d%3600000)/60000))}:${p(Math.floor((d%60000)/1000))}`;
  }
  tick(); setInterval(tick, 1000);
}

// ===========================
//  NAV
// ===========================
function goTo(name) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("on"));
  document.querySelectorAll(".nb").forEach(b => b.classList.remove("active"));
  const pg = document.getElementById("page-" + name);
  if (pg) pg.classList.add("on");
  const nb = document.getElementById("nb-" + name);
  if (nb) nb.classList.add("active");
  const pagesContainer = document.querySelector(".pages");
  if (pagesContainer) pagesContainer.scrollTop = 0;

  if (name === "sevimlilar")       renderFavGrid();
  if (name === "savat")            renderSavat();
  if (name === "profil")           renderProfile();
  if (name === "konstruktor")      resetK();
  if (name === "katalog")          renderKatalog();
  if (name === "rasmiylashtirish") updateRasmiTotal();
}

// ===========================
//  PRODUCT CARD HTML
// ===========================
function pCard(c) {
  const liked = favs.includes(c.id);
  return `<div class="pcard" onclick="openCakeModal(${c.id})">
    <div class="pcard-fig">
      <div class="cake-circle">
        <img src="${c.img}" alt="${c.name}" loading="lazy"
          onerror="this.style.display='none';this.parentElement.innerHTML='<span style=font-size:2.5rem>🎂</span>'"/>
      </div>
      <button class="pcard-heart" onclick="toggleFav(event,${c.id})">${liked ? "❤️" : "🤍"}</button>
    </div>
    <div class="pcard-info">
      <div class="pcard-name">${c.name}</div>
      <div class="pcard-price">${f(c.price)} UZS</div>
    </div>
  </div>`;
}

function f(n) { return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "); }

function renderAllLists() {
  const map = {
    "list-mashhur":"mashhur","list-pushti":"pushti","list-kasblar":"kasblar",
    "list-ombre":"ombre","list-mevalar":"mevalar","list-sanat":"sanat",
    "list-klassika":"klassika","list-haydash":"haydash","list-uy":"uy",
  };
  for (const [id, tag] of Object.entries(map)) {
    const el = document.getElementById(id);
    if (!el) continue;
    el.innerHTML = CAKES.filter(c => c.tags.includes(tag)).map(pCard).join("");
  }
}

// ===========================
//  FAVORITES
// ===========================
function toggleFav(e, id) {
  if (e && e.stopPropagation) e.stopPropagation();
  if (favs.includes(id)) {
    favs = favs.filter(x => x !== id);
    showToast("Sevimlilardan o'chirildi");
  } else {
    favs.push(id);
    showToast("Sevimlilarga qo'shildi ❤️");
  }
  localStorage.setItem("th_fav", JSON.stringify(favs));
  renderAllLists();
  renderFavGrid();
  renderKatalog();
}

function renderFavGrid() {
  const grid = document.getElementById("fav-grid");
  const empty = document.getElementById("fav-empty");
  if (!grid || !empty) return;
  const list = CAKES.filter(c => favs.includes(c.id));
  if (!list.length) { empty.style.display = "flex"; grid.innerHTML = ""; return; }
  empty.style.display = "none";
  grid.innerHTML = list.map(c => `
    <div class="gcard" onclick="openCakeModal(${c.id})">
      <div class="gcard-fig">
        <div class="cake-circle">
          <img src="${c.img}" alt="${c.name}" loading="lazy" onerror="this.style.display='none'"/>
        </div>
        <button class="gheart" onclick="toggleFav(event,${c.id})">❤️</button>
      </div>
      <div class="gcard-info">
        <div class="gcard-name">${c.name}</div>
        <div class="gcard-price">${f(c.price)} UZS</div>
      </div>
    </div>`).join("");
}

// ===========================
//  KATALOG
// ===========================
function buildKatFilters() {
  const el = document.getElementById("kat-filters");
  if (!el) return;
  el.innerHTML = KAT_CATS.map(c =>
    `<button class="fchip ${c.toLowerCase() === activeCat.toLowerCase() ? "on" : ""}" onclick="renderKatalog('${c}')">${c}</button>`
  ).join("");
}

function renderKatalog(cat) {
  if (cat) activeCat = cat;
  buildKatFilters();
  const searchTag = activeCat.toLowerCase().replace(/['`’]/g, '');
  const list = activeCat === "Hammasi" ? CAKES :
    CAKES.filter(c => c.tags.some(t => {
      const normT = t.toLowerCase().replace(/['`’]/g, '');
      return normT === searchTag || t.toLowerCase() === activeCat.toLowerCase();
    }));

  const grid = document.getElementById("kat-grid");
  if (!grid) return;
  grid.innerHTML = list.map(c => `
    <div class="gcard" onclick="openCakeModal(${c.id})">
      <div class="gcard-fig">
        <div class="cake-circle">
          <img src="${c.img}" alt="${c.name}" loading="lazy" onerror="this.style.display='none'"/>
        </div>
        <button class="gheart" onclick="toggleFav(event,${c.id})">${favs.includes(c.id) ? "❤️" : "🤍"}</button>
      </div>
      <div class="gcard-info">
        <div class="gcard-name">${c.name}</div>
        <div class="gcard-price">${f(c.price)} UZS</div>
      </div>
    </div>`).join("");
}

function goKat(tag) {
  const targetCategory = TAG_MAP[tag] || (tag.charAt(0).toUpperCase() + tag.slice(1));
  goTo("katalog");
  setTimeout(() => renderKatalog(targetCategory), 60);
}

// ===========================
//  CAKE DETAIL MODAL
// ===========================
function openCakeModal(id) {
  const c = CAKES.find(x => x.id === id);
  if (!c) return;
  document.getElementById("cake-mod").innerHTML = `
    <div class="cm-fig" style="background:#faf5ee;display:flex;align-items:center;justify-content:center;padding:18px;border-radius:16px;margin-bottom:14px">
      <div style="width:180px;height:180px;border-radius:50%;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,.14)">
        <img src="${c.img}" alt="${c.name}" style="width:100%;height:100%;object-fit:cover"/>
      </div>
    </div>
    <div class="cm-name">${c.name}</div>
    <div class="cm-price">${f(c.price)} UZS</div>
    <div class="cm-desc">Professional qandolatchilarimiz tomonidan tabiiy va sarxil ingredientlardan tayyorlangan premium tort. 3 soat ichida yetkazib beriladi.</div>
    <div class="cm-acts">
      <button class="fav-btn" id="cm-fav" onclick="cmFav(${id})">${favs.includes(id) ? "❤️" : "🤍"}</button>
      <button class="btn-amber-full" onclick="addCakeCart(${id})">Savatga qo'shish</button>
    </div>`;
  openMod("cake-ov");
}

function cmFav(id) {
  toggleFav(null, id);
  const b = document.getElementById("cm-fav");
  if (b) b.textContent = favs.includes(id) ? "❤️" : "🤍";
}

function addCakeCart(id) {
  const c = CAKES.find(x => x.id === id);
  if (!c) return;
  const ex = cart.find(i => i.id === id && i.type === "cat");
  if (ex) ex.qty++;
  else cart.push({ id, type: "cat", name: c.name, price: c.price, img: c.img, qty: 1 });
  saveCart();
  refreshBadge();
  closeMod("cake-ov");
  showToast("Savatga qo'shildi 🛒");
}

// ===========================
//  KONSTRUKTOR (3D)
// ===========================
function resetK() {
  Object.assign(KS, {
    step: 1, basePrice: 225000, shapeName: "Klassik Aylana", shapeType: "round",
    tasteExtra: 0, cakeColor: "#fde88a", topExtra: 0, topName: "Toppingsiz", topEmoji: "",
    textExtra: 0, textColor: "#1a0e04", activeTCat: "Hammasi"
  });
  const ta = document.getElementById("cake-text"); if (ta) ta.value = "";
  const cc = document.getElementById("cc"); if (cc) cc.textContent = "0/30";
  const up = document.getElementById("up-preview"); if (up) up.innerHTML = "";

  document.querySelectorAll(".shape-card").forEach((c, i) => c.classList.toggle("active-card", i === 0));
  document.querySelectorAll(".taste-card").forEach((c, i) => c.classList.toggle("active-card", i === 0));

  renderColorGrid();
  renderTextColorRow();
  renderToppings("Hammasi");
  kStep(1);
  updateKPrice();

  // 3D Three.js modelni ishga tushirish
  setTimeout(() => {
    if (typeof initCake3D === 'function') {
      C3D.color = 0xfde88a;
      C3D.shapeType = 'round';
      C3D.topEmoji = '';
      C3D.candles = 0;
      C3D.rotating = true;
      initCake3D();
    }
    applyPreview();
  }, 60);
}

function kStep(n) {
  document.querySelectorAll(".kstep").forEach(s => s.classList.remove("active"));
  const el = document.getElementById("kstep-" + n);
  if (el) el.classList.add("active");

  document.querySelectorAll(".sdot").forEach((d, i) => {
    d.classList.remove("active", "done");
    if (i + 1 < n) d.classList.add("done");
    if (i + 1 === n) d.classList.add("active");
  });
  KS.step = n;
  const back = document.getElementById("k-back");
  if (back) back.classList.toggle("hide", n === 1);
  const next = document.getElementById("k-next");
  if (next) next.textContent = n === 5 ? "Savatga qo'shish" : "Keyingi";
}

function kNext() { if (KS.step < 5) kStep(KS.step + 1); else addKCart(); }
function kPrev() { if (KS.step > 1) kStep(KS.step - 1); }

function kTabSwitch(btn, which) {
  document.querySelectorAll(".tsw").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("shapes-round").style.display = which === "round" ? "grid" : "none";
  document.getElementById("shapes-other").style.display = which === "other" ? "grid" : "none";
}

function pickShape(el, price, name, type) {
  document.querySelectorAll(".shape-card").forEach(c => c.classList.remove("active-card"));
  el.classList.add("active-card");
  KS.basePrice = price;
  KS.shapeName = name;
  KS.shapeType = type;
  updateKPrice();
  applyPreview();
}

function pickTaste(el, extra, name, color) {
  document.querySelectorAll(".taste-card, .taste-card-new").forEach(c => c.classList.remove("active-card"));
  el.classList.add("active-card");
  KS.tasteExtra = extra;
  updateKPrice();
  applyPreview();
}

function renderColorGrid() {
  const el = document.getElementById("color-grid");
  if (!el) return;
  el.innerHTML = COLORS.map((c, i) =>
    `<div class="cdot ${i === 0 ? "on" : ""}" style="background:${c}${c === "#ffffff" ? ";border:2px solid #e0d0b0" : ""}" onclick="pickColor(this,'${c}')"></div>`
  ).join("");
  KS.cakeColor = COLORS[0];
}

function pickColor(el, color) {
  document.querySelectorAll(".cdot").forEach(d => d.classList.remove("on"));
  el.classList.add("on");
  KS.cakeColor = color;
  applyPreview();
}

function renderToppings(cat) {
  KS.activeTCat = cat;
  const fc = document.getElementById("top-cats");
  if (fc) {
    fc.innerHTML = Object.keys(TOPPINGS).map(c =>
      `<button class="tcat-btn ${c === cat ? "on" : ""}" onclick="renderToppings('${c}')">${c}</button>`
    ).join("");
  }
  const grid = document.getElementById("top-grid");
  if (!grid) return;
  grid.innerHTML = (TOPPINGS[cat] || []).map(t =>
    `<div class="top-card ${KS.topName === t.n ? "on" : ""}" onclick="pickTopping(this,'${t.n}','${t.e}',${t.p})">
      <div class="top-ico">${t.e}</div>
      <p>${t.n}</p>
      <small>${t.p > 0 ? "+" + f(t.p) + " UZS" : "0 UZS"}</small>
    </div>`
  ).join("");
}

function pickTopping(el, name, emoji, price) {
  document.querySelectorAll(".top-card").forEach(c => c.classList.remove("on"));
  el.classList.add("on");
  KS.topName = name;
  KS.topEmoji = (emoji === "✖️" ? "" : emoji);
  KS.topExtra = price;
  updateKPrice();
  applyPreview();
}

function renderTextColorRow() {
  const el = document.getElementById("tclr-row");
  if (!el) return;
  el.innerHTML = TEXT_COLORS.map((c, i) =>
    `<div class="tclr-dot ${i === 0 ? "on" : ""}" style="background:${c}${c === "#ffffff" ? ";border:2px solid #e0d0b0" : ""}" onclick="pickTextClr(this,'${c}')"></div>`
  ).join("");
}

function pickTextClr(el, color) {
  document.querySelectorAll(".tclr-dot").forEach(d => d.classList.remove("on"));
  el.classList.add("on");
  KS.textColor = color;
}

function updateCC() {
  const v = document.getElementById("cake-text").value;
  document.getElementById("cc").textContent = v.length + "/30";
}

function handleUpload(input) {
  const f2 = input.files[0];
  if (!f2) return;
  const r = new FileReader();
  r.onload = e => {
    document.getElementById("up-preview").innerHTML = `<img src="${e.target.result}" style="width:100%;border-radius:10px;margin-top:9px;max-height:130px;object-fit:cover"/>`;
    KS.textExtra = 15000;
    updateKPrice();
    showToast("Rasm yuklandi (+15 000 UZS)");
  };
  r.readAsDataURL(f2);
}

function updateKPrice() {
  const total = KS.basePrice + (KS.tasteExtra || 0) + KS.topExtra + KS.textExtra;
  const pEl = document.getElementById("k-price");
  if (pEl) pEl.textContent = f(total);
}

function applyPreview() {
  if (typeof updateCake3DColor === 'function') {
    updateCake3DColor(KS.cakeColor);
    updateCake3DShape(KS.shapeType);
    updateCake3DTopping(KS.topEmoji || '');
  }
  const shapeLbl = document.getElementById("k3d-shape-lbl");
  const topLbl   = document.getElementById("k3d-top-lbl");
  if (shapeLbl) shapeLbl.textContent = KS.shapeName;
  if (topLbl)   topLbl.textContent   = KS.topName !== "Toppingsiz" ? "· " + KS.topName : "";
}

function addKCart() {
  const total = KS.basePrice + (KS.tasteExtra || 0) + KS.topExtra + KS.textExtra;
  const text = document.getElementById("cake-text")?.value || "";
  cart.push({
    id: Date.now(),
    type: "custom",
    name: "Maxsus " + KS.shapeName,
    price: total,
    img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=300&fit=crop",
    qty: 1,
    details: { shape: KS.shapeName, color: KS.cakeColor, topping: KS.topName, text }
  });
  saveCart();
  refreshBadge();
  showToast("Maxsus tort savatga qo'shildi 🎂");
  goTo("savat");
}

// ===========================
//  SAVAT
// ===========================
function renderSavat() {
  const empty = document.getElementById("savat-empty");
  const body = document.getElementById("savat-body");
  if (!cart.length) {
    if (empty) empty.style.display = "flex";
    if (body) body.style.display = "none";
    return;
  }
  if (empty) empty.style.display = "none";
  if (body) body.style.display = "block";

  document.getElementById("savat-list").innerHTML = cart.map(it => `
    <div class="sitem">
      <div class="sitem-fig">
        <img src="${it.img || ''}" alt="${it.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" style="width:100%;height:100%;object-fit:cover;border-radius:12px"/>
        <div class="sitem-fallback" style="display:none;align-items:center;justify-content:center;font-size:2rem;width:100%;height:100%">🎂</div>
      </div>
      <div class="sitem-info">
        <div class="sitem-name">${it.name}</div>
        <div class="sitem-price">${f(it.price * it.qty)} UZS</div>
        ${it.type === "custom" ? `<span class="sitem-tag">3D Konstruktor</span>` : ""}
      </div>
      <div class="qty-ctrl">
        <button class="qbtn" onclick="chQty(${it.id},-1)">−</button>
        <span class="qnum">${it.qty}</span>
        <button class="qbtn" onclick="chQty(${it.id},1)">+</button>
      </div>
    </div>`).join("");

  updateSavatTotal();
}

function chQty(id, d) {
  const it = cart.find(i => i.id === id);
  if (!it) return;
  it.qty += d;
  if (it.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart();
  refreshBadge();
  renderSavat();
}

function updateSavatTotal() {
  let t = cart.reduce((s, i) => s + i.price * i.qty, 0) + extras.reduce((s, e) => s + e.price * e.qty, 0);
  const el = document.getElementById("savat-total");
  if (el) el.textContent = f(t) + " UZS";
}

function renderExtras() {
  const el = document.getElementById("extras-row");
  if (!el) return;
  el.innerHTML = EXTRAS.map(e => `
    <div class="ecard" onclick="openExtraModal(${e.id})">
      <div class="ecard-ico">${e.emoji}</div>
      <div class="ecard-name">${e.name}</div>
      <div class="ecard-price">${f(e.price)} UZS dan</div>
    </div>`).join("");
}

function openExtraModal(id) {
  const e = EXTRAS.find(x => x.id === id);
  if (!e) return;
  const inC = extras.find(x => x.id === id);
  const qty = inC ? inC.qty : 1;
  document.getElementById("extra-mod").innerHTML = `
    <div class="em-fig">${e.emoji}</div>
    <div class="em-name">${e.name}</div>
    <div class="em-sub">Bayramona bezak va qo'shimcha</div>
    <div class="em-price">${f(e.price)} UZS</div>
    <div class="em-qty">
      <button class="qbtn" onclick="emQCh(${id},-1,${e.price})">−</button>
      <span class="qnum" id="em-q">${qty}</span>
      <button class="qbtn" onclick="emQCh(${id},1,${e.price})">+</button>
    </div>
    <div style="font-size:.82rem;color:#5a2e08;margin-bottom:14px">Jami: <b id="em-tot">${f(e.price * qty)} UZS</b></div>
    <button class="btn-amber-full" onclick="addExtra(${id})">Savatga qo'shish</button>`;
  openMod("extra-ov");
}

function emQCh(id, d, price) {
  const el = document.getElementById("em-q");
  if (!el) return;
  let q = Math.max(1, parseInt(el.textContent) + d);
  el.textContent = q;
  document.getElementById("em-tot").textContent = f(price * q) + " UZS";
}

function addExtra(id) {
  const e = EXTRAS.find(x => x.id === id);
  const qty = parseInt(document.getElementById("em-q").textContent);
  const ex = extras.find(x => x.id === id);
  if (ex) ex.qty = qty;
  else extras.push({ ...e, qty });
  localStorage.setItem("th_ext", JSON.stringify(extras));
  closeMod("extra-ov");
  renderSavat();
  showToast("Qo'shimcha qo'shildi ✨");
}

function saveCart() { localStorage.setItem("th_cart", JSON.stringify(cart)); }

function refreshBadge() {
  const n = cart.reduce((s, i) => s + i.qty, 0);
  const b = document.getElementById("cbadge");
  if (b) {
    b.style.display = n > 0 ? "flex" : "none";
    b.textContent = n;
  }
}

// ===========================
//  RASMIYLASHTIRISH
// ===========================
function pickTime(t) {
  document.getElementById("ropt1").classList.toggle("active", t === "tez");
  document.getElementById("ropt2").classList.toggle("active", t === "belgi");
  document.getElementById("dt-pick").style.display = t === "belgi" ? "block" : "none";
}

function applyPromo() {
  const val = document.getElementById("promo-inp").value.trim().toUpperCase();
  const msg = document.getElementById("promo-msg");
  if (val !== "TORTHOUSE") {
    msg.className = "err";
    msg.textContent = "❌ Noto'g'ri promokod. (Masalan: TORTHOUSE)";
    return;
  }
  if (promoOn) {
    msg.className = "err";
    msg.textContent = "❌ Promokod allaqachon qo'llangan";
    return;
  }
  if (!user) {
    msg.className = "err";
    msg.textContent = "⚠️ Promokoddan foydalanish uchun hisobingizga kiring";
    openLoginModal();
    return;
  }
  if (promoUsed.includes(user.phone)) {
    msg.className = "err";
    msg.textContent = "❌ Siz bu promokodni allaqachon ishlatgansiz";
    return;
  }
  promoOn = true;
  msg.className = "ok";
  msg.textContent = "✅ Promokod qo'llandi! −30 000 UZS chegirma";
  updateRasmiTotal();
  showToast("TORTHOUSE promokodi faollashdi 🎉");
}

function updateRasmiTotal() {
  let t = cart.reduce((s, i) => s + i.price * i.qty, 0) + extras.reduce((s, e) => s + e.price * e.qty, 0);
  if (promoOn) t = Math.max(0, t - 30000);
  const el = document.getElementById("rasmi-total");
  if (el) el.textContent = f(t) + " UZS";
  return t;
}

// ===========================
//  MANZILLARNI BOSHQARISH
// ===========================
function openAddrModal() {
  renderSavedAddrs();
  openMod("addr-ov");
}

function renderSavedAddrs() {
  const box = document.getElementById("saved-addrs");
  if (!box) return;
  if (!savedAddrs.length) {
    box.innerHTML = `<p class="no-item">Saqlangan manzillar mavjud emas</p>`;
    return;
  }
  box.innerHTML = savedAddrs.map((a, i) => `
    <div class="addr-item ${a === delivAddr ? 'active' : ''}" onclick="selectAddr('${a.replace(/'/g, "\\'")}')" style="display:flex;align-items:center;justify-content:space-between;padding:12px;margin-bottom:8px;border:1.5px solid ${a===delivAddr?'#c87e0a':'#e0d0b0'};border-radius:12px;background:${a===delivAddr?'#fdf4e4':'#fff'};cursor:pointer">
      <div style="display:flex;align-items:center;gap:8px;font-size:.85rem;color:#1a0e04">
        <i class="fa fa-location-dot" style="color:#c87e0a"></i>
        <span>${a}</span>
      </div>
      ${a === delivAddr ? '<i class="fa fa-check" style="color:#c87e0a"></i>' : ''}
    </div>
  `).join("");
}

function selectAddr(addr) {
  delivAddr = addr;
  const txt = document.getElementById("addr-txt");
  if (txt) txt.textContent = delivAddr;
  closeMod("addr-ov");
  showToast("Manzil tanlandi 📍");
}

function addNewAddr() {
  const a = prompt("Yangi yetkazib berish manzilini kiriting (Masalan: Toshkent sh., Chilonzor 7, 14-uy):");
  if (!a || !a.trim()) return;
  const newAddr = a.trim();
  if (!savedAddrs.includes(newAddr)) {
    savedAddrs.unshift(newAddr);
    localStorage.setItem("th_addrs", JSON.stringify(savedAddrs));
  }
  selectAddr(newAddr);
}

function goPayment() {
  const name = document.getElementById("ord-name")?.value.trim();
  if (!name) { showToast("Iltimos, ismingizni kiriting"); return; }
  if (!delivAddr) { showToast("Yetkazib berish manzilini tanlang"); return; }
  if (!cart.length) { showToast("Savat bo'sh"); return; }

  const total = updateRasmiTotal();
  document.getElementById("t-amount").textContent = f(total) + " UZS";
  document.getElementById("t-meta").textContent = cart.reduce((s, i) => s + i.qty, 0) + " ta mahsulot";
  document.getElementById("t-addr").textContent = delivAddr;
  goTo("tolov");
}

function confirmOrder() {
  const total = updateRasmiTotal();
  const oid = "#TH" + Math.floor(100000 + Math.random() * 900000);
  const newOrder = {
    id: oid,
    date: new Date().toLocaleDateString("uz-UZ", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    status: "faol",
    statusText: "Konditer tasdig'i kutilmoqda",
    address: delivAddr,
    total,
    items: [...cart]
  };

  orders.unshift(newOrder);
  localStorage.setItem("th_orders", JSON.stringify(orders));

  if (promoOn && user && !promoUsed.includes(user.phone)) {
    promoUsed.push(user.phone);
    localStorage.setItem("th_promo", JSON.stringify(promoUsed));
  }

  cart = [];
  extras = [];
  promoOn = false;
  localStorage.setItem("th_cart", "[]");
  localStorage.setItem("th_ext", "[]");
  refreshBadge();

  showToast("Buyurtmangiz muvaffaqiyatli qabul qilindi 🎉");
  setTimeout(() => goTo("profil"), 1200);
}

// ===========================
//  PROFIL & BUYURTMALAR
// ===========================
function renderProfile() {
  if (!user) {
    document.getElementById("profil-guest").style.display = "block";
    document.getElementById("profil-user").style.display = "none";
  } else {
    showUserProfile();
  }
}

function showUserProfile() {
  document.getElementById("profil-guest").style.display = "none";
  document.getElementById("profil-user").style.display = "block";
  document.getElementById("p-name").textContent = user.name || "Foydalanuvchi";
  document.getElementById("p-phone").textContent = "+998 " + user.phone;
  showOrders("faol", document.querySelector(".otab"));
}

function showOrders(type, btn) {
  document.querySelectorAll(".otab").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  let list = orders;
  if (type === "faol") list = orders.filter(o => o.status === "faol");
  if (type === "tarix") list = orders.filter(o => o.status !== "faol");
  const el = document.getElementById("orders-list");
  if (!list.length) {
    el.innerHTML = `<div class="no-orders">📦 Hozircha buyurtmalar yo'q</div>`;
    return;
  }
  el.innerHTML = list.map(o => `
    <div class="ocard">
      <div class="ocard-top">
        <span class="onum">BUYURTMA ${o.id}</span>
        <span class="odate">${o.date}</span>
      </div>
      <div class="ostatus">${o.statusText}</div>
      <div class="oprog">
        <div class="opd done"><i class="fa fa-check" style="font-size:.5rem"></i></div><div class="opl done"></div>
        <div class="opd act"><i class="fa fa-clock" style="font-size:.5rem"></i></div><div class="opl"></div>
        <div class="opd"><i class="fa fa-box" style="font-size:.5rem"></i></div><div class="opl"></div>
        <div class="opd"><i class="fa fa-truck" style="font-size:.5rem"></i></div><div class="opl"></div>
        <div class="opd"><i class="fa fa-star" style="font-size:.5rem"></i></div>
      </div>
      <div class="ocard-btm">
        <div class="oaddr"><i class="fa fa-location-dot"></i> ${o.address}</div>
        <span class="odetail" onclick="viewOrderDetail('${o.id}')">Batafsil ›</span>
      </div>
      <div class="ototal">${f(o.total)} UZS</div>
    </div>`).join("");
}

function viewOrderDetail(orderId) {
  const o = orders.find(x => x.id === orderId);
  if (!o) return;
  const itemsHtml = o.items.map(it => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f0e4d0;font-size:.82rem">
      <div>
        <strong>${it.name}</strong> × ${it.qty}
        ${it.details ? `<div style="font-size:.72rem;color:#8a5a20">${it.details.shape || ''}, ${it.details.topping || ''}</div>` : ''}
      </div>
      <div style="color:#c87e0a;font-weight:700">${f(it.price * it.qty)} UZS</div>
    </div>
  `).join("");

  document.getElementById("cake-mod").innerHTML = `
    <h3 class="mod-title">Buyurtma ${o.id}</h3>
    <p class="mod-sub">Sana: ${o.date} | Holat: <b style="color:#c87e0a">${o.statusText}</b></p>
    <div style="margin-bottom:14px">
      <div style="font-size:.8rem;color:#8a5a20;margin-bottom:6px">Yetkazish manzili: <b>${o.address}</b></div>
      <div style="background:#faf5ee;border-radius:12px;padding:10px">${itemsHtml}</div>
      <div style="display:flex;justify-content:space-between;margin-top:12px;font-size:1rem;font-weight:700">
        <span>Jami to'lov:</span>
        <span style="color:#c87e0a">${f(o.total)} UZS</span>
      </div>
    </div>
    <button class="btn-amber-full" onclick="closeMod('cake-ov')">Tushunarli</button>
  `;
  openMod("cake-ov");
}

function doLogout() {
  user = null;
  localStorage.removeItem("th_user");
  promoOn = false;
  renderProfile();
  showToast("Tizimdan chiqildi");
}

// ===========================
//  LOGIN & SMS
// ===========================
function openLoginModal() { openMod("login-ov"); }

function sendCode() {
  const p = document.getElementById("ph-inp").value.trim();
  if (p.length < 9) { showToast("To'liq 9 xonali raqam kiriting"); return; }
  document.getElementById("ls1").style.display = "none";
  document.getElementById("ls2").style.display = "block";
  const firstBox = document.querySelector(".sbox");
  if (firstBox) firstBox.focus();
  showToast("SMS tasdiqlash kodi: 123456 (demo)");
}

function smsNext(el, i) {
  if (el.value.length === 1) {
    const boxes = document.querySelectorAll(".sbox");
    if (i < boxes.length - 1) boxes[i + 1].focus();
  }
}

function smsKeyDown(e, i) {
  if (e.key === "Backspace") {
    const boxes = document.querySelectorAll(".sbox");
    if (!boxes[i].value && i > 0) {
      boxes[i - 1].focus();
    }
  }
}

function verifyCode() {
  const code = Array.from(document.querySelectorAll(".sbox")).map(b => b.value).join("");
  if (code === "123456" || code.length === 6) {
    const phone = document.getElementById("ph-inp").value;
    user = { phone, name: "Aziz Mehmon" };
    localStorage.setItem("th_user", JSON.stringify(user));
    promoUsed = JSON.parse(localStorage.getItem("th_promo") || "[]");
    closeMod("login-ov");
    showUserProfile();
    showToast("Muvaffaqiyatli kirdingiz ✅");
  } else {
    showToast("Noto'g'ri kod. Demo kod: 123456");
  }
}

function backPhone() {
  document.getElementById("ls1").style.display = "block";
  document.getElementById("ls2").style.display = "none";
  document.querySelectorAll(".sbox").forEach(b => b.value = "");
}

// ===========================
//  SHAHAR VA TIL TOGGLE
// ===========================
function changeCity() {
  const cities = ["Toshkent", "Samarqand", "Buxoro", "Andijon", "Farg'ona", "Namangan"];
  const current = document.querySelector(".city-btn span")?.textContent || "Toshkent";
  const next = cities[(cities.indexOf(current) + 1) % cities.length];
  const btn = document.querySelector(".city-btn");
  if (btn) btn.innerHTML = `<i class="fa fa-location-dot"></i> <span>${next}</span>`;
  showToast(`Shahar tanlandi: ${next} 📍`);
}

function toggleLang() {
  showToast("Hozircha faqat O'zbek tili (UZ) mavjud 🇺🇿");
}

// ===========================
//  MODAL VA TOAST
// ===========================
function openMod(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add("open");
}

function closeMod(id, e) {
  if (e && e.target !== document.getElementById(id)) return;
  const m = document.getElementById(id);
  if (m) m.classList.remove("open");
}

function showToast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove("show"), 2600);
}

