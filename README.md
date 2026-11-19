# DP-666: o guia definitivo

O guia definitivo e independente do rádio DEEPELEC DP-666, um receptor com o sintonizador NXP TEF6686 e o módulo ESP32. Explica os botões e os menus, recomenda ajustes para o Brasil, ajuda a resolver problemas e mostra como usar o rádio com o computador.

**Site:** https://mflipe.github.io/guia-dp666/ · **English:** https://mflipe.github.io/guia-dp666/en/

O guia funciona como o menu de um jogo, no celular, no tablet e no computador, nos temas claro e escuro, sem barra de navegação: o Início é a tela de título, com todas as páginas e o Continuar, e um botão de sintonia chama o mesmo menu por cima de qualquer página, com a busca e as seções. Tem os controles do rádio em 3D, o rádio montado com as fotos de cada lado (que gira até o controle tocado e marca onde ele fica), um explorador de ajustes com busca, um assistente de problemas e a placa em 3D. Está em português e em inglês, com um seletor PT/EN, na tela de título e no menu, que mantém a mesma página.

## Estrutura

| Pasta | O que tem |
|---|---|
| `site/docs/` | O texto das páginas, em Markdown |
| `site/docs/en/` | O texto das páginas em inglês, com os mesmos nomes de arquivo |
| `site/i18n.py` e `site/i18n/` | A tradução do resto: textos da interface, catálogos português → inglês dos dados, dos diagramas e do JavaScript, e os nomes dos menus da linha oficial em inglês (`menuspec_en.py`, `didatica_en.py`) |
| `site/` | O gerador. O `build.py` junta o texto, as peças do layout em `ui/` (montadas pelo `layout.py`), o `app.js`, os dados dos menus (`menuspec.py`, `didatica.py`, `appdata.py`, `data.py`) e os diagramas (`diagrams.py`) num único `index.html` |
| `site/ui/css/` | Os estilos, um arquivo por componente, em camadas na ordem `tokens`, `base`, `conteudo`, `componentes`, `ferramentas` e `layout`: uma camada posterior vence a anterior, sem depender da especificidade. As cores ficam só nos tokens (`tokens/`): `tokens.css` é o tema Claro, a base, e cada outro tema tem um arquivo só com o que muda |
| `site/componentes.py` e `site/ui/componentes.js` | Os componentes da interface (botão, nota, selo, seletor, opção, amostra de cor, lista recolhível, item do menu), com os mesmos nomes e o mesmo HTML nos dois lados: o `build.py` usa o de Python; o `app.js` e o `navegacao.js`, o de JavaScript. O build confere os dois com os exemplos de `componentes.py` |
| `site/tema.py` e `site/temas_radio.py` | Os temas do guia (Automático, Claro, Escuro e os temas do firmware): a lista dos temas e tudo o que sai dela, dos blocos de CSS ao botão e à janela de escolha |
| `site/catalogo.py` | Gera o `catalogo.html`: cada componente no lugar onde aparece no guia, nos temas claro e escuro, e as cores dos tokens |
| `testes/` | A regressão visual: fotografa cada seção do catálogo e compara com as referências em `testes/referencia/` |
| `viewer3d/` | Os visualizadores 3D do painel, da placa, do ESP32 e do rádio montado com as fotos, feitos com three.js |
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

## Temas do guia

O botão de tema fica ao lado do idioma e do perfil do rádio, no alto de cada página, na tela de título e no rodapé do menu. Ele deixa escolher entre Automático (segue o claro ou o escuro do aparelho), Claro, Escuro e os 17 temas do firmware, no grupo **Do rádio**. A escolha fica guardada no navegador e é aplicada antes de a página aparecer.

Os temas do rádio não têm arquivo: `site/temas_radio.py` transforma as cores de cada tema do firmware (as de `site/temas.json`, tiradas do código) nos tokens do guia. O fundo da tela vira o fundo da página, a moldura faz as linhas e as superfícies, a cor principal vira o destaque, e tudo o que é lido como texto tem contraste de pelo menos 4,5:1 com o fundo e as superfícies. Um tema que ganhar cores em `temas.json` (como o Chinese Red e o Retro, do Mod17) entra sozinho.

Para criar um tema do guia:

1. Acrescente uma entrada na lista `TEMAS` de `site/tema.py`: o id, o nome em português e em inglês, o esquema (`light` ou `dark`) e, se quiser partir de um tema que já existe, `base` com o id dele.
2. Crie `site/ui/css/tokens/<id>.css` com um bloco `:root { … }` só com os tokens que mudam em relação ao Claro (ou ao tema de `base`).

