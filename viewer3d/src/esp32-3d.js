/*! Visão 3D dos módulos ESP32 do guia do DP-666. Feita com three.js (licença MIT). */
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, BoxGeometry, CylinderGeometry, CircleGeometry,
  MeshStandardMaterial, MeshBasicMaterial, DirectionalLight, AmbientLight, GridHelper, Raycaster,
  Vector2, Vector3, Box3, BufferGeometry, Float32BufferAttribute, LineSegments, LineBasicMaterial,
  LineDashedMaterial, CanvasTexture, Sprite, SpriteMaterial, PMREMGenerator, SRGBColorSpace,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// Medidas em milímetros. Contornos externos dos datasheets da Espressif;
// passo de 1,27 mm e pads de 0,9 × 0,85 mm; o resto é aproximado.
const PITCH = 1.27, PAD_W = 0.9, PAD_L = 0.85, PAD_T = 0.04, PCB_T = 0.8;
const SIDE_OFFSET = 1.5;   // borda de baixo até o centro do pino lateral mais baixo (aproximado)
const BOTTOM_Z = 9.6;      // todos os módulos alinhados pela borda de baixo, como numa troca
const MARGIN = 1.15, TOP_STRIP = 3.6;
const DEFAULT_DIR = new Vector3(0.12, 1.7, 0.85).normalize();

// Paleta validada (CVD e visão normal) sobre a placa escura e sobre as duas superfícies do site.
const C = {
  blue: '#3987e5', orange: '#d95926', aqua: '#199e70',
  sys: '#8b939c', dark: '#3b4148', silver: '#cfd5db', critical: '#d03b3b',
};

const CATS = {
  tela: { label: 'Tela e toque', color: C.blue },
  ctl: { label: 'Controles', color: C.orange },
  radio: { label: 'Rádio, bateria e extras', color: C.aqua },
  sys: { label: 'Energia, USB e gravação', color: C.sys },
  flash: { label: 'Flash interna', color: C.dark },
  livre: { label: 'Sem uso', color: C.silver },
  conf: { label: 'Conflito', color: C.critical, alert: true },
  usb: { label: 'USB nativo', color: C.blue },
  adc1: { label: 'ADC1 (funciona com Wi-Fi)', color: C.aqua },
  res: { label: 'Reservado à PSRAM', color: C.dark },
  geral: { label: 'Uso geral', color: C.silver },
};
const DP_ORDER = ['tela', 'ctl', 'radio', 'conf', 'sys', 'flash', 'livre'];
const S3_ORDER = ['usb', 'adc1', 'res', 'sys', 'geral'];

// Função de cada GPIO no DP-666, pelo código oficial (TEF6686_ESP32.ino e User_Setup.h da wiki).
const DP = {
  34: ['ctl', 'Encoder: fase A'],
  36: ['ctl', 'Encoder: fase B'],
  39: ['ctl', 'Encoder: botão'],
  35: ['ctl', 'Potenciômetro do squelch'],
  4: ['ctl', 'Botão BAND'],
  25: ['ctl', 'Botão BW'],
  26: ['ctl', 'Botão MODE'],
  14: ['ctl', 'Interrupção do teclado (XL9555)'],
  5: ['tela', 'Tela: seleção (CS)'],
  17: ['tela', 'Tela: dado ou comando (DC)'],
  16: ['tela', 'Tela: reset (RST)'],
  18: ['tela', 'SPI: clock da tela e do toque (pino padrão do ESP32)'],
  23: ['tela', 'SPI: dados para a tela (pino padrão do ESP32)'],
  19: ['tela', 'SPI: dados do toque para o ESP32 (pino padrão do ESP32)'],
  32: ['tela', 'Toque: seleção (CS)'],
  33: ['tela', 'Toque: interrupção'],
  2: ['tela', 'Brilho da tela (PWM)'],
  21: ['radio', 'I²C, dados (SDA): sintonizador, teclado e relógio'],
  22: ['radio', 'I²C, clock (SCL): sintonizador, teclado e relógio'],
  13: ['radio', 'Leitura da bateria. Fica no ADC2, que para de ler quando o Wi-Fi liga'],
  15: ['radio', 'Tensão que indica o cristal do sintonizador, lida na partida'],
  27: ['radio', 'Saída para medidor analógico (montagens caseiras)'],
  0: ['sys', 'Modo de gravação (BOOT)'],
  1: ['sys', 'Serial do USB: envia (TX)'],
  3: ['sys', 'Serial do USB: recebe (RX)'],
  12: ['livre', 'Sem uso no código oficial. Não pode estar em nível alto na partida'],
};

