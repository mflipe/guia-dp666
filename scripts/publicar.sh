#!/usr/bin/env bash
# Gera o site e publica na branch gh-pages, que o GitHub Pages serve, à mão. Normalmente quem publica é o GitHub
# Actions (.github/workflows/testes-e-publicacao.yml), a cada envio para o main que passa nos testes; este script
# serve para publicar sem ele. Ele não apaga o que não é do guia, como as prévias (prototipo-*), e envia sem forçar.
# Uso: ./scripts/publicar.sh
# Precisa de git, Node.js 18 ou mais novo e Python 3 com o pacote markdown (pip install -r requirements.txt).
set -euo pipefail

raiz="$(cd "$(dirname "$0")/.." && pwd)"
cd "$raiz"

echo "1/4 Visualizadores 3D (português e inglês)"
(cd viewer3d && npm ci --no-audit --no-fund && npm run build)

echo "2/4 Páginas (português e inglês)"
python3 site/build.py

echo "3/4 Testes"
(cd testes && npm ci --no-audit --no-fund && node todos.mjs)

echo "4/4 Envio para a branch gh-pages"
remoto="$(git remote get-url origin)"
versao="$(git rev-parse --short HEAD)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
git clone -q --branch gh-pages --single-branch "$remoto" "$tmp"
scripts/copiar-para-pages.sh "$tmp"
git -C "$tmp" add -A
if git -C "$tmp" diff --cached --quiet; then echo "Nada mudou no site."; exit 0; fi
git -C "$tmp" commit -q -m "Site gerado a partir de $versao"
git -C "$tmp" push -q origin gh-pages

echo "Pronto. O GitHub Pages atualiza o site em um ou dois minutos."
