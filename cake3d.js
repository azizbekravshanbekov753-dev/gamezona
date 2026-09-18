/* =============================================================
   CAKE 3D — Canvas 2D bilan chiroyli izometrik 3D tort
   ============================================================= */

let cakeCanvas, cakeCtx, cakeAnim;
let cakeAngle = 0;

// Tort holati
const CK = {
  color:   '#f5c842',
  layers:  3,
  topEmoji: '',
  rotating: true,
};

function initCake3D() {
  cakeCanvas = document.getElementById('k-canvas');
  if (!cakeCanvas) return;

  const box = cakeCanvas.parentElement;
  cakeCanvas.width  = box.clientWidth  || 310;
  cakeCanvas.height = 200;
  cakeCtx = cakeCanvas.getContext('2d');

  if (cakeAnim) cancelAnimationFrame(cakeAnim);
  cakeAngle = 0;
  loopCake();
}

function loopCake() {
  drawCake3D(cakeAngle);
  if (CK.rotating) cakeAngle += 0.012;
  cakeAnim = requestAnimationFrame(loopCake);
}

// ── Ana chizish funksiyasi ──────────────────────────────────
function drawCake3D(angle) {
  const W = cakeCanvas.width;
  const H = cakeCanvas.height;
  cakeCtx.clearRect(0, 0, W, H);

  // Fon gradient
  const bg = cakeCtx.createRadialGradient(W/2, H/2, 10, W/2, H/2, W*0.7);
  bg.addColorStop(0, '#2d1b69');
  bg.addColorStop(1, '#0d0820');
  cakeCtx.fillStyle = bg;
  cakeCtx.fillRect(0, 0, W, H);

  // Yerga soya doira
  drawShadow(W/2, H - 22, 80, angle);

  // Qatlamlar (pastdan yuqoriga)
  const layerData = getLayerData();
  const cx = W / 2;
  let baseY = H - 20;

  // Taglik plita
  drawPlate(cx, baseY, layerData[0].rx * 1.35, angle);
  baseY -= 8;

  // Har bir qatlam
  layerData.forEach((layer, i) => {
    drawLayer(cx, baseY, layer.rx, layer.ry, layer.h, layer.color, layer.dark, layer.light, angle, i);
    baseY -= layer.h;
    // Krem
    if (i < layerData.length - 1) {
      drawCreamEdge(cx, baseY, layer.rx * 0.92, layer.ry * 0.92, angle);
    }
  });

  // Tepada bezak
  const top = layerData[layerData.length - 1];
  drawTopping(cx, baseY, top.rx, top.ry, angle);

  // Shamlar
  drawCandles(cx, baseY, top.rx, top.ry, angle);
}

// ── Qatlam ma'lumotlari ─────────────────────────────────────
function getLayerData() {
  const c = CK.color;
  const dark  = blendColor(c, '#000000', 0.35);
  const light = blendColor(c, '#ffffff', 0.45);
  const mid   = blendColor(c, '#ffffff', 0.15);

  if (CK.layers === 1) return [
    { rx:78, ry:22, h:52, color:c, dark, light },
  ];
  if (CK.layers === 2) return [
    { rx:78, ry:22, h:44, color:c, dark, light },
    { rx:52, ry:16, h:36, color:mid, dark:blendColor(mid,'#000',0.35), light:blendColor(mid,'#fff',0.45) },
  ];
  // 3 qatlam (default)
  return [
    { rx:78, ry:22, h:40, color:c, dark, light },
    { rx:56, ry:16, h:34, color:mid, dark:blendColor(mid,'#000',0.35), light:blendColor(mid,'#fff',0.45) },
    { rx:36, ry:12, h:28, color:light, dark:blendColor(light,'#000',0.3), light:blendColor(light,'#fff',0.4) },
  ];
}

// ── Ellips yordamchi ────────────────────────────────────────
function ellipsePath(ctx, cx, cy, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
}

// ── Taglik ──────────────────────────────────────────────────
function drawPlate(cx, y, rx, angle) {
  const ry = rx * 0.28;
  // Soya
  const sg = cakeCtx.createRadialGradient(cx, y, 0, cx, y, rx * 1.1);
  sg.addColorStop(0, 'rgba(0,0,0,0.35)');
  sg.addColorStop(1, 'rgba(0,0,0,0)');
  ellipsePath(cakeCtx, cx, y + 4, rx * 1.1, ry * 1.1);
  cakeCtx.fillStyle = sg;
  cakeCtx.fill();

  // Plita yuza
  ellipsePath(cakeCtx, cx, y, rx, ry);
  const pg = cakeCtx.createLinearGradient(cx - rx, y, cx + rx, y);
  pg.addColorStop(0, '#d4c090');
  pg.addColorStop(0.35, '#f5e8c0');
  pg.addColorStop(0.65, '#e8d4a0');
  pg.addColorStop(1, '#b8a060');
  cakeCtx.fillStyle = pg;
  cakeCtx.fill();

  // Chet chizig'i
  cakeCtx.strokeStyle = '#c0a860';
  cakeCtx.lineWidth = 1.5;
  cakeCtx.stroke();
}

