# Guia do DP-666

Guia independente do rádio DEEPELEC DP-666, um receptor com o sintonizador NXP TEF6686 e o módulo ESP32. Explica os botões e os menus, recomenda ajustes para o Brasil, ajuda a resolver problemas e mostra como usar o rádio com o computador.

**Site:** https://mflipe.github.io/guia-dp666/

O guia funciona como um app, no celular e no computador, nos temas claro e escuro. Tem os controles do rádio em 3D, um explorador de ajustes com busca, um assistente de problemas e a placa em 3D.

## Estrutura

| Pasta | O que tem |
|---|---|
| `site/docs/` | O texto das páginas, em Markdown |
| `site/` | O gerador. O `build.py` junta o texto, o `template.html`, o `app.js`, os dados dos menus (`menuspec.py`, `didatica.py`, `appdata.py`, `data.py`) e os diagramas (`diagrams.py`) num único `index.html` |
| `viewer3d/` | Os visualizadores 3D do painel, da placa e do ESP32, feitos com three.js |
| `scripts/publicar.sh` | Gera o site e publica no GitHub Pages |

## Gerar o site

Precisa de Python 3 e Node.js 18 ou mais novo.

```sh
pip install -r requirements.txt
(cd viewer3d && npm ci && npm run build)
python3 site/build.py
```

O resultado fica em `site/preview/`: o `index.html` e o `js/viewer3d.js`. Para ver no computador, sirva essa pasta e abra http://localhost:8000:

```sh
python3 -m http.server -d site/preview
```

Abrir o `index.html` direto do disco não carrega o 3D, porque o navegador bloqueia módulos JavaScript fora de um servidor.

## Publicar

```sh
./scripts/publicar.sh
```

O script gera o site e envia o resultado para a branch `gh-pages`, que o GitHub Pages serve. Essa branch é refeita a cada publicação; o histórico fica na `main`.

## Aviso

Guia independente, sem ligação com a DEEPELEC nem com o PE5PVB. A página Fontes do guia lista de onde vem cada informação.
