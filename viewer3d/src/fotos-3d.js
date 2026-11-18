// Modelo 3D do rádio feito com as fotos: uma caixa nas medidas do corpo, com a foto de cada lado,
// e os dois knobs e o conector da antena como peças 3D, com a foto da ponta de cada um.
// A antena em si aparece só nas fotos.
import {
  AmbientLight, BoxGeometry, CanvasTexture, CircleGeometry, CylinderGeometry, DirectionalLight, DoubleSide, EdgesGeometry,
  LineBasicMaterial, LineSegments, Mesh, MeshBasicMaterial, MeshStandardMaterial, Path, PerspectiveCamera, RingGeometry,
  Scene, Shape, ShapeGeometry, Spherical, SRGBColorSpace, TextureLoader, Vector3, WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const W = 128, H = 80, D = 29; // mm, sem os knobs
// id, rótulo, arquivo da foto endireitada, de onde a câmera olha
const LADOS = [
  ['frente', 'Frente', 'dp666-3d-frente.webp', [0.55, 0.28, 1]],
  ['direita', 'Lateral direita', 'dp666-3d-direita.webp', [1, 0.2, 0.12]],
  ['verso', 'Verso', 'dp666-3d-verso.webp', [-0.35, 0.2, -1]],
  ['esquerda', 'Lateral esquerda', 'dp666-3d-esquerda.webp', [-1, 0.2, 0.12]],
  ['topo', 'Topo', 'dp666-3d-topo.webp', [0.12, 1, 0.35]],
  ['fundo', 'Fundo', 'dp666-3d-fundo.webp', [0.12, -1, 0.35]],
];
// ordem das faces da BoxGeometry: +x, −x, +y, −y, +z, −z
const FACES = ['direita', 'esquerda', 'topo', 'fundo', 'frente', 'verso'];
// knobs da lateral direita: foto da ponta, centro e raio na foto endireitada da lateral (10 px por mm)
const KNOBS = [['dp666-3d-knob-tuning.webp', 143, 166, 107], ['dp666-3d-knob-volume.webp', 139, 641, 110]];
const KNOB_LEN = 11.7; // mm para fora da lateral
// conector SMA da antena, no topo: centro da base medido na foto de cima (mm), porca sextavada e corpo rosqueado;
// a altura vem do quanto a ponta se desloca da base na foto
const SMA = { x: -51.7, z: -1.7, porca: 4.5, porcaAlt: 2.2, r: 3.15, alt: 7.8 };
const F = D / 2;
// Onde fica cada controle (mm, com o centro da caixa na origem), medido nas fotos endireitadas:
// p = centro, n = face (z frente, x direita, -x esquerda, -y fundo, y topo), r = marca redonda, ret = marca retangular
const PONTOS = {
  tela: { p: [20, 11, F], n: 'z', ret: [62, 48] },
  teclado: { p: [31.8, -26, F], n: 'z', ret: [42, 24] },
  falante: { p: [-36, 2, F], n: 'z', ret: [40, 46] },
  bw: { p: [5.5, -18.5, F], n: 'z', r: 4.4 },
  mode: { p: [5.5, -26, F], n: 'z', r: 4.4 },
  band: { p: [5.5, -33.5, F], n: 'z', r: 4.4 },
  power: { p: [-6.7, -28, F], n: 'z', r: 4.6 },
  enc: { p: [W / 2 + KNOB_LEN, 23.4, 0.2], n: 'x', r: 11.6 },
  volume: { p: [W / 2 + KNOB_LEN, -24.1, 0.6], n: 'x', r: 11.9 },
  sql: { p: [W / 2, 0.3, 5.1], n: 'x', ret: [5, 17] },
  boot: { p: [-W / 2, 34, 5.5], n: '-x', r: 2.8 },
  fone: { p: [-W / 2, 27.5, 5.2], n: '-x', r: 4.2 },
  usbc: { p: [-W / 2, -33.1, 2.8], n: '-x', ret: [11, 5] },
  chave: { p: [-6.8, -H / 2, 4.7], n: '-y', ret: [9, 5] },
  antena: { p: [SMA.x, H / 2, SMA.z], n: 'y', r: 6 },
};
// de onde a câmera olha para ver cada face (e o giro da marca para ficar deitada nela)
const VISTA = { z: [0.3, 0.2, 1], x: [1, 0.2, 0.35], '-x': [-1, 0.2, 0.35], '-y': [0.15, -1, 0.5], y: [-0.25, 1, 0.7] };
const GIRO = { z: [0, 0, 0], x: [0, Math.PI / 2, 0], '-x': [0, -Math.PI / 2, 0], '-y': [Math.PI / 2, 0, 0], y: [-Math.PI / 2, 0, 0] };
const NORMAL = { z: [0, 0, 1], x: [1, 0, 0], '-x': [-1, 0, 0], '-y': [0, -1, 0], y: [0, 1, 0] };

function contorno(pt, folga = 0) {
  if (pt.r) return new RingGeometry(pt.r - 0.9 + folga, pt.r + folga, 56);
  const [w, h] = pt.ret, t = 0.9;
  const s = new Shape();
  s.moveTo(-w / 2 - folga, -h / 2 - folga); s.lineTo(w / 2 + folga, -h / 2 - folga); s.lineTo(w / 2 + folga, h / 2 + folga); s.lineTo(-w / 2 - folga, h / 2 + folga); s.lineTo(-w / 2 - folga, -h / 2 - folga);
  const b = new Path();
  b.moveTo(-w / 2 + t - folga, -h / 2 + t - folga); b.lineTo(-w / 2 + t - folga, h / 2 - t + folga); b.lineTo(w / 2 - t + folga, h / 2 - t + folga); b.lineTo(w / 2 - t + folga, -h / 2 + t - folga); b.lineTo(-w / 2 + t - folga, -h / 2 + t - folga);
  s.holes.push(b);
  return new ShapeGeometry(s);
}

const TXT = {
  lado: 'Lado do rádio',
  modelo: 'Modelo 3D do rádio feito com as fotos de cada lado. As fotos e a tabela abaixo mostram o mesmo.',
  dica: 'Arraste para girar. Pinça ou roda do mouse para aproximar.',
  dicaCurta: 'Arraste para girar',
  erro: 'Este navegador não conseguiu abrir a visão 3D. As fotos abaixo mostram cada lado.',
};

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// compacto: só o palco, sem os botões de lado (no Início e no simulador dos controles); dica: o "arraste para girar" no canto
export function mountFotos(root, { compacto = false, dica = false } = {}) {
  let stage;
  if (compacto) {
    stage = root.classList.contains('f3-stage') ? root : document.createElement('div');
    if (stage !== root) { stage.className = 'v3-stage f3-stage'; root.innerHTML = ''; root.appendChild(stage); }
    stage.innerHTML = `<canvas class="v3-canvas" role="img" aria-label="${esc(TXT.modelo)}"></canvas>` +
      (dica ? `<span class="f3-dica" aria-hidden="true">${esc(TXT.dicaCurta)}</span>` : '');
  } else {
    root.innerHTML = `
    <div class="v3-tabs" role="tablist" aria-label="${esc(TXT.lado)}">${LADOS.map(([id, nome], i) => `<button type="button" role="tab" class="v3-tab" data-i="${i}" aria-selected="false">${esc(nome)}</button>`).join('')}</div>
    <div class="v3-stage f3-stage"><canvas class="v3-canvas" role="img" aria-label="${esc(TXT.modelo)}"></canvas></div>
    <div class="v3-tools"><span class="v3-hint">${esc(TXT.dica)}</span></div>`;
    stage = root.querySelector('.f3-stage');
  }
  const canvas = stage.querySelector('canvas');
  const tabs = [...root.querySelectorAll('.v3-tab')];

  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (e) {
    stage.innerHTML = `<p class="v3-err">${esc(TXT.erro)}</p>`;
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = SRGBColorSpace;

  const scene = new Scene();
  const camera = new PerspectiveCamera(28, 1, 1, 3000);
  const controls = new OrbitControls(camera, canvas);
  controls.enablePan = false;
  controls.minPolarAngle = 0.05;
  controls.maxPolarAngle = Math.PI - 0.05;
  controls.rotateSpeed = 0.8;

  const loader = new TextureLoader();
  const pasta = new URL('../img/', import.meta.url);
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const mats = FACES.map((id) => {
    const lado = LADOS.find((l) => l[0] === id);
    if (!lado) return new MeshBasicMaterial({ color: 0x25282d });
    const tex = loader.load(new URL(lado[2], pasta).href, wake);
    tex.colorSpace = SRGBColorSpace;
    tex.anisotropy = aniso;
    return new MeshBasicMaterial({ map: tex });
  });
  const caixa = new Mesh(new BoxGeometry(W, H, D), mats);
  scene.add(caixa);
  scene.add(new LineSegments(new EdgesGeometry(caixa.geometry), new LineBasicMaterial({ color: 0x7d858f })));

  // knobs: corpo serrilhado com luz, e a foto do alto do knob na ponta
  scene.add(new AmbientLight(0xffffff, 0.9));
  const sol = new DirectionalLight(0xffffff, 1.6);
  sol.position.set(80, 120, 140);
  scene.add(sol);
  const cv = document.createElement('canvas');
  cv.width = 480; cv.height = 32;
  const cx = cv.getContext('2d');
  cx.fillStyle = '#3b3f45'; cx.fillRect(0, 0, 480, 32);
  cx.fillStyle = '#121417';
  for (let i = 0; i < 480; i += 16) cx.fillRect(i, 0, 5, 32);
  const serrilha = new CanvasTexture(cv);
  serrilha.colorSpace = SRGBColorSpace;
  KNOBS.forEach(([arq, u, v, rpx]) => {
    const r = rpx / 10, y = H / 2 - v / 10, z = D / 2 - u / 10;
    const corpo = new Mesh(new CylinderGeometry(r, r, KNOB_LEN, 64, 1, true),
      new MeshStandardMaterial({ map: serrilha, roughness: 0.55, metalness: 0.25 }));
    corpo.rotation.z = -Math.PI / 2; // eixo do cilindro para fora da lateral (+x)
    corpo.position.set(W / 2 + KNOB_LEN / 2, y, z);
    scene.add(corpo);
    const tex = loader.load(new URL(arq, pasta).href, wake);
    tex.colorSpace = SRGBColorSpace;
    const ponta = new Mesh(new CircleGeometry(r, 64), new MeshBasicMaterial({ map: tex }));
    ponta.rotation.y = Math.PI / 2; // a foto fica virada para fora, sem espelhar
    ponta.position.set(W / 2 + KNOB_LEN + 0.02, y, z);
    scene.add(ponta);
  });

  // conector da antena: porca e corpo dourados (rosca em listras) e a foto da ponta em cima
  const cr = document.createElement('canvas');
  cr.width = 16; cr.height = 64;
  const crx = cr.getContext('2d');
  crx.fillStyle = '#c9a24a'; crx.fillRect(0, 0, 16, 64);
  crx.fillStyle = '#7a5a1c';
  for (let i = 0; i < 64; i += 8) crx.fillRect(0, i, 16, 3);
  const rosca = new CanvasTexture(cr);
  rosca.colorSpace = SRGBColorSpace;
  const ouro = new MeshStandardMaterial({ color: 0xc9a24a, roughness: 0.4, metalness: 0.45 });
  const porca = new Mesh(new CylinderGeometry(SMA.porca, SMA.porca, SMA.porcaAlt, 6), ouro);
  porca.position.set(SMA.x, H / 2 + SMA.porcaAlt / 2, SMA.z);
  const corpoSma = new Mesh(new CylinderGeometry(SMA.r, SMA.r, SMA.alt - SMA.porcaAlt, 40, 1, true),
    new MeshStandardMaterial({ map: rosca, roughness: 0.4, metalness: 0.45 }));
  corpoSma.position.set(SMA.x, H / 2 + (SMA.alt + SMA.porcaAlt) / 2, SMA.z);
  const pontaTex = loader.load(new URL('dp666-3d-sma.webp', pasta).href, wake);
  pontaTex.colorSpace = SRGBColorSpace;
  const pontaSma = new Mesh(new CircleGeometry(SMA.r, 40), new MeshBasicMaterial({ map: pontaTex }));
  pontaSma.rotation.x = -Math.PI / 2; // virada para cima, com o verso para o fundo da foto, como a face do topo
  pontaSma.position.set(SMA.x, H / 2 + SMA.alt + 0.02, SMA.z);
  scene.add(porca, corpoSma, pontaSma);

  // marca de "onde fica": um contorno âmbar e um halo que pulsa algumas vezes
  const corMarca = 0xffb020;
  const marca = new Mesh(new RingGeometry(1, 2, 8), new MeshBasicMaterial({ color: corMarca, side: DoubleSide }));
  const halo = new Mesh(new RingGeometry(1, 2, 8), new MeshBasicMaterial({ color: corMarca, side: DoubleSide, transparent: true, opacity: 0, depthWrite: false }));
  marca.visible = halo.visible = false;
  scene.add(marca, halo);
  let pulso = 0;

  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let dist = 330, anim = null, pending = false;

  function render() {
    pending = false;
    if (anim) {
      const k = Math.min(1, (performance.now() - anim.t0) / anim.ms);
      const e = 1 - Math.pow(1 - k, 3);
      const s = new Spherical(dist, anim.a.phi + (anim.b.phi - anim.a.phi) * e, anim.a.theta + anim.dt * e);
      camera.position.setFromSpherical(s);
      camera.lookAt(0, 0, 0);
      if (k >= 1) { const depois = anim.depois; anim = null; if (depois) depois(); }
    }
    let pulsando = false;
    if (halo.visible) {
      const t = (performance.now() - pulso) / 1000;
      if (t < 2.4 && !reduced) {
        const k = (t % 0.8) / 0.8;
        halo.scale.setScalar(1 + 0.45 * k);
        halo.material.opacity = 0.75 * (1 - k);
        pulsando = true;
      } else halo.visible = false;
    }
    controls.update();
    renderer.render(scene, camera);
    if (anim || pulsando) wake();
  }
  function wake() {
    if (!pending) { pending = true; requestAnimationFrame(render); }
  }
  controls.addEventListener('change', wake);
  controls.addEventListener('start', () => {
    anim = null;
    tabs.forEach((t) => t.setAttribute('aria-selected', 'false'));
    const d = stage.querySelector('.f3-dica');
    if (d) d.classList.add('sai');
  });

  function ver(i, ms = 650) {
    tabs.forEach((t, j) => t.setAttribute('aria-selected', String(i === j)));
    irPara(LADOS[i][3], ms);
  }
  function irPara(dir, ms = 650, depois = null) {
    const alvo = new Vector3(...dir).normalize().multiplyScalar(dist);
    const a = new Spherical().setFromVector3(camera.position);
    const b = new Spherical().setFromVector3(alvo);
    let dt = b.theta - a.theta;
    while (dt > Math.PI) dt -= 2 * Math.PI;
    while (dt < -Math.PI) dt += 2 * Math.PI;
    if (reduced || !ms) { camera.position.copy(alvo); camera.lookAt(0, 0, 0); anim = null; } else anim = { a, b, dt, t0: performance.now(), ms, depois };
    wake();
  }
  tabs.forEach((t, i) => t.addEventListener('click', () => ver(i)));

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    // distância para a caixa inteira caber, com folga, em qualquer proporção da tela
    const r = Math.hypot(W + 2 * KNOB_LEN, H, D) / 2;
    const vf = (camera.fov * Math.PI) / 360;
    const hf = Math.atan(Math.tan(vf) * camera.aspect);
    // a esfera sobra nas telas largas; nas quase quadradas (o "onde fica" no computador) os knobs cortariam, então folga mais
    const folga = camera.aspect < 1.5 ? 0.75 + (1.5 - camera.aspect) * 0.4 : 0.75;
    dist = (r / Math.sin(Math.min(vf, hf))) * folga;
    controls.minDistance = dist * 0.55;
    controls.maxDistance = dist * 1.6;
    camera.position.setLength(dist);
    wake();
  }
  camera.position.set(...LADOS[0][3]).normalize().multiplyScalar(dist);
  camera.lookAt(0, 0, 0);
  if (window.ResizeObserver) new ResizeObserver(resize).observe(stage);
  else window.addEventListener('resize', resize);
  resize();
  ver(0, 0);

  // mostra onde fica um controle: gira até a face dele e marca o lugar
  function mostrar(id) {
    const pt = PONTOS[id];
    marca.visible = halo.visible = false;
    if (!pt) { wake(); return false; }
    marca.geometry.dispose(); halo.geometry.dispose();
    marca.geometry = contorno(pt); halo.geometry = contorno(pt, 0.6);
    const n = new Vector3(...NORMAL[pt.n]);
    const pos = new Vector3(...pt.p).addScaledVector(n, 0.35);
    [marca, halo].forEach((m) => { m.position.copy(pos); m.rotation.set(...GIRO[pt.n]); m.scale.setScalar(1); });
    marca.visible = halo.visible = true;
    pulso = performance.now();
    tabs.forEach((t) => t.setAttribute('aria-selected', 'false'));
    irPara(VISTA[pt.n]);
    return true;
  }
  // ao abrir pelo botão: vira até os knobs e volta, para mostrar que dá para girar (nada, com movimento reduzido)
  function apresentar() {
    if (reduced) return;
    irPara([1, 0.3, 0.42], 1100, () => irPara(LADOS[0][3], 1100));
  }
  return { show: mostrar, apresentar };
}