// ── Asosiy tort qatlami ─────────────────────────────────────
function drawLayer(cx, baseY, rx, ry, h, color, dark, light, angle, idx) {
  // --- YON YUZALAR (silindr yon qismi) ---
  // Chap yoy
  cakeCtx.beginPath();
  cakeCtx.moveTo(cx - rx, baseY - h);
  cakeCtx.lineTo(cx - rx, baseY);
  cakeCtx.ellipse(cx, baseY, rx, ry, 0, Math.PI, Math.PI * 2);
  cakeCtx.lineTo(cx + rx, baseY - h);
  cakeCtx.ellipse(cx, baseY - h, rx, ry, 0, 0, Math.PI, true);
  cakeCtx.closePath();

  // Gradient — chap qoramtir, o'ng yorug'
  const sg = cakeCtx.createLinearGradient(cx - rx, 0, cx + rx, 0);
  sg.addColorStop(0,    dark);
  sg.addColorStop(0.15, color);
  sg.addColorStop(0.55, light);
  sg.addColorStop(0.85, color);
  sg.addColorStop(1,    dark);
  cakeCtx.fillStyle = sg;
  cakeCtx.fill();

  // Chet
  cakeCtx.strokeStyle = 'rgba(0,0,0,0.15)';
  cakeCtx.lineWidth = 0.8;
  cakeCtx.stroke();

  // Yon vertikal chiziqlar (bezak)
  const lineCount = 8;
  for (let i = 0; i < lineCount; i++) {
    const t  = i / lineCount;
    const lx = cx + Math.cos(Math.PI + t * Math.PI) * rx;
    const ly = baseY + Math.sin(Math.PI + t * Math.PI) * ry;
    cakeCtx.beginPath();
    cakeCtx.moveTo(lx, ly);
    cakeCtx.lineTo(lx, ly - h);
    cakeCtx.strokeStyle = 'rgba(255,255,255,0.07)';
    cakeCtx.lineWidth = 0.7;
    cakeCtx.stroke();
  }

  // --- YUQORI YUZ (doira) ---
  ellipsePath(cakeCtx, cx, baseY - h, rx, ry);
  const tg = cakeCtx.createRadialGradient(cx - rx*0.3, baseY - h - ry*0.2, 0, cx, baseY - h, rx * 1.1);
  tg.addColorStop(0, light);
  tg.addColorStop(0.6, color);
  tg.addColorStop(1, dark);
  cakeCtx.fillStyle = tg;
  cakeCtx.fill();
  cakeCtx.strokeStyle = 'rgba(0,0,0,0.1)';
  cakeCtx.lineWidth = 0.8;
  cakeCtx.stroke();

  // Yaltiroq aks (highlight)
  cakeCtx.save();
  cakeCtx.beginPath();
  cakeCtx.ellipse(cx - rx * 0.25, baseY - h - ry * 0.15, rx * 0.38, ry * 0.38, -0.3, 0, Math.PI * 2);
  cakeCtx.fillStyle = 'rgba(255,255,255,0.18)';
  cakeCtx.fill();
  cakeCtx.restore();
}

// ── Krem chetlari ───────────────────────────────────────────
function drawCreamEdge(cx, y, rx, ry, angle) {
  const dotCount = Math.max(8, Math.floor(rx / 7));
  for (let i = 0; i < dotCount; i++) {
    const a  = Math.PI + (i / dotCount) * Math.PI;
    const dx = Math.cos(a) * rx;
    const dy = Math.sin(a) * ry;
    cakeCtx.beginPath();
    cakeCtx.arc(cx + dx, y + dy, 4.5, 0, Math.PI * 2);
    cakeCtx.fillStyle = '#fff';
    cakeCtx.fill();
    cakeCtx.strokeStyle = 'rgba(200,180,140,0.4)';
    cakeCtx.lineWidth = 0.7;
    cakeCtx.stroke();
  }
}

