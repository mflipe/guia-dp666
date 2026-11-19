#!/usr/bin/env python3
"""Gera o Guia do DP-666 nos dois idiomas, a partir de docs/*.md (português) e docs/en/*.md (inglês).

Saída: preview/index.html (português) e preview/en/index.html (inglês). Cada uma é um único arquivo,
que só busca as fontes do Google e, quando o leitor pede o 3D, o js/viewer3d.js (ou viewer3d.en.js).
Uso: python3 build.py [pt|en] (sem argumento, gera os dois).
"""
import html
import json
import pathlib
import re
import shutil
from urllib.parse import urlparse

import sys
import types

import markdown
from markdown.extensions.toc import slugify_unicode

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import appdata  # noqa: E402
import layout  # noqa: E402
import data as data_pt  # noqa: E402
import diagrams  # noqa: E402
import i18n  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parent
LANG, L = "pt", i18n.UI["pt"]
DOCS = ROOT / "docs"
OUT = ROOT / "preview" / "index.html"
UPDATED = L["updated"]
data = data_pt
DIAGRAM_TR = {}

NAV = L["nav"]
PAGES = [(f, r, t, g) for g, items in NAV for (f, r, t) in items]

# ferramentas do app: rota, título no menu, título da página, chamada
TOOLS = L["tools"]
TOOL_BY = {t[0]: t for t in TOOLS}
FILE_TO_ROUTE = {f: r for f, r, _, _ in PAGES}

# Páginas com ferramenta: ela entra logo depois da introdução. Quando a ferramenta é a própria página
# (só_ferramenta), o texto do arquivo apenas a alimenta e não aparece de novo embaixo dela.
JUNTAS = {
    "hardware": {"ferramenta": "placa"},
    "uso": {"ferramenta": "botoes"},
    "problemas": {"ferramenta": "ajuda", "so_ferramenta": True},
    "ajustes": {"ferramenta": "ajustes", "so_ferramenta": True},
}

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




def h1_text(title):
    """Título da página, com os códigos de modelo (DP-666, DP-66X) protegidos contra quebra no hífen."""
    return re.sub(r"\b(DP-6\d[\dX])\b", r'<span class="nw">\1</span>', html.escape(title))

def collect_sources():
    seen, rows = set(), []
    for f, _, _, _ in PAGES:
        if f == "fontes":
            continue
        text = doc(f)
        part = text.split("## " + L["sources_h"], 1)
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
    out = [f"# {L['sources_h']}", "", L["sources_intro"].format(n=len(rows)), ""]
    for g, _ in SOURCE_GROUPS:
        if groups[g]:
            out += [f"## {L['groups'].get(g, g)}", ""] + [f"- [{l}]({u})" for l, u in sorted(groups[g], key=lambda x: x[0].lower())] + [""]
    if other:
        out += [f"## {L['other']}", ""] + [f"- [{l}]({u})" for l, u in other] + [""]
    out += L["cite"].splitlines()
    (DOCS / "fontes.md").write_text("\n".join(out), encoding="utf-8")
    return len(rows)


# ---------------------------------------------------------------- markdown → HTML
STATUS, PROVENANCE = {}, {}
ST_CLASS = {"✅": "st st-ok", "🟡": "st st-maybe", "❓": "st st-unk"}



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
            f'<p class="card-tags">{st}</p>' + (f'<ul class="card-links">{links}</ul>' if links else "") + '</article>')
    return '<div class="cards">' + "".join(cards) + "</div>"


def refs_html(key):
    items = []
    for title, shows, credit, url in data.REFS[key]:
        kind = L["ref_kind"]["pdf" if url.lower().endswith(".pdf") else ("img" if re.search(r"\.(jpe?g|png)$", url, re.I) else "page")]
        items.append(
            f'<li><a class="ref-title" href="{esc(url)}" target="_blank" rel="noopener noreferrer">{esc(title)}</a>'
            f'<span class="ref-shows">{esc(shows)}</span>'
            f'<span class="ref-meta">{esc(kind)} · {esc(credit)} · {esc(L["ref_rights"])}</span></li>')
    return '<ul class="refs">' + "".join(items) + "</ul>"


