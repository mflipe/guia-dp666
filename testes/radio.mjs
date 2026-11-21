// O rádio virtual: o painel dentro do guia (abrir, minimizar, fechar, voltar igual depois da troca de idioma, o link
// para os códigos da tela) e a página do rádio sozinha (emissoras em círculo, ajustes que mudam a tela, protetor de
// tela, som com o diretório e as transmissões simulados, toques na tela, letreiro e medidores).
import crypto from 'node:crypto';
import { navegador, relatorio, sleep, sozinho, esperar, CELULAR } from './comum.mjs';

// um tom curto em WAV, para as transmissões simuladas
function tom() {
  const taxa = 8000, n = taxa / 2, dados = Buffer.alloc(44 + n * 2);
  dados.write('RIFF', 0); dados.writeUInt32LE(36 + n * 2, 4); dados.write('WAVEfmt ', 8); dados.writeUInt32LE(16, 16);
  dados.writeUInt16LE(1, 20); dados.writeUInt16LE(1, 22); dados.writeUInt32LE(taxa, 24); dados.writeUInt32LE(taxa * 2, 28);
  dados.writeUInt16LE(2, 32); dados.writeUInt16LE(16, 34); dados.write('data', 36); dados.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) dados.writeInt16LE(Math.round(Math.sin(i / taxa * 2 * Math.PI * 440) * 8000), 44 + i * 2);
  return dados;
}

