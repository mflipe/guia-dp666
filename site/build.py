#!/usr/bin/env python3
"""Gera a prévia navegável do Guia do DP-666 a partir de docs/*.md.

Saída: preview/index.html (um único arquivo, sem dependências além das fontes do Google).
Os arquivos de docs/ seguem o formato do MkDocs, para virar um site no GitHub Pages depois.
"""
import html
import json
import pathlib
import re
from urllib.parse import urlparse

import sys

import markdown
from markdown.extensions.toc import slugify_unicode

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import appdata  # noqa: E402
import data  # noqa: E402
import diagrams  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parent
DOCS = ROOT / "docs"
OUT = ROOT / "preview" / "index.html"
UPDATED = "16/11/2026"

NAV = [
    ("Começar", [("index", "inicio", "Início"), ("brasil", "brasil", "Configuração para o Brasil")]),
    ("O rádio", [("hardware", "hardware", "Hardware"), ("uso", "uso", "Uso do rádio"), ("menus", "menus", "Menus explicados")]),
    ("Firmware", [("firmwares", "firmwares", "Megatron × oficial"), ("oficial", "oficial", "Uso da linha oficial"), ("mod17", "mod17", "Recursos ocultos do Mod17"), ("backup", "backup", "Backup e gravação")]),
    ("Conexões", [("computador", "computador", "Usar com o computador"), ("conectividade", "conectividade", "Conectividade e controle remoto")]),
    ("Ajuda", [("problemas", "problemas", "Problemas comuns"), ("comparacao", "comparacao", "Comparação com outros rádios")]),
    ("Projetos", [("laboratorio", "laboratorio", "Laboratório")]),
    ("Referência", [("fontes", "fontes", "Fontes")]),
]
PAGES = [(f, r, t, g) for g, items in NAV for (f, r, t) in items]

# ferramentas do app: rota, título no menu, título da página, chamada
TOOLS = [
    ("inicio", "Início", "", ""),
    ("botoes", "Controles do rádio", "Controles do rádio",
     "Toque ou segure cada botão e knob para ver o que ele faz no seu firmware, em 3D ou na visualização simples."),
    ("ajustes", "Ajustes do rádio", "Ajustes do rádio",
     "Cada opção do menu, com os valores possíveis, o padrão de fábrica e o valor para o Brasil."),
    ("ajuda", "Assistente de problemas", "Assistente de problemas",
     "Escolha o que está acontecendo e siga os passos, do mais simples ao mais trabalhoso."),
    ("placa", "Placa em 3D", "Placa em 3D",
     "Os chips do rádio em blocos, com o caminho do som e os barramentos. É um diagrama: tamanhos e posições não são os da placa real."),
]
TOOL_FALLBACK = {
    "botoes": '<a href="#uso">Uso do rádio</a> e <a href="#oficial">Uso da linha oficial</a>',
    "ajustes": '<a href="#menus">Menus explicados</a> e <a href="#oficial">Uso da linha oficial</a>',
    "ajuda": '<a href="#problemas">Problemas comuns</a>',
    "placa": '<a href="#hardware">Hardware</a>',
}
FILE_TO_ROUTE = {f: r for f, r, _, _ in PAGES}

# ---------------------------------------------------------------- fontes
SOURCE_GROUPS = [
    ("Datasheets dos componentes", ("nxp.com", "mouser.com", "espressif.com/sites/default/files/documentation", "documentation.espressif.com", "adafruit.com", "grobotronics", "xinluda", "lcsc.com", "epsondevice", "ti.com", "analog.com", "wch.cn", "wch-ic.com", "soselectronic", "toppwr", "richtek", "farnell.com", "waveshare.com")),
    ("Fabricante e manuais", ("deepelec.com", "raddy-download")),
    ("Firmware e código", ("github.com/PE5PVB", "github.com/flyoob", "github.com/SDRRADIO001", "newreleases.io")),
    ("FMDX e integrações", ("fmdx.org", "github.com/NoobishSVK", "github.com/bkram", "github.com/kkonradpl", "kantoaalto", "pira.cz")),
    ("Análises, lojas e comunidade", ("blogordie", "swling", "mediaspy", "thewearify", "fruugo", "passion-radio", "cridland", "radiomuseum")),
    ("Normas e referências no Brasil", ("arctel-cplp", "itu.int", "wikipedia", "diretolegaliza", "ntp.br", "planalto.gov.br", "rds.org.uk")),
    ("Desenvolvimento e ferramentas", ("WCHSoftGroup", "soldered.com", "claude.com", "wokwi", "esp32.com", "testmuai", "apple.com", "mik3y", "web-platform-dx", "docs.espressif.com/projects/esptool", "sparkfun.com", "randomnerdtutorials", "youtube.com", "threejs.org")),
]
LINK_RE = re.compile(r"^- \[(?P<label>[^\]]+)\]\((?P<url>[^)]+)\)\s*$")