def viewer3d_html():
    js = ROOT / "preview" / "js" / L["viewer_js"]
    if not js.exists():
        js = ROOT / "preview" / "js" / "viewer3d.js"
    size_kb = round(js.stat().st_size / 1024)
    return (
        '<figure class="figure figure-3d"><div class="figure-body"><div class="viewer3d"><div class="v3-ui">'
        f'<button type="button" class="v3-open" data-viewer3d-open>{esc(L["v3_open"])}</button>'
        f'<p class="v3-note">{esc(L["v3_note"].format(kb=size_kb))}</p>'
        "</div></div></div>"
        f"<figcaption>{esc(L['v3_caption'])}</figcaption></figure>"
    )


def fotos3d_html():
    js = ROOT / "preview" / "js" / L["viewer_js"]
    if not js.exists():
        js = ROOT / "preview" / "js" / "viewer3d.js"
    kb = js.stat().st_size + sum(p.stat().st_size for p in (ROOT / "img").glob("dp666-3d-*.webp") if p.stem != "dp666-3d-capa")
    return (
        '<figure class="figure figure-3d"><div class="figure-body"><div class="viewer3d"><div class="v3-ui">'
        f'<button type="button" class="v3-open" data-viewer3d-open="fotos">{esc(L["f3_open"])}</button>'
        f'<p class="v3-note">{esc(L["f3_note"].format(kb=round(kb / 1024)))}</p>'
        "</div></div></div>"
        f"<figcaption>{esc(L['f3_caption'])}</figcaption></figure>"
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
    "computador": '<rect x="4.5" y="5" width="15" height="10.5" rx="1"/><path d="M12 15.5v3.5M7.5 19h9"/><circle cx="6" cy="19" r="1.5" fill="currentColor" stroke="none"/><circle cx="18" cy="19" r="1.5" fill="currentColor" stroke="none"/>',
    "escolha": '<path d="M12 19.5v-6.5M12 13 6.5 7.5M12 13l5.5-5.5"/><circle cx="5.5" cy="6.5" r="1.7" fill="currentColor" stroke="none"/><circle cx="18.5" cy="6.5" r="1.7" fill="currentColor" stroke="none"/><circle cx="12" cy="19.5" r="1.7" fill="currentColor" stroke="none"/>',
    "mais": '<path d="M7.8 12h2.4M13.8 12h2.4"/><circle cx="6" cy="12" r="1.8" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1.8" fill="currentColor" stroke="none"/>',
}


def icon(name):
    return f'<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">{ICONS[name]}</svg>'


HOME_LEAD = L["home_lead"]

HOME_CARDS = L["home_cards"]


def home_html():
    cards = "".join(
        f'<a class="tool-card" href="{href}">{icon(ic)}<strong>{html.escape(t)}</strong><span>{html.escape(d)}</span></a>'
        for ic, href, t, d in HOME_CARDS)
    return ('<div class="home-app"><section class="home-profile" id="home-profile" aria-live="polite"></section>'
            f'<h2 class="home-q">{esc(L["home_q"])}</h2><nav class="tool-grid" aria-label="{esc(L["home_nav"])}">{cards}</nav></div>')


CAPA = (900, 560)   # tamanho de img/dp666-3d-capa.webp


def home_radio():
    """O rádio montado com as fotos, no alto do Início: uma imagem que vira o 3D quando a pessoa toca."""
    return ('<div class="home-radio viewer3d"><div class="v3-stage f3-stage f3-home">'
            f'<img class="f3-capa" src="img/dp666-3d-capa.webp" width="{CAPA[0]}" height="{CAPA[1]}" alt="{esc(L["f3_capa_alt"])}">'
            f'<button type="button" class="v3-open f3-girar" data-viewer3d-open="fotos-home">{esc(L["f3_girar"])}</button>'
            '</div></div>')


