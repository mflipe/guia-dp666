#!/usr/bin/env bash
# Copia o site gerado (site/preview) para uma cópia da branch gh-pages, sem mexer no que não é do guia, como as
# prévias (prototipo-*). O arquivo .publicado, na raiz da gh-pages, lista o que a última publicação pôs lá: o que
# estava na lista sai antes da cópia, para não sobrar página que o guia não tem mais.
# Uso: scripts/copiar-para-pages.sh <pasta com a branch gh-pages>
set -euo pipefail

raiz="$(cd "$(dirname "$0")/.." && pwd)"
origem="$raiz/site/preview"
destino="${1:?diga a pasta com a branch gh-pages}"
[ -f "$origem/index.html" ] || { echo "Falta o site gerado. Rode antes: python3 site/build.py" >&2; exit 2; }
[ -d "$destino/.git" ] || [ -f "$destino/.git" ] || { echo "$destino não é uma cópia da branch gh-pages" >&2; exit 2; }

# na primeira vez, sem .publicado: o que o publicar.sh antigo punha
if [ -f "$destino/.publicado" ]; then anteriores="$(cat "$destino/.publicado")"; else anteriores="index.html catalogo.html en js img radio"; fi
for item in $anteriores; do
  case "$item" in ""|.|..|.git|.nojekyll|prototipo-*) continue ;; esac
  rm -rf "${destino:?}/$item"
done

novos=()
for caminho in "$origem"/*; do
  item="$(basename "$caminho")"
  case "$item" in _*) continue ;; esac   # pastas de teste locais, como _testfonts
  cp -r "$caminho" "$destino/"
  novos+=("$item")
done
touch "$destino/.nojekyll"
printf '%s\n' "${novos[@]}" > "$destino/.publicado"
echo "Copiado para $destino: ${novos[*]}"
