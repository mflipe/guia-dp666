// Modelo 3D do rádio feito com as fotos: uma caixa nas medidas do corpo, com a foto de cada lado,
// e os dois knobs como peças 3D, com a foto do alto de cada um na ponta.
// A antena aparece só na foto, e o topo ainda não tem foto.
import {
  AmbientLight, BoxGeometry, CanvasTexture, CircleGeometry, CylinderGeometry, DirectionalLight, EdgesGeometry,
  LineBasicMaterial, LineSegments, Mesh, MeshBasicMaterial, MeshStandardMaterial,
  PerspectiveCamera, Scene, Spherical, SRGBColorSpace, TextureLoader, Vector3, WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const W = 128, H = 80, D = 29; // mm, sem os knobs
// id, rótulo, arquivo da foto endireitada, de onde a câmera olha
const LADOS = [
  ['frente', 'Frente', 'dp666-3d-frente.webp', [0.55, 0.28, 1]],
  ['direita', 'Lateral direita', 'dp666-3d-direita.webp', [1, 0.2, 0.12]],
  ['verso', 'Verso', 'dp666-3d-verso.webp', [-0.35, 0.2, -1]],
  ['esquerda', 'Lateral esquerda', 'dp666-3d-esquerda.webp', [-1, 0.2, 0.12]],
  ['fundo', 'Fundo', 'dp666-3d-fundo.webp', [0.12, -1, 0.35]],
];
// ordem das faces da BoxGeometry: +x, −x, +y (topo, sem foto), −y, +z, −z
const FACES = ['direita', 'esquerda', null, 'fundo', 'frente', 'verso'];
// knobs da lateral direita: foto da ponta, centro e raio na foto endireitada da lateral (10 px por mm)
const KNOBS = [['dp666-3d-knob-tuning.webp', 143, 166, 107], ['dp666-3d-knob-volume.webp', 139, 641, 110]];
const KNOB_LEN = 11.7; // mm para fora da lateral

const TXT = {
  lado: 'Lado do rádio',
  modelo: 'Modelo 3D do rádio feito com as fotos de cada lado. As fotos e a tabela abaixo mostram o mesmo.',
  dica: 'Arraste para girar. Pinça ou roda do mouse para aproximar.',
  erro: 'Este navegador não conseguiu abrir a visão 3D. As fotos abaixo mostram cada lado.',
};

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function mountFotos(root) {
  root.innerHTML = `
    <div class="v3-tabs" role="tablist" aria-label="${esc(TXT.lado)}">${LADOS.map(([id, nome], i) => `<button type="button" role="tab" class="v3-tab" data-i="${i}" aria-selected="false">${esc(nome)}</button>`).join('')}</div>
    <div class="v3-stage f3-stage"><canvas class="v3-canvas" role="img" aria-label="${esc(TXT.modelo)}"></canvas></div>
    <div class="v3-tools"><span class="v3-hint">${esc(TXT.dica)}</span></div>`;
  const stage = root.querySelector('.f3-stage');
  const canvas = root.querySelector('canvas');
  const tabs = [...root.querySelectorAll('.v3-tab')];

  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (e) {
    stage.innerHTML = `<p class="v3-err">${esc(TXT.erro)}</p>`;
    return;
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
      if (k >= 1) anim = null;
    }
    controls.update();
    renderer.render(scene, camera);
    if (anim) wake();
  }
  function wake() {
    if (!pending) { pending = true; requestAnimationFrame(render); }
  }
  controls.addEventListener('change', wake);
  controls.addEventListener('start', () => { anim = null; tabs.forEach((t) => t.setAttribute('aria-selected', 'false')); });

  function ver(i, ms = 650) {
    tabs.forEach((t, j) => t.setAttribute('aria-selected', String(i === j)));
    const alvo = new Vector3(...LADOS[i][3]).normalize().multiplyScalar(dist);
    const a = new Spherical().setFromVector3(camera.position);
    const b = new Spherical().setFromVector3(alvo);
    let dt = b.theta - a.theta;
    while (dt > Math.PI) dt -= 2 * Math.PI;
    while (dt < -Math.PI) dt += 2 * Math.PI;
    if (reduced || !ms) { camera.position.copy(alvo); camera.lookAt(0, 0, 0); anim = null; } else anim = { a, b, dt, t0: performance.now(), ms };
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
    dist = (r / Math.sin(Math.min(vf, hf))) * 0.75;
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
}
