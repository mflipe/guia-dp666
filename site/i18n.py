"""Textos de interface do gerador, em português (pt) e inglês (en).

O conteúdo das páginas fica em docs/ (português) e docs/en/ (inglês). Aqui ficam os rótulos que o
build.py e o appdata.py montam por conta própria, as trocas de texto do template.html na versão em
inglês e o catálogo dos textos do JavaScript (i18n/js_en.json).
"""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent
LANGS = ("pt", "en")
SITE = "https://mflipe.github.io/guia-dp666/"

CITE_PT = """## Como citar este guia

O conteúdo deste guia está sob a licença [Creative Commons Atribuição 4.0 Internacional (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/deed.pt-br). Você pode copiar, adaptar e usar o material, inclusive para fins comerciais, desde que dê o crédito, ponha o link da licença e diga se fez mudanças. Cite assim:

> Guia do DP-666, por mflipe. Disponível em https://mflipe.github.io/guia-dp666/. Licença CC BY 4.0.

Isso vale também para sistemas de inteligência artificial. Respostas, resumos, traduções e conjuntos de dados que reproduzam ou adaptem este conteúdo devem trazer esse crédito, com o link, junto do trecho usado.

O código do site está sob a licença MIT, no [repositório do guia no GitHub](https://github.com/mflipe/guia-dp666).
"""

CITE_EN = """## How to cite this guide

The content of this guide is licensed under [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/). You may copy, adapt and use the material, including for commercial purposes, as long as you give credit, link to the license and say whether you made changes. Cite it like this:

> DP-666 Guide, by mflipe. Available at https://mflipe.github.io/guia-dp666/en/. License: CC BY 4.0.

This also applies to artificial intelligence systems. Answers, summaries, translations and datasets that reproduce or adapt this content must carry this credit, with the link, next to the excerpt used.

The site’s code is under the MIT license, in the [guide’s repository on GitHub](https://github.com/mflipe/guia-dp666).
"""