const WROOM_PINS = [
  'GND', '3V3', 'EN', 'SENSOR_VP:36', 'SENSOR_VN:39', 'IO34:34', 'IO35:35', 'IO32:32', 'IO33:33', 'IO25:25',
  'IO26:26', 'IO27:27', 'IO14:14', 'IO12:12',
  'GND', 'IO13:13', 'SD2:9', 'SD3:10', 'CMD:11', 'CLK:6', 'SD0:7', 'SD1:8', 'IO15:15', 'IO2:2',
  'IO0:0', 'IO4:4', 'IO16:16', 'IO17:17', 'IO5:5', 'IO18:18', 'IO19:19', 'NC', 'IO21:21', 'RXD0:3', 'TXD0:1',
  'IO22:22', 'IO23:23', 'GND',
];
const WROOM_E_PINS = WROOM_PINS.map((s, i) => (i + 1 >= 17 && i + 1 <= 22 ? 'NC' : s));
const WROVER_PINS = WROOM_PINS.map((s, i) => ((i + 1 >= 17 && i + 1 <= 22) || i + 1 === 27 || i + 1 === 28 ? 'NC' : s));
const S3_PINS = [
  'GND', '3V3', 'EN', 'IO4:4', 'IO5:5', 'IO6:6', 'IO7:7', 'IO15:15', 'IO16:16', 'IO17:17', 'IO18:18', 'IO8:8',
  'IO19:19', 'IO20:20',
  'IO3:3', 'IO46:46', 'IO9:9', 'IO10:10', 'IO11:11', 'IO12:12', 'IO13:13', 'IO14:14', 'IO21:21', 'IO47:47',
  'IO48:48', 'IO45:45',
  'IO0:0', 'IO35:35', 'IO36:36', 'IO37:37', 'IO38:38', 'IO39:39', 'IO40:40', 'IO41:41', 'IO42:42', 'RXD0:44',
  'TXD0:43', 'IO2:2', 'IO1:1', 'GND',
];

function parsePins(list) {
  return list.map((s, i) => {
    const [name, g] = s.split(':');
    return { n: i + 1, name, gpio: g === undefined ? null : Number(g) };
  });
}

function power(p) {
  if (p.name === 'GND') return ['sys', 'Terra (GND)'];
  if (p.name === '3V3') return ['sys', 'Alimentação de 3,3 V'];
  if (p.name === 'EN') return ['sys', 'Reset do ESP32 (EN)'];
  return null;
}

function dpInfo(p) {
  const pw = power(p);
  if (pw) return pw;
  if (p.name === 'NC') return ['livre', 'Sem conexão (NC)'];
  if (p.gpio >= 6 && p.gpio <= 11) return ['flash', 'Ligado à memória flash interna do 32U: não usar. No 32UE, este pino fica sem conexão'];
  return DP[p.gpio] || ['livre', 'Sem uso no código oficial'];
}

function s3Info(p) {
  const pw = power(p);
  if (pw) return pw;
  const g = p.gpio;
  if (p.name === 'RXD0' || p.name === 'TXD0') return ['sys', 'Serial padrão (UART0), usada na gravação'];
  if (g === 0) return ['sys', 'Modo de gravação (BOOT)'];
  if (g === 19) return ['usb', 'USB nativo: D−'];
  if (g === 20) return ['usb', 'USB nativo: D+'];
  if (g >= 1 && g <= 10) return ['adc1', `ADC1, canal ${g - 1}: lê tensão mesmo com o Wi-Fi ligado`];
  if (g >= 35 && g <= 37) return ['res', 'Ligado à PSRAM nas versões com PSRAM octal: não usar'];
  if (g === 3 || g === 45 || g === 46) return ['geral', 'Uso geral; também define o modo na partida'];
  if (g >= 11 && g <= 18) return ['geral', 'Uso geral (ADC2)'];
  return ['geral', 'Uso geral'];
}