O build faz o resto: o bloco do tema na folha de estilos, o papel quadriculado na cor de `--grid`, a cor da barra do navegador (a de `--bg`), a opção na janela, com a amostra das cores, e uma coluna a mais no catálogo. Para o Automático usar outro tema no claro ou no escuro, mude `AUTOMATICO` no mesmo arquivo.

## Modo telas (protótipo)

Nas páginas listadas em `EM_TELAS`, em `site/build.py` (por enquanto só Uso), a página não rola. O texto corre em colunas do tamanho da tela e a leitura avança de tela em tela: gesto para o lado ou para cima, setas, Page Down, espaço, roda do mouse ou os botões ‹ › da barra no pé da tela, que mostra a seção e a tela (3 de 15). Cada seção começa numa tela nova, a não ser que a tela de antes ficasse quase vazia. Figuras, avisos, tabelas e ferramentas não se partem; o que é maior que a tela rola por dentro. Links para seções, o menu, a busca, o Continuar e o Tab levam à tela certa, e a leitura fica no mesmo trecho quando a tela gira. O estilo está em `site/ui/css/layout/telas.css`, e a lógica, em `site/ui/navegacao.js`. As outras páginas continuam rolando como antes.

## Conferir a aparência

O build gera também o `site/preview/catalogo.html`, com cada componente nos dois temas (publicado em https://mflipe.github.io/guia-dp666/catalogo.html). A regressão visual fotografa as seções do catálogo no celular e no computador e compara com as referências:

```sh
(cd testes && npm ci)
python3 site/build.py
node testes/regressao-visual.mjs              # compara; as fotos novas e as diferenças vão para testes/saida/
node testes/regressao-visual.mjs --atualizar  # quando a mudança é de propósito, grava as novas referências
```

Precisa do Chrome (ou diga onde ele está na variável `CHROME`). As fontes da internet ficam bloqueadas durante as fotos, então as referências valem para a máquina onde foram gravadas: numa máquina nova, rode com `--atualizar` antes de mudar o código.

## Publicar

```sh
./scripts/publicar.sh
```

O script gera o site e envia o resultado para a branch `gh-pages`, que o GitHub Pages serve. Essa branch é refeita a cada publicação; o histórico fica na `main`.

## Tradução

A versão em inglês usa as mesmas rotas e os mesmos ids de ajuste da versão em português, para o seletor PT/EN levar à mesma página. Ao mudar um texto em português, mude também o equivalente em inglês: a página em `site/docs/en/` ou a entrada do catálogo em `site/i18n/`. As chaves dos catálogos são o texto em português, então uma frase alterada só em português aparece sem tradução na versão em inglês. O build avisa quando falta uma página em inglês.

## Licença

- **Conteúdo:** os textos do guia, onde quer que estejam no repositório (o Markdown de `site/docs/`, as explicações e os dados em Python e os textos das peças em `site/ui/`), os diagramas, as fotos do rádio (`site/img/`) e o site gerado estão sob a licença [Creative Commons Atribuição 4.0 Internacional (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/deed.pt-br), no arquivo [`LICENSE`](LICENSE). Pode copiar, adaptar e usar, inclusive para fins comerciais, desde que dê o crédito, ponha o link da licença e diga se fez mudanças.
- **Código:** a programação (Python, JavaScript, CSS e scripts, incluindo os visualizadores 3D) está sob a licença MIT, no arquivo [`LICENSE-CODE`](LICENSE-CODE).

## Como citar

Ao reproduzir ou adaptar o conteúdo, cite assim:

> DP-666: o guia definitivo, por mflipe. Disponível em https://mflipe.github.io/guia-dp666/. Licença CC BY 4.0.

Isso vale também para sistemas de inteligência artificial. Respostas, resumos, traduções e conjuntos de dados que reproduzam ou adaptem este conteúdo devem trazer esse crédito, com o link, junto do trecho usado.

Em alguns países, a lei permite usar textos no treino de modelos sem autorização. Nesses casos a licença não se aplica, e o pedido de crédito vale como preferência do autor.

## Aviso

Guia independente, sem ligação com a DEEPELEC nem com o PE5PVB. A página Fontes do guia lista de onde vem cada informação.

## In English

An independent guide to the DEEPELEC DP-666 radio (NXP TEF6686 tuner and ESP32): buttons, menus, settings for Brazil, troubleshooting and use with a computer. Read it at https://mflipe.github.io/guia-dp666/en/. The content is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) and the code under MIT. When you reproduce or adapt it, including with AI, credit it like this:

> DP-666 Guide, by mflipe. Available at https://mflipe.github.io/guia-dp666/en/. License: CC BY 4.0.
