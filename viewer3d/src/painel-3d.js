// Painel de controles em 3D. É um desenho próprio, não o rádio: os controles do DP-666
// aparecem agrupados por função, sem a forma nem a disposição do aparelho.
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, BoxGeometry, CylinderGeometry, PlaneGeometry,
  CircleGeometry, MeshStandardMaterial, MeshBasicMaterial, DirectionalLight, AmbientLight, Raycaster,
  Vector2, Vector3, Box3, PMREMGenerator, CanvasTexture, SRGBColorSpace,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const HL = '#3987e5';
const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

const MATS = {
  deck: ['#d8dce1', 0.75, 0.05], plate: ['#c9ced4', 0.85, 0.05], dark: ['#2b2f34', 0.5, 0.15],
  key: ['#353a40', 0.45, 0.1], metal: ['#c9ced4', 0.3, 0.85], gold: ['#d9c27a', 0.3, 0.9],
  glass: ['#0b0d10', 0.12, 0.3], hole: ['#0b0d10', 0.9, 0], light: ['#e9ebee', 0.5, 0.05],
};
const mat = (k) => { const [c, r, m] = MATS[k]; return new MeshStandardMaterial({ color: c, roughness: r, metalness: m }); };

function canvasTex(w, h, draw) {
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  draw(cv.getContext('2d'), w, h);
  const t = new CanvasTexture(cv);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// texto deitado sobre a superfície (w × h em mm)
function text(str, w, h, { color = '#2a2e33', weight = 700, size = 0.66, align = 'center' } = {}) {
  const S = 22;
  const tex = canvasTex(Math.round(w * S), Math.round(h * S), (x, cw, ch) => {
    x.fillStyle = color;
    x.font = `${weight} ${Math.round(ch * size)}px ${FONT}`;
    x.textAlign = align;
    x.textBaseline = 'middle';
    x.fillText(str, align === 'left' ? 2 : cw / 2, ch / 2 + 1);
  });
  const m = new Mesh(new PlaneGeometry(w, h), new MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2;
  return m;
}

function cyl(r, h, m, y, seg = 40) {
  const mesh = new Mesh(new CylinderGeometry(r, r, h, seg), m);
  mesh.position.y = y + h / 2;
  return mesh;
}
function rbox(w, h, d, m, y, rad = 1.2) {
  const mesh = new Mesh(new RoundedBoxGeometry(w, h, d, 2, Math.min(rad, h / 2 - 0.01, w / 2, d / 2)), m);
  mesh.position.y = y + h / 2;
  return mesh;
}

function layout(portrait) {
  if (!portrait) {
    return {
      deck: [152, 96],
      groups: [['TELA E TECLADO', -72, -43, -22, 43], ['SINTONIA', -18, -43, 26, 5], ['BOTÕES', -18, 9, 26, 43],
        ['ÁUDIO', 30, -43, 72, 5], ['ENERGIA E CONEXÕES', 30, 9, 72, 43]],
      c: { tela: [-47, -17], teclado: [-47, 24], enc: [4, -19], band: [-9, 27], bw: [4, 27], mode: [17, 27],
        volume: [39, -33], sql: [52, -33], fone: [64, -33], falante: [51, -10],
        power: [38, 17], chave: [56, 17], usbc: [37, 33], antena: [51, 33], boot: [64, 33] },
    };
  }
  return {
    deck: [100, 174],
    groups: [['TELA E TECLADO', -48, -82, 48, -40], ['SINTONIA', -48, -36, 2, 8], ['BOTÕES', 6, -36, 48, 8],
      ['ÁUDIO', -48, 12, 48, 46], ['ENERGIA E CONEXÕES', -48, 50, 48, 82]],
    c: { tela: [-20, -61], teclado: [28, -61], enc: [-23, -15], band: [14, -14], bw: [27, -14], mode: [40, -14],
      volume: [-38, 21], sql: [-24, 21], fone: [-10, 21], falante: [28, 29],
      power: [-36, 62], chave: [-14, 62], usbc: [6, 62], antena: [24, 62], boot: [40, 62] },
  };
}

// cada construtor recebe o grupo e devolve partes que se movem: cap (apertar) e rot (girar)
const BUILD = {
  tela(g, m) {
    g.add(rbox(44, 2, 30, m('dark'), 0, 1.4));
    const glass = new Mesh(new PlaneGeometry(40, 25), m('glass'));
    glass.rotation.x = -Math.PI / 2; glass.position.set(0, 2.02, -0.6);
    g.add(glass);
    const t = text('TELA DE TOQUE', 24, 3.2, { color: '#7d8590', weight: 600 });
    t.position.set(0, 2.06, -0.6);
    g.add(t);
  },
  teclado(g, m) {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'DX', '0', 'ENT'];
    keys.forEach((k, i) => {
      const x = ((i % 3) - 1) * 9.6, z = (Math.floor(i / 3) - 1.5) * 6.8;
      const key = rbox(8, 2.2, 5.4, m('key'), 0, 0.9);
      key.position.x = x; key.position.z = z;
      g.add(key);
      const t = text(k, 7, 4, { color: '#eef0f2', size: k.length > 1 ? 0.5 : 0.7 });
      t.position.set(x, 2.24, z);
      g.add(t);
    });
  },
  enc(g, m) {
    g.add(cyl(13, 1, m('metal'), 0, 64));
    const cap = new Group(), rot = new Group();
    cap.add(cyl(11, 7, m('dark'), 1, 64));
    cap.add(cyl(11.35, 5.4, m('dark'), 1.8, 28));
    cap.add(cyl(9.4, 0.3, m('key'), 8, 64));
    const ind = new Mesh(new BoxGeometry(1.4, 0.4, 6), m('light'));
    ind.position.set(0, 8.4, -5);
    rot.add(ind);
    cap.add(rot);
    g.add(cap);
    const t = text('TUNING', 22, 4.2); t.position.set(0, 0.02, 16); g.add(t);
    return { cap, rot };
  },
  key(label) {
    return (g, m) => {
      const cap = new Group();
      cap.add(rbox(11, 4, 8, m('key'), 0, 1.4));
      const t = text(label, 10, 4, { color: '#f1f3f5', size: 0.6 });
      t.position.set(0, 4.04, 0);
      cap.add(t);
      g.add(cap);
      return { cap };
    };
  },
  power(g, m) {
    const cap = new Group();
    cap.add(cyl(4.6, 3, m('key'), 0));
    const tex = canvasTex(128, 128, (x) => {
      x.strokeStyle = '#f1f3f5'; x.lineWidth = 10; x.lineCap = 'round';
      x.beginPath(); x.arc(64, 68, 34, -Math.PI * 0.32, Math.PI * 1.32); x.stroke();
      x.beginPath(); x.moveTo(64, 22); x.lineTo(64, 64); x.stroke();
    });
    const icon = new Mesh(new CircleGeometry(3.2, 32), new MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    icon.rotation.x = -Math.PI / 2; icon.position.y = 3.03;
    cap.add(icon);
    g.add(cap);
    const t = text('POWER', 15, 3.8); t.position.set(0, 0.02, 8); g.add(t);
    return { cap };
  },
  boot(g, m) {
    g.add(cyl(3.3, 0.8, m('metal'), 0, 32));
    g.add(cyl(2.3, 0.84, m('hole'), 0, 32));
    const cap = new Group();
    cap.add(cyl(1.6, 1.3, m('key'), 0.2, 24));
    g.add(cap);
    const t = text('BOOT', 13, 3.8); t.position.set(0, 0.02, 6.8); g.add(t);
    return { cap };
  },
  chave(g, m) {
    g.add(rbox(16, 1, 5.6, m('dark'), 0, 0.4));
    const cap = new Group();
    cap.add(rbox(5, 3, 4.6, m('metal'), 0.8, 1));
    cap.position.x = -4.6;
    g.add(cap);
    const on = text('ON', 7, 3, { size: 0.7 }); on.position.set(-5, 0.02, 4.6); g.add(on);
    const off = text('OFF', 7, 3, { size: 0.7 }); off.position.set(5, 0.02, 4.6); g.add(off);
    const t = text('CHAVE GERAL', 24, 3.8); t.position.set(0, 0.02, 8.6); g.add(t);
    return { lever: cap };
  },
  pot(label) {
    return (g, m) => {
      g.add(cyl(6.3, 0.6, m('metal'), 0, 40));
      const cap = new Group(), rot = new Group();
      cap.add(cyl(5.2, 4.6, m('metal'), 0.6, 40));
      const ind = new Mesh(new BoxGeometry(0.9, 0.3, 3.2), m('dark'));
      ind.position.set(0, 5.3, -2.6);
      rot.add(ind);
      cap.add(rot);
      g.add(cap);
      const t = text(label, 15, 3.8); t.position.set(0, 0.02, 9.2); g.add(t);
      return { cap, rot };
    };
  },
  roda(g, m) {
    const rim = rbox(6, 0.8, 13.6, m('metal'), 0, 0.8); rim.position.x = 1.5; g.add(rim);
    const slot = rbox(3.8, 0.84, 11, m('hole'), 0, 0.5); slot.position.x = 1.5; g.add(slot);
    const serrilha = canvasTex(512, 64, (x, w, h) => {
      x.fillStyle = '#41464d'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#15181c';
      for (let i = 0; i < w; i += 16) x.fillRect(i, 0, 7, h);
    });
    const mk = m('key'); mk.map = serrilha; mk.color.set('#ffffff');
    const wheel = new Mesh(new CylinderGeometry(4.8, 4.8, 3.2, 48), mk);
    wheel.rotation.z = Math.PI / 2;   // eixo deitado: a roda gira para o + ou para o −
    wheel.position.set(1.5, -2.6, 0);  // só o alto da roda passa pela fenda
    g.add(wheel);
    const mais = text('+', 3.4, 3.4, { size: 0.9 }); mais.position.set(-4.2, 0.02, -4.4); g.add(mais);
    const menos = text('−', 3.4, 3.4, { size: 0.9 }); menos.position.set(-4.2, 0.02, 4.4); g.add(menos);
    const t = text('SQL', 15, 3.8); t.position.set(0, 0.02, 9.2); g.add(t);
  },
  fone(g, m) {
    g.add(cyl(3.6, 1.2, m('metal'), 0, 40));
    g.add(cyl(2, 1.26, m('hole'), 0, 32));
    const t = text('FONE', 12, 3.8); t.position.set(0, 0.02, 9.2); g.add(t);
  },
  falante(g, m) {
    g.add(cyl(9.2, 0.8, m('dark'), 0, 64));
    const dots = canvasTex(256, 256, (x) => {
      x.fillStyle = '#2b2f34'; x.fillRect(0, 0, 256, 256);
      x.fillStyle = '#0b0d10';
      for (let i = 10; i < 256; i += 18) for (let j = 10; j < 256; j += 18) {
        if (Math.hypot(i - 128, j - 128) < 118) { x.beginPath(); x.arc(i, j, 4.5, 0, Math.PI * 2); x.fill(); }
      }
    });
    const grille = new Mesh(new CircleGeometry(8.5, 64), new MeshStandardMaterial({ map: dots, roughness: 0.8 }));
    grille.rotation.x = -Math.PI / 2; grille.position.y = 0.82;
    g.add(grille);
    const t = text('ALTO-FALANTE', 26, 3.8); t.position.set(0, 0.02, 11.6); g.add(t);
  },
  usbc(g, m) {
    g.add(rbox(12, 1.6, 5.6, m('metal'), 0, 1.2));
    g.add(rbox(9, 1.64, 2.4, m('hole'), 0, 1));
    const t = text('USB-C', 13, 3.8); t.position.set(0, 0.02, 6.8); g.add(t);
  },
  antena(g, m) {
    g.add(cyl(3.4, 2.2, m('gold'), 0, 6));
    g.add(cyl(2.3, 4.5, m('gold'), 2.2, 24));
    g.add(cyl(1.5, 0.1, m('hole'), 6.7, 24));
    const t = text('ANTENA', 15, 3.8); t.position.set(0, 0.02, 6.8); g.add(t);
  },
};
BUILD.band = BUILD.key('BAND');
BUILD.bw = BUILD.key('BW');
BUILD.mode = BUILD.key('MODE');
BUILD.volume = BUILD.pot('VOLUME');
BUILD.sql = BUILD.roda;

function disposeTree(o) {
  o.traverse((n) => {
    if (n.geometry) n.geometry.dispose();
    if (n.material) { if (n.material.map) n.material.map.dispose(); n.material.dispose(); }
  });
}

export function mountPainel(stage, cb = {}) {
  if (stage.__painel) return stage.__painel;
  stage.innerHTML = '<canvas role="img" aria-label="Painel 3D com os controles do rádio. A visualização simples tem os mesmos controles em botões."></canvas>' +
    '<div class="p3-hold" hidden><div class="p3-bar"><i></i><b class="m1"></b><b class="m2"></b></div><span></span></div>';
  const canvas = stage.querySelector('canvas');
  const hold = stage.querySelector('.p3-hold');
  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch (err) {
    stage.innerHTML = '<div class="pl-load">Este navegador não conseguiu abrir o painel em 3D. Use a visualização simples.</div>';
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  scene.add(new AmbientLight(0xffffff, 0.3));
  const sun = new DirectionalLight(0xffffff, 1.0);
  sun.position.set(-30, 90, 60);
  scene.add(sun);
  const camera = new PerspectiveCamera(36, 1, 1, 2000);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.12;
  controls.minDistance = 40;
  controls.maxDistance = 420;
  controls.maxPolarAngle = Math.PI * 0.45;
  controls.screenSpacePanning = true;
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let deck = null, ctls = {}, pickables = [], portrait = null;
  let mode = 'uso', held = {}, selected = null, hovered = null, chaveOn = true;

  function build(p) {
    if (deck) { scene.remove(deck); disposeTree(deck); }
    const L = layout(p);
    deck = new Group();
    const [W, D] = L.deck;
    const slab = rbox(W, 6, D, mat('deck'), -6, 4);
    deck.add(slab);
    L.groups.forEach(([title, x0, z0, x1, z1]) => {
      const plate = rbox(x1 - x0, 0.6, z1 - z0, mat('plate'), 0, 1.6);
      plate.position.x = (x0 + x1) / 2; plate.position.z = (z0 + z1) / 2;
      deck.add(plate);
      const w = Math.max(18, title.length * 2.75);
      const t = text(title, w, 4, { color: '#5b6470', weight: 700, size: 0.7, align: 'left' });
      t.position.set(x0 + w / 2, 0.03, z0 - 2.2);
      deck.add(t);
    });
    ctls = {}; pickables = [];
    Object.entries(L.c).forEach(([id, [x, z]]) => {
      const g = new Group();
      const mats = [];
      const m = (k) => { const mm = mat(k); mats.push(mm); return mm; };
      const parts = BUILD[id](g, m) || {};
      g.position.set(x, 0.6, z);
      g.traverse((n) => { if (n.isMesh) { n.userData.ctl = id; pickables.push(n); } });
      deck.add(g);
      ctls[id] = { id, g, mats, ...parts, angle: 0 };
    });
    if (ctls.chave) ctls.chave.lever.position.x = chaveOn ? -4.6 : 4.6;
    scene.add(deck);
    paint();
  }

  function paint() {
    Object.values(ctls).forEach((c) => {
      const on = !!held[c.id];
      const k = on ? 0.55 : c.id === selected ? 0.38 : c.id === hovered ? 0.2 : 0;
      c.mats.forEach((mm) => { mm.emissive.set(on || c.id === selected ? HL : '#ffffff'); mm.emissiveIntensity = on || c.id === selected ? k : k * 0.5; });
      if (c.cap) c.cap.position.y = on ? -1 : 0;
    });
    wake();
  }

  function fit(ms) {
    const dir = new Vector3(0, portrait ? 2.2 : 1.7, 1).normalize();
    const box = new Box3().setFromObject(deck);
    const target = box.getCenter(new Vector3());
    target.y = 0;
    const corners = [];
    for (const x of [box.min.x, box.max.x]) for (const z of [box.min.z, box.max.z]) corners.push(new Vector3(x, 0, z));
    let dist = 220;
    for (let i = 0; i < 4; i++) {
      camera.position.copy(target).add(dir.clone().multiplyScalar(dist));
      camera.lookAt(target);
      camera.updateMatrixWorld();
      let mx = 0;
      corners.forEach((c) => { const p = c.clone().project(camera); mx = Math.max(mx, Math.abs(p.x), Math.abs(p.y)); });
      dist *= mx / 0.95;
    }
    const pos = target.clone().add(dir.multiplyScalar(dist));
    if (!ms || reduced) { camera.position.copy(pos); controls.target.copy(target); controls.update(); }
    else anim = { t0: performance.now(), ms, p0: camera.position.clone(), q0: controls.target.clone(), p1: pos, q1: target };
    wake();
  }

  // apertar e segurar: o painel não gira enquanto um controle está apertado
  const ray = new Raycaster(), ndc = new Vector2();
  function pick(ev) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(pickables, false)[0];
    return hit ? hit.object.userData.ctl : null;
  }
  let press = null;
  function holdFrame() {
    if (!press) return;
    const ms = performance.now() - press.t0;
    if (press.th) {
      hold.querySelector('i').style.width = `${Math.min(100, (ms / press.max) * 100)}%`;
      hold.querySelector('span').textContent = `Segurando ${(ms / 1000).toFixed(1).replace('.', ',')} s`;
    }
    press.raf = requestAnimationFrame(holdFrame);
  }
  stage.addEventListener('pointerdown', (e) => {
    if (e.target !== canvas || e.button > 0) return;
    const id = pick(e);
    if (!id) return;
    controls.enabled = false;
    const th = mode === 'uso' && cb.thresholds ? cb.thresholds(id) : null;
    const max = th ? (th.hold ? th.hold * 1.15 : th.long ? th.long * 1.6 : 600) : 600;
    press = { id, t0: performance.now(), x: e.clientX, y: e.clientY, th, max };
    const c = ctls[id];
    if (c.cap && mode === 'uso') c.cap.position.y = -1;
    if (th && (th.long || th.hold)) {
      hold.hidden = false;
      const m1 = hold.querySelector('.m1'), m2 = hold.querySelector('.m2');
      m1.style.display = th.long ? '' : 'none';
      m2.style.display = th.hold ? '' : 'none';
      if (th.long) m1.style.left = `${(th.long / max) * 100}%`;
      if (th.hold) m2.style.left = `${(th.hold / max) * 100}%`;
    }
    holdFrame();
    wake();
  }, true);
  function release(e, cancel) {
    if (!press) return;
    const p = press;
    press = null;
    cancelAnimationFrame(p.raf);
    hold.hidden = true;
    hold.querySelector('i').style.width = '0%';
    controls.enabled = true;
    const c = ctls[p.id];
    if (c.cap) c.cap.position.y = held[p.id] ? -1 : 0;
    const moved = e ? Math.hypot(e.clientX - p.x, e.clientY - p.y) : 0;
    if (cancel || moved > 12) { paint(); return; }
    selected = p.id;
    if (p.id === 'chave') {
      chaveOn = !chaveOn;
      c.lever.position.x = chaveOn ? -4.6 : 4.6;
    }
    paint();
    if (cb.press) cb.press(p.id, performance.now() - p.t0);
  }
  window.addEventListener('pointerup', (e) => release(e, false));
  window.addEventListener('pointercancel', () => release(null, true));
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  canvas.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || e.buttons) return;
    const id = pick(e);
    canvas.style.cursor = id ? 'pointer' : '';
    if (id !== hovered) { hovered = id; paint(); }
  });
  canvas.addEventListener('pointerleave', () => { if (hovered) { hovered = null; paint(); } });

  let anim = null, running = false, idle = 0, visible = true;
  function tick(now) {
    let active = false;
    if (anim) {
      const k = Math.min(1, (now - anim.t0) / anim.ms), e = 1 - Math.pow(1 - k, 3);
      camera.position.lerpVectors(anim.p0, anim.p1, e);
      controls.target.lerpVectors(anim.q0, anim.q1, e);
      if (k >= 1) anim = null;
      active = true;
    }
    Object.values(ctls).forEach((c) => {
      if (!c.rot) return;
      const d = c.angle - c.rot.rotation.y;
      if (Math.abs(d) > 0.001) { c.rot.rotation.y += reduced ? d : d * 0.2; active = true; }
    });
    if (controls.update()) active = true;
    if (press) active = true;
    renderer.render(scene, camera);
    idle = active ? 0 : idle + 1;
    if (!visible || idle > 20) { running = false; return; }
    requestAnimationFrame(tick);
  }
  function wake() {
    idle = 0;
    if (!running && visible) { running = true; requestAnimationFrame(tick); }
  }
  controls.addEventListener('change', wake);

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const p = camera.aspect < 0.9;
    if (p !== portrait) { portrait = p; build(p); fit(0); }
    wake();
  }
  if (window.ResizeObserver) new ResizeObserver(resize).observe(stage);
  else window.addEventListener('resize', resize);
  if (window.IntersectionObserver) {
    new IntersectionObserver((en) => { visible = en.some((x) => x.isIntersecting); if (visible) wake(); }).observe(stage);
  }
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; if (visible) wake(); });

  resize();
  const api = {
    setMode: (m) => { mode = m; if (m === 'uso') held = {}; paint(); },
    setHeld: (h) => { held = { ...h }; paint(); },
    select: (id) => { selected = id; paint(); },
    rotate: (id, dir) => { const c = ctls[id]; if (c && c.rot) { c.angle -= dir * Math.PI / 6; wake(); } },
    refit: () => fit(400),
    pointOf: (id) => {
      const c = ctls[id];
      if (!c) return null;
      const v = new Vector3();
      c.g.getWorldPosition(v);
      v.y += 3;
      v.project(camera);
      const r = canvas.getBoundingClientRect();
      return { x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height };
    },
  };
  stage.__painel = api;
  return api;
}