# ---------------------------------------------------------------- menu de jogo
LUPA = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path></svg>'


def menu_html(titulo):
    """O menu do guia, como num jogo: as páginas por grupo, com o cursor no item em foco. Na tela de título o
    Início fica de fora (é ela mesma) e entra o Continuar; no menu chamado de dentro das páginas, o Início volta."""
    out = []
    if titulo:
        out.append(f'<ul class="mi-lista"><li class="mi-item mi-continuar" hidden><a class="mi" href="#inicio">'
                   f'<span class="mi-nome">{esc(L["continue"])}</span><span class="mi-sub"></span></a><p class="mi-desc"></p></li></ul>')
    for group, items in NAV:
        lis = "".join(
            f'<li class="mi-item" data-route="{r}"><a class="mi" href="#{r}"><span class="mi-nome">{h1_text(t)}</span>'
            f'<span class="mi-aqui">{esc(L["here"])}</span></a><p class="mi-desc">{esc(L["desc"][r])}</p></li>'
            for _, r, t in items if not (titulo and r == "inicio"))
        if lis:
            out.append(f'<h2 class="mi-grupo">{esc(group)}</h2><ul class="mi-lista">{lis}</ul>')
    return "".join(out)


def titulo_inicio(title):
    """O título do Início como tela de título: o nome do rádio grande e, embaixo, o resto do título."""
    marca, _, resto = title.partition(": ")
    if not resto:
        return h1_text(title)
    return (f'<span class="tt-dp">{h1_text(marca)}</span><span class="sr-only">: </span>'
            f'<span class="tt-sub">{html.escape(resto)}</span>')


def tela_titulo(title):
    """Cabeçalho do Início: o perfil, o idioma e a busca, o rádio, o título e o menu do guia inteiro."""
    return ('<header class="page-head tela-titulo">'
            '<div class="tt-topo">{{CONTA}}'
            f'<button class="tt-busca" type="button" data-buscar aria-label="{esc(L["search_btn"])}">{LUPA}</button></div>'
            '<div class="tt-grade">'
            f'<div class="tt-render">{home_radio()}</div>'
            f'<div class="tt-nome"><h1 tabindex="-1" class="tt-h1">{titulo_inicio(title)}</h1>'
            f'<p class="lead">{html.escape(HOME_LEAD)}</p></div>'
            f'<nav class="tt-menu" aria-label="{esc(L["menu_aria"])}">{menu_html(True)}</nav>'
            f'<aside class="tt-foco" id="tt-foco" aria-label="{esc(L["focus_panel"])}">'
            '<p class="tf-titulo"></p><p class="tf-desc"></p><ol class="tf-secoes"></ol></aside>'
            '</div></header>')