const VIEWS = [
  {
    id: 'wroom', tab: '32U/32UE · atual', title: 'ESP32-WROOM-32U / 32UE', size: [18, 19.2, 3.2], layout: [14, 10, 14],
    epad: 39, pins: parsePins(WROOM_PINS), order: DP_ORDER, info: dpInfo,
    desc: '18 × 19,2 × 3,2 mm · 38 pinos · 4 MB de flash, sem PSRAM. O WROOM-32UE nas versões N4, N8 e N16 tem o mesmo formato e os pinos que o DP-666 usa nos mesmos lugares: é a troca direta.',
  },
  {
    id: 'r2', tab: '32UE com PSRAM', title: 'ESP32-WROOM-32UE-N4R2, N8R2 e N16R2', size: [18, 19.2, 3.2], layout: [14, 10, 14],
    epad: 39, pins: parsePins(WROOM_E_PINS), order: DP_ORDER,
    info: (p) => {
      if (p.gpio === 16) return ['conf', 'Nas versões com PSRAM (R2), este pino fica preso a ela. No DP-666, ele é o reset (RST) da tela.'];
      if (p.n >= 17 && p.n <= 22) return ['livre', 'Sem conexão: a flash fica dentro do módulo'];
      return dpInfo(p);
    },
    desc: 'Mesmo formato e 2 MB de PSRAM dentro do chip. O pino 27 (GPIO 16) fica preso à PSRAM, e no DP-666 ele é o reset da tela.',
  },
  {
    id: 'wrover', tab: 'WROVER-IE', title: 'ESP32-WROVER-IE', size: [18, 31.4, 3.3], layout: [14, 10, 14],
    epad: 39, pins: parsePins(WROVER_PINS), order: DP_ORDER, outline: true,
    info: (p) => {
      if (p.n === 27) return ['conf', 'Sem conexão no WROVER: o GPIO 16 vai para a PSRAM interna. No DP-666, este pino é o reset (RST) da tela.'];
      if (p.n === 28) return ['conf', 'Sem conexão no WROVER: o GPIO 17 vai para a PSRAM interna. No DP-666, este pino é o dado ou comando (DC) da tela.'];
      if (p.n >= 17 && p.n <= 22) return ['livre', 'Sem conexão: a flash e a PSRAM ficam dentro do módulo'];
      return dpInfo(p);
    },
    desc: '18 × 31,4 × 3,3 mm · 38 pinos · até 16 MB de flash e 8 MB de PSRAM. É 12,2 mm mais longo que o espaço do módulo atual (tracejado), e os pinos 27 e 28 ficam sem conexão.',
  },
  {
    id: 's3', tab: 'S3-WROOM-1U', title: 'ESP32-S3-WROOM-1U', size: [18, 19.2, 3.2], layout: [14, 12, 14],
    epad: 41, pins: parsePins(S3_PINS), order: S3_ORDER, outline: true, info: s3Info,
    desc: 'Mesmo tamanho do atual (tracejado), mas com 41 pinos em outra ordem: não encaixa na placa do DP-666. Até 16 MB de flash e de PSRAM, USB nativo e só Bluetooth LE.',
  },
];

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function pinLabel(p) {
  if (p.epad) return `${p.name}, por baixo`;
  if (p.gpio !== null && !p.name.startsWith('IO')) return `${p.name} / GPIO ${p.gpio}`;
  return p.name;
}

function swatch(cat) {
  const c = CATS[cat];
  return `<i class="v3-sw${c.alert ? ' v3-sw-alert' : ''}" style="background:${c.color}" aria-hidden="true">${c.alert ? '!' : ''}</i>`;
}