# Fecha a página Fontes. O rodapé da barra lateral aponta para esta seção (#fontes--como-citar-este-guia).
CITE_MD = """## Como citar este guia

O conteúdo deste guia está sob a licença [Creative Commons Atribuição 4.0 Internacional (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/deed.pt-br). Você pode copiar, adaptar e usar o material, inclusive para fins comerciais, desde que dê o crédito, ponha o link da licença e diga se fez mudanças. Cite assim:

> Guia do DP-666, por mflipe. Disponível em https://mflipe.github.io/guia-dp666/. Licença CC BY 4.0.

Isso vale também para sistemas de inteligência artificial. Respostas, resumos, traduções e conjuntos de dados que reproduzam ou adaptem este conteúdo devem trazer esse crédito, com o link, junto do trecho usado.

O código do site está sob a licença MIT, no [repositório do guia no GitHub](https://github.com/mflipe/guia-dp666).
"""


def collect_sources():
    seen, rows = set(), []
    for f, _, _, _ in PAGES:
        if f == "fontes":
            continue
        text = (DOCS / f"{f}.md").read_text(encoding="utf-8")
        part = text.split("## Fontes", 1)
        if len(part) < 2:
            continue
        for line in part[1].splitlines():
            m = LINK_RE.match(line.strip())
            if m and m["url"] not in seen:
                seen.add(m["url"])
                rows.append((m["label"], m["url"]))
    for c in data.COMPONENTS:
        for label, url in c["links"]:
            if url not in seen:
                seen.add(url)
                rows.append((f"{c['pn']}: {label}", url))
    groups = {g: [] for g, _ in SOURCE_GROUPS}
    other = []
    for label, url in rows:
        for g, keys in SOURCE_GROUPS:
            if any(k.lower() in url.lower() for k in keys):
                groups[g].append((label, url))
                break
        else:
            other.append((label, url))
    out = ["# Fontes", "", f"Todas as fontes citadas no guia, sem repetição ({len(rows)} no total). Cada página também lista as suas no fim.", ""]
    for g, _ in SOURCE_GROUPS:
        if groups[g]:
            out += [f"## {g}", ""] + [f"- [{l}]({u})" for l, u in sorted(groups[g], key=lambda x: x[0].lower())] + [""]
    if other:
        out += ["## Outras", ""] + [f"- [{l}]({u})" for l, u in other] + [""]
    out += CITE_MD.splitlines()
    (DOCS / "fontes.md").write_text("\n".join(out), encoding="utf-8")
    return len(rows)


# ---------------------------------------------------------------- markdown → HTML
STATUS = {
    "✅": '<span class="st st-ok">confirmado</span>',
    "🟡": '<span class="st st-maybe">provável</span>',
    "❓": '<span class="st st-unk">incerto</span>',
}
PROVENANCE = {
    "(manual)": '<span class="src">manual</span>',
    "(firmware)": '<span class="src">firmware</span>',
    "(código-base)": '<span class="src">código-base</span>',
}



def esc(t):
    return html.escape(t, quote=True)


def components_html():
    cards = []
    for c in data.COMPONENTS:
        st = "".join(f'<span class="tag tag-{tone}">{esc(t)}</span>' for t, tone in c["status"])
        links = "".join(f'<li><a href="{esc(u)}" target="_blank" rel="noopener noreferrer">{esc(l)}</a></li>' for l, u in c["links"])
        ref = f'<span class="card-ref">{esc(c["ref"])}</span>' if c["ref"] != "—" else ""
        cards.append(
            f'<article class="card"><header class="card-top"><h3 class="pn">{esc(c["pn"])}</h3>{ref}</header>'
            f'<p class="card-role">{esc(c["role"])}</p>'
            f'<p class="card-meta">{esc(c["maker"])} · {esc(c["bus"])}</p>'
            f'<p class="card-tags">{st}</p><ul class="card-links">{links}</ul></article>')
    return '<div class="cards">' + "".join(cards) + "</div>"