def proximo_html(i, rendered):
    """O fim de cada página, como o próximo objetivo de um jogo: a próxima página em foco, duas leituras
    relacionadas, a página anterior e a volta ao menu."""
    _, route, nav_title, *_ = rendered[i]
    prev_ = rendered[i - 1] if i > 0 else None
    next_ = rendered[i + 1] if i + 1 < len(rendered) else None
    titulos = {r: t for _, r, t, *_ in rendered}
    out = [f'<nav class="proximo" aria-label="{esc(L["after"])}">'
           + (f'<p class="prox-fim">{esc(L["end_of"].format(t=nav_title))}</p>' if route != "inicio" else "")]
    if next_:
        out.append(f'<a class="prox-next" href="#{next_[1]}"><span class="prox-txt"><span class="prox-rot">{esc(L["next_page"])}</span>'
                   f'<span class="prox-nome">{h1_text(next_[2])}</span><span class="prox-desc">{esc(L["desc"][next_[1]])}</span></span></a>')
    rel = [(r, a, m) for r, a, m in L["rel"].get(route, []) if r != route]
    if rel:
        out.append(f'<h2 class="mi-grupo">{esc(L["related"])}</h2><ul class="mi-lista">')
        out += [f'<li class="mi-item"><a class="mi" href="#{a or r}"><span class="mi-nome">{h1_text(titulos[r])}'
                f'<span class="mi-sub">{esc(m)}</span></span></a></li>' for r, a, m in rel]
        out.append('</ul>')
    out.append('<p class="prox-volta">')
    if prev_:
        out.append(f'<a href="#{prev_[1]}">{esc(L["prev_page"].format(t=prev_[2]))}</a>')
    if route != "inicio":
        out.append(f'<a href="#inicio">{esc(L["back_menu"])}</a>')
    out.append('</p></nav>')
    return "".join(out)


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
    menus = appdata.build_menus(doc("oficial"), inline)
    problems = appdata.build_problems(doc("problemas"), inline,
                                      lambda name: f'<figure class="figure">{diagram(name)}</figure>')
    board = appdata.build_board(inline)
    checklist = appdata.build_checklist(menus, inline)
    return {"botoes": btn, "painel": appdata.build_panel(inline), "ajustes": menus, "checklist": checklist,
            "ajuda": {"cats": problems}, "placa": board}, \
        appdata.search_entries(menus, problems)


def partes(md_text):
    """Divide um texto em título (# ...), introdução (antes do primeiro ##), seções e linhas da lista de fontes."""
    titulo, linhas = "", md_text.split("\n")
    if linhas and linhas[0].startswith("# "):
        titulo, md_text = linhas[0][2:].strip(), "\n".join(linhas[1:])
    intro, sep, resto = md_text.partition("\n## ")
    secoes = ("## " + resto) if sep else ""
    pedaco = re.split(r"(?m)^## " + re.escape(L["sources_h"]) + r"\s*$", secoes, maxsplit=1)
    fontes = [x for x in pedaco[1].splitlines() if LINK_RE.match(x.strip())] if len(pedaco) > 1 else []
    return titulo, intro.strip("\n"), pedaco[0].rstrip("\n"), fontes


def secao(md_text, titulo):
    """Corpo de uma seção ## (sem o título dela) e onde ela começa e termina no texto."""
    m = re.search(r"(?m)^## " + re.escape(titulo) + r"\s*$", md_text)
    if not m:
        return None, None
    fim = re.search(r"(?m)^## ", md_text[m.end():])
    ate = m.end() + fim.start() if fim else len(md_text)
    return md_text[m.end():ate].strip("\n"), (m.start(), ate)


def compor(f, route):
    """Texto da página. Nas páginas com ferramenta, ela entra logo depois da introdução; quando a ferramenta é a
    própria página, ficam só o título, a introdução, a ferramenta e as fontes."""
    md_text = doc(f)
    if route == "oficial":   # o menu completo da linha oficial alimenta o explorador de Ajustes do rádio
        _, onde = secao(md_text, L["menu_full"][3:])
        if onde:
            md_text = md_text[:onde[0]] + L["menu_full"] + "\n\n" + L["menu_oficial"] + "\n\n" + md_text[onde[1]:]
        return md_text
    j = JUNTAS.get(route)
    if not j:
        return md_text
    titulo, intro, secoes, fontes = partes(md_text)
    so = j.get("so_ferramenta")
    out = [f"# {titulo}", "", intro, "", f"<!--FERRAMENTA:{j['ferramenta']}{':topo' if so else ''}-->", ""]
    if not so:
        out += [secoes, ""]
    if fontes:
        out += ["## " + L["sources_h"], ""] + fontes + [""]
    return "\n".join(out)