function alertTexture() {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 128;
  const x = cv.getContext('2d');
  x.fillStyle = C.critical;
  x.beginPath(); x.arc(64, 64, 54, 0, Math.PI * 2); x.fill();
  x.lineWidth = 9; x.strokeStyle = '#ffffff'; x.stroke();
  x.fillStyle = '#ffffff';
  x.font = 'bold 80px system-ui, -apple-system, "Segoe UI", sans-serif';
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText('!', 64, 68);
  const t = new CanvasTexture(cv);
  t.colorSpace = SRGBColorSpace;
  return t;
}

function buildModule(view) {
  const [W, L, H] = view.size;
  const [nL, nB, nR] = view.layout;
  const zB = BOTTOM_Z, zT = BOTTOM_Z - L;
  const group = new Group();
  const pads = [], pickables = [], markers = [];

  const pcb = new Mesh(new BoxGeometry(W, PCB_T, L), new MeshStandardMaterial({ color: '#1c2420', roughness: 0.78, metalness: 0.05 }));
  pcb.position.set(0, PCB_T / 2, zB - L / 2);
  group.add(pcb);

  const canW = W - 2 * MARGIN, canZ0 = zT + TOP_STRIP, canZ1 = zB - MARGIN, canH = H - PCB_T;
  const can = new Mesh(
    new BoxGeometry(canW, canH, canZ1 - canZ0),
    new MeshStandardMaterial({ color: '#d3d7dc', metalness: 0.85, roughness: 0.34 }),
  );
  can.position.set(0, PCB_T + canH / 2, (canZ0 + canZ1) / 2);
  group.add(can);

  // conector de antena U.FL (posição aproximada)
  const gold = new MeshStandardMaterial({ color: '#d9c27a', metalness: 0.9, roughness: 0.3 });
  const ufl = new Group();
  const base = new Mesh(new BoxGeometry(2.6, 0.3, 2.6), new MeshStandardMaterial({ color: '#e7dcc4', roughness: 0.6 }));
  base.position.y = 0.15;
  const ring = new Mesh(new CylinderGeometry(1.0, 1.0, 0.9, 40), gold);
  ring.position.y = 0.75;
  const hole = new Mesh(new CylinderGeometry(0.72, 0.72, 0.92, 40), new MeshStandardMaterial({ color: '#2a2d31', roughness: 0.85 }));
  hole.position.y = 0.76;
  const center = new Mesh(new CylinderGeometry(0.18, 0.18, 0.95, 16), gold);
  center.position.y = 0.77;
  ufl.add(base, ring, hole, center);
  ufl.position.set(W / 2 - 2.9, PCB_T, zT + 1.9);
  group.add(ufl);
  const uflRec = { ufl: true };
  ufl.children.forEach((m) => { m.userData.rec = uflRec; pickables.push(m); });

  const gSide = new BoxGeometry(PAD_L, PAD_T, PAD_W), gBottom = new BoxGeometry(PAD_W, PAD_T, PAD_L);
  const eSide = new BoxGeometry(PAD_T, PCB_T + 0.004, 0.6), eBottom = new BoxGeometry(0.6, PCB_T + 0.004, PAD_T);

  const addPad = (p, top, edges) => {
    const [cat, text] = view.info(p);
    const color = CATS[cat].color;
    const mat = new MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.22, metalness: 0.3, roughness: 0.42, transparent: true });
    const meshes = [top, ...edges];
    meshes.forEach((m) => { m.material = mat; group.add(m); pickables.push(m); });
    const rec = { ...p, cat, text, mat, meshes, baseY: top.position.y, lift: p.epad ? -0.06 : 0.08 };
    meshes.forEach((m) => { m.userData.rec = rec; });
    pads.push(rec);
    return rec;
  };

  for (const p of view.pins) {
    let x, z, side;
    if (p.n <= nL) { side = 'L'; x = -W / 2 + PAD_L / 2; z = zB - SIDE_OFFSET - (nL - p.n) * PITCH; }
    else if (p.n <= nL + nB) { side = 'B'; x = -((nB - 1) * PITCH) / 2 + (p.n - nL - 1) * PITCH; z = zB - PAD_L / 2; }
    else { side = 'R'; x = W / 2 - PAD_L / 2; z = zB - SIDE_OFFSET - (p.n - nL - nB - 1) * PITCH; }
    const top = new Mesh(side === 'B' ? gBottom : gSide);
    top.position.set(x, PCB_T + PAD_T / 2, z);
    const edge = new Mesh(side === 'B' ? eBottom : eSide);
    if (side === 'B') edge.position.set(x, PCB_T / 2, zB + PAD_T / 2);
    else edge.position.set(side === 'L' ? -W / 2 - PAD_T / 2 : W / 2 + PAD_T / 2, PCB_T / 2, z);
    const rec = addPad(p, top, [edge]);
    if (rec.cat === 'conf') {
      const out = side === 'L' ? new Vector3(-2.2, 0, 0) : side === 'R' ? new Vector3(2.2, 0, 0) : new Vector3(0, 0, 2.2);
      const tip = new Vector3(x, PCB_T + 0.05, z);
      const at = tip.clone().add(out).add(new Vector3(0, H + 1.2, 0));
      const sp = new Sprite(new SpriteMaterial({ map: alertTexture(), depthTest: false }));
      sp.renderOrder = 10;
      sp.position.copy(at);
      sp.scale.setScalar(1.25);
      const lg = new BufferGeometry();
      lg.setAttribute('position', new Float32BufferAttribute([tip.x, tip.y, tip.z, at.x, at.y, at.z], 3));
      const line = new LineSegments(lg, new LineBasicMaterial({ color: C.critical }));
      group.add(sp, line);
      markers.push(sp);
    }
  }

  // pad de terra central, por baixo
  const ep = new Mesh(new BoxGeometry(3.7, PAD_T, 3.7));
  ep.position.set(0, -PAD_T / 2, zB - SIDE_OFFSET - ((nL - 1) * PITCH) / 2);
  addPad({ n: view.epad, name: 'GND', gpio: null, epad: true }, ep, []).text =
    'Terra (GND): pad central, por baixo do módulo. É ele que exige estação de ar quente numa troca.';

  // marca do pino 1
  const p1z = zB - SIDE_OFFSET - (nL - 1) * PITCH;
  const onCan = p1z > canZ0 + 0.6;
  const dot = new Mesh(new CircleGeometry(0.32, 24), new MeshBasicMaterial({ color: '#f2f4f6' }));
  dot.rotation.x = -Math.PI / 2;
  dot.position.set(onCan ? -canW / 2 + 0.9 : -W / 2 + 1.6, (onCan ? H : PCB_T) + 0.004, p1z);
  group.add(dot);

  return { group, pads, pickables, markers, W, H, occluders: [pcb, can] };
}