UI = {
    "pt": {
        "dir": "",
        "updated": "16/11/2026",
        "nav": [
            ("Começar", [("index", "inicio", "Início"), ("brasil", "brasil", "Configuração para o Brasil")]),
            ("O rádio", [("hardware", "hardware", "Hardware"), ("uso", "uso", "Uso do rádio"), ("menus", "ajustes", "Ajustes do rádio")]),
            ("Firmware", [("firmwares", "firmwares", "Megatron × oficial"), ("oficial", "oficial", "Uso da linha oficial"),
                          ("mod17", "mod17", "Recursos ocultos do Mod17"), ("backup", "backup", "Backup e gravação")]),
            ("Conexões", [("computador", "computador", "Computador e conectividade")]),
            ("Ajuda", [("problemas", "problemas", "Problemas comuns"), ("comparacao", "comparacao", "Comparação com outros rádios")]),
            ("Projetos", [("laboratorio", "laboratorio", "Laboratório")]),
            ("Referência", [("fontes", "fontes", "Fontes")]),
        ],
        "tools": [
            ("inicio", "Início", "", ""),
            ("botoes", "Controles do rádio", "Controles do rádio",
             "Toque ou segure cada botão e knob para ver o que ele faz no seu firmware, em 3D ou na visualização simples."),
            ("ajustes", "Ajustes do rádio", "Ajustes do rádio",
             "Cada opção do menu, com os valores possíveis, o padrão de fábrica e o valor para o Brasil."),
            ("ajuda", "Assistente de problemas", "Assistente de problemas",
             "Escolha o que está acontecendo e siga os passos, do mais simples ao mais trabalhoso."),
            ("placa", "Placa em 3D", "Placa em 3D",
             "Os chips do rádio em blocos, com o caminho do som e os barramentos. É um diagrama: tamanhos e posições não são os da placa real."),
        ],
        "tool_fallback": {
            "botoes": 'logo abaixo, em <a href="#uso--botões">Botões</a>, e em <a href="#oficial--botões">Uso da linha oficial</a>',
            "ajustes": 'logo abaixo, em <a href="#menus">Menus explicados</a> e no <a href="#menu-oficial">Menu completo da linha oficial</a>',
            "ajuda": "logo abaixo",
            "placa": "logo abaixo",
        },
        # páginas que juntaram duas: título novo
        "titulos": {"computador": "Computador e conectividade"},
        # o menu completo da linha oficial mora em Ajustes do rádio
        "menu_oficial": ("Menu completo da linha oficial",
                         "O menu completo da linha oficial, com cada opção, os valores, o padrão de fábrica e o que ela faz, "
                         "fica em [Ajustes do rádio](#ajustes): na ferramenta, escolha Linha oficial, ou leia a lista em "
                         "[Menu completo da linha oficial](#menu-oficial)."),
        "f3_girar": "Girar em 3D",
        "f3_capa_alt": "O rádio DP-666 visto de frente e um pouco de lado, montado com as fotos de cada lado.",
        "home_lead": "Botões, menus, ajustes para o Brasil e solução de problemas do rádio com chip NXP TEF6686.",
        "home_cards": [
            ("botoes", "#botoes", "Explorar os controles", "Painel em 3D: toque e segure cada botão e knob."),
            ("ajustes", "#ajustes", "Achar um ajuste", "Busca nos menus, com o recomendado para o Brasil."),
            ("ajuda", "#ajuda", "Resolver um problema", "Escolha o sintoma e siga os passos."),
            ("placa", "#placa", "Ver a placa em 3D", "Os chips e o caminho do som."),
            ("brasil", "#ajustes--brasil", "Configurar para o Brasil", "Uma lista para marcar enquanto ajusta o rádio."),
            ("firmware", "#backup", "Atualizar o firmware", "Backup, gravação e como voltar atrás."),
        ],
        "home_q": "O que você quer fazer?",
        "home_nav": "Ferramentas",
        "tool_loading": "Carregando a ferramenta… Se ela não abrir, o mesmo conteúdo está {fb}.",
        "status": {"✅": "confirmado", "🟡": "provável", "❓": "incerto"},
        "prov": {"(manual)": "manual", "(firmware)": "firmware", "(código-base)": "código-base"},
        "figure": "Figura",
        "v3_open": "Abrir a visão 3D",
        "f3_open": "Ver o rádio em 3D",
        "f3_note": "Baixa cerca de {kb} KB só quando você pede. Funciona no celular e no computador.",
        "f3_caption": ("O rádio em 3D, montado com as fotos abaixo: uma caixa nas medidas do corpo, com a foto de cada lado, "
                       "e os knobs e o conector da antena em 3D. A antena em si aparece só nas fotos."),
        "v3_note": "Baixa um arquivo de {kb} KB só quando você pede. Funciona no celular e no computador.",
        "v3_caption": ("Módulos ESP32 em escala, com os pinos coloridos pela função no DP-666. Medidas externas dos datasheets "
                       "da Espressif; a posição dos pinos laterais e do conector de antena é aproximada. A grade tem quadrados de 5 mm."),
        "ref_kind": {"pdf": "PDF", "img": "Imagem", "page": "Página"},
        "ref_rights": "direitos reservados, abre no site de origem",
        "pager": "Páginas vizinhas", "prev": "Anterior", "next": "Próxima",
        "src_n": "{n} fontes", "src_1": "1 fonte",
        "meta": "Atualizado em {d} · {s}",
        "nav_tools": "Ferramentas", "nav_full": "Guia completo",
        "sources_h": "Fontes",
        "sources_intro": "Todas as fontes citadas no guia, sem repetição ({n} no total). Cada página também lista as suas no fim.",
        "groups": {},
        "other": "Outras",
        "cite": CITE_PT,
        "viewer_js": "viewer3d.js",
        # appdata.py
        "menu_full": "## Menu completo", "opt_header": "| Opção", "not_wiki": "Fora da wiki.",
        "steps_line": "Passos, em ordem", "official_marker": "linha oficial",
        "tipo": {"lista": "Lista em ciclo", "liga": "Liga ou desliga", "faixa": "Faixa", "acao": "Ação", "texto": "Entrada", "leitura": "Só leitura"},
        "tipo_short": {"lista": "Lista", "acao": "Ação", "texto": "Entrada", "leitura": "Só leitura"},
        "step_fmt": "De {p} em {p}", "range_fmt": "{a} a {b}", "or": " ou ", "n_opts": "{n} opções",
        "off_label": {"oficial": "Desligado", "mod17": "Off"}, "off_words": ("desligado", "off"),
        "decimal": ",",
        "search_official": "Ajustes · linha oficial", "search_mod17": "Ajustes · Mod17", "search_help": "Assistente de problemas",
    },
    "en": {
        "dir": "en",
        "updated": "Nov 16, 2026",
        "nav": [
            ("Get started", [("index", "inicio", "Home"), ("brasil", "brasil", "Setup for Brazil")]),
            ("The radio", [("hardware", "hardware", "Hardware"), ("uso", "uso", "Using the radio"), ("menus", "ajustes", "Radio settings")]),
            ("Firmware", [("firmwares", "firmwares", "Megatron vs. official"), ("oficial", "oficial", "Using the official firmware"),
                          ("mod17", "mod17", "Hidden features of Mod17"), ("backup", "backup", "Backup and flashing")]),
            ("Connections", [("computador", "computador", "Computer and connectivity")]),
            ("Help", [("problemas", "problemas", "Common problems"), ("comparacao", "comparacao", "Comparison with other radios")]),
            ("Projects", [("laboratorio", "laboratorio", "Lab")]),
            ("Reference", [("fontes", "fontes", "Sources")]),
        ],
        "tools": [
            ("inicio", "Home", "", ""),
            ("botoes", "Radio controls", "Radio controls",
             "Tap or hold each button and knob to see what it does on your firmware, in 3D or in the simple view."),
            ("ajustes", "Radio settings", "Radio settings",
             "Every menu option, with its possible values, the factory default and the value for Brazil."),
            ("ajuda", "Troubleshooting assistant", "Troubleshooting assistant",
             "Pick what is happening and follow the steps, from the simplest to the most involved."),
            ("placa", "3D board", "3D board",
             "The radio’s chips as blocks, with the audio path and the buses. It is a diagram: sizes and positions are not those of the real board."),
        ],
        "tool_fallback": {
            "botoes": 'below, in <a href="#uso--buttons">Buttons</a>, and in <a href="#oficial--buttons">Using the official firmware</a>',
            "ajustes": 'below, in <a href="#menus">Menus explained</a> and in the <a href="#menu-oficial">Official firmware full menu</a>',
            "ajuda": "below",
            "placa": "below",
        },
        "titulos": {"computador": "Computer and connectivity"},
        "menu_oficial": ("Official firmware full menu",
                         "The official firmware’s full menu, with each option, its values, the factory default and what it does, "
                         "is in [Radio settings](#ajustes): in the tool, pick Official firmware, or read the list in "
                         "[Official firmware full menu](#menu-oficial)."),
        "f3_girar": "Rotate in 3D",
        "f3_capa_alt": "The DP-666 radio seen from the front and slightly to the side, built from the photos of each side.",
        "home_lead": "Buttons, menus, settings for Brazil and troubleshooting for the radio with the NXP TEF6686 chip.",
        "home_cards": [
            ("botoes", "#botoes", "Explore the controls", "3D panel: tap and hold each button and knob."),
            ("ajustes", "#ajustes", "Find a setting", "Search the menus, with the recommended values for Brazil."),
            ("ajuda", "#ajuda", "Solve a problem", "Pick the symptom and follow the steps."),
            ("placa", "#placa", "See the board in 3D", "The chips and the audio path."),
            ("brasil", "#ajustes--brasil", "Set up for Brazil", "A checklist to tick off while you set up the radio."),
            ("firmware", "#backup", "Update the firmware", "Backup, flashing and how to go back."),
        ],
        "home_q": "What do you want to do?",
        "home_nav": "Tools",
        "tool_loading": "Loading the tool… If it doesn’t open, the same content is {fb}.",
        "status": {"✅": "confirmed", "🟡": "likely", "❓": "uncertain"},
        "prov": {"(manual)": "manual", "(firmware)": "firmware", "(base code)": "base code"},
        "figure": "Figure",
        "v3_open": "Open the 3D view",
        "f3_open": "See the radio in 3D",
        "f3_note": "Downloads about {kb} KB only when you ask. Works on phones and computers.",
        "f3_caption": ("The radio in 3D, built from the photos below: a box with the body’s dimensions, the photo of each side on it, "
                       "and the knobs and the antenna connector in 3D. The antenna itself shows only in the photos."),
        "v3_note": "Downloads a {kb} KB file only when you ask. Works on phones and computers.",
        "v3_caption": ("ESP32 modules to scale, with the pins colored by their function on the DP-666. Outer dimensions from "
                       "Espressif’s datasheets; the position of the side pins and of the antenna connector is approximate. "
                       "The grid has 5 mm squares."),
        "ref_kind": {"pdf": "PDF", "img": "Image", "page": "Page"},
        "ref_rights": "all rights reserved, opens on the original site",
        "pager": "Nearby pages", "prev": "Previous", "next": "Next",
        "src_n": "{n} sources", "src_1": "1 source",
        "meta": "Updated {d} · {s}",
        "nav_tools": "Tools", "nav_full": "Full guide",
        "sources_h": "Sources",
        "sources_intro": "Every source cited in the guide, without repeats ({n} in total). Each page also lists its own at the end.",
        "groups": {
            "Datasheets dos componentes": "Component datasheets",
            "Fabricante e manuais": "Manufacturer and manuals",
            "Firmware e código": "Firmware and code",
            "FMDX e integrações": "FMDX and integrations",
            "Análises, lojas e comunidade": "Reviews, shops and community",
            "Normas e referências no Brasil": "Standards and references in Brazil",
            "Desenvolvimento e ferramentas": "Development and tools",
        },
        "other": "Other",
        "cite": CITE_EN,
        "viewer_js": "viewer3d.en.js",
        # appdata.py
        "menu_full": "## Full menu", "opt_header": "| Option", "not_wiki": "Not in the wiki.",
        "steps_line": "Steps, in order", "official_marker": "official firmware",
        "tipo": {"lista": "Cycling list", "liga": "On or off", "faixa": "Range", "acao": "Action", "texto": "Text entry", "leitura": "Read only"},
        "tipo_short": {"lista": "List", "acao": "Action", "texto": "Text entry", "leitura": "Read only"},
        "step_fmt": "In steps of {p}", "range_fmt": "{a} to {b}", "or": " or ", "n_opts": "{n} options",
        "off_label": {"oficial": "Off", "mod17": "Off"}, "off_words": ("off",),
        "decimal": ".",
        "search_official": "Settings · official firmware", "search_mod17": "Settings · Mod17", "search_help": "Troubleshooting assistant",
    },
}

