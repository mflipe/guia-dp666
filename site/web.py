"""O que o site precisa além das páginas do guia.

- O manifesto e o service worker: o guia instalável no celular e no computador, e aberto sem internet depois da
  primeira visita (ui/sw.js explica a estratégia).
- As etiquetas de compartilhamento (Open Graph): título, descrição e imagem quando alguém manda o link.
- As páginas de leitura: cada página do guia ganha um endereço próprio (/codigos/, /en/codigos/), com o texto em
  HTML comum, sem depender de JavaScript. Os buscadores acham cada uma, o link compartilhado mostra o título da
  página, e quem chega por elas tem um botão para abrir o guia interativo.
- O mapa do site (sitemap.xml), com os endereços nos dois idiomas.

Os caminhos são relativos: raiz é a pasta da raiz do site vista da página ("" no início em português, "../" no
início em inglês e nas páginas de leitura em português, "../../" nas de leitura em inglês).
"""
import hashlib
import html
import json
import pathlib

URL = "https://mflipe.github.io/guia-dp666/"
UI = pathlib.Path(__file__).parent / "ui"

# as fontes de letra que todas as páginas usam: entram na instalação do service worker; as outras (acentos raros,
# letras gregas) ficam guardadas quando aparecem
LETRAS_BASE = ["geist-sans-latin-400-normal.woff2", "geist-sans-latin-500-normal.woff2", "geist-sans-latin-600-normal.woff2",
               "geist-sans-latin-700-normal.woff2", "geist-mono-latin-400-normal.woff2", "geist-mono-latin-500-normal.woff2",
               "tektur-latin-500-normal.woff2", "tektur-latin-600-normal.woff2", "tektur-latin-700-normal.woff2"]


def esc(t):
    return html.escape(str(t), quote=True)


def endereco(lang, route=None):
    """Endereço completo do início do guia ou da página de leitura de uma rota."""
    return URL + ("en/" if lang == "en" else "") + (f"{route}/" if route else "")