async function abrir(b, erros) {
  const p = await b.newPage();
  p.on('pageerror', (e) => erros.push('erro: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|net::ERR_/.test(m.text())) erros.push('console: ' + m.text()); });
  await p.setRequestInterception(true);
  const wav = tom();
  p.on('request', (q) => {
    const u = q.url();
    if (/api\.radio-browser\.info\/json\/stations\/search/.test(u)) {
      const nome = decodeURIComponent(u.match(/name=([^&]+)/)[1]);
      const s = nome.toLowerCase().replace(/\W+/g, '');
      return q.respond({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify([
        { name: nome + ' Rio de Janeiro', state: 'Rio de Janeiro', tags: '', url_resolved: `https://stream.teste/${s}-rio`, clickcount: 9000 },
        { name: nome + ' São Paulo', state: 'São Paulo', tags: 'pop', url_resolved: `https://stream.teste/${s}-sp`, clickcount: 300 },
        { name: nome + ' SP sem https', state: 'São Paulo', tags: '', url_resolved: `http://stream.teste/${s}-http`, clickcount: 99999 },
      ]) });
    }
    if (/stream\.teste/.test(u)) return /jovempan-sp/.test(u) ? q.respond({ status: 404, body: 'fora do ar' }) : q.respond({ status: 200, contentType: 'audio/wav', body: wav });
    if (u.startsWith('http://127.0.0.1:') || u.startsWith('data:') || u.startsWith('blob:')) return q.continue();
    return q.abort();
  });
  await p.setViewport(CELULAR);
  return p;
}

export async function rodar(url) {
  const r = relatorio('Rádio virtual');
  const b = await navegador();
  const erros = [];

  // ---------------------------------------------------------------- o painel dentro do guia
  let p = await abrir(b, erros);
  const doca = () => p.evaluate(() => { const d = document.querySelector('#radio-doca'); return { hidden: d.hidden, estado: d.getAttribute('data-estado'),
    btns: [...document.querySelectorAll('.radio-btn')].map((x) => x.getAttribute('data-estado') + '/' + x.getAttribute('aria-expanded')) }; });
  const clica = (sel) => p.$eval(sel, (x) => x.click());
  await p.goto(url + '#ajustes', { waitUntil: 'networkidle0' });
  await p.evaluate(() => { localStorage.removeItem('dp666.radio'); sessionStorage.removeItem('dp666.radio.painel'); });
  await p.reload({ waitUntil: 'networkidle0' }); await sleep(400);
  r.ok('três botões do rádio: rodapé do menu, título e alto da página', (await p.$$('.radio-btn')).length === 3);
  r.ok('nada do rádio carregado antes do toque', await p.evaluate(() => !window.RadioVirtual && !document.querySelector('link[href$="painel.css"]')));
  await clica('.topo-conta .radio-btn');
  await esperar(p, () => window.radioVirtual && document.querySelector('#radio-doca').getAttribute('data-estado') === 'aberto');
  let d = await doca();
  r.ok('o toque carrega e abre o painel', !d.hidden && d.estado === 'aberto' && d.btns.every((x) => x === 'aberto/true'), d);
  r.ok('o foco vai para o título do painel', await p.evaluate(() => document.activeElement && document.activeElement.classList.contains('rv-titulo')));
  r.ok('a tela começa na CBN, em português', await p.evaluate(() => radioVirtual.estado.ps === 'CBN SP') &&
    (await p.$eval('.rv-emissora span', (x) => x.textContent)) === '90,5 MHz · memória 1 de 10');
  const rel = () => p.evaluate(() => [radioVirtual.estado.relogioModo, [...document.querySelectorAll('[data-ajuste="relogio"] button')].map((x) => x.textContent + ':' + x.getAttribute('aria-pressed')).join(' ')]);
  r.ok('Show clock com três opções', (await rel())[1] === 'Off:false Time only:true Date + Time:false', await rel());
  await clica('[data-ajuste="relogio"] [data-v="completo"]');
  r.ok('Date + Time mostra a data completa', (await rel())[0] === 'completo');
  const tocaTela = async (x, y) => {
    const q = await p.$eval('.rv-tela', (c) => { const b = c.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; });
    await p.mouse.click(q.x + x * q.w / 320, q.y + y * q.h / 240); await sleep(60);
  };
  await p.$eval('.rv-tela', (c) => c.scrollIntoView({ block: 'center' })); await sleep(100);
  await tocaTela(265, 198);
  r.ok('o toque no relógio vai para PI, e o seletor marca Off', (await rel())[0] === 'pi' && /Off:true/.test((await rel())[1]), await rel());
  await clica('[data-ajuste="tema"] [data-v="Cyan"]');
  const link = await p.$eval('#radio-doca a[data-acao="codigos"]', (a) => ({ href: a.getAttribute('href'), t: a.textContent }));
  r.ok('o painel leva aos códigos da tela', link.href === '#codigos' && link.t === 'Mensagens e códigos da tela', link);
  await clica('.rv-topo [data-acao="minimizar"]'); await sleep(250);
  d = await doca();
  r.ok('minimizar: a barra escura, com a tela', d.estado === 'minimizado' && await p.evaluate(() => !!document.querySelector('.rv-mini-tela .rv-tela')), d);
  await clica('.rv-mini [data-acao="proxima"]');
  r.ok('próxima emissora pela barra', (await p.$eval('.rv-mini-t strong', (x) => x.textContent)) === 'Kiss FM');
  await clica('.rv-mini-abrir'); await sleep(200);
  r.ok('abrir pela barra', (await doca()).estado === 'aberto');
  await p.focus('.rv-titulo'); await p.keyboard.press('Escape'); await sleep(200);
  r.ok('Esc no painel minimiza', (await doca()).estado === 'minimizado');
  await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle0' }), clica('.topo-conta .lang-link')]);
  await esperar(p, () => window.radioVirtual && document.querySelector('.rv-mini-t span'));
  d = await doca();
  r.ok('no inglês, o rádio volta minimizado, com os ajustes guardados', !d.hidden && d.estado === 'minimizado' &&
    await p.evaluate(() => radioVirtual.ajustes.tema === 'Cyan' && radioVirtual.estado.memoria === 2) &&
    (await p.$eval('.rv-mini-t span', (x) => x.textContent)) === '92.5 MHz · memory 2 of 10', d);
  await clica('.rv-mini-abrir'); await sleep(250);
  await clica('.rv-topo [data-acao="fechar"]'); await sleep(200);
  d = await doca();
  r.ok('fechar esconde o painel e fica guardado', d.hidden && await p.evaluate(() => sessionStorage.getItem('dp666.radio.painel')) === 'fechado', d);
  await clica('#sintonia'); await sleep(450);
  await clica('.pausa-conta .radio-btn'); await sleep(700);
  r.ok('o botão do rodapé do menu fecha o menu e abre o rádio', !(await p.evaluate(() => document.body.classList.contains('pausado'))) && (await doca()).estado === 'aberto');
  await p.close();

  // ---------------------------------------------------------------- a página do rádio sozinha
  p = await abrir(b, erros);
  await p.goto(url + 'radio/', { waitUntil: 'networkidle0' });
  await p.evaluate(() => localStorage.removeItem('dp666.radio'));
  await p.reload({ waitUntil: 'networkidle0' }); await sleep(500);
  const est = () => p.evaluate(() => ({ freq: radioVirtual.estado.freq, mem: radioVirtual.estado.memoria, ps: radioVirtual.estado.ps, pty: radioVirtual.estado.pty }));
  const aperta = (sel) => p.$eval(sel, (x) => x.click());
  let e = await est();
  r.ok('começa na CBN, memória 1, News', e.freq === 9050 && e.mem === 1 && e.pty === 'News', e);
  await aperta('.rv-troca [data-acao="anterior"]'); e = await est();
  r.ok('anterior da primeira vai para a última', e.mem === 10, e);
  await aperta('.rv-troca [data-acao="proxima"]'); e = await est();
  r.ok('próxima da última volta para a primeira', e.freq === 9050, e);
  r.ok('o link dos códigos leva ao guia em português', (await p.$eval('a[data-acao="codigos"]', (a) => a.getAttribute('href'))) === '../#codigos');

  // os ajustes mudam a tela: congela a animação e compara o desenho
  await p.evaluate(() => { radioVirtual.parar(); Object.assign(radioVirtual.estado, { sinal: 640, mod: 70, pico: 100, hora: '10:31:52' }); });
  const quadro = () => p.evaluate(() => {
    const v = radioVirtual;
    v.tela.desenhar(v.estado, v.dados.temas[v.ajustes.tema], { pty: v.letreiro('pty'), ps: v.letreiro('ps'), rt: v.letreiro('rt') });
    return Array.from(v.tela.ctx.getImageData(0, 0, 320, 240).data.filter((_, i) => i % 4 !== 3)).join(',');
  });
  const h = (s) => crypto.createHash('md5').update(s).digest('hex');
  let antes = h(await quadro());
  for (const [nome, grupo, v] of [['Modulation meter Off', 'mod', '0'], ['Battery options Show voltage', 'bateria', 'volts'],
    ['Signalmeter unit dBf', 'unidade', 'dBf'], ['Show clock Off', 'relogio', 'pi'], ['Theme Cyan', 'tema', 'Cyan'],
    ['Frequency font Modern', 'fonte', 'Modern'], ['Show underscore in RDS Off', 'sub', 'nao']]) {
    await p.evaluate((g, val) => document.querySelector(`[data-ajuste="${g}"] [data-v="${val}"]`).click(), grupo, v);
    const depois = h(await quadro());
    r.ok(nome + ' muda a tela', depois !== antes);
    antes = depois;
  }
  await p.select('#rv-idioma', 'Português');
  r.ok('Language Português: PTY em português', (await est()).pty === 'Notícias', await est());
  await p.select('#rv-idioma', 'English');

  // protetor de tela
  const filtro = () => p.$eval('.rv-tela', (c) => c.style.filter);
  await p.$eval('.rv-brilho', (x) => { x.value = 50; x.dispatchEvent(new Event('input', { bubbles: true })); });
  r.ok('brilho 50% como o firmware (135 de 255)', (await filtro()) === 'brightness(0.529)', await filtro());
  await p.$eval('.rv-brilho', (x) => { x.value = 100; x.dispatchEvent(new Event('input', { bubbles: true })); });
  await aperta('[data-ajuste="protecao"] [data-v="3"]'); await sleep(3600);
  r.ok('depois de 3 s, a tela cai para 1% do brilho', (await filtro()) === 'brightness(0.068)', await filtro());
  await p.tap('h1'); await sleep(100);
  r.ok('um toque acorda a tela', (await filtro()) === '', await filtro());
  await aperta('[data-ajuste="protecao"] [data-v="0"]');

  // o som segue a emissora, com o diretório e as transmissões simulados
  const info = () => p.$eval('.rv-som-info', (x) => x.textContent);
  await p.evaluate(() => radioVirtual.ir(0));
  await aperta('.rv-som [data-acao="som"]');
  r.ok('liga e toca a CBN, a de São Paulo, por https', await esperar(p, () => /Tocando a CBN São Paulo/.test(document.querySelector('.rv-som-info').textContent), null, 6000) &&
    await p.evaluate(() => /cbn-sp$/.test((JSON.parse(localStorage.getItem('dp666.radio.streams') || '{}')['9050'] || { urls: [''] }).urls[0])), await info());
  await p.evaluate(() => radioVirtual.ir(6));
  r.ok('a Jovem Pan toca pela segunda transmissão quando a primeira está fora do ar',
    await esperar(p, () => /Tocando a Jovem Pan FM/.test(document.querySelector('.rv-som-info').textContent), null, 6000), await info());
  await aperta('.rv-som [data-acao="som"]'); await sleep(300);
  r.ok('desliga o som', /Som desligado/.test(await info()), await info());

  // toques na tela, letreiro e medidores, com a animação rodando
  await p.evaluate(() => localStorage.removeItem('dp666.radio'));
  await p.reload({ waitUntil: 'networkidle0' }); await sleep(500);
  await p.evaluate(() => window.scrollTo(0, 0)); await sleep(100);
  const telaAtual = () => p.evaluate(() => [radioVirtual.estado.tela, radioVirtual.estado.relogioModo]);
  await tocaTelaPagina(p, 139, 15); r.ok('toque no RDS: a tela do RDS avançado', (await telaAtual())[0] === 'rds');
  await tocaTelaPagina(p, 100, 180); r.ok('toque embaixo: a lista de AF', (await telaAtual())[0] === 'af');
  await tocaTelaPagina(p, 100, 180); r.ok('de novo: a lista de EON', (await telaAtual())[0] === 'eon');
  await tocaTelaPagina(p, 100, 180); r.ok('de novo: volta à principal', (await telaAtual())[0] === 'principal');
  await tocaTelaPagina(p, 265, 198); r.ok('toque no relógio: data e hora', (await telaAtual())[1] === 'completo');
  const let_ = (k) => p.evaluate((k) => { const L = radioVirtual.letreiro(k); return { texto: L.texto, x: L.x, largura: L.largura }; }, k);
  await p.evaluate(() => radioVirtual.ir(1)); await sleep(150);
  const l1 = await let_('rt');
  r.ok('o RT que não cabe vira letreiro, parado no começo', l1.largura > 270 && l1.x === 0, l1);
  await sleep(1600);
  const l2 = await let_('rt');
  r.ok('depois de 1 s, corre para a esquerda', l2.x < -10, l2.x);
  const amostras = [];
  for (let k = 0; k < 25; k++) { amostras.push(await p.evaluate(() => [radioVirtual.estado.sinal, radioVirtual.estado.mod])); await sleep(100); }
  const faixa = (v) => Math.max(...v) - Math.min(...v);
  r.ok('S varia pouco e M varia bastante', faixa(amostras.map((a) => a[0] / 10)) < 4 && faixa(amostras.map((a) => a[1])) > 40);
  await p.select('#rv-idioma', 'Português');
  await aperta('[data-toque="rds"]'); await aperta('[data-toque="rds"]');
  const av = await p.evaluate(() => [radioVirtual.estado.tela, radioVirtual.estado.avisos.semAF, radioVirtual.estado.avisos.fechar]);
  r.ok('a lista de AF em português', av[0] === 'af' && av[1] === 'AF não disponível' && av[2] === 'PRESSIONE BAND PARA FECHAR', av);
  await p.evaluate(() => window.scrollTo(0, 700)); await sleep(300);
  r.ok('no celular, a tela fica presa no alto', Math.abs(await p.$eval('.rv-fixo', (x) => x.getBoundingClientRect().top)) < 1);
  await p.goto(url + 'radio/?lang=en', { waitUntil: 'networkidle0' }); await sleep(400);
  r.ok('em inglês, o link dos códigos leva ao guia em inglês', (await p.$eval('a[data-acao="codigos"]', (a) => a.getAttribute('href'))) === '../en/#codigos');

  r.ok('sem erros no console', !erros.length, erros.slice(0, 5));
  await b.close();
  return r.fim();
}

async function tocaTelaPagina(p, x, y) {
  const q = await p.$eval('.rv-tela', (c) => { const b = c.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; });
  await p.mouse.click(q.x + x * q.w / 320, q.y + y * q.h / 240);
  await sleep(80);
}

await sozinho(import.meta, rodar);
