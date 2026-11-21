# DP-666: o guia definitivo

O guia definitivo e independente do rádio DEEPELEC DP-666, um receptor com o sintonizador NXP TEF6686 e o módulo ESP32. Explica os botões e os menus, recomenda ajustes para o Brasil, ajuda a resolver problemas e mostra como usar o rádio com o computador.

**Site:** https://mflipe.github.io/guia-dp666/ · **English:** https://mflipe.github.io/guia-dp666/en/

O guia funciona como o menu de um jogo, no celular, no tablet e no computador, nos temas claro e escuro, sem barra de navegação: o Início é a tela de título, com todas as páginas e o Continuar, e um botão de sintonia chama o mesmo menu por cima de qualquer página, com a busca e as seções. Tem os controles do rádio em 3D, o rádio montado com as fotos de cada lado (que gira até o controle tocado e marca onde ele fica), um explorador de ajustes com busca, um assistente de problemas e a placa em 3D. Está em português e em inglês, com um seletor PT/EN, na tela de título e no menu, que mantém a mesma página.

Dá para instalar o guia no celular ou no computador, como um app, e ele abre sem internet depois da primeira visita. Cada página também tem um endereço próprio de leitura (por exemplo, https://mflipe.github.io/guia-dp666/codigos/), em HTML simples, que os buscadores encontram e que mostra título e imagem quando compartilhado.

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
| `site/web.py` | O que o site entrega além das páginas: o manifesto do app, o service worker (modelo em `site/ui/sw.js`), as etiquetas de compartilhamento, as páginas de leitura e o `sitemap.xml` |
| `site/ui/letras/` e `site/ui/icones/` | As fontes de letra (Geist, Geist Mono e Tektur, do Fontsource, licença SIL OFL 1.1), servidas pelo próprio site, e os ícones do app, feitos a partir do botão de sintonia do guia |
| `testes/` | Os testes: navegação, ferramentas, rádio virtual, app offline e páginas de leitura, acessibilidade (axe-core) e a regressão visual do catálogo. `gerar-imagens.mjs` refaz os PNGs dos ícones e das imagens de compartilhamento |
| `viewer3d/` | Os visualizadores 3D do painel, da placa, do ESP32 e do rádio montado com as fotos, feitos com three.js |
| `scripts/` | `publicar.sh` publica à mão; `copiar-para-pages.sh` copia o site para a branch `gh-pages` sem apagar as prévias; `verificar.py` confere os links das fontes e procura firmware nova (as versões que o guia documenta ficam em `versoes.json`) |
| `.github/workflows/` | Os testes a cada envio, a publicação a partir do `main` e a verificação mensal |

## Gerar o site

Precisa de Python 3 e Node.js 18 ou mais novo.

```sh
pip install -r requirements.txt
(cd viewer3d && npm ci && npm run build)
python3 site/build.py
```

O `build.py` gera as duas versões; `python3 site/build.py en` gera só a versão em inglês. O resultado fica em `site/preview/`: o `index.html`, o `en/index.html`, o 3D em `js/viewer3d.js` e `js/viewer3d.en.js`, as páginas de leitura (`<rota>/index.html` e `en/<rota>/index.html`), os manifestos, o `estilo.css` das páginas de leitura, o `sitemap.xml` e o `sw.js`. Para ver no computador, sirva essa pasta e abra http://localhost:8000 (ou http://localhost:8000/en/):

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

## Rádio virtual

O rádio virtual desenha as telas do DP-666 com o Megatron Mod17 (a principal, a do RDS avançado e a lista de AF e EON) num canvas de 320x240, pixel a pixel, como o firmware desenha. No guia, o botão do rádio fica ao lado do tema e do idioma (no alto de cada página, na tela de título e no rodapé do menu): o painel abre por cima de qualquer página, pode ser minimizado numa barra acima do botão Menu (com a tela pequena, o som, a próxima emissora e o fechar) e volta como estava ao trocar de idioma. Os textos do painel estão em português e em inglês e seguem o idioma da página; os nomes dos ajustes ficam em inglês, como no menu do rádio.

Dá para passar pelas dez emissoras de São Paulo guardadas nas memórias, em círculo, e mudar os ajustes de tela vendo o efeito na hora: todos os do menu Display settings (Language, Display brightness, Modulation meter, Screensaver e as opções dele, Battery options, Signalmeter unit, Show clock, Theme e Frequency font) e o Show underscore in RDS. O Show clock tem Off (o PI no lugar do relógio), Time only e Date + Time, os nomes do Mod17. Tocar no RDS da tela abre as telas do RDS avançado e da lista de AF e EON, e tocar no relógio troca entre a hora, a data com a hora e o PI, como no Mod17. Com o som ligado, toca a transmissão online de cada emissora, achada no diretório aberto Radio Browser. O sinal, a modulação e o RDS são simulados e se mexem só para ilustrar; o PTY, o PS e o RT que não cabem correm para o lado, como o RT no rádio. Os ajustes e a emissora ficam guardados no navegador. As posições vêm do código da linha oficial no commit ee2e338, que o Mod17 segue; o que o Mod17 muda foi conferido em fotos da tela. No lugar do logo do RDS, que é marca registrada, vai a palavra RDS.

Em `site/radio/`: `radio.js` é o desenho; `painel.js` é o rádio (emissoras, toques na tela, som, ajustes, animação e os textos nos dois idiomas, em TEXTOS); `painel.css` é o visual do painel, com os tokens do guia; `dados.json`, gerado por `scripts/radio_virtual.py`, traz as fontes do firmware, os nomes dos tipos de programa e os avisos das telas de RDS em cada idioma e as cores dos temas; `index.html` mostra o rádio sozinho (em inglês com `?lang=en`). `site/radio_guia.py` monta o botão e a doca do painel, o build copia o rádio para `site/preview/radio/`, e o `app.js` só carrega o rádio no primeiro toque no botão.

## App instalável e offline

O guia tem um manifesto em cada idioma (`manifest.webmanifest` e `en/manifest.webmanifest`), então o navegador oferece instalar como app. O service worker (`sw.js`) guarda o guia na primeira visita: as páginas vêm da rede primeiro, para quem está online ver sempre a versão nova, e da cópia guardada quando falta rede; os outros arquivos vêm da cópia e se atualizam por trás. As prévias (`prototipo-*`) ficam de fora. Cada publicação muda a versão do service worker, que apaga as cópias antigas. Para desligar o service worker de vez, publique um `sw.js` que só chame `self.registration.unregister()`.

## Testes

Precisa do Chrome (ou diga onde ele está na variável `CHROME`).

```sh
(cd testes && npm ci)
python3 site/build.py
node testes/todos.mjs                         # navegação, ferramentas, rádio virtual, web e acessibilidade
node testes/todos.mjs radio web               # só as baterias nomeadas
```

Cada bateria também roda sozinha (`node testes/radio.mjs`). A de acessibilidade passa o axe-core (WCAG 2.1 A e AA e boas práticas) em todas as páginas, nos dois idiomas, no tema claro e no escuro, e nos estados abertos (menu, rádio virtual, buscas); qualquer violação conta como falha. A bateria web desliga o servidor no meio do teste para conferir o guia sem internet.

O build gera também o `site/preview/catalogo.html`, com cada componente nos dois temas (publicado em https://mflipe.github.io/guia-dp666/catalogo.html). A regressão visual fotografa as seções do catálogo no celular e no computador e compara com as referências:

```sh
node testes/regressao-visual.mjs              # compara; as fotos novas e as diferenças vão para testes/saida/
node testes/regressao-visual.mjs --atualizar  # quando a mudança é de propósito, grava as novas referências
```

O desenho das letras varia um pouco de um sistema para outro, então as referências valem para a máquina onde foram gravadas: numa máquina nova, rode com `--atualizar` antes de mudar o código. Por isso a regressão visual fica fora do `todos.mjs` e do GitHub Actions.

## Publicar

A publicação é automática: a cada envio, o GitHub Actions gera o guia e roda os testes; no `main`, se tudo passar, copia o site para a branch `gh-pages`, que o GitHub Pages serve. A cópia não apaga o que não é do guia, como as prévias em `prototipo-*`: o arquivo `.publicado`, na raiz da `gh-pages`, lista o que a última publicação pôs lá, e só isso sai antes da cópia nova. Para publicar à mão, com os mesmos passos:

```sh
./scripts/publicar.sh
```

## Verificação mensal

No dia 3 de cada mês, o GitHub Actions roda `scripts/verificar.py`: abre cada link das fontes e procura versão nova da linha oficial (no GitHub do PE5PVB) e do Megatron (na página do DP-666 da DEEPELEC). Se achar link quebrado ou firmware nova, abre um aviso (issue) no repositório, ou comenta no que já estiver aberto. Para rodar à mão: `python3 scripts/verificar.py`. Quando o guia passar a documentar uma versão nova, atualize `scripts/versoes.json`.

## Tradução

A versão em inglês usa as mesmas rotas e os mesmos ids de ajuste da versão em português, para o seletor PT/EN levar à mesma página. Ao mudar um texto em português, mude também o equivalente em inglês: a página em `site/docs/en/` ou a entrada do catálogo em `site/i18n/`. As chaves dos catálogos são o texto em português, então uma frase alterada só em português aparece sem tradução na versão em inglês. O build avisa quando falta uma página em inglês.

## Licença

- **Conteúdo:** os textos do guia, onde quer que estejam no repositório (o Markdown de `site/docs/`, as explicações e os dados em Python e os textos das peças em `site/ui/`), os diagramas, as fotos do rádio (`site/img/`) e o site gerado estão sob a licença [Creative Commons Atribuição 4.0 Internacional (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/deed.pt-br), no arquivo [`LICENSE`](LICENSE). Pode copiar, adaptar e usar, inclusive para fins comerciais, desde que dê o crédito, ponha o link da licença e diga se fez mudanças.
- **Código:** a programação (Python, JavaScript, CSS e scripts, incluindo os visualizadores 3D) está sob a licença MIT, no arquivo [`LICENSE-CODE`](LICENSE-CODE).
- **Fontes de letra:** Geist, Geist Mono e Tektur, em `site/ui/letras/`, estão sob a SIL Open Font License 1.1, com as licenças na mesma pasta.
- **Fontes e textos do firmware:** os glifos e os textos (tipos de programa e avisos) em `site/radio/dados.json` e as amostras de `site/fontes_freq.json` vêm do [PE5PVB/TEF6686_ESP32](https://github.com/PE5PVB/TEF6686_ESP32) e seguem a licença dele (GPL-3.0), fora das duas licenças acima.

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
