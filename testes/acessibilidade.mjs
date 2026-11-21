// Acessibilidade: o axe-core (as regras WCAG 2.1 A e AA e as boas práticas) confere cada página do guia interativo
// e cada página de leitura, nos dois idiomas, no tema claro e no escuro, e também os estados abertos: o menu, o
// rádio virtual, a busca de códigos com resultados, um ajuste aberto e uma categoria de problema aberta. Qualquer
// violação conta como falha.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { navegador, isolar, relatorio, sleep, sozinho, esperar, CELULAR, COMPUTADOR } from './comum.mjs';

const require = createRequire(import.meta.url);
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

export async function rodar(url) {
  const r = relatorio('Acessibilidade (axe-core)');
  const b = await navegador();
  const p = await b.newPage();
  const erros = [];
  await isolar(p, erros);
  await p.setViewport(COMPUTADOR);

  async function auditar(onde) {
    await p.evaluate(AXE);
    return p.evaluate(async () => {
      const res = await axe.run(document, { resultTypes: ['violations'] });
      return res.violations.map((v) => `${v.id} [${v.impact}] ${v.nodes.length}×: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`);
    }).then((v) => v.map((x) => onde + ': ' + x));
  }
  const tema = (t) => p.evaluate((x) => localStorage.setItem('dp666.tema', x), t);

  await p.goto(url, { waitUntil: 'networkidle0' });
  const rotas = await p.$$eval('article.page', (a) => a.map((x) => x.dataset.route));
  for (const [lingua, temas] of [['', ['claro', 'escuro']], ['en/', ['claro']]]) {
    for (const t of temas) {
      await p.goto(url + lingua, { waitUntil: 'networkidle0' });
      await tema(t);
      const achados = [];
      for (const rota of rotas) {
        await p.goto(url + lingua + '#' + rota, { waitUntil: 'networkidle0' });
        await sleep(400);
        achados.push(...await auditar(rota));
      }
      r.ok(`guia interativo ${lingua || 'pt'}, tema ${t}: as 15 páginas sem violações`, !achados.length, achados.slice(0, 6));
      const leitura = [];
      for (const rota of rotas.filter((x) => x !== 'inicio')) {
        await p.goto(url + lingua + rota + '/', { waitUntil: 'networkidle0' });
        leitura.push(...await auditar(rota + '/'));
      }
      r.ok(`páginas de leitura ${lingua || 'pt'}, tema ${t}: as 14 sem violações`, !leitura.length, leitura.slice(0, 6));
    }
  }

  // estados abertos, no celular
  await p.setViewport(CELULAR);
  await p.goto(url, { waitUntil: 'networkidle0' });
  await tema('claro');
  const estados = [];
  await p.goto(url + '#uso', { waitUntil: 'networkidle0' });
  await p.click('#sintonia'); await sleep(450);
  estados.push(...await auditar('menu aberto'));
  await p.$eval('#q', (i) => { i.value = 'squelch'; i.dispatchEvent(new Event('input', { bubbles: true })); }); await sleep(350);
  estados.push(...await auditar('busca com resultados'));
  await p.$eval('#q', (i) => { i.value = 'xyzzy'; i.dispatchEvent(new Event('input', { bubbles: true })); }); await sleep(350);
  estados.push(...await auditar('busca sem resultados'));
  await p.$eval('#q', (i) => { i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true })); });
  await p.keyboard.press('Escape'); await sleep(400);
  await p.$eval('.topo-conta .radio-btn', (x) => x.click());
  await esperar(p, () => window.radioVirtual && document.querySelector('#radio-doca').getAttribute('data-estado') === 'aberto');
  await sleep(700);   // o painel entra com uma transição; no meio dela, as cores ainda estão misturadas
  estados.push(...await auditar('rádio virtual aberto'));
  await p.$eval('.rv-topo [data-acao="minimizar"]', (x) => x.click()); await sleep(700);
  estados.push(...await auditar('rádio virtual minimizado'));
  await p.$eval('.rv-mini [data-acao="fechar"], .rv-mini-fechar', (x) => x.click()).catch(() => {});
  await p.goto(url + '#codigos', { waitUntil: 'networkidle0' });
  await p.$eval('#tool-codigos .tool-search', (i) => { i.value = 'tuner'; i.dispatchEvent(new Event('input', { bubbles: true })); }); await sleep(300);
  estados.push(...await auditar('códigos com resultados'));
  await p.$eval('#tool-codigos .tool-search', (i) => { i.value = 'B21F'; i.dispatchEvent(new Event('input', { bubbles: true })); }); await sleep(300);
  estados.push(...await auditar('códigos com um PI'));
  await p.goto(url + '#ajustes', { waitUntil: 'networkidle0' });
  await p.$eval('#tool-ajustes .aj-row', (x) => x.click()); await sleep(300);
  estados.push(...await auditar('ajuste aberto'));
  await p.goto(url + '#ajuda--tela-parada-em-tuner-none', { waitUntil: 'networkidle0' }); await sleep(500);
  estados.push(...await auditar('categoria de problema aberta'));
  await p.goto(url + '#ajuda--tela-parada-em-tuner-none-nao-faca-reset-de-fabrica-bw-tuning', { waitUntil: 'networkidle0' }); await sleep(500);
  estados.push(...await auditar('item de problema aberto'));
  r.ok('estados abertos sem violações', !estados.length, estados.slice(0, 8));

  r.ok('sem erros no console', !erros.length, erros.slice(0, 5));
  await b.close();
  return r.fim();
}

await sozinho(import.meta, rodar);