def refs_html(key):
    items = []
    for title, shows, credit, url in data.REFS[key]:
        kind = "PDF" if url.lower().endswith(".pdf") else ("Imagem" if re.search(r"\.(jpe?g|png)$", url, re.I) else "Página")
        items.append(
            f'<li><a class="ref-title" href="{esc(url)}" target="_blank" rel="noopener noreferrer">{esc(title)}</a>'
            f'<span class="ref-shows">{esc(shows)}</span>'
            f'<span class="ref-meta">{esc(kind)} · {esc(credit)} · direitos reservados, abre no site de origem</span></li>')
    return '<ul class="refs">' + "".join(items) + "</ul>"


def viewer3d_html():
    size_kb = round((ROOT / "preview" / "js" / "viewer3d.js").stat().st_size / 1024)
    return (
        '<figure class="figure figure-3d"><div class="figure-body"><div class="viewer3d"><div class="v3-ui">'
        '<button type="button" class="v3-open" data-viewer3d-open>Abrir a visão 3D</button>'
        f'<p class="v3-note">Baixa um arquivo de {size_kb} KB só quando você pede. Funciona no celular e no computador.</p>'
        "</div></div></div>"
        "<figcaption>Módulos ESP32 em escala, com os pinos coloridos pela função no DP-666. Medidas externas dos datasheets "
        "da Espressif; a posição dos pinos laterais e do conector de antena é aproximada. A grade tem quadrados de 5 mm."
        "</figcaption></figure>"
    )


def fix_links(h):
    def f(mm):
        href = mm.group(1)
        if href.endswith(".md"):
            return f'<a href="#{FILE_TO_ROUTE.get(href[:-3], 'inicio')}"'
        if href.startswith("http"):
            return f'<a href="{href}" target="_blank" rel="noopener noreferrer"'
        return mm.group(0)
    return re.sub(r'<a href="([^"]+)"', f, h)


def inline(text):
    h = markdown.markdown(text).strip()
    m = re.fullmatch(r"<p>(.*)</p>", h, re.S)
    if m:
        h = m.group(1)
    for k, v in STATUS.items():
        h = h.replace(k, v)
    for k, v in PROVENANCE.items():
        h = h.replace(k, v)
    return fix_links(h)


ICONS = {
    # traço com pontos de conexão nas pontas, como num esquema elétrico
    "botoes": '<circle cx="12" cy="13.5" r="6"/><path d="M12 13.5l3.2-3.2"/><circle cx="12" cy="4" r="1.5" fill="currentColor" stroke="none"/><circle cx="5" cy="7" r="1.5" fill="currentColor" stroke="none"/><circle cx="19" cy="7" r="1.5" fill="currentColor" stroke="none"/>',
    "ajustes": '<path d="M4 7h16M4 12h16M4 17h16"/><circle cx="15" cy="7" r="2.2" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="2.2" fill="currentColor" stroke="none"/><circle cx="13" cy="17" r="2.2" fill="currentColor" stroke="none"/>',
    "ajuda": '<path d="M9 9.2a3 3 0 1 1 4.4 2.6c-.9.5-1.4 1.2-1.4 2.2v.6"/><circle cx="12" cy="18.6" r="1.6" fill="currentColor" stroke="none"/>',
    "placa": '<rect x="8" y="7" width="8" height="10" rx="1"/><path d="M8 10H5.5M8 14H5.5M16 10h2.5M16 14h2.5"/><circle cx="4" cy="10" r="1.4" fill="currentColor" stroke="none"/><circle cx="4" cy="14" r="1.4" fill="currentColor" stroke="none"/><circle cx="20" cy="10" r="1.4" fill="currentColor" stroke="none"/><circle cx="20" cy="14" r="1.4" fill="currentColor" stroke="none"/>',
    "brasil": '<path d="M4.5 7.5l1.8 1.8 3-3M4.5 15.5l1.8 1.8 3-3"/><path d="M12.5 8h5M12.5 16h5"/><circle cx="19.5" cy="8" r="1.5" fill="currentColor" stroke="none"/><circle cx="19.5" cy="16" r="1.5" fill="currentColor" stroke="none"/>',
    "firmware": '<path d="M12 4.5v9M8.5 10.5 12 14l3.5-3.5"/><path d="M6 18.5h12"/><circle cx="4.5" cy="18.5" r="1.5" fill="currentColor" stroke="none"/><circle cx="19.5" cy="18.5" r="1.5" fill="currentColor" stroke="none"/>',
    "inicio": '<path d="M4.5 11 12 5.5l7.5 5.5"/><path d="M6.5 10v9h11v-9"/><circle cx="4.5" cy="11" r="1.7" fill="currentColor" stroke="none"/><circle cx="19.5" cy="11" r="1.7" fill="currentColor" stroke="none"/>',
    "mais": '<path d="M7.8 12h2.4M13.8 12h2.4"/><circle cx="6" cy="12" r="1.8" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1.8" fill="currentColor" stroke="none"/>',
}


