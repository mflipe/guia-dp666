// O que o site entrega além das páginas: o manifesto e os ícones do app instalado, o service worker (o guia abre
// sem internet depois da primeira visita, sem tocar nas prévias), as etiquetas de compartilhamento, as páginas de
// leitura com endereço próprio e o mapa do site.
import fs from 'node:fs';
import path from 'node:path';
import { navegador, isolar, relatorio, sleep, sozinho, esperar, servir, SITE, COMPUTADOR } from './comum.mjs';

const PUBLICO = 'https://mflipe.github.io/guia-dp666/';

export async function rodar(url) {
  const r = relatorio('Site: app instalável, offline, compartilhamento e endereços por página');
  const b = await navegador();
  const erros = [];
  // cada parte num contexto novo, sem o service worker da parte anterior
  const novaPagina = async () => {
    const ctx = await b.createBrowserContext();
    const pg = await ctx.newPage();
    await isolar(pg, erros);
    await pg.setViewport(COMPUTADOR);
    return pg;
  };
  let p = await novaPagina();
  const pega = (u) => p.evaluate(async (u) => { const x = await fetch(u, { cache: 'no-store' }); return { status: x.status, tipo: x.headers.get('content-type'), texto: x.headers.get('content-type').startsWith('image') ? '' : await x.text() }; }, u);

  // ---------------------------------------------------------------- manifesto, ícones e etiquetas
  await p.goto(url, { waitUntil: 'networkidle0' });
  for (const [lingua, nome] of [['', 'DP-666: o guia definitivo'], ['en/', 'DP-666: the definitive guide']]) {
    const m = await pega(url + lingua + 'manifest.webmanifest');
    let j = {};
    try { j = JSON.parse(m.texto); } catch { /* fica vazio e falha abaixo */ }
    r.ok(`manifesto ${lingua || 'pt'}: nome, início, tela cheia e ícone para máscara`, m.status === 200 && j.name === nome && j.start_url === './' &&
      j.display === 'standalone' && j.icons.some((i) => i.purpose === 'maskable' && i.sizes === '512x512'), j);
    let icones = true;
    for (const i of j.icons || []) {
      const x = await pega(new URL(i.src, url + lingua + 'manifest.webmanifest').href);
      icones = icones && x.status === 200 && x.tipo === 'image/png';
    }
    r.ok(`manifesto ${lingua || 'pt'}: os ícones existem`, icones);
  }
  for (const [lingua, canon] of [['', PUBLICO], ['en/', PUBLICO + 'en/']]) {
    await p.goto(url + lingua, { waitUntil: 'networkidle0' });
    const cab = await p.evaluate(() => ({
      canon: (document.querySelector('link[rel=canonical]') || {}).href,
      og: Object.fromEntries([...document.querySelectorAll('meta[property^="og:"]')].map((m) => [m.getAttribute('property'), m.content])),
      icones: [...document.querySelectorAll('link[rel~=icon], link[rel=apple-touch-icon], link[rel=manifest]')].map((l) => l.href),
      google: [...document.querySelectorAll('link[href*="googleapis"], link[href*="gstatic"]')].length,
    }));
    r.ok(`início ${lingua || 'pt'}: endereço canônico e etiquetas de compartilhamento`, cab.canon === canon && cab.og['og:url'] === canon &&
      cab.og['og:image'] === `${PUBLICO}img/compartilhar-${lingua ? 'en' : 'pt'}.png` && !!cab.og['og:title'], cab);
    let ok = true;
    for (const u of cab.icones) ok = ok && (await pega(u)).status === 200;
    r.ok(`início ${lingua || 'pt'}: ícones e manifesto respondem, e nada vem do Google Fonts`, ok && cab.google === 0, cab.icones);
  }
  const fontes = await p.evaluate(async () => { await document.fonts.ready; return [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family); });
  r.ok('as fontes de letra carregam do próprio site', ['Geist', 'Tektur'].every((f) => fontes.some((x) => x.replace(/"/g, '') === f)), fontes);
  for (const l of ['pt', 'en']) {
    const img = path.join(SITE, 'img', `compartilhar-${l}.png`);
    const cab = fs.existsSync(img) ? fs.readFileSync(img).subarray(16, 24) : Buffer.alloc(8);
    r.ok(`imagem de compartilhamento ${l}: 1200×630`, cab.readUInt32BE(0) === 1200 && cab.readUInt32BE(4) === 630);
  }

  // ---------------------------------------------------------------- páginas de leitura
  p = await novaPagina();
  await p.goto(url, { waitUntil: 'networkidle0' });
  const rotas = (await p.$$eval('article.page', (a) => a.map((x) => x.dataset.route))).filter((x) => x !== 'inicio');
  for (const lingua of ['', 'en/']) {
    await p.goto(url + lingua, { waitUntil: 'networkidle0' });
    const titulos = await p.$$eval('article.page', (a) => Object.fromEntries(a.map((x) => [x.dataset.route, (x.querySelector('h1') || {}).textContent || ''])));
    const problemas = [];
    for (const rota of rotas) {
      await p.goto(url + lingua + rota + '/', { waitUntil: 'domcontentloaded' });
      const status = await p.evaluate(() => performance.getEntriesByType('navigation')[0].responseStatus);
      const canon = PUBLICO + lingua + rota + '/';
      const info = await p.evaluate(() => ({
        h1: (document.querySelector('h1') || {}).textContent, canon: (document.querySelector('link[rel=canonical]') || {}).href,
        og: (document.querySelector('meta[property="og:url"]') || {}).content, desc: (document.querySelector('meta[name=description]') || {}).content,
        alt: [...document.querySelectorAll('link[rel=alternate][hreflang]')].map((l) => l.hreflang + ' ' + l.href),
        abrir: (document.querySelector('.le-abrir') || {}).href,
        quebrados: [...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute('href')).filter((h) => h.length > 1 && !document.getElementById(decodeURIComponent(h.slice(1)))),
        ferramentas: document.querySelectorAll('.tool-embed, [data-viewer3d-open]').length,
        internos: [...document.querySelectorAll('main a[href^="../"]')].map((a) => a.href),
      }));
      const falta = [];
      if (status !== 200) falta.push('status ' + status);
      if (info.h1 !== titulos[rota].trim()) falta.push('h1 ' + info.h1);
      if (info.canon !== canon || info.og !== canon) falta.push('canônico ' + info.canon);
      if (!info.desc) falta.push('descrição');
      if (info.alt.length !== 2) falta.push('hreflang');
      if (info.abrir !== url + lingua + '#' + rota) falta.push('abrir ' + info.abrir);
      if (info.quebrados.length) falta.push('âncoras ' + info.quebrados.slice(0, 3).join(' '));
      if (info.ferramentas) falta.push('ferramenta sem trocar');
      if (falta.length) problemas.push(rota + ': ' + falta.join(', '));
    }
    r.ok(`páginas de leitura ${lingua || 'pt'}: as 14 abrem, com título, endereço canônico, hreflang e âncoras certas`, !problemas.length, problemas);
  }
  // os links entre páginas de leitura levam a páginas que existem
  const links = new Set();
  for (const lingua of ['', 'en/']) for (const rota of rotas) {
    const html = fs.readFileSync(path.join(SITE, lingua, rota, 'index.html'), 'utf8');
    for (const m of html.matchAll(/href="(\.\.\/[^"#]*)(#[^"]*)?"/g)) links.add(new URL(m[1], url + lingua + rota + '/').pathname);
  }
  const mortos = [...links].filter((u) => { const f = path.join(SITE, decodeURIComponent(u)); return !fs.existsSync(f.endsWith('/') ? path.join(f, 'index.html') : f); });
  r.ok('os links das páginas de leitura levam a arquivos que existem', !mortos.length, mortos.slice(0, 5));

  // ---------------------------------------------------------------- mapa do site
  const mapa = fs.readFileSync(path.join(SITE, 'sitemap.xml'), 'utf8');
  const locs = [...mapa.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  r.ok('sitemap: os dois inícios e as 28 páginas de leitura', locs.length === 30 && locs.every((u) => {
    const f = path.join(SITE, u.replace(PUBLICO, ''), 'index.html');
    return fs.existsSync(f);
  }), locs.length);

  // ---------------------------------------------------------------- offline: um servidor só para esta parte, que depois é
  // desligado (o modo offline do navegador não vale para o service worker, que tem a própria rede)
  const { servidor: srv, url: u } = await servir();
  const ctx = await b.createBrowserContext();
  p = await ctx.newPage();
  p.on('pageerror', (e) => erros.push('erro: ' + e.message));
  await p.setViewport(COMPUTADOR);
  await p.goto(u, { waitUntil: 'networkidle0' });
  r.ok('o service worker se registra e fica pronto', await esperar(p, () => navigator.serviceWorker.ready.then(() => true), null, 15000));
  await p.reload({ waitUntil: 'networkidle0' });
  r.ok('depois de recarregar, o service worker controla a página', await esperar(p, () => !!navigator.serviceWorker.controller, null, 10000));
  await p.goto(u + 'codigos/', { waitUntil: 'networkidle0' });   // visitada: fica guardada
  const prev = await p.evaluate(async (x) => { const q = await fetch(x); return { status: q.status, guardado: !!(await caches.match(x)) }; }, u + 'prototipo-teste/');
  r.ok('as prévias (prototipo-*) passam direto, sem cópia guardada', prev.status === 404 && !prev.guardado, prev);
  await sleep(500);
  srv.closeAllConnections();
  await new Promise((ok) => srv.close(ok));
  await p.goto(u + '#codigos', { waitUntil: 'domcontentloaded' });
  r.ok('sem internet, o guia abre e a página de códigos aparece', await esperar(p, () => {
    const a = document.getElementById('page-codigos'); return a && !a.hidden && document.querySelector('#tool-codigos .tool-search');
  }, null, 10000));
  await p.goto(u + 'en/', { waitUntil: 'domcontentloaded' });
  r.ok('sem internet, o guia em inglês abre (guardado na instalação)', await esperar(p, () => document.documentElement.lang === 'en' && !!document.querySelector('#page-inicio'), null, 10000));
  await p.goto(u + 'codigos/', { waitUntil: 'domcontentloaded' });
  r.ok('sem internet, a página de leitura já visitada abre', await esperar(p, () => document.querySelector('h1') && document.querySelector('h1').textContent === 'Mensagens e códigos da tela', null, 10000));
  await p.goto(u + 'mod17/', { waitUntil: 'domcontentloaded' });
  r.ok('sem internet, uma página nunca aberta cai no início do guia', await esperar(p, () => !!document.querySelector('#page-inicio'), null, 10000));
  await p.goto(u + 'en/mod17/', { waitUntil: 'domcontentloaded' });
  r.ok('sem internet, em inglês, cai no início em inglês', await esperar(p, () => document.documentElement.lang === 'en' && !!document.querySelector('#page-inicio'), null, 10000));

  r.ok('sem erros no console', !erros.length, erros.slice(0, 5));
  await b.close();
  return r.fim();
}

await sozinho(import.meta, rodar);
