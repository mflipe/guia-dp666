#!/usr/bin/env bash
# Gera o site e publica na branch gh-pages, que o GitHub Pages serve.
# Uso: ./scripts/publicar.sh
# Precisa de git, Node.js 18 ou mais novo e Python 3 com o pacote markdown (pip install -r requirements.txt).
set -euo pipefail

raiz="$(cd "$(dirname "$0")/.." && pwd)"
cd "$raiz"

echo "1/3 Visualizadores 3D (português e inglês)"
(cd viewer3d && npm ci --no-audit --no-fund && npm run build)

echo "2/3 Páginas (português e inglês)"
python3 site/build.py

echo "3/3 Envio para a branch gh-pages"
remoto="$(git remote get-url origin)"
versao="$(git rev-parse --short HEAD)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
mkdir -p "$tmp/js" "$tmp/en"
cp site/preview/index.html "$tmp/"
cp site/preview/catalogo.html "$tmp/"
cp site/preview/en/index.html "$tmp/en/"
cp site/preview/js/viewer3d.js site/preview/js/viewer3d.en.js "$tmp/js/"
cp -r site/preview/img "$tmp/"
cp -r site/preview/radio "$tmp/"   # o rádio virtual, que o botão do alto das páginas abre
touch "$tmp/.nojekyll"
git -C "$tmp" init -q -b gh-pages
git -C "$tmp" add -A
git -C "$tmp" commit -q -m "Site gerado a partir de $versao"
git -C "$tmp" push -q -f "$remoto" gh-pages

echo "Pronto. O GitHub Pages atualiza o site em um ou dois minutos."