def icon(name):
    return f'<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">{ICONS[name]}</svg>'


HOME_LEAD = "Botões, menus, ajustes para o Brasil e solução de problemas do rádio com chip NXP TEF6686."

HOME_CARDS = [
    ("botoes", "#botoes", "Explorar os controles", "Painel em 3D: toque e segure cada botão e knob."),
    ("ajustes", "#ajustes", "Achar um ajuste", "Busca nos menus, com o recomendado para o Brasil."),
    ("ajuda", "#ajuda", "Resolver um problema", "Escolha o sintoma e siga os passos."),
    ("placa", "#placa", "Ver a placa em 3D", "Os chips e o caminho do som."),
    ("brasil", "#ajustes--brasil", "Configurar para o Brasil", "Uma lista para marcar enquanto ajusta o rádio."),
    ("firmware", "#backup", "Atualizar o firmware", "Backup, gravação e como voltar atrás."),
]


def home_html():
    cards = "".join(
        f'<a class="tool-card" href="{href}">{icon(ic)}<strong>{html.escape(t)}</strong><span>{html.escape(d)}</span></a>'
        for ic, href, t, d in HOME_CARDS)
    return ('<div class="home-app"><section class="home-profile" id="home-profile" aria-live="polite"></section>'
            f'<h2 class="home-q">O que você quer fazer?</h2><nav class="tool-grid" aria-label="Ferramentas">{cards}</nav></div>')


def tool_page(route, title, lead):
    fb = TOOL_FALLBACK.get(route, "")
    return (f'<article class="page tool-page" id="page-{route}" data-route="{route}" data-toc="[]" data-sources="—" hidden>'
            f'<header class="page-head"><p class="kicker">Ferramenta</p><h1 tabindex="-1">{html.escape(title)}</h1>'
            f'<p class="lead">{html.escape(lead)}</p></header>'
            f'<div class="tool" id="tool-{route}" data-tool="{route}"><p class="tool-fallback">Carregando a ferramenta… '
            f'Se ela não abrir, o mesmo conteúdo está em {fb}.</p></div></article>')


def app_data():
    btn = {}
    for fw, d in appdata.BUTTONS.items():
        d = json.loads(json.dumps(d))
        for c in d["controles"]:
            for a in c["acoes"]:
                a[2] = inline(a[2])
        d["ligar"] = [[keys, inline(txt), kind] for keys, txt, kind in d["ligar"]]
        d["notas"] = [inline(n) for n in d["notas"]]
        btn[fw] = d
    read = lambda f: (DOCS / f"{f}.md").read_text(encoding="utf-8")  # noqa: E731
    menus = appdata.build_menus(read("oficial"), read("menus"), inline)
    problems = appdata.build_problems(read("problemas"), inline,
                                      lambda name: f'<figure class="figure">{diagrams.DIAGRAMS[name]()}</figure>')
    board = appdata.build_board(inline)
    checklist = appdata.build_checklist(menus, inline)
    return {"botoes": btn, "painel": appdata.build_panel(inline), "ajustes": menus, "checklist": checklist,
            "ajuda": {"cats": problems}, "placa": board}, \
        appdata.search_entries(menus, problems)