def juntar(body):
    """Põe a ferramenta no lugar do marcador, fora do bloco de texto. Com :topo, ela entra sem título próprio."""
    def ferramenta(m):
        tid, topo = m.group(1), m.group(2)
        _, _, titulo, chamada = TOOL_BY[tid]
        caixa = (f'<div class="tool tool-embed" id="tool-{tid}" data-tool="{tid}">'
                 f'<p class="tool-fallback">{L["tool_loading"]}</p></div>')
        if topo:
            return f'</div>{caixa}<div class="prose">'
        return f'<h2 id="{tid}">{esc(titulo)}</h2><p class="tool-lead">{esc(chamada)}</p></div>{caixa}<div class="prose">'

    return re.sub(r"<!--FERRAMENTA:(\w+)(:topo)?-->", ferramenta, body)


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
        return html_fig.replace("<figcaption>", f'<figcaption><span class="fig-n">{L["figure"]} {fig["n"]}</span>', 1)

    body = re.sub(r"<!--DIAL-->", lambda m: numbered(diagram("fm_dial")), body)
    body = re.sub(r"<!--DIAGRAM:(\w+)-->", lambda m: numbered(diagram(m.group(1))), body)
    body = re.sub(r"<!--VIEWER3D-->", lambda m: numbered(viewer3d_html()), body)
    body = re.sub(r"<!--FOTOS3D-->", lambda m: numbered(fotos3d_html()), body)
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
    body = juntar(body)
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
    part = md_text.split("## " + L["sources_h"], 1)
    if len(part) < 2:
        return 0
    return sum(1 for line in part[1].splitlines() if LINK_RE.match(line.strip()))


