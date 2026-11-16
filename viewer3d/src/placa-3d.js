// Placa do DP-666 em blocos: um diagrama 3D, com tamanhos e posições simbólicos.
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, BoxGeometry, CylinderGeometry, SphereGeometry,
  MeshStandardMaterial, DirectionalLight, AmbientLight, Raycaster, Vector2, Vector3, Box3, PMREMGenerator,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const HL = '#3987e5';        // destaque (mesmo azul validado da paleta do visor do ESP32)
const TRACE = '#8b939c';     // ligações em repouso
const PRIORITY = ['tef', 'esp32', 'tela', 'antena', 'falante', 'fone', 'bateria', 'usbc', 'controles', 'teclado',
  'xl', 'rtc', 'xpt', 'ch340', 'tp4056', 'rt9193', 'chave', 'tpa', 'max'];

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function mat(color, o = {}) {
  return new MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.1, transparent: true, ...o });
}

function box(w, h, d, m, x = 0, y = 0, z = 0) {
  const mesh = new Mesh(new BoxGeometry(w, h, d), m);
  mesh.position.set(x, y + h / 2, z);
  return mesh;
}

function cyl(r1, r2, h, m, x = 0, y = 0, z = 0, seg = 32) {
  const mesh = new Mesh(new CylinderGeometry(r1, r2, h, seg), m);
  mesh.position.set(x, y + h / 2, z);
  return mesh;
}

// cada tipo de bloco vira um pequeno modelo genérico; devolve [grupo, altura do rótulo]
function makeBlock(b) {
  const g = new Group();
  const [w, d] = b.tam;
  const dark = () => mat('#1f2226', { roughness: 0.45 });
  const metal = () => mat('#cfd3d8', { metalness: 0.85, roughness: 0.32 });
  const gold = () => mat('#d9c27a', { metalness: 0.9, roughness: 0.3 });
  let top = 2;
  switch (b.tipo) {
    case 'chip': {
      g.add(box(w + 1.2, 0.25, d + 1.2, metal()));
      g.add(box(w, 1.1, d, dark(), 0, 0.25, 0));
      const dot = new Mesh(new CylinderGeometry(0.35, 0.35, 0.02, 16), mat('#e6e8eb'));
      dot.position.set(-w / 2 + 0.9, 1.37, -d / 2 + 0.9);
      g.add(dot);
      top = 1.5;
      break;
    }
    case 'modulo': {
      g.add(box(w, 0.8, d, mat('#1c2420', { roughness: 0.8 })));
      g.add(box(w - 2.3, 2.4, d - 4.8, metal(), 0, 0.8, 1.2));
      g.add(cyl(1, 1, 0.9, gold(), w / 2 - 2.9, 0.8, -d / 2 + 1.9));
      top = 3.4;
      break;
    }
    case 'antena': {
      g.add(cyl(2.1, 2.1, 3, gold()));
      g.add(cyl(0.55, 0.55, 24, metal(), 0, 3, 0, 16));
      const tip = new Mesh(new SphereGeometry(0.9, 16, 12), metal());
      tip.position.set(0, 27.4, 0);
      g.add(tip);
      top = 7;
      break;
    }
    case 'falante': {
      g.add(cyl(7, 7, 1.6, mat('#2b2f34', { roughness: 0.7 })));
      g.add(cyl(6.2, 2.6, 1.3, mat('#3a3f45', { roughness: 0.9 }), 0, 1.6, 0));
      const cap = new Mesh(new SphereGeometry(2.1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat('#4a5058'));
      cap.position.set(0, 2.2, 0);
      g.add(cap);
      top = 4.2;
      break;
    }
    case 'fone': {
      g.add(box(w, 4, d, dark()));
      g.add(cyl(1.7, 1.7, 0.4, metal(), 0, 4, 0));
      g.add(cyl(1.0, 1.0, 0.45, mat('#0b0d10'), 0, 4, 0));
      top = 4.8;
      break;
    }
    case 'tela': {
      g.add(box(w, 1.6, d, mat('#2a2e33', { roughness: 0.6 })));
      g.add(box(w - 2, 0.06, d - 3, mat('#0b0d10', { roughness: 0.12, metalness: 0.2 }), 0, 1.6, 0.6));
      top = 2.2;
      break;
    }
    case 'controles': {
      g.add(box(w, 0.8, d, mat('#3a3f45')));
      g.add(cyl(3.1, 3.1, 3.2, metal(), -w / 2 + 4, 0.8, 0));
      for (let i = 0; i < 3; i++) g.add(box(2.4, 1, 1.8, dark(), -0.4 + i * 3, 0.8, -1.6));
      g.add(cyl(1.1, 1.1, 2, metal(), w / 2 - 2, 0.8, 2.6, 16));
      top = 4.6;
      break;
    }
    case 'teclado': {
      g.add(box(w, 0.8, d, mat('#3a3f45')));
      for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) g.add(box(2.6, 0.8, 1.9, dark(), -3.6 + c * 3.6, 0.8, -4.2 + r * 2.8));
      top = 2.2;
      break;
    }
    case 'usb': {
      g.add(box(w, 3.2, d, metal()));
      g.add(box(w - 2, 1.2, 0.3, mat('#0b0d10'), 0, 1, d / 2));
      top = 4;
      break;
    }
    case 'bateria': {
      g.add(box(w, 5, d, mat('#7f95a8', { roughness: 0.7 })));
      g.add(box(4, 0.3, 2, metal(), -w / 2 + 3, 5, 0));
      top = 6;
      break;
    }
    case 'chave': {
      g.add(box(w, 2, d, dark()));
      g.add(box(1.6, 2.2, 1.6, metal(), -1, 2, 0));
      top = 4.6;
      break;
    }
    default:
      g.add(box(w, 1.5, d, dark()));
  }
  g.position.set(b.pos[0], 0, b.pos[1]);
  g.traverse((n) => { n.userData.block = b.id; });
  return [g, top];
}