def manifesto(L, lang):
    raiz = "../" if lang == "en" else ""
    m = {
        "name": L["app_nome"], "short_name": L["app_curto"], "description": L["app_desc"],
        "lang": L["html_lang"], "dir": "ltr",
        # cada idioma é um app: começa no próprio início; o escopo é o site inteiro, para a troca de idioma ficar no app
        "id": "./", "start_url": "./", "scope": raiz or "./",
        "display": "standalone", "background_color": "#eef1f5", "theme_color": "#eef1f5",
        "categories": ["education", "utilities"],
        "icons": [
            {"src": raiz + "icones/icone-192.png", "sizes": "192x192", "type": "image/png"},
            {"src": raiz + "icones/icone-512.png", "sizes": "512x512", "type": "image/png"},
            {"src": raiz + "icones/icone-mascara-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
        ],
    }
    return json.dumps(m, ensure_ascii=False, indent=1) + "\n"


def cabeca(L, lang, raiz, url, titulo, descricao):
    """Ícones, manifesto, endereço canônico e as etiquetas de compartilhamento."""
    img = URL + f"img/compartilhar-{lang}.png"
    return "\n".join([
        f'<link rel="canonical" href="{url}">',
        f'<link rel="manifest" href="{raiz}{"en/" if lang == "en" else ""}manifest.webmanifest">',
        f'<link rel="icon" href="{raiz}icones/favicon.svg" type="image/svg+xml">',
        f'<link rel="icon" href="{raiz}icones/favicon-32.png" sizes="32x32" type="image/png">',
        f'<link rel="apple-touch-icon" href="{raiz}icones/apple-touch-icon.png">',
        '<meta property="og:type" content="website">',
        f'<meta property="og:site_name" content="{esc(L["app_nome"])}">',
        f'<meta property="og:title" content="{esc(titulo)}">',
        f'<meta property="og:description" content="{esc(descricao)}">',
        f'<meta property="og:url" content="{url}">',
        f'<meta property="og:image" content="{img}">',
        '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="630">',
        f'<meta property="og:image:alt" content="{esc(L["og_alt"])}">',
        f'<meta property="og:locale" content="{L["og_locale"]}">',
        f'<meta property="og:locale:alternate" content="{L["og_locale_alt"]}">',
        '<meta name="twitter:card" content="summary_large_image">',
    ])


def registro(raiz):
    """Registra o service worker depois que a página carrega, para não disputar a rede com ela."""
    return ('<script>if ("serviceWorker" in navigator) addEventListener("load", function () { '
            f'navigator.serviceWorker.register("{raiz}sw.js").catch(function () {{}}); }});</script>')


def service_worker(pasta):
    """Escreve sw.js na raiz do site gerado. A versão muda quando muda uma das páginas, e aí as cópias antigas saem."""
    modelo = (UI / "sw.js").read_text(encoding="utf-8")
    h = hashlib.sha1(modelo.encode())
    for p in ("index.html", "en/index.html", "estilo.css"):
        h.update((pasta / p).read_bytes())
    essencial = (["./", "en/", "manifest.webmanifest", "en/manifest.webmanifest", "estilo.css",
                  "icones/favicon.svg", "icones/icone-192.png"] + [f"letras/{a}" for a in LETRAS_BASE])
    texto = modelo.replace("{{VERSAO}}", h.hexdigest()[:12]).replace("{{ESSENCIAL}}", json.dumps(essencial))
    (pasta / "sw.js").write_text(texto, encoding="utf-8")


def sitemap(rotas, data_iso):
    """Os inícios e as páginas de leitura nos dois idiomas, cada um com o par no outro idioma."""
    linhas = ['<?xml version="1.0" encoding="UTF-8"?>',
              '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    for rota in [None] + list(rotas):
        for lang in ("pt", "en"):
            linhas.append(f"  <url><loc>{endereco(lang, rota)}</loc><lastmod>{data_iso}</lastmod>"
                          f'<xhtml:link rel="alternate" hreflang="pt-BR" href="{endereco("pt", rota)}"/>'
                          f'<xhtml:link rel="alternate" hreflang="en" href="{endereco("en", rota)}"/></url>')
    linhas.append("</urlset>")
    return "\n".join(linhas) + "\n"


def pagina_leitura(L, lang, route, titulo, grupo, descricao, meta, corpo, proximo, paginas, rodape, tema_cabeca):
    """Uma página de leitura: o texto da página, sem o menu nem as ferramentas, com o link para o guia interativo."""
    raiz = "../../" if lang == "en" else "../"
    outra = "pt" if lang == "en" else "en"
    url = endereco(lang, route)
    lista = "".join(f'<li><a href="../{r}/"{" aria-current=\"page\"" if r == route else ""}>{esc(t)}</a></li>'
                    for r, t in paginas)
    return f"""<!DOCTYPE html>
<html lang="{L["html_lang"]}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
{tema_cabeca}<title>{esc(titulo)} | {esc(L["app_nome"])}</title>
<meta name="description" content="{esc(descricao)}">
<meta name="author" content="mflipe">
<link rel="license" href="https://creativecommons.org/licenses/by/4.0/">
<link rel="alternate" hreflang="pt-BR" href="{endereco("pt", route)}">
<link rel="alternate" hreflang="en" href="{endereco("en", route)}">
{cabeca(L, lang, raiz, url, titulo, descricao)}
<link rel="preload" href="{raiz}letras/geist-sans-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="{raiz}estilo.css">
</head>
<body class="leitura">
<header class="le-topo"><div class="le-topo-in">
  <a class="le-marca" href="../">{esc(L["app_nome"]).replace("DP-666", "DP-666<span class=\"le-marca-resto\">", 1)}</span></a>
  <nav class="le-acoes" aria-label="{esc(L["le_acoes"])}">
    <a class="le-lingua" href="{raiz}{"en/" if outra == "en" else ""}{route}/" hreflang="{"en" if outra == "en" else "pt-BR"}" lang="{"en" if outra == "en" else "pt-BR"}">{outra.upper()}</a>
    <a class="le-abrir" href="../#{route}">{esc(L["le_abrir"])}</a>
  </nav>
</div></header>
<div class="app"><div class="main">
<main id="main">
<article class="page" id="page-{route}">
<header class="page-head"><p class="kicker"><a class="kicker-raiz" href="../">DP-666</a><span aria-hidden="true"> › </span>{esc(grupo)}</p><h1>{esc(titulo)}</h1><p class="meta">{meta}</p></header>
<p class="le-aviso">{esc(L["le_aviso"])}</p>
<div class="prose">{corpo}</div>
{proximo}
</article>
<nav class="le-paginas" aria-labelledby="le-paginas-t"><h2 id="le-paginas-t">{esc(L["le_paginas"])}</h2><ul>{lista}</ul></nav>
</main>
{rodape}
</div></div>
{registro(raiz)}
</body>
</html>
"""