def build():
    n_sources = collect_sources()
    sections_html, index, rendered = [], [], []
    for f, route, nav_title, group in PAGES:
        md_text = compor(f, route)
        title, body, toc = render(md_text, route)
        n_src = n_sources if f == "fontes" else count_sources(md_text)
        rendered.append((f, route, nav_title, group, title, body, toc, n_src))
        index += search_sections(route, title, re.sub(r'<div class="tool tool-embed".*?</div>', " ", body, flags=re.S))

    for i, (f, route, nav_title, group, title, body, toc, n_src) in enumerate(rendered):
        toc_json = html.escape(json.dumps(toc, ensure_ascii=False), quote=True)
        hidden = "" if route == "inicio" else " hidden"
        src_txt = L["src_n"].format(n=n_src) if n_src != 1 else L["src_1"]
        sections_html.append(
            f'<article class="page" id="page-{route}" data-route="{route}" data-toc="{toc_json}" '
            f'data-sources="{src_txt}"{hidden}>'
            + (tela_titulo(title) if route == "inicio" else
               f'<header class="page-head"><p class="kicker"><a class="kicker-raiz" href="#inicio">DP-666</a>'
               f'<span aria-hidden="true"> › </span>{html.escape(group)}</p><h1 tabindex="-1">{h1_text(title)}</h1>'
               f'<p class="meta">{L["meta"].format(d=UPDATED, s=src_txt)}</p></header>')
            + f'<div class="prose">{body}</div>{proximo_html(i, rendered)}</article>')

    app, extra_index = app_data()
    index += extra_index

    search_json = json.dumps(index, ensure_ascii=False).replace("</", "<\\/")
    app_json = json.dumps(app, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    catalog = i18n.js_catalog(LANG)
    app_js = i18n.tr_js((ROOT / "app.js").read_text(encoding="utf-8"), catalog)
    template = i18n.tr_js(i18n.template_for(LANG, TEMPLATE), catalog)
    # o perfil e o idioma moram no rodapé do menu; a tela de título leva uma cópia, com os ids que o app usa
    conta = re.search(r"<!--CONTA-->(.*?)<!--/CONTA-->", template, re.S).group(1)
    conta_titulo = (conta.replace('class="profile-chip"', 'class="profile-chip" id="profile-btn"', 1)
                    .replace('class="lang-link"', 'class="lang-link" id="lang-switch"', 1))
    pages_html = "".join(sections_html).replace("{{CONTA}}", conta_titulo)
    page = template.replace("{{MENU}}", menu_html(False)) \
                   .replace("{{PAGES}}", pages_html) \
                   .replace("{{SEARCH}}", search_json) \
                   .replace("{{APPDATA}}", app_json) \
                   .replace("{{APPJS}}", app_js) \
                   .replace("{{ICON_INICIO}}", icon("inicio")).replace("{{ICON_BOTOES}}", icon("botoes")) \
                   .replace("{{ICON_AJUSTES}}", icon("ajustes")).replace("{{ICON_AJUDA}}", icon("ajuda")) \
                   .replace("{{ICON_MAIS}}", icon("mais")) \
                   .replace("{{UPDATED}}", UPDATED) \
                   .replace("{{NPAGES}}", str(len(PAGES))) \
                   .replace("{{NSOURCES}}", str(n_sources))
    page = page.replace("<!--CONTA-->", "").replace("<!--/CONTA-->", "")
    if L["dir"]:
        page = page.replace('src="img/', 'src="../img/')  # as fotos ficam na raiz do site, uma pasta acima
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(page, encoding="utf-8")
    print(f"ok: {OUT} ({OUT.stat().st_size // 1024} KB, {len(PAGES)} páginas, {len(index)} seções, {n_sources} fontes)")


# ---------------------------------------------------------------- idiomas
MISSING = []


def doc(f):
    """Texto da página no idioma atual; enquanto a tradução não existe, usa o português e avisa."""
    path = DOCS / f"{f}.md"
    if not path.exists() and LANG != "pt":
        if f not in MISSING:
            MISSING.append(f)
        path = ROOT / "docs" / f"{f}.md"
    return path.read_text(encoding="utf-8")


def diagram(name):
    fn = {"fm_dial": diagrams.fm_dial}.get(name) or diagrams.DIAGRAMS[name]
    return i18n.tr_fragments(fn(), DIAGRAM_TR) if DIAGRAM_TR else fn()


def use_lang(lang):
    """Troca os textos, as pastas e os dados do módulo para o idioma pedido."""
    global LANG, L, DOCS, OUT, UPDATED, NAV, PAGES, TOOLS, TOOL_BY, FILE_TO_ROUTE, HOME_LEAD, HOME_CARDS, data, DIAGRAM_TR
    LANG, L = lang, i18n.UI[lang]
    sub = L["dir"]
    DOCS = ROOT / "docs" / sub if sub else ROOT / "docs"
    OUT = ROOT / "preview" / sub / "index.html" if sub else ROOT / "preview" / "index.html"
    UPDATED = L["updated"]
    NAV = L["nav"]
    PAGES = [(f, r, t, g) for g, items in NAV for (f, r, t) in items]
    TOOLS = L["tools"]
    TOOL_BY = {t[0]: t for t in TOOLS}
    FILE_TO_ROUTE = {f: r for f, r, _, _ in PAGES}
    HOME_LEAD, HOME_CARDS = L["home_lead"], L["home_cards"]
    STATUS.clear()
    STATUS.update({k: f'<span class="{ST_CLASS[k]}">{v}</span>' for k, v in L["status"].items()})
    PROVENANCE.clear()
    PROVENANCE.update({k: f'<span class="src">{v}</span>' for k, v in L["prov"].items()})
    data = data_pt
    DIAGRAM_TR = {}
    if lang == "en":
        cat = i18n.catalog("data_en")
        data = types.SimpleNamespace(COMPONENTS=i18n.deep_tr(data_pt.COMPONENTS, cat), REFS=i18n.deep_tr(data_pt.REFS, cat))
        DIAGRAM_TR = i18n.catalog("diagrams_en")
    appdata.set_lang(lang, data)
    MISSING.clear()


# o modelo da página é montado das peças em ui/ (veja layout.py)
TEMPLATE = layout.montar()

if __name__ == "__main__":
    shutil.copytree(ROOT / "img", ROOT / "preview" / "img", dirs_exist_ok=True)
    for lang in (sys.argv[1:] or i18n.LANGS):
        use_lang(lang)
        build()
        if MISSING:
            print(f"  aviso ({lang}): sem tradução, usou o português em: {', '.join(MISSING)}")