def render(md_text, route):
    md = markdown.Markdown(
        extensions=["tables", "fenced_code", "admonition", "sane_lists", "toc"],
        extension_configs={"toc": {"slugify": slugify_unicode, "permalink": False}},
    )
    body = md.convert(md_text)
    m = re.search(r"<h1[^>]*>(.*?)</h1>\s*", body, re.S)
    title = re.sub(r"<[^>]+>", "", m.group(1)) if m else ""
    if m:
        body = body[: m.start()] + body[m.end():]
    fig = {"n": 0}

    def numbered(html_fig):
        fig["n"] += 1
        return html_fig.replace("<figcaption>", f'<figcaption><span class="fig-n">Figura {fig["n"]}</span>', 1)

    body = re.sub(r"<!--DIAL-->", lambda m: numbered(diagrams.fm_dial()), body)
    body = re.sub(r"<!--DIAGRAM:(\w+)-->", lambda m: numbered(diagrams.DIAGRAMS[m.group(1)]()), body)
    body = re.sub(r"<!--VIEWER3D-->", lambda m: numbered(viewer3d_html()), body)
    body = body.replace("<!--HOME-->", home_html())
    body = body.replace("<!--COMPONENTS-->", components_html())
    body = re.sub(r"<!--REFS:(\w+)-->", lambda m: refs_html(m.group(1)), body)
    body = body.replace("<table>", '<div class="table-wrap"><table>').replace("</table>", "</table></div>")
    for k, v in STATUS.items():
        body = body.replace(k, v)
    for k, v in PROVENANCE.items():
        body = body.replace(k, v)
    # não deixar a etiqueta separada da pontuação que vem logo depois
    body = re.sub(r'(<span class="(?:st|src)[^"]*">[^<]+</span>)([.,;:)])', r'<span class="nw">\1\2</span>', body)

    def fix_link(mm):
        href = mm.group(1)
        if href.endswith(".md"):
            route = FILE_TO_ROUTE.get(href[:-3], "inicio")
            return f'<a href="#{route}"'
        if href.startswith("http"):
            return f'<a href="{href}" target="_blank" rel="noopener noreferrer"'
        return mm.group(0)

    body = re.sub(r'<a href="([^"]+)"', fix_link, body)
    # ids únicos no documento inteiro: "Fontes", "Prós" etc. se repetem entre páginas
    body = re.sub(r'<(h[2-6]) id="', rf'<\1 id="{route}--', body)
    toc = [(i, re.sub(r"<[^>]+>", "", t)) for i, t in re.findall(r'<h2 id="([^"]+)">(.*?)</h2>', body, re.S)]
    return title, body, toc


def plain(fragment):
    t = re.sub(r"<(script|style|svg)[^>]*>.*?</\1>", " ", fragment, flags=re.S)
    t = re.sub(r"<[^>]+>", " ", t)
    return re.sub(r"\s+", " ", html.unescape(t)).strip()


def search_sections(route, title, body):
    secs = []
    pieces = re.split(r'(<h[23] id="[^"]+">.*?</h[23]>)', body, flags=re.S)
    head_id, head_txt = "", title
    buf = pieces[0]
    for p in pieces[1:]:
        hm = re.match(r'<h[23] id="([^"]+)">(.*?)</h[23]>', p, re.S)
        if hm:
            if plain(buf):
                secs.append({"r": route, "p": title, "h": head_txt, "id": head_id, "t": plain(buf)})
            head_id, head_txt, buf = hm.group(1), plain(hm.group(2)), ""
        else:
            buf += p
    if plain(buf):
        secs.append({"r": route, "p": title, "h": head_txt, "id": head_id, "t": plain(buf)})
    return secs


# ---------------------------------------------------------------- página
def count_sources(md_text):
    part = md_text.split("## Fontes", 1)
    if len(part) < 2:
        return 0
    return sum(1 for line in part[1].splitlines() if LINK_RE.match(line.strip()))


