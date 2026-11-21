// Regressão visual do catálogo de componentes: fotografa cada seção de site/preview/catalogo.html, no celular e
// no computador, e compara com as imagens de referência em testes/referencia/.
//
//   python3 site/build.py                         gere o site antes
//   node testes/regressao-visual.mjs              compara; sai com erro se alguma seção mudou
//   node testes/regressao-visual.mjs --atualizar  grava as fotos atuais como referência
//
// Quando algo muda, a foto nova e a diferença (em vermelho) ficam em testes/saida/. O navegador é o da variável
// CHROME ou o Chrome instalado no lugar de costume. As fontes vêm do próprio site, e tudo o que fica fora dele é
// bloqueado, para a foto não depender da rede. O desenho das letras ainda varia um pouco de um sistema para outro;
// por isso as referências valem para a máquina onde foram feitas: numa máquina nova, grave as referências com
// --atualizar antes de mexer no código.
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import { AQUI, SITE, chrome, servir } from './comum.mjs';

const REF = path.join(AQUI, 'referencia');
const SAIDA = path.join(AQUI, 'saida');
const ATUALIZAR = process.argv.includes('--atualizar');
const TELAS = [['pc', 1100, 900], ['cel', 390, 844]];
const TOLERANCIA = 16;     // diferença aceita em cada canal de cor (bordas suavizadas)
const LIMITE = 0.0005;     // fração de pixels diferentes aceita numa seção

// compara duas fotos PNG dentro do navegador (canvas), sem precisar de outra biblioteca
async function comparar(pagina, antes, depois) {
  return pagina.evaluate(async (a64, b64, tol) => {
    const abrir = (b) => new Promise((ok, erro) => { const i = new Image(); i.onload = () => ok(i); i.onerror = erro; i.src = 'data:image/png;base64,' + b; });
    const [a, b] = await Promise.all([abrir(a64), abrir(b64)]);
    if (a.width !== b.width || a.height !== b.height) return { tamanho: `${a.width}×${a.height} → ${b.width}×${b.height}` };
    const tela = (img) => { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0); return [c, x]; };
    const da = tela(a)[1].getImageData(0, 0, a.width, a.height).data;
    const [cb, xb] = tela(b);
    const db = xb.getImageData(0, 0, b.width, b.height);
    let n = 0;
    for (let i = 0; i < da.length; i += 4) {
      const muda = Math.abs(da[i] - db.data[i]) > tol || Math.abs(da[i + 1] - db.data[i + 1]) > tol || Math.abs(da[i + 2] - db.data[i + 2]) > tol;
      if (muda) { n++; db.data[i] = 230; db.data[i + 1] = 0; db.data[i + 2] = 0; db.data[i + 3] = 255; }
      else { db.data[i + 3] = 70; }   // o que não mudou fica apagado
    }
    xb.putImageData(db, 0, 0);
    return { n, total: a.width * a.height, marcas: n ? cb.toDataURL('image/png').split(',')[1] : null };
  }, antes.toString('base64'), depois.toString('base64'), TOLERANCIA);
}

if (!fs.existsSync(path.join(SITE, 'catalogo.html'))) { console.error('Falta site/preview/catalogo.html. Gere o site antes: python3 site/build.py'); process.exit(2); }
const { servidor, url: raiz } = await servir();   // SITE=pasta: outro build
const url = raiz + 'catalogo.html';
const navegador = await puppeteer.launch({ executablePath: chrome(), headless: true, args: ['--no-sandbox', '--font-render-hinting=none'] });
fs.mkdirSync(REF, { recursive: true });
fs.rmSync(SAIDA, { recursive: true, force: true });
const conta = { iguais: 0, gravadas: 0, mudaram: 0 };
const comparador = await navegador.newPage();
try {
  for (const [tela, largura, altura] of TELAS) {
    const p = await navegador.newPage();
    await p.setViewport({ width: largura, height: altura, deviceScaleFactor: 1 });
    await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }, { name: 'prefers-reduced-motion', value: 'reduce' }]);
    await p.setRequestInterception(true);
    p.on('request', (r) => (r.url().startsWith('http://127.0.0.1:') ? r.continue() : r.abort()));
    await p.goto(url, { waitUntil: 'load' });
    await p.evaluate(() => document.fonts.ready);
    // data-telas="pc" numa seção: ela só é fotografada nessas telas (a dos temas do rádio, longa demais no celular)
    const ids = await p.$$eval('.cat-sec', (ss, t) => ss.filter((e) => !e.dataset.telas || e.dataset.telas.split(' ').includes(t)).map((e) => e.id), tela);
    for (const id of ids) {
      // cada seção sozinha no alto da página: a foto não depende do que vem antes dela
      await p.evaluate((i) => {
        document.querySelectorAll('.cat-topo, .cat-sec').forEach((e) => { e.style.display = e.id === i ? '' : 'none'; });
        window.scrollTo(0, 0);
      }, id);
      const secao = await p.$('#' + id);
      const nome = `${tela}-${id}.png`;
      const ref = path.join(REF, nome);
      const foto = Buffer.from(await secao.screenshot());
      if (ATUALIZAR || !fs.existsSync(ref)) { fs.writeFileSync(ref, foto); conta.gravadas++; continue; }
      const r = await comparar(comparador, fs.readFileSync(ref), foto);
      const fora = r.tamanho || r.n / r.total > LIMITE;
      if (!fora) { conta.iguais++; continue; }
      conta.mudaram++;
      fs.mkdirSync(SAIDA, { recursive: true });
      fs.writeFileSync(path.join(SAIDA, nome), foto);
      if (r.marcas) fs.writeFileSync(path.join(SAIDA, nome.replace('.png', '-diferenca.png')), Buffer.from(r.marcas, 'base64'));
      console.log(`mudou: ${nome} (${r.tamanho ? 'tamanho ' + r.tamanho : r.n + ' pixels'})`);
    }
    await p.close();
  }
} finally {
  await navegador.close();
  servidor.close();
}
console.log(`regressão visual: ${conta.iguais} iguais, ${conta.mudaram} mudaram, ${conta.gravadas} gravadas como referência`);
if (conta.mudaram) { console.log(`As fotos novas e as diferenças estão em ${path.relative(process.cwd(), SAIDA) || SAIDA}.`); process.exit(1); }
