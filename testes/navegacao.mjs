// Navegação do guia interativo, nos dois idiomas: cada página abre pelo endereço, o menu abre e fecha, a busca
// geral leva ao lugar certo, os endereços antigos ainda funcionam, a troca de idioma mantém a página e o fim de
// cada página leva à próxima.
import { navegador, isolar, relatorio, sleep, sozinho, esperar, CELULAR, COMPUTADOR } from './comum.mjs';

export async function rodar(url) {
  const r = relatorio('Navegação');
  const b = await navegador();
  const p = await b.newPage();
  const erros = [];
  await isolar(p, erros);
  const visivel = (rota) => p.evaluate((x) => { const a = document.getElementById('page-' + x); return !!a && !a.hidden; }, rota);

  for (const [lingua, tela] of [['', COMPUTADOR], ['en/', CELULAR]]) {
    const nome = lingua ? 'inglês' : 'português';
    await p.setViewport(tela);
    await p.goto(url + lingua, { waitUntil: 'networkidle0' });
    const rotas = await p.$$eval('article.page', (a) => a.map((x) => x.dataset.route));
    r.ok(`${nome}: 15 páginas no documento`, rotas.length === 15, rotas);
    let todas = true;
    for (const rota of rotas) {
      await p.goto(url + lingua + '#' + rota, { waitUntil: 'domcontentloaded' });
      // sem placa de vídeo (como no GitHub Actions), o 3D da página hardware ocupa o navegador por vários segundos,
      // e a página seguinte só abre depois; por isso a espera é longa
      const ok = await esperar(p, (x) => { const a = document.getElementById('page-' + x); return a && !a.hidden && a.querySelector('h1, .tt'); }, rota, 20000);
      if (!ok) { todas = false; r.ok(`${nome}: a página ${rota} abre pelo endereço`, false); }
    }
    r.ok(`${nome}: cada página abre pelo endereço`, todas);

    // o menu: o botão de sintonia abre, Esc fecha
    await p.goto(url + lingua + '#uso', { waitUntil: 'networkidle0' }); await sleep(300);
    await p.click('#sintonia'); await sleep(450);
    r.ok(`${nome}: o botão de sintonia abre o menu`, await p.evaluate(() => !document.getElementById('menu').hidden && document.body.classList.contains('pausado')));
    await p.keyboard.press('Escape'); await sleep(450);
    r.ok(`${nome}: Esc fecha o menu`, await p.evaluate(() => document.getElementById('menu').hidden && !document.body.classList.contains('pausado')));

    // a busca geral
    await p.click('#sintonia'); await sleep(450);
    await p.$eval('#q', (i) => { i.value = 'squelch'; i.dispatchEvent(new Event('input', { bubbles: true })); }); await sleep(400);
    const n = await p.$$eval('#results .result', (x) => x.length);
    r.ok(`${nome}: a busca acha squelch`, n > 3, n);
    const alvo = await p.$eval('#results .result', (a) => a.getAttribute('href') || a.dataset.r || '');
    await p.$eval('#results .result', (a) => a.click()); await sleep(900);
    r.ok(`${nome}: o resultado fecha o menu e abre uma página`, await p.evaluate(() => document.getElementById('menu').hidden && !!document.querySelector('article.page:not([hidden])')), alvo);
  }

  // endereços antigos
  await p.setViewport(COMPUTADOR);
  for (const [antiga, nova] of [['ajuda', 'problemas'], ['menus', 'ajustes'], ['placa', 'hardware']]) {
    await p.goto(url + '#' + antiga, { waitUntil: 'networkidle0' }); await sleep(300);
    r.ok(`o endereço antigo #${antiga} abre ${nova}`, await visivel(nova));
  }

  // a troca de idioma mantém a página
  await p.goto(url + '#codigos', { waitUntil: 'networkidle0' }); await sleep(300);
  await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle0' }), p.click('.topo-conta .lang-link')]);
  await sleep(400);
  r.ok('a troca de idioma mantém a página', p.url().includes('/en/') && await visivel('codigos') &&
    (await p.$eval('#page-codigos h1', (h) => h.textContent.trim())) === 'Screen messages and codes', p.url());

  // o fim da página leva à próxima
  await p.goto(url + '#uso', { waitUntil: 'networkidle0' }); await sleep(300);
  const prox = await p.$eval('#page-uso .prox-next', (a) => a.getAttribute('href'));
  await p.$eval('#page-uso .prox-next', (a) => a.click()); await sleep(500);
  r.ok('o link de próxima página abre a próxima', await visivel(prox.slice(1)), prox);

  r.ok('sem erros no console', !erros.length, erros.slice(0, 5));
  await b.close();
  return r.fim();
}

await sozinho(import.meta, rodar);
