// Peças comuns dos testes: achar o Chrome, servir a pasta do site gerado, abrir o navegador e anotar os resultados.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

export const AQUI = path.dirname(fileURLToPath(import.meta.url));
export const SITE = path.resolve(process.env.SITE || path.join(AQUI, '..', 'site', 'preview'));   // SITE=pasta: outro build
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// o Chrome da variável CHROME ou o instalado no lugar de costume
export function chrome() {
  if (process.env.CHROME) return process.env.CHROME;
  const lugares = ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'];
  const achado = lugares.find((l) => fs.existsSync(l));
  if (!achado) { console.error('Não achei o Chrome. Diga onde ele está na variável CHROME.'); process.exit(2); }
  return achado;
}

export function navegador() {
  return puppeteer.launch({ executablePath: chrome(), headless: true, args: ['--no-sandbox'] });
}

// um servidor só para a pasta do site gerado, com os tipos que o GitHub Pages manda
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
};
export function servir(pasta = SITE) {
  return new Promise((pronto) => {
    const s = http.createServer((req, res) => {
      let u;
      try { u = decodeURIComponent(new URL(req.url, 'http://local').pathname); } catch { res.writeHead(400); res.end(); return; }
      let f = path.join(pasta, u);
      if (fs.existsSync(f) && fs.statSync(f).isDirectory()) {
        if (!u.endsWith('/')) { res.writeHead(301, { location: u + '/' }); res.end(); return; }
        f = path.join(f, 'index.html');
      }
      if (!f.startsWith(pasta) || !fs.existsSync(f) || !fs.statSync(f).isFile()) { res.writeHead(404); res.end('não achei'); return; }
      res.writeHead(200, { 'content-type': TIPOS[path.extname(f)] || 'application/octet-stream', 'cache-control': 'no-cache' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => pronto({ servidor: s, url: `http://127.0.0.1:${s.address().port}/` }));
  });
}

// anota cada conferência e conta as falhas; fim() devolve quantas falharam
export function relatorio(titulo) {
  let falhas = 0, total = 0;
  console.log(`\n== ${titulo}`);
  return {
    ok(nome, certo, detalhe) {
      total++;
      if (!certo) falhas++;
      console.log((certo ? 'ok    ' : 'FALHA ') + nome + (!certo && detalhe !== undefined ? '  ' + JSON.stringify(detalhe).slice(0, 400) : ''));
      return certo;
    },
    fim() { console.log(`${titulo}: ${total - falhas} de ${total} certos`); return falhas; },
  };
}

// a página não sai do computador: o que é de fora (fontes de terceiros, o diretório de rádios, as transmissões) não
// carrega; erros de rede assim não contam como erro do guia
export async function isolar(pagina, erros) {
  await pagina.setRequestInterception(true);
  pagina.on('request', (r) => {
    const u = r.url();
    if (u.startsWith('http://127.0.0.1:') || u.startsWith('data:') || u.startsWith('blob:')) return r.continue();
    if (/radio-browser\.info/.test(u)) return r.respond({ status: 503, body: '' });
    return r.abort();
  });
  pagina.on('pageerror', (e) => erros.push('erro: ' + e.message));
  pagina.on('console', (m) => {
    if (m.type() === 'error' && !/Failed to load resource|net::ERR_/.test(m.text())) erros.push('console: ' + m.text());
  });
}

export const CELULAR = { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 };
export const COMPUTADOR = { width: 1366, height: 900, deviceScaleFactor: 1 };

// roda uma bateria sozinha (node testes/<bateria>.mjs): sobe o servidor, roda e sai com erro se algo falhou
export async function sozinho(meta, rodar) {
  if (process.argv[1] && fileURLToPath(meta.url) === path.resolve(process.argv[1])) {
    const { servidor, url } = await servir();
    let falhas = 1;
    try { falhas = await rodar(url); } finally { servidor.close(); }
    process.exit(falhas ? 1 : 0);
  }
}

// espera uma condição na página, sem estourar: devolve se ela ficou verdadeira a tempo
export async function esperar(pagina, fn, arg, ms = 8000) {
  try { await pagina.waitForFunction(fn, { timeout: ms, polling: 100 }, arg); return true; } catch { return false; }
}
