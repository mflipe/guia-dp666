// As ferramentas do guia interativo: a busca de códigos da tela, o explorador de ajustes, o assistente de problemas
// e as vistas em 3D, que só baixam quando a pessoa pede.
import { navegador, isolar, relatorio, sleep, sozinho, esperar, CELULAR, COMPUTADOR } from './comum.mjs';

export async function rodar(url) {
  const r = relatorio('Ferramentas');
  const b = await navegador();
  const p = await b.newPage();
  const erros = [];
  await isolar(p, erros);
  await p.setViewport(CELULAR);

  // ---------------------------------------------------------------- códigos da tela
  const F = '#tool-codigos';
  const digita = async (t) => {
    await p.$eval(F + ' .tool-search', (i, t) => { i.value = t; i.dispatchEvent(new Event('input', { bubbles: true })); }, t);
    await sleep(220);
    return p.evaluate((f) => ({
      conta: document.querySelector(f + ' .cod-conta').textContent,
      vazio: !!document.querySelector(f + ' .exp-empty'),
      nota: (document.querySelector(f + ' .cod-nota') || {}).textContent || '',
      res: [...document.querySelectorAll(f + ' .cod-item')].map((li) => ({
        t: li.querySelector('.cod-t').textContent, onde: li.querySelector('.cod-onde').textContent,
        alt: (li.querySelector('.cod-alt') || {}).textContent || '', em: (li.querySelector('.cod-alt em') || {}).textContent || '' })),
    }), F);
  };
  for (const [lingua, txt] of [['', { rds: 'Tela de RDS avançado', vazio: 'Experimente:', oficial: 'Mensagens só da linha oficial' }],
    ['en/', { rds: 'Advanced RDS screen', vazio: 'Try:', oficial: 'Messages only on the official firmware' }]]) {
    const nome = lingua ? 'inglês' : 'português';
    await p.goto(url + lingua + '#codigos', { waitUntil: 'networkidle0' });
    await esperar(p, (f) => document.querySelector(f + ' .tool-search'), F);
    r.ok(`${nome}: a busca de códigos abre com os exemplos`, (await p.$eval(F + ' .cod-ex span', (x) => x.textContent)) === txt.vazio &&
      (await p.$$(F + ' .cod-ex .chip-btn')).length === 5);
    let x = await digita('TMC');
    r.ok(`${nome}: TMC, na tela de RDS`, x.res[0] && x.res[0].t === 'TMC' && x.res[0].onde === txt.rds, x.res[0]);
    x = await digita('tuner none');
    r.ok(`${nome}: sem pontuação acha Tuner: !None!`, x.res[0] && x.res[0].t === 'Tuner: !None!', x.res.slice(0, 2));
    x = await digita('rt+');
    r.ok(`${nome}: RT+ antes de RT`, x.res[0] && x.res[0].t === 'RT+' && x.res[1].t === 'RT', x.res.slice(0, 2).map((y) => y.t));
    x = await digita('logbook is full');
    r.ok(`${nome}: mensagem da linha oficial, com a tradução em itálico`, x.res[0] && x.res[0].onde === txt.oficial &&
      x.res[0].em === 'Não é possível adicionar! O livro está cheio!', x.res[0]);
    x = await digita('B21F');
    r.ok(`${nome}: um código PI vira explicação do PI`, x.res[0] && x.res[0].t === 'PI' && /B21F/.test(x.nota), x);
    x = await digita('1a2b?');
    r.ok(`${nome}: um PI com ? mostra primeiro a linha do ?`, x.res[0] && /\?/.test(x.res[0].t), x.res.map((y) => y.t));
    x = await digita('xyzzy');
    r.ok(`${nome}: nada encontrado`, x.vazio && !x.res.length);
  }
  let x = await (async () => { await p.goto(url + '#codigos', { waitUntil: 'networkidle0' }); return digita('sintonizador'); })();
  r.ok('a tradução digitada aparece em cima, com o original embaixo', x.res[0] && x.res[0].t === 'Sintonizador: !Nenhum!' && x.res[0].alt === 'Tuner: !None!', x.res[0]);
  x = await digita('s');
  r.ok('uma letra: só códigos, no máximo 10', x.res.length === 10 && x.res[0].t === 'S' && /10/.test(x.conta), [x.conta, x.res.slice(0, 3).map((y) => y.t)]);
  await p.$eval(F + ' .tool-search', (i) => { i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true })); }); await sleep(200);
  await p.$eval(F + ' .cod-ex .chip-btn[data-ex="PTYN N/A"]', (b) => b.click()); await sleep(200);
  r.ok('o exemplo preenche o campo e busca', (await p.$eval(F + ' .tool-search', (i) => i.value)) === 'PTYN N/A' &&
    (await p.$eval(F + ' .cod-t', (y) => y.textContent)) === 'PTYN N/A');
  r.ok('as linhas das tabelas têm os ids da busca', await p.evaluate(() => {
    const n = document.querySelectorAll('#page-codigos .cod-tabela tbody tr').length;
    return n > 100 && n === document.querySelectorAll('#page-codigos tr[id^="codigos--"]').length;
  }));
  // a busca geral leva à linha da tabela, que acende
  await p.goto(url + '#inicio', { waitUntil: 'networkidle0' });
  await p.click('#sintonia'); await sleep(450);
  await p.$eval('#q', (i) => { i.value = 'TMC'; i.dispatchEvent(new Event('input', { bubbles: true })); }); await sleep(400);
  r.ok('busca geral: TMC vem de Códigos da tela', (await p.$eval('#results .result .r-path', (y) => y.textContent)) === 'Códigos da tela › TMC');
  await p.$eval('#results .result', (a) => a.click());
  r.ok('a linha do TMC aparece e acende', await esperar(p, () => {
    const tr = document.getElementById('codigos--tela-de-rds-avançado-tmc');
    const q = tr && tr.getBoundingClientRect();
    return tr && tr.classList.contains('cod-alvo') && q.top >= 0 && q.top < innerHeight;
  }, null, 9000));

  // ---------------------------------------------------------------- explorador de ajustes
  await p.setViewport(COMPUTADOR);
  await p.goto(url + '#ajustes', { waitUntil: 'networkidle0' });
  await esperar(p, () => document.querySelector('#tool-ajustes .tool-search'));
  await p.$eval('#tool-ajustes .tool-search', (i) => { i.value = 'squelch'; i.dispatchEvent(new Event('input', { bubbles: true })); }); await sleep(400);
  const nAj = await p.$$eval('#tool-ajustes .aj-item', (y) => y.length);
  r.ok('ajustes: a busca acha os ajustes de squelch', nAj > 0, nAj);
  await p.$eval('#tool-ajustes .aj-row', (y) => y.click()); await sleep(250);
  r.ok('ajustes: o item abre com a explicação', await p.$eval('#tool-ajustes .aj-row', (y) => y.getAttribute('aria-expanded') === 'true'));
  r.ok('ajustes: os grupos são h2, logo abaixo do título da página', await p.$$eval('#tool-ajustes .aj-gh', (y) => y.length > 0 && y.every((h) => h.tagName === 'H2')));

  // ---------------------------------------------------------------- assistente de problemas
  await p.goto(url + '#ajuda--tela-parada-em-tuner-none', { waitUntil: 'networkidle0' }); await sleep(600);
  r.ok('problemas: o endereço da categoria abre a categoria', await p.evaluate(() => {
    const c = document.querySelector('#tool-ajuda #ajuda--tela-parada-em-tuner-none');
    return !document.getElementById('page-problemas').hidden && !!c && c.getBoundingClientRect().height > 0;
  }));

  // ---------------------------------------------------------------- 3D: nada baixa antes do toque; depois, aparece
  await p.goto(url + '#laboratorio', { waitUntil: 'networkidle0' }); await sleep(400);
  const pedidos = [];
  p.on('request', (q) => { if (/viewer3d/.test(q.url())) pedidos.push(q.url()); });
  r.ok('3D: nada baixado antes do toque', !pedidos.length);
  await p.$eval('#page-laboratorio .v3-open', (y) => y.click());
  r.ok('3D: o toque baixa o visualizador e desenha', await esperar(p, () => !!document.querySelector('#page-laboratorio .viewer3d canvas'), null, 30000), pedidos);

  r.ok('sem erros no console', !erros.length, erros.slice(0, 5));
  await b.close();
  return r.fim();
}

await sozinho(import.meta, rodar);
