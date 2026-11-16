// Gera os pacotes dos visualizadores 3D:
//   ../site/preview/js/viewer3d.js     (português, o código como está em src/)
//   ../site/preview/js/viewer3d.en.js  (inglês, com os textos de ../site/i18n/js_en.json)
import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(here, 'src') + path.sep;
const OUT = path.join(here, '..', 'site', 'preview', 'js');

// Mesmo algoritmo de tr_js em site/i18n.py: troca literais inteiros ("...", '...' ou `...`),
// das chaves mais longas para as mais curtas, sem mudar as aspas do original. Mude os dois juntos.
function trJs(src, catalog, used) {
  const aspas = (s, q) => s.split('\\' + q).join('').split(q).length - 1;
  for (const key of Object.keys(catalog).sort((a, b) => b.length - a.length)) {
    const val = catalog[key];
    for (const q of ['"', "'", '`']) {
      const a = q + key + q;
      if (!src.includes(a)) continue;
      if (aspas(val, q) !== aspas(key, q)) throw new Error(`i18n: a tradução muda as aspas ${q} do literal: ${val.slice(0, 60)}`);
      src = src.split(a).join(q + val + q);
      used.add(key);
    }
  }
  return src;
}

function i18n(catalog, used) {
  return {
    name: 'i18n',
    setup(b) {
      b.onLoad({ filter: /\.js$/ }, async (args) => {
        if (!args.path.startsWith(SRC)) return undefined;
        return { contents: trJs(await readFile(args.path, 'utf8'), catalog, used), loader: 'js' };
      });
    },
  };
}

const common = {
  entryPoints: [path.join(here, 'src', 'viewer3d.js')],
  bundle: true,
  minify: true,
  format: 'esm',
  target: 'es2020',
  logLevel: 'warning',
};

await build({ ...common, outfile: path.join(OUT, 'viewer3d.js') });

const catalog = JSON.parse(await readFile(path.join(here, '..', 'site', 'i18n', 'js_en.json'), 'utf8'));
const used = new Set();
await build({ ...common, outfile: path.join(OUT, 'viewer3d.en.js'), plugins: [i18n(catalog, used)] });
console.log(`viewer3d.js e viewer3d.en.js prontos (${used.size} textos traduzidos no 3D).`);
