// Gera as imagens fixas do guia a partir dos desenhos em SVG e das fontes do próprio site, com o mesmo Chrome dos
// testes. Rode de novo só quando mudar o desenho do ícone ou o texto da imagem de compartilhamento:
//
//   node testes/gerar-imagens.mjs
//
// Saem os PNGs do ícone em site/ui/icones/ (o app instalado, o favicon e o ícone do iPhone) e a imagem que aparece
// quando alguém compartilha o guia (WhatsApp, redes sociais), em site/img/compartilhar-pt.png e -en.png, 1200×630.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { chrome } from './comum.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.join(AQUI, '..', 'site');
const ICONES = path.join(SITE, 'ui', 'icones');
// as fontes entram na página como data: (uma página feita com setContent não lê arquivos do disco)
const fonte = (arq) => 'data:font/woff2;base64,' + fs.readFileSync(path.join(SITE, 'ui', 'letras', arq)).toString('base64');

const b = await puppeteer.launch({ executablePath: chrome(), headless: true, args: ['--no-sandbox'] });
const p = await b.newPage();

// um SVG num tamanho, sem fundo transparente nas bordas que não fazem parte do desenho
async function png(svg, lado, destino) {
  await p.setViewport({ width: lado, height: lado, deviceScaleFactor: 1 });
  await p.setContent(`<html><body style="margin:0;background:transparent">${fs.readFileSync(path.join(ICONES, svg), 'utf8')
    .replace('<svg ', `<svg width="${lado}" height="${lado}" `)}</body></html>`);
  await p.screenshot({ path: destino, omitBackground: true, clip: { x: 0, y: 0, width: lado, height: lado } });
  console.log('ok', path.relative(path.join(AQUI, '..'), destino));
}
await png('icone.svg', 192, path.join(ICONES, 'icone-192.png'));
await png('icone.svg', 512, path.join(ICONES, 'icone-512.png'));
await png('icone-mascara.svg', 512, path.join(ICONES, 'icone-mascara-512.png'));
await png('icone-mascara.svg', 180, path.join(ICONES, 'apple-touch-icon.png'));   // o iPhone arredonda os cantos sozinho
await png('favicon.svg', 32, path.join(ICONES, 'favicon-32.png'));

// a imagem de compartilhamento: o título do guia, o que ele cobre, o endereço e o botão de sintonia do guia
const TEXTOS = {
  pt: { lang: 'pt-BR', selo: 'Guia independente, em português e inglês', titulo: 'DP-666: o guia definitivo',
    sub: 'Botões, menus, ajustes para o Brasil, códigos da tela e solução de problemas do rádio DEEPELEC com chip TEF6686.' },
  en: { lang: 'en', selo: 'Independent guide, in English and Portuguese', titulo: 'DP-666: the definitive guide',
    sub: 'Buttons, menus, settings, screen codes and troubleshooting for the DEEPELEC radio with the TEF6686 chip.' },
};
const knob = fs.readFileSync(path.join(ICONES, 'icone-mascara.svg'), 'utf8').replace('<rect width="512" height="512" rx="0" fill="#121824"/>', '');
for (const [lingua, t] of Object.entries(TEXTOS)) {
  await p.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await p.setContent(`<!DOCTYPE html><html lang="${t.lang}"><head><meta charset="utf-8"><style>
    @font-face { font-family: "Geist"; font-weight: 400; src: url("${fonte('geist-sans-latin-400-normal.woff2')}"); }
    @font-face { font-family: "Geist Mono"; font-weight: 500; src: url("${fonte('geist-mono-latin-500-normal.woff2')}"); }
    @font-face { font-family: "Tektur"; font-weight: 700; src: url("${fonte('tektur-latin-700-normal.woff2')}"); }
    @font-face { font-family: "Tektur"; font-weight: 500; src: url("${fonte('tektur-latin-500-normal.woff2')}"); }
    html, body { margin: 0; width: 1200px; height: 630px; }
    body { box-sizing: border-box; display: grid; grid-template-columns: 1fr 380px; align-items: center; gap: 48px; padding: 72px 80px;
      background-color: #0e131d; color: #e6ebf3; font-family: "Geist", sans-serif;
      background-image: linear-gradient(rgb(255 255 255 / 0.045) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.045) 1px, transparent 1px);
      background-size: 24px 24px; }
    .selo { margin: 0 0 22px; font: 500 26px "Tektur", sans-serif; color: #c9a66b; letter-spacing: 0.02em; }
    h1 { margin: 0; font: 700 74px/1.04 "Tektur", sans-serif; letter-spacing: 0.01em; }
    .sub { margin: 28px 0 0; max-width: 30ch; font-size: 30px; line-height: 1.38; color: #b4bfce; }
    .url { margin: 40px 0 0; font: 500 26px "Geist Mono", monospace; color: #f2b14c; }
    svg { width: 380px; height: 380px; display: block; }
  </style></head><body><div><p class="selo">${t.selo}</p><h1>${t.titulo}</h1><p class="sub">${t.sub}</p>
    <p class="url">mflipe.github.io/guia-dp666</p></div>${knob}</body></html>`);
  await p.evaluate(async () => { await Promise.all([...document.fonts].map((f) => f.load())); await document.fonts.ready; });
  const destino = path.join(SITE, 'img', `compartilhar-${lingua}.png`);
  await p.screenshot({ path: destino });
  console.log('ok', path.relative(path.join(AQUI, '..'), destino));
}
await b.close();