// ── Soya ────────────────────────────────────────────────────
function drawShadow(cx, y, r, angle) {
  const sg = cakeCtx.createRadialGradient(cx, y, 0, cx, y, r);
  sg.addColorStop(0, 'rgba(0,0,0,0.5)');
  sg.addColorStop(1, 'rgba(0,0,0,0)');
  cakeCtx.beginPath();
  cakeCtx.ellipse(cx, y, r, r * 0.3, 0, 0, Math.PI * 2);
  cakeCtx.fillStyle = sg;
  cakeCtx.fill();
}

// ── Topping ─────────────────────────────────────────────────
function drawTopping(cx, topY, rx, ry, angle) {
  if (!CK.topEmoji || CK.topEmoji === '') {
    // Standart gul bezak
    drawFlower(cx, topY - 2, 12, '#ff6b9d', '#ffb3d0');
    return;
  }
  // Emoji topping
  cakeCtx.font = '24px serif';
  cakeCtx.textAlign = 'center';
  cakeCtx.textBaseline = 'bottom';
  cakeCtx.fillText(CK.topEmoji, cx, topY + 2);
}

// Gul chizish
function drawFlower(cx, cy, r, inner, outer) {
  for (let p = 0; p < 6; p++) {
    const a = (p / 6) * Math.PI * 2;
    cakeCtx.beginPath();
    cakeCtx.arc(cx + Math.cos(a)*r, cy + Math.sin(a)*r, r*0.6, 0, Math.PI*2);
    cakeCtx.fillStyle = outer;
    cakeCtx.fill();
  }
  cakeCtx.beginPath();
  cakeCtx.arc(cx, cy, r * 0.65, 0, Math.PI * 2);
  cakeCtx.fillStyle = inner;
  cakeCtx.fill();
}

// ── Shamlar ─────────────────────────────────────────────────
function drawCandles(cx, topY, rx, ry, angle) {
  const n = CK.candles || 0;
  if (n === 0) return;
  const count = Math.min(n, 7);
  const colors = ['#ff6b9d','#74b9ff','#a29bfe','#fdcb6e','#55efc4','#fd79a8','#6c5ce7'];

  for (let i = 0; i < count; i++) {
    const a  = Math.PI + (i / count) * Math.PI;
    const dx = Math.cos(a) * rx * 0.55;
    const dy = Math.sin(a) * ry * 0.55;
    const x  = cx + dx;
    const y  = topY + dy;

    // Sham tanasi
    cakeCtx.fillStyle = colors[i % colors.length];
    cakeCtx.fillRect(x - 3, y - 22, 6, 20);

    // Alanga
    const fg = cakeCtx.createRadialGradient(x, y - 26, 1, x, y - 26, 6);
    fg.addColorStop(0, '#fff8e1');
    fg.addColorStop(0.4, '#ffa502');
    fg.addColorStop(1, 'rgba(255,100,0,0)');
    cakeCtx.beginPath();
    cakeCtx.ellipse(x, y - 26, 4, 7, 0, 0, Math.PI * 2);
    cakeCtx.fillStyle = fg;
    cakeCtx.fill();
  }
}

// ── Ranglarni aralash ────────────────────────────────────────
function blendColor(hex1, hex2, t) {
  const p = v => parseInt(v.replace('#','').slice(0,2),16);
  const r1=parseInt(hex1.replace('#','').slice(0,2),16);
  const g1=parseInt(hex1.replace('#','').slice(2,4),16);
  const b1=parseInt(hex1.replace('#','').slice(4,6),16);
  const r2=parseInt(hex2.replace('#','').slice(0,2),16);
  const g2=parseInt(hex2.replace('#','').slice(2,4),16);
  const b2=parseInt(hex2.replace('#','').slice(4,6),16);
  const r=Math.round(r1+(r2-r1)*t);
  const g=Math.round(g1+(g2-g1)*t);
  const b=Math.round(b1+(b2-b1)*t);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

// ── Tashqaridan chaqiriladigan funksiyalar ───────────────────
function updateCake3DColor(hex) {
  CK.color = hex;
}
function updateCake3DLayers(n) {
  CK.layers = n;
}
function updateCake3DTopping(emoji) {
  CK.topEmoji = emoji === '✖️' ? '' : (emoji || '');
}
function updateCake3DCandles(n) {
  CK.candles = n;
}
function updateCake3DShape(type) {
  CK.shapeType = type;
  const map = { round:3, sm:2, bento:1, lg:3, heart:2 };
  CK.layers = map[type] || 3;
}
function destroyCake3D() {
  if (cakeAnim) cancelAnimationFrame(cakeAnim);
}

window.addEventListener('resize', () => {
  if (!cakeCanvas) return;
  cakeCanvas.width = cakeCanvas.parentElement.clientWidth || 310;
});