function makeOutline(y, color) {
  const o = 0.5, x0 = -9 - o, x1 = 9 + o, z0 = BOTTOM_Z - 19.2 - o, z1 = BOTTOM_Z + o;
  const pts = [x0, y, z0, x1, y, z0, x1, y, z0, x1, y, z1, x1, y, z1, x0, y, z1, x0, y, z1, x0, y, z0];
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(pts, 3));
  const ls = new LineSegments(geo, new LineDashedMaterial({ color, dashSize: 1.1, gapSize: 0.7, depthTest: false, transparent: true, opacity: 0.9 }));
  ls.renderOrder = 5;
  ls.computeLineDistances();
  return ls;
}

function disposeTree(o) {
  o.traverse((n) => {
    if (n.geometry) n.geometry.dispose();
    if (n.material) {
      (Array.isArray(n.material) ? n.material : [n.material]).forEach((m) => { if (m.map) m.map.dispose(); m.dispose(); });
    }
  });
}

function readTheme(el) {
  const cs = getComputedStyle(el);
  const v = (n, d) => (cs.getPropertyValue(n) || '').trim() || d;
  return { rule: v('--rule', '#e2e6eb'), muted: v('--muted', '#5b6470'), accent: v('--accent', '#0f6e6e') };
}

export function mount(root) {
  if (root.__v3) return root.__v3;
  const ui = root.querySelector('.v3-ui') || root;
  ui.innerHTML = `
    <div class="v3-tabs" role="tablist" aria-label="Módulo">${VIEWS.map((v, i) => `<button type="button" role="tab" class="v3-tab" data-i="${i}" aria-selected="false">${esc(v.tab)}</button>`).join('')}</div>
    <p class="v3-desc" aria-live="polite"></p>
    <div class="v3-stage"><canvas class="v3-canvas" role="img" aria-label="Modelo 3D do módulo ESP32 selecionado. A legenda abaixo lista os pinos de cada categoria."></canvas></div>
    <div class="v3-tools">
      <button type="button" class="v3-btn" data-act="flip" aria-pressed="false">Virar o módulo</button>
      <button type="button" class="v3-btn" data-act="reset">Recentralizar</button>
      <span class="v3-hint">Arraste para girar. Pinça ou roda do mouse para aproximar.</span>
    </div>
    <div class="v3-legend" role="group" aria-label="Legenda: toque numa categoria para destacar e listar os pinos"></div>
    <p class="v3-info" aria-live="polite"></p>`;
  const stage = ui.querySelector('.v3-stage');
  const canvas = ui.querySelector('canvas');
  const desc = ui.querySelector('.v3-desc');
  const legend = ui.querySelector('.v3-legend');
  const info = ui.querySelector('.v3-info');
  const tabs = [...ui.querySelectorAll('.v3-tab')];
  const flipBtn = ui.querySelector('[data-act="flip"]');

  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch (err) {
    stage.innerHTML = '<p class="v3-err">Este navegador não conseguiu abrir a visão 3D. A tabela abaixo tem as mesmas informações.</p>';
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  scene.add(new AmbientLight(0xffffff, 0.25));
  const sun = new DirectionalLight(0xffffff, 1.1);
  sun.position.set(18, 40, 26);
  scene.add(sun);

  const camera = new PerspectiveCamera(35, 1, 0.5, 600);
  camera.position.copy(DEFAULT_DIR).multiplyScalar(60);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.12;
  controls.minDistance = 10;
  controls.maxDistance = 160;
  controls.maxPolarAngle = Math.PI * 0.47;
  controls.screenSpacePanning = true;

  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let theme = readTheme(root);
  let grid = null, outline = null;
  let view = null, viewIndex = 0, built = null;
  let selected = null, hovered = null, isolate = null;
  let anim = null, pulseUntil = 0;
  const flip = { cur: 0, to: 0 };
  let running = false, idle = 0, visible = true;

  function makeGrid() {
    if (grid) { scene.remove(grid); disposeTree(grid); }
    grid = new GridHelper(80, 16, theme.rule, theme.rule);
    grid.position.set(0, -0.02, -4);
    scene.add(grid);
  }

  function applyFlip(a) {
    if (!built) return;
    built.group.rotation.z = a;
    built.group.position.y = (built.W / 2) * Math.sin(a) - Math.min(0, built.H * Math.cos(a));
  }

  function fit(ms, resetDir) {
    const box = new Box3().setFromObject(built.group);
    const size = box.getSize(new Vector3());
    const target = box.getCenter(new Vector3());
    const radius = Math.max(size.x, size.z) / 2 + 1.2;
    const t = Math.tan((camera.fov * Math.PI) / 360);
    const dist = Math.max(radius / t, radius / (t * camera.aspect)) * 1.12;
    const dir = resetDir ? DEFAULT_DIR.clone() : camera.position.clone().sub(controls.target).normalize();
    const pos = target.clone().add(dir.multiplyScalar(dist));
    if (!ms || reduced) {
      camera.position.copy(pos); controls.target.copy(target); controls.update();
    } else {
      anim = { t0: performance.now(), ms, p0: camera.position.clone(), t0v: controls.target.clone(), p1: pos, t1: target };
    }
    wake();
  }

  function padState(rec) {
    const dim = isolate && rec.cat !== isolate;
    rec.mat.opacity = dim ? 0.16 : 1;
    rec.mat.emissiveIntensity = rec === selected ? 0.95 : rec === hovered ? 0.6 : 0.22;
    rec.meshes[0].position.y = rec.baseY + (rec === selected ? rec.lift : 0);
  }
  const refreshPads = () => built.pads.forEach(padState);

  function renderLegend() {
    const counts = {};
    built.pads.forEach((p) => { counts[p.cat] = (counts[p.cat] || 0) + 1; });
    legend.innerHTML = view.order.filter((k) => counts[k]).map((k) =>
      `<button type="button" class="v3-chip" data-cat="${k}" aria-pressed="${isolate === k}">${swatch(k)}${esc(CATS[k].label)}<span class="v3-n">${counts[k]}</span></button>`).join('');
  }

  function showInfo() {
    if (selected && selected.ufl) {
      info.innerHTML = '<strong>Conector de antena (U.FL ou IPEX)</strong><br>Recebe o cabo da antena de Wi-Fi e Bluetooth. A posição no desenho é aproximada.';
    } else if (selected) {
      const p = selected;
      info.innerHTML = `<strong>Pino ${p.n} · ${esc(pinLabel(p))}</strong><span class="v3-tag">${swatch(p.cat)}${esc(CATS[p.cat].label)}</span><br>${esc(p.text)}`;
    } else if (isolate) {
      const list = built.pads.filter((p) => p.cat === isolate).sort((a, b) => a.n - b.n).map((p) => `${p.n} (${pinLabel(p)})`);
      info.innerHTML = `<strong>${esc(CATS[isolate].label)}</strong>: ${list.length === 1 ? 'pino' : 'pinos'} ${esc(list.join(', '))}.`;
    } else {
      info.innerHTML = `<span class="v3-muted">Toque num pino para ver o que ele faz${view.id === 's3' ? '' : ' no DP-666'}, ou numa categoria da legenda para listar os pinos dela.</span>`;
    }
  }

  function setView(i, first) {
    viewIndex = i; view = VIEWS[i];
    selected = hovered = isolate = null;
    if (built) { scene.remove(built.group); disposeTree(built.group); }
    if (outline) { scene.remove(outline); disposeTree(outline); outline = null; }
    built = buildModule(view);
    scene.add(built.group);
    flip.cur = flip.to = 0; applyFlip(0);
    flipBtn.setAttribute('aria-pressed', 'false'); flipBtn.textContent = 'Virar o módulo';
    if (view.outline) { outline = makeOutline(0.02, theme.accent); scene.add(outline); }
    tabs.forEach((t, k) => t.setAttribute('aria-selected', String(k === i)));
    desc.innerHTML = `<strong>${esc(view.title)}</strong> · ${esc(view.desc)}`;
    refreshPads(); renderLegend(); showInfo();
    pulseUntil = built.markers.length && !reduced ? performance.now() + 8000 : 0;
    fit(first ? 0 : 450, !!first);
  }

  // escolher pino: raio primeiro; se errar por pouco (dedo), o pino mais próximo na tela
  const ray = new Raycaster(), ndc = new Vector2(), tmp = new Vector3();
  function pick(ev, touch) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects([...built.occluders, ...built.pickables], false)[0];
    if (hit && hit.object.userData.rec) return hit.object.userData.rec;
    let best = null, bestD = touch ? 22 : 9;
    for (const p of built.pads) {
      if (p.epad && flip.to === 0) continue;
      p.meshes[0].getWorldPosition(tmp).project(camera);
      const sx = ((tmp.x + 1) / 2) * r.width + r.left, sy = ((1 - tmp.y) / 2) * r.height + r.top;
      const d = Math.hypot(sx - ev.clientX, sy - ev.clientY);
      if (d < bestD) { bestD = d; best = p; }
    }
    return best;
  }

  let down = null;
  canvas.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY }; wake(); });
  canvas.addEventListener('pointerup', (e) => {
    if (!down) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
    down = null;
    if (moved > 6) return;
    const rec = pick(e, e.pointerType !== 'mouse');
    selected = rec && rec === selected ? null : rec;
    if (selected && !selected.ufl && isolate && selected.cat !== isolate) isolate = null;
    refreshPads(); renderLegend(); showInfo(); wake();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || e.buttons) return;
    const rec = pick(e, false);
    const pad = rec && !rec.ufl ? rec : null;
    canvas.style.cursor = rec ? 'pointer' : '';
    if (pad !== hovered) { hovered = pad; refreshPads(); wake(); }
  });
  canvas.addEventListener('pointerleave', () => { if (hovered) { hovered = null; refreshPads(); wake(); } });

  ui.querySelector('.v3-tabs').addEventListener('click', (e) => {
    const b = e.target.closest('.v3-tab');
    if (b && Number(b.dataset.i) !== viewIndex) setView(Number(b.dataset.i));
  });
  legend.addEventListener('click', (e) => {
    const b = e.target.closest('.v3-chip');
    if (!b) return;
    isolate = isolate === b.dataset.cat ? null : b.dataset.cat;
    selected = null;
    refreshPads(); renderLegend(); showInfo(); wake();
  });
  ui.querySelector('.v3-tools').addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    if (b.dataset.act === 'flip') {
      flip.to = flip.to ? 0 : Math.PI;
      if (reduced) { flip.cur = flip.to; applyFlip(flip.cur); }
      flipBtn.setAttribute('aria-pressed', String(!!flip.to));
      flipBtn.textContent = flip.to ? 'Desvirar' : 'Virar o módulo';
      wake();
    } else {
      fit(450, true);
    }
  });

  function tick(now) {
    let active = false;
    if (anim) {
      const k = Math.min(1, (now - anim.t0) / anim.ms), e = 1 - Math.pow(1 - k, 3);
      camera.position.lerpVectors(anim.p0, anim.p1, e);
      controls.target.lerpVectors(anim.t0v, anim.t1, e);
      if (k >= 1) anim = null;
      active = true;
    }
    if (flip.cur !== flip.to) {
      const step = 0.09 * Math.sign(flip.to - flip.cur);
      flip.cur = Math.abs(flip.to - flip.cur) <= Math.abs(step) ? flip.to : flip.cur + step;
      applyFlip(flip.cur);
      active = true;
    }
    if (controls.update()) active = true;
    if (built && built.markers.length) {
      const pulsing = now < pulseUntil;
      const s = pulsing ? 1.25 + 0.12 * Math.sin(now / 160) : 1.25;
      built.markers.forEach((m) => { m.scale.setScalar(s); m.visible = flip.cur === 0; });
      built.pads.forEach((p) => { if (p.cat === 'conf' && p !== selected) p.mat.emissiveIntensity = pulsing ? 0.45 + 0.35 * Math.sin(now / 160) : 0.5; });
      if (pulsing) active = true;
    }
    renderer.render(scene, camera);
    idle = active ? 0 : idle + 1;
    if (!visible || idle > 24) { running = false; return; }
    requestAnimationFrame(tick);
  }
  function wake() {
    idle = 0;
    if (!running && visible) { running = true; requestAnimationFrame(tick); }
  }

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    wake();
  }
  if (window.ResizeObserver) new ResizeObserver(resize).observe(stage);
  else window.addEventListener('resize', resize);
  if (window.IntersectionObserver) {
    new IntersectionObserver((entries) => {
      visible = entries.some((en) => en.isIntersecting);
      if (visible) wake();
    }).observe(stage);
  }
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; if (visible) wake(); });

  const onTheme = () => {
    theme = readTheme(root);
    makeGrid();
    if (outline) outline.material.color.set(theme.accent);
    wake();
  };
  new MutationObserver(onTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    if (mq.addEventListener) mq.addEventListener('change', onTheme);
  }

  makeGrid();
  resize();
  setView(0, true);

  const api = {
    setView: (i) => setView(i),
    select: (n) => { selected = built.pads.find((p) => p.n === n) || null; refreshPads(); renderLegend(); showInfo(); wake(); },
    isolate: (k) => { isolate = k; selected = null; refreshPads(); renderLegend(); showInfo(); wake(); },
    flip: () => flipBtn.click(),
    padPoint: (n) => {
      const p = built.pads.find((q) => q.n === n);
      if (!p) return null;
      const r = canvas.getBoundingClientRect();
      p.meshes[0].getWorldPosition(tmp).project(camera);
      return { x: ((tmp.x + 1) / 2) * r.width + r.left, y: ((1 - tmp.y) / 2) * r.height + r.top };
    },
  };
  root.__v3 = api;
  return api;
}
