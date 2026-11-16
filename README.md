# Guia do DP-666

Guia independente do rádio DEEPELEC DP-666, um receptor com o sintonizador NXP TEF6686 e o módulo ESP32. Explica os botões e os menus, recomenda ajustes para o Brasil, ajuda a resolver problemas e mostra como usar o rádio com o computador.

**Site:** https://mflipe.github.io/guia-dp666/ · **English:** https://mflipe.github.io/guia-dp666/en/

O guia funciona como um app, no celular e no computador, nos temas claro e escuro. Tem os controles do rádio em 3D, um explorador de ajustes com busca, um assistente de problemas e a placa em 3D. Está em português e em inglês, com um seletor PT/EN no topo que mantém a mesma página.

## Estrutura

| Pasta | O que tem |
|---|---|
| `site/docs/` | O texto das páginas, em Markdown |
| `site/docs/en/` | O texto das páginas em inglês, com os mesmos nomes de arquivo |
| `site/i18n.py` e `site/i18n/` | A tradução do resto: textos da interface, catálogos português → inglês dos dados, dos diagramas e do JavaScript, e os nomes dos menus da linha oficial em inglês (`menuspec_en.py`, `didatica_en.py`) |
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

O `build.py` gera as duas versões; `python3 site/build.py en` gera só a versão em inglês. O resultado fica em `site/preview/`: o `index.html`, o `en/index.html` e o 3D em `js/viewer3d.js` e `js/viewer3d.en.js`. Para ver no computador, sirva essa pasta e abra http://localhost:8000 (ou http://localhost:8000/en/):

```sh
python3 -m http.server -d site/preview
```

Abrir o `index.html` direto do disco não carrega o 3D, porque o navegador bloqueia módulos JavaScript fora de um servidor.

## Publicar

```sh
./scripts/publicar.sh
```

O script gera o site e envia o resultado para a branch `gh-pages`, que o GitHub Pages serve. Essa branch é refeita a cada publicação; o histórico fica na `main`.

## Tradução

A versão em inglês usa as mesmas rotas e os mesmos ids de ajuste da versão em português, para o seletor PT/EN levar à mesma página. Ao mudar um texto em português, mude também o equivalente em inglês: a página em `site/docs/en/` ou a entrada do catálogo em `site/i18n/`. As chaves dos catálogos são o texto em português, então uma frase alterada só em português aparece sem tradução na versão em inglês. O build avisa quando falta uma página em inglês.

## Licença

- **Conteúdo:** os textos do guia, onde quer que estejam no repositório (o Markdown de `site/docs/`, as explicações e os dados em Python e os textos do `site/template.html`), os diagramas e o site gerado estão sob a licença [Creative Commons Atribuição 4.0 Internacional (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/deed.pt-br), no arquivo [`LICENSE`](LICENSE). Pode copiar, adaptar e usar, inclusive para fins comerciais, desde que dê o crédito, ponha o link da licença e diga se fez mudanças.
- **Código:** a programação (Python, JavaScript, CSS e scripts, incluindo os visualizadores 3D) está sob a licença MIT, no arquivo [`LICENSE-CODE`](LICENSE-CODE).

## Como citar

Ao reproduzir ou adaptar o conteúdo, cite assim:

> Guia do DP-666, por mflipe. Disponível em https://mflipe.github.io/guia-dp666/. Licença CC BY 4.0.

Isso vale também para sistemas de inteligência artificial. Respostas, resumos, traduções e conjuntos de dados que reproduzam ou adaptem este conteúdo devem trazer esse crédito, com o link, junto do trecho usado.

Em alguns países, a lei permite usar textos no treino de modelos sem autorização. Nesses casos a licença não se aplica, e o pedido de crédito vale como preferência do autor.

## Aviso

Guia independente, sem ligação com a DEEPELEC nem com o PE5PVB. A página Fontes do guia lista de onde vem cada informação.

## In English

An independent guide to the DEEPELEC DP-666 radio (NXP TEF6686 tuner and ESP32): buttons, menus, settings for Brazil, troubleshooting and use with a computer. Read it at https://mflipe.github.io/guia-dp666/en/. The content is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) and the code under MIT. When you reproduce or adapt it, including with AI, credit it like this:

> DP-666 Guide, by mflipe. Available at https://mflipe.github.io/guia-dp666/en/. License: CC BY 4.0.