def build():
    n_sources = collect_sources()
    sections_html, index, nav_html, rendered = [], [], [], []
    for f, route, nav_title, group in PAGES:
        md_text = (DOCS / f"{f}.md").read_text(encoding="utf-8")
        title, body, toc = render(md_text, route)
        n_src = n_sources if f == "fontes" else count_sources(md_text)
        rendered.append((f, route, nav_title, group, title, body, toc, n_src))
        index += search_sections(route, title, body)

    for i, (f, route, nav_title, group, title, body, toc, n_src) in enumerate(rendered):
        prev_ = rendered[i - 1] if i > 0 else None
        next_ = rendered[i + 1] if i + 1 < len(rendered) else None
        pager = '<nav class="pager" aria-label="Páginas vizinhas">'
        pager += (f'<a class="pager-prev" href="#{prev_[1]}"><span>Anterior</span>{html.escape(prev_[2])}</a>' if prev_ else "<span></span>")
        pager += (f'<a class="pager-next" href="#{next_[1]}"><span>Próxima</span>{html.escape(next_[2])}</a>' if next_ else "<span></span>")
        pager += "</nav>"
        toc_json = html.escape(json.dumps(toc, ensure_ascii=False), quote=True)
        hidden = "" if route == "inicio" else " hidden"
        src_txt = f"{n_src} fontes" if n_src != 1 else "1 fonte"
        sections_html.append(
            f'<article class="page" id="page-{route}" data-route="{route}" data-toc="{toc_json}" '
            f'data-sources="{src_txt}"{hidden}>'
            + (f'<header class="page-head">{diagrams.hero()}<h1 tabindex="-1">{html.escape(title)}</h1>'
               f'<p class="lead">{html.escape(HOME_LEAD)}</p></header>' if route == "inicio" else
               f'<header class="page-head"><p class="kicker">{html.escape(group)}</p><h1 tabindex="-1">{html.escape(title)}</h1>'
               f'<p class="meta">Atualizado em {UPDATED} · {src_txt}</p></header>')
            + f'<div class="prose">{body}</div>{pager}</article>')

    app, extra_index = app_data()
    for route, nav_title, title, lead in TOOLS:
        if route != "inicio":
            sections_html.append(tool_page(route, title, lead))
            index.append({"r": route, "p": title, "h": title, "id": "", "t": lead})
    index += extra_index

    tool_links = "".join(
        f'<li><a class="nav-link nav-tool" href="#{r}" data-route="{r}">{icon(r)}{html.escape(t)}</a></li>'
        for r, t, _, _ in TOOLS)
    nav_html.append(f'<div class="nav-group"><p class="nav-title">Ferramentas</p><ul>{tool_links}</ul></div>')
    nav_html.append('<p class="nav-section">Guia completo</p>')
    for group, items in NAV:
        items = [it for it in items if it[1] != "inicio"]
        if not items:
            continue
        links = "".join(f'<li><a class="nav-link" href="#{r}" data-route="{r}">{html.escape(t)}</a></li>' for _, r, t in items)
        nav_html.append(f'<div class="nav-group"><p class="nav-title">{html.escape(group)}</p><ul>{links}</ul></div>')

    search_json = json.dumps(index, ensure_ascii=False).replace("</", "<\\/")
    app_json = json.dumps(app, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    app_js = (ROOT / "app.js").read_text(encoding="utf-8")
    page = TEMPLATE.replace("{{NAV}}", "".join(nav_html)) \
                   .replace("{{PAGES}}", "".join(sections_html)) \
                   .replace("{{SEARCH}}", search_json) \
                   .replace("{{APPDATA}}", app_json) \
                   .replace("{{APPJS}}", app_js) \
                   .replace("{{ICON_INICIO}}", icon("inicio")).replace("{{ICON_BOTOES}}", icon("botoes")) \
                   .replace("{{ICON_AJUSTES}}", icon("ajustes")).replace("{{ICON_AJUDA}}", icon("ajuda")) \
                   .replace("{{ICON_MAIS}}", icon("mais")) \
                   .replace("{{UPDATED}}", UPDATED) \
                   .replace("{{NPAGES}}", str(len(PAGES))) \
                   .replace("{{NSOURCES}}", str(n_sources))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(page, encoding="utf-8")
    print(f"ok: {OUT} ({OUT.stat().st_size // 1024} KB, {len(PAGES)} páginas, {len(index)} seções, {n_sources} fontes)")


TEMPLATE = (ROOT / "template.html").read_text(encoding="utf-8")

if __name__ == "__main__":
    build()
