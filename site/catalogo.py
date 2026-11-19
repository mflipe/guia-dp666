"""Gera o catálogo de componentes (preview/catalogo.html).

Cada componente de componentes.py aparece com os exemplos de componentes.exemplos(), no lugar onde ele fica no
guia (a moldura do exemplo), duas vezes: no tema claro e no escuro. A página usa a mesma folha de estilos do
guia; os dois temas vêm dos blocos de tokens.css, aplicados a cada metade (.tema-claro e .tema-escuro).
Também lista as cores dos tokens nos dois temas. Os estilos do catálogo ficam numa camada abaixo das do guia, para
não mexer nos componentes. É a página que testes/regressao-visual.mjs fotografa.
"""
import html
import inspect
import json
import pathlib
import re

import componentes
import layout

UI = pathlib.Path(__file__).parent / "ui"
COR = re.compile(r"#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)")


def tokens():
    """Os dois blocos de tokens.css (claro e escuro), como texto, e os valores de cada um."""
    t = (UI / "css" / "tokens" / "tokens.css").read_text(encoding="utf-8")
    claro = re.search(r"^:root \{\n(.*?)\n\}", t, re.S | re.M)[1]
    escuro = layout.ESCURO.search(t)[1]

    def valores(bloco):
        return dict(re.findall(r"(--[\w-]+)\s*:\s*([^;]+);", re.sub(r"/\*.*?\*/", "", bloco, flags=re.S)))
    return claro, escuro, valores(claro), valores(escuro)


def curto(v):
    """Os argumentos de um exemplo, para mostrar: textos longos (o HTML de outros componentes) encurtados."""
    if isinstance(v, str):
        return v if len(v) <= 48 else v[:45] + "…"
    if isinstance(v, dict):
        return {k: curto(x) for k, x in v.items()}
    if isinstance(v, list):
        return [curto(x) for x in v]
    return v


def par(conteudo):
    """O mesmo conteúdo nos dois temas, lado a lado."""
    return ('<div class="cat-par">'
            f'<div class="cat-tema tema-claro" data-tema="Claro">{conteudo}</div>'
            f'<div class="cat-tema tema-escuro" data-tema="Escuro">{conteudo}</div></div>')


def cores(claro, escuro):
    def lista(tema):
        linhas = []
        for nome, v in claro.items():
            if not COR.fullmatch(v.strip()):
                continue
            valor = (escuro.get(nome, v) if tema == "escuro" else v).strip()
            linhas.append(f'<li><i style="background:var({nome})"></i><code>{nome}</code><span>{html.escape(valor)}</span></li>')
        return '<ul class="cat-cores">' + "".join(linhas) + "</ul>"
    return ('<div class="cat-par">'
            f'<div class="cat-tema tema-claro" data-tema="Claro">{lista("claro")}</div>'
            f'<div class="cat-tema tema-escuro" data-tema="Escuro">{lista("escuro")}</div></div>')


def gerar(destino):
    bloco_claro, bloco_escuro, claro, escuro = tokens()
    secoes, ordem = {}, []
    for nome, args, moldura, legenda in componentes.exemplos():
        if nome not in secoes:
            secoes[nome] = []
            ordem.append(nome)
        peca = moldura.replace("{}", getattr(componentes, nome)(*args))
        chamada = f"{nome}(" + ", ".join(json.dumps(curto(a), ensure_ascii=False) for a in args) + ")"
        secoes[nome].append(f'<figure class="cat-ex"><figcaption><b>{html.escape(legenda)}</b><code>{html.escape(chamada)}</code></figcaption>'
                            + par(peca) + "</figure>")
    corpo = []
    for nome in ordem:
        doc = " ".join(inspect.getdoc(getattr(componentes, nome)).split())
        corpo.append(f'<section class="cat-sec" id="{nome}"><h2><code>{nome}</code></h2><p class="cat-desc">{html.escape(doc)}</p>'
                     + "".join(secoes[nome]) + "</section>")
    fontes = "\n".join(l for l in layout.ler("cabeca.html").splitlines() if l.startswith(('<link rel="preconnect"', '<link rel="stylesheet"')))
    indice = '<a href="#cores">cores</a>' + "".join(f'<a href="#{n}"><code>{n}</code></a>' for n in ordem)
    pagina = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>DP-666: catálogo de componentes</title>
{fontes}
<style>
@layer catalogo;
{layout.css()}
@layer catalogo {{
.tema-claro {{
{bloco_claro}
}}
.tema-escuro {{
{bloco_escuro}
}}
{layout.ler("catalogo.css").rstrip()}
}}
</style>
</head>
<body>
<main class="cat">
<header class="cat-topo">
<p class="cat-volta"><a href="./">DP-666: o guia definitivo</a></p>
<h1>Catálogo de componentes</h1>
<p class="cat-intro">Cada componente do guia, no lugar onde aparece nas páginas, no tema claro e no escuro. Os componentes ficam em
<code>site/componentes.py</code> e <code>site/ui/componentes.js</code>, com os mesmos nomes e o mesmo HTML; o build confere os dois
com estes exemplos antes de gerar o site.</p>
<nav class="cat-indice" aria-label="Componentes">{indice}</nav>
</header>
<section class="cat-sec" id="cores"><h2>Cores</h2><p class="cat-desc">Os tokens de cor de <code>site/ui/css/tokens/tokens.css</code>. Os
componentes usam só estes, nunca a cor direto; os que não mudam de um tema para o outro repetem o valor.</p>{cores(claro, escuro)}</section>
{"".join(corpo)}
</main>
</body>
</html>
"""
    destino.write_text(pagina, encoding="utf-8")
    print(f"ok: {destino} ({len(ordem)} componentes, {sum(len(v) for v in secoes.values())} exemplos)")