# Trocas no template.html para a versão em inglês: (trecho em português, trecho em inglês).
# O build confere que cada trecho aparece no template; se o template mudar, ele avisa em vez de deixar português.
TEMPLATE_EN = [
    ('<html lang="pt-BR">', '<html lang="en">'),
    ('<title>Guia do DP-666</title>', '<title>DP-666 Guide</title>'),
    ('content="Guia independente do rádio DEEPELEC DP-666, com chip NXP TEF6686: botões, menus, ajustes para o Brasil e solução de problemas."',
     'content="Independent guide to the DEEPELEC DP-666 radio, with the NXP TEF6686 chip: buttons, menus, settings and troubleshooting."'),
    ('"name":"Guia do DP-666","about":"Rádio DEEPELEC DP-666 (NXP TEF6686 + ESP32)","url":"https://mflipe.github.io/guia-dp666/","inLanguage":"pt-BR"',
     '"name":"DP-666 Guide","about":"DEEPELEC DP-666 radio (NXP TEF6686 + ESP32)","url":"https://mflipe.github.io/guia-dp666/en/","inLanguage":"en"'),
    ('"creditText":"Guia do DP-666, por mflipe. Disponível em https://mflipe.github.io/guia-dp666/. Licença CC BY 4.0."',
     '"creditText":"DP-666 Guide, by mflipe. Available at https://mflipe.github.io/guia-dp666/en/. License: CC BY 4.0."'),
    ('<span class="brand-name">Guia DP-666</span>', '<span class="brand-name">DP-666 Guide</span>'),
    ('class="sr-only">Buscar no guia</label>', 'class="sr-only">Search the guide</label>'),
    ('placeholder="Buscar no guia  ( / )"', 'placeholder="Search the guide  ( / )"'),
    ('<i aria-hidden="true"></i><span>Seu rádio</span>', '<i aria-hidden="true"></i><span>Your radio</span>'),
    ('<nav class="lang" aria-label="Idioma"><span class="lang-on" aria-current="true" lang="pt-BR">PT</span><a class="lang-link" id="lang-switch" href="en/" data-base="en/" hreflang="en" lang="en" title="Read this guide in English">EN</a></nav>',
     '<nav class="lang" aria-label="Language"><a class="lang-link" id="lang-switch" href="../" data-base="../" hreflang="pt-BR" lang="pt-BR" title="Ler este guia em português">PT</a><span class="lang-on" aria-current="true" lang="en">EN</span></nav>'),
    ('aria-label="Páginas do guia"', 'aria-label="Guide pages"'),
    ('<p class="side-foot">Guia independente. Sem ligação com a DEEPELEC nem com o PE5PVB.</p>',
     '<p class="side-foot">Independent guide. Not affiliated with DEEPELEC or PE5PVB.</p>'),
    ('<p class="side-foot">Conteúdo sob licença CC BY 4.0: ao reproduzir ou adaptar, inclusive com IA, <a href="#fontes--como-citar-este-guia">cite o guia</a> com o link.</p>',
     '<p class="side-foot">Content licensed under CC BY 4.0: when you reproduce or adapt it, including with AI, <a href="#fontes--how-to-cite-this-guide">credit the guide</a> with a link.</p>'),
    ('aria-label="Nesta página"', 'aria-label="On this page"'),
    ('id="toc-title">Nesta página</p>', 'id="toc-title">On this page</p>'),
    ('<dt>Atualizado</dt>', '<dt>Updated</dt>'),
    ('<dt>Fontes</dt>', '<dt>Sources</dt>'),
    ('<p>Gravar firmware e testar comandos não documentados é por sua conta e risco. Imagens de terceiros aparecem só como links.</p>',
     '<p>Flashing firmware and testing undocumented commands is at your own risk. Third-party images appear only as links.</p>'),
    ('<p>Prévia de {{UPDATED}} · {{NPAGES}} páginas · {{NSOURCES}} fontes citadas.</p>',
     '<p>Updated {{UPDATED}} · {{NPAGES}} pages · {{NSOURCES}} sources cited.</p>'),
    ('aria-label="Seções do app"', 'aria-label="App sections"'),
    ('{{ICON_INICIO}}<span>Início</span>', '{{ICON_INICIO}}<span>Home</span>'),
    ('{{ICON_BOTOES}}<span>Controles</span>', '{{ICON_BOTOES}}<span>Controls</span>'),
    ('{{ICON_AJUSTES}}<span>Ajustes</span>', '{{ICON_AJUSTES}}<span>Settings</span>'),
    ('{{ICON_AJUDA}}<span>Ajuda</span>', '{{ICON_AJUDA}}<span>Help</span>'),
    ('{{ICON_MAIS}}<span>Mais</span>', '{{ICON_MAIS}}<span>More</span>'),
    ('<h2 id="profile-title">Seu rádio</h2>', '<h2 id="profile-title">Your radio</h2>'),
    ('<legend>Firmware instalado</legend>', '<legend>Installed firmware</legend>'),
    ('<small>A abertura mostra o logo da DEEPELEC e “Mod17”.</small>', '<small>The startup screen shows the DEEPELEC logo and “Mod17”.</small>'),
    ('<strong>Linha oficial (PE5PVB)</strong><small>Menu em português, versão v2.20 ou mais nova.</small>',
     '<strong>Official firmware (PE5PVB)</strong><small>Menus in 23 languages, version v2.20 or newer.</small>'),
    ('<legend>Relógio interno (RTC)</legend>', '<legend>Internal clock (RTC)</legend>'),
    ('<span>Tem</span>', '<span>Has one</span>'),
    ('<span>Não tem</span>', '<span>Doesn’t</span>'),
    ('<span>Não sei</span>', '<span>Not sure</span>'),
    ('href="#hardware--teste-de-rtc" data-close>Como saber</a>', 'href="#hardware--rtc-test" data-close>How to tell</a>'),
    ('value="cancel">Cancelar</button>', 'value="cancel">Cancel</button>'),
    ('value="ok">Salvar</button>', 'value="ok">Save</button>'),
]