function readTheme(el) {
  const cs = getComputedStyle(el);
  const v = (n, f) => (cs.getPropertyValue(n) || '').trim() || f;
  return { surface: v('--surface', '#f4f6f8'), rule: v('--rule', '#e2e6eb') };
}

function disposeTree(o) {
  o.traverse((n) => {
    if (n.geometry) n.geometry.dispose();
    if (n.material) n.material.dispose();
  });
}

export function mountPlaca(root, data, opts = {}) {
  if (root.__placa) return root.__placa;
  const stage = root.querySelector('.pl-stage');
  const busBox = root.querySelector('.pl-buses');
  const info = root.querySelector('.pl-info');
  stage.innerHTML = '<canvas role="img" aria-label="Diagrama 3D dos blocos da placa. Os botões abaixo destacam cada ligação."></canvas><div class="pl-labels" aria-hidden="true"></div>';
  const canvas = stage.querySelector('canvas');
  const labelBox = stage.querySelector('.pl-labels');

  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch (err) {
    stage.innerHTML = '<div class="pl-load">Este navegador não conseguiu abrir a visão 3D. A lista de componentes está em <a href="#hardware">Hardware</a>.</div>';
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
  sun.position.set(30, 80, 50);
  scene.add(sun);

  const camera = new PerspectiveCamera(38, 1, 1, 2000);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.12;
  controls.minDistance = 25;
  controls.maxDistance = 420;
  controls.maxPolarAngle = Math.PI * 0.46;
  controls.screenSpacePanning = true;
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // plataforma neutra: deixa claro que é um diagrama, não a placa real
  let theme = readTheme(root);
  const platform = box(158, 1.2, 94, mat(theme.surface, { roughness: 0.95, transparent: false }), 0, -1.2, -1);
  scene.add(platform);

  // blocos
  const blocks = {};
  const pickables = [];
  data.blocos.forEach((b) => {
    const [g, top] = makeBlock(b);
    const meshes = [];
    g.traverse((n) => { if (n.isMesh) { meshes.push(n); pickables.push(n); } });
    const [w, d] = b.tam;
    const ring = box(w + 3, 0.12, d + 3, mat(HL, { emissive: HL, emissiveIntensity: 0.4, opacity: 0.85 }), 0, -0.02, 0);
    ring.visible = false;
    ring.userData.block = b.id;
    g.add(ring);
    scene.add(g);
    const label = document.createElement('div');
    label.className = 'pl-label';
    label.textContent = b.rotulo;
    labelBox.appendChild(label);
    blocks[b.id] = { b, g, meshes, ring, label, top, links: [] };
  });

  // ligações: faixas achatadas sobre a plataforma
  const links = data.ligacoes.map(([from, to, bus, pts]) => {
    const g = new Group();
    const m = mat(TRACE, { roughness: 0.6 });
    const segs = [];
    let total = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, z1] = pts[i], [x2, z2] = pts[i + 1];
      const len = Math.hypot(x2 - x1, z2 - z1);
      const horiz = Math.abs(x2 - x1) >= Math.abs(z2 - z1);
      const piece = new Mesh(new BoxGeometry(horiz ? len + 1 : 1, 0.3, horiz ? 1 : len + 1), m);
      piece.position.set((x1 + x2) / 2, 0.15, (z1 + z2) / 2);
      g.add(piece);
      segs.push({ x1, z1, x2, z2, len, start: total });
      total += len;
    }
    scene.add(g);
    const link = { from, to, bus, g, m, segs, total, pulses: [] };
    blocks[from].links.push(link);
    blocks[to].links.push(link);
    return link;
  });
  const pulseGeo = new SphereGeometry(0.85, 12, 8);
  const pulseMat = mat(HL, { emissive: HL, emissiveIntensity: 0.9, transparent: false });
  links.forEach((l) => {
    const n = Math.max(1, Math.round(l.total / 22));
    for (let k = 0; k < n; k++) {
      const s = new Mesh(pulseGeo, pulseMat);
      s.visible = false;
      scene.add(s);
      l.pulses.push({ s, off: k / n });
    }
  });

  // estado
  let selected = null, hovered = null, bus = null;
  const rtcState = () => (opts.rtc ? opts.rtc() : '?');

  function activeLinks() {
    if (selected) return new Set(blocks[selected].links);
    if (bus) return new Set(links.filter((l) => l.bus === bus));
    return null;
  }
  function paint() {
    const act = activeLinks();
    const involved = new Set();
    if (act) act.forEach((l) => { involved.add(l.from); involved.add(l.to); });
    if (selected) involved.add(selected);
    links.forEach((l) => {
      const on = act && act.has(l);
      l.m.color.set(on ? HL : TRACE);
      l.m.emissive.set(on ? HL : '#000000');
      l.m.emissiveIntensity = on ? 0.35 : 0;
      l.m.opacity = act && !on ? 0.3 : 1;
      l.pulses.forEach((p) => { p.s.visible = !!on && !reduced; });
      l.on = !!on;
    });
    const rtcMissing = rtcState() === 'nao';
    Object.values(blocks).forEach((k) => {
      const dim = (act && !involved.has(k.b.id)) || (k.b.rtc && rtcMissing);
      k.meshes.forEach((m) => { m.material.opacity = dim ? 0.3 : 1; });
      k.ring.visible = k.b.id === selected || (k.b.id === hovered && !selected);
      k.ring.material.opacity = k.b.id === selected ? 0.85 : 0.4;
      k.label.classList.toggle('dim', !!dim);
      k.label.classList.toggle('sel', k.b.id === selected);
      k.label.textContent = k.b.rotulo + (k.b.rtc && rtcMissing ? ' (ausente)' : '');
    });
    [...busBox.querySelectorAll('button')].forEach((btn) => btn.setAttribute('aria-pressed', String(btn.dataset.bus === bus)));
    wake();
  }

  function showInfo() {
    if (selected) {
      const b = blocks[selected].b;
      const buses = [...new Set(blocks[selected].links.map((l) => data.barramentos[l.bus].nome))];
      let h = `<h3>${esc(b.titulo)}</h3>`;
      const meta = [b.ref && b.ref !== '—' ? `${b.ref} no esquema` : '', b.bus || ''].filter(Boolean).join(' · ');
      if (meta) h += `<p class="meta">${esc(meta)}</p>`;
      h += `<p>${b.texto || ''}</p>`;
      if (b.extra) h += `<p>${b.extra}</p>`;
      if (b.rtc) {
        const r = rtcState();
        h += `<p>${r === 'nao' ? 'Pelo seu perfil, o seu rádio não tem este relógio.' : r === 'sim' ? 'Pelo seu perfil, o seu rádio tem este relógio.' : 'Não sabe se o seu tem? Faça o <a href="#hardware--teste-de-rtc">teste do RTC</a>.'}</p>`;
      }
      if (buses.length) h += `<p class="meta">Ligações: ${esc(buses.join(', '))}</p>`;
      if (b.links && b.links.length) {
        h += '<ul>' + b.links.map(([t, u]) => `<li><a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(t)}</a></li>`).join('') + '</ul>';
      }
      if (b.link) h += `<p style="margin:12px 0 0"><a class="btn-ghost" href="${esc(b.link[1])}">${esc(b.link[0])} →</a></p>`;
      info.innerHTML = h;
    } else if (bus) {
      const B = data.barramentos[bus];
      const names = [...new Set(links.filter((l) => l.bus === bus).flatMap((l) => [l.from, l.to]))].map((id) => blocks[id].b.rotulo);
      info.innerHTML = `<h3>${esc(B.nome)}</h3><p>${B.texto}</p><p class="meta">Blocos: ${esc(names.join(', '))}</p>`;
    } else {
      info.innerHTML = '<p class="v3-muted" style="margin:0">Toque num bloco para ver o chip e os datasheets, ou num barramento acima para seguir o caminho. As ligações acendem em azul.</p>';
    }
  }

  busBox.innerHTML = Object.entries(data.barramentos).map(([k, v]) =>
    `<button type="button" class="chip-btn" data-bus="${k}" aria-pressed="false">${esc(v.nome)}</button>`).join('');
  busBox.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-bus]');
    if (!btn) return;
    bus = bus === btn.dataset.bus ? null : btn.dataset.bus;
    selected = null;
    paint(); showInfo();
  });

  // câmera: enquadra a plataforma; em tela de pé, gira para o lado comprido ficar na vertical
  function fit(ms) {
    const portrait = camera.aspect < 1;
    const dir = (portrait ? new Vector3(1, 2.6, 0.12) : new Vector3(0, 1.45, 1)).normalize();
    const target = new Vector3(0, 0, -1);
    const pb = new Box3().setFromObject(platform);
    const corners = [];
    for (const x of [pb.min.x, pb.max.x]) for (const z of [pb.min.z, pb.max.z]) corners.push(new Vector3(x, 0, z));
    let dist = 200;
    for (let i = 0; i < 4; i++) {
      camera.position.copy(target).add(dir.clone().multiplyScalar(dist));
      camera.lookAt(target);
      camera.updateMatrixWorld();
      let m = 0;
      corners.forEach((c) => { const p = c.clone().project(camera); m = Math.max(m, Math.abs(p.x), Math.abs(p.y)); });
      dist *= m / 0.94;
    }
    const pos = target.clone().add(dir.multiplyScalar(dist));
    if (!ms || reduced) { camera.position.copy(pos); controls.target.copy(target); controls.update(); }
    else anim = { t0: performance.now(), ms, p0: camera.position.clone(), q0: controls.target.clone(), p1: pos, q1: target };
    wake();
  }

  // escolha por toque ou clique
  const ray = new Raycaster(), ndc = new Vector2();
  function pick(ev) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(pickables, false)[0];
    return hit ? hit.object.userData.block : null;
  }
  let down = null;
  canvas.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY }; wake(); });
  canvas.addEventListener('pointerup', (e) => {
    if (!down) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
    down = null;
    if (moved > 6) return;
    const id = pick(e);
    selected = id && id !== selected ? id : null;
    bus = null;
    paint(); showInfo();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || e.buttons) return;
    const id = pick(e);
    canvas.style.cursor = id ? 'pointer' : '';
    if (id !== hovered) { hovered = id; paint(); }
  });
  canvas.addEventListener('pointerleave', () => { if (hovered) { hovered = null; paint(); } });

  // rótulos em HTML, sem sobreposição: os mais importantes primeiro
  const tmp = new Vector3();
  const order = Object.values(blocks).sort((a, b) => {
    const pa = PRIORITY.indexOf(a.b.id), pb = PRIORITY.indexOf(b.b.id);
    return (pa < 0 ? 99 : pa) - (pb < 0 ? 99 : pb);
  });
  function placeLabels() {
    const w = stage.clientWidth, h = stage.clientHeight;
    const placed = [];
    const list = selected ? [blocks[selected], ...order.filter((k) => k.b.id !== selected)] : order;
    list.forEach((k) => {
      tmp.set(k.b.pos[0], k.top + 0.6, k.b.pos[1]).project(camera);
      const x = ((tmp.x + 1) / 2) * w, y = ((1 - tmp.y) / 2) * h;
      const lw = k.label.offsetWidth || 60, lh = k.label.offsetHeight || 18;
      const rect = [x - lw / 2, y - lh - 4, x + lw / 2, y - 4];
      const off = tmp.z > 1 || x < -40 || x > w + 40 || y < -20 || y > h + 30;
      const clash = placed.some((p) => !(rect[2] < p[0] || rect[0] > p[2] || rect[3] < p[1] || rect[1] > p[3]));
      const show = !off && !clash;
      k.label.style.visibility = show ? 'visible' : 'hidden';
      if (show) {
        k.label.style.transform = `translate(${Math.round(rect[0])}px, ${Math.round(rect[1])}px)`;
        placed.push(rect);
      }
    });
  }

  // laço de desenho sob demanda
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
    if (controls.update()) active = true;
    const pulsing = !reduced && links.some((l) => l.on);
    if (pulsing) {
      links.forEach((l) => {
        if (!l.on) return;
        l.pulses.forEach((p) => {
          const t = (((now / 2600) + p.off) % 1) * l.total;
          const s = l.segs.find((q) => t <= q.start + q.len) || l.segs[l.segs.length - 1];
          const f = s.len ? (t - s.start) / s.len : 0;
          p.s.position.set(s.x1 + (s.x2 - s.x1) * f, 0.9, s.z1 + (s.z2 - s.z1) * f);
        });
      });
      active = true;
    }
    renderer.render(scene, camera);
    placeLabels();
    idle = active ? 0 : idle + 1;
    if (!visible || idle > 20) { running = false; return; }
    requestAnimationFrame(tick);
  }
  function wake() {
    idle = 0;
    if (!running && visible) { running = true; requestAnimationFrame(tick); }
  }
  controls.addEventListener('change', wake);

  let lastPortrait = null;
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const portrait = camera.aspect < 1;
    if (portrait !== lastPortrait) { lastPortrait = portrait; fit(0); }
    wake();
  }
  if (window.ResizeObserver) new ResizeObserver(resize).observe(stage);
  else window.addEventListener('resize', resize);
  if (window.IntersectionObserver) {
    new IntersectionObserver((en) => { visible = en.some((x) => x.isIntersecting); if (visible) wake(); }).observe(stage);
  }
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; if (visible) wake(); });
  new MutationObserver(() => {
    theme = readTheme(root);
    platform.material.color.set(theme.surface);
    wake();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    if (mq.addEventListener) mq.addEventListener('change', () => { theme = readTheme(root); platform.material.color.set(theme.surface); wake(); });
  }
  if (opts.onProfile) opts.onProfile(() => { paint(); showInfo(); });

  resize();
  paint();
  showInfo();
  const api = {
    select: (id) => { selected = id; bus = null; paint(); showInfo(); },
    bus: (k) => { bus = k; selected = null; paint(); showInfo(); },
    refit: () => fit(400),
    dispose: () => disposeTree(scene),
  };
  root.__placa = api;
  return api;
}