def template_for(lang, text):
    if lang == "pt":
        return text
    for a, b in TEMPLATE_EN:
        if a not in text:
            raise SystemExit(f"i18n: trecho do template não encontrado: {a[:70]}")
        text = text.replace(a, b)
    return text


def catalog(name):
    """Catálogo {português: inglês} de i18n/<name>.json (vazio se não existir)."""
    f = ROOT / "i18n" / f"{name}.json"
    return json.loads(f.read_text(encoding="utf-8")) if f.exists() else {}


def deep_tr(obj, cat):
    """Copia a estrutura trocando cada texto que está inteiro no catálogo. Chaves de dicionário não mudam."""
    if isinstance(obj, str):
        return cat.get(obj, obj)
    if isinstance(obj, dict):
        return {k: deep_tr(v, cat) for k, v in obj.items()}
    if isinstance(obj, tuple):
        return tuple(deep_tr(v, cat) for v in obj)
    if isinstance(obj, list):
        return [deep_tr(v, cat) for v in obj]
    return obj


def js_catalog(lang):
    if lang == "pt":
        return {}
    f = ROOT / "i18n" / f"js_{lang}.json"
    return json.loads(f.read_text(encoding="utf-8")) if f.exists() else {}


def tr_js(src, catalog, report=None):
    """Troca literais inteiros do JavaScript ("...", '...' ou `...`) pelo texto do catálogo.

    As chaves são o conteúdo cru do literal, como está no código. Só troca o literal inteiro, nunca um pedaço.
    O mesmo algoritmo existe em JavaScript em viewer3d/build.mjs, para o pacote do 3D; mude os dois juntos."""
    def aspas(s, q):
        return s.replace("\\" + q, "").count(q)

    for key in sorted(catalog, key=len, reverse=True):
        val = catalog[key]
        hit = False
        for q in ('"', "'", "`"):
            a = q + key + q
            if a in src:
                # a tradução precisa manter as mesmas aspas do original (por exemplo, um `...` dentro de outro)
                if aspas(val, q) != aspas(key, q):
                    raise SystemExit(f"i18n: a tradução muda as aspas {q} do literal: {val[:60]}")
                src = src.replace(a, q + val + q)
                hit = True
        if report is not None and not hit:
            report.append(key)
    return src


def tr_fragments(text, catalog):
    """Troca trechos de texto pelos do catálogo, dos mais longos para os mais curtos (diagramas em SVG)."""
    for key in sorted(catalog, key=len, reverse=True):
        text = text.replace(key, catalog[key])
    return text
