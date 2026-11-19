"""Gera o catálogo de componentes (preview/catalogo.html).

Cada componente de componentes.py aparece com os exemplos de componentes.exemplos(), no lugar onde ele fica no
guia (a moldura do exemplo), uma vez em cada tema do guia (tema.py), lado a lado. A página usa a mesma folha de
estilos do guia; cada metade recebe os tokens inteiros do seu tema (.tema-<id>). Também mostra as cores dos
tokens em cada tema e a janela de escolha do tema. Os estilos do catálogo ficam numa camada abaixo das do guia,
para não mexer nos componentes. É a página que testes/regressao-visual.mjs fotografa.
"""
import html
import inspect
import json
import pathlib
import re

import componentes
import i18n
import layout
import tema

UI = pathlib.Path(__file__).parent / "ui"
COR = re.compile(r"#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)")


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
    """O mesmo conteúdo em cada tema, lado a lado."""
    return ('<div class="cat-par">' + "".join(f'<div class="cat-tema tema-{t["id"]}" data-tema="{html.escape(t["nome"]["pt"])}">{conteudo}</div>'
                                            for t in tema.TEMAS) + "</div>")


def cores():
    """Os tokens de cor, cada tema com os seus valores; a amostra usa o token de verdade, dentro do tema."""
    nomes = [n for n, v in tema.valores(tema.BASE).items() if COR.fullmatch(v.strip())]
    colunas = []
    for t in tema.TEMAS:
        v = tema.valores(t)
        linhas = "".join(f'<li><i style="background:var({n})"></i><code>{n}</code><span>{html.escape(v[n].strip())}</span></li>' for n in nomes)
        colunas.append(f'<div class="cat-tema tema-{t["id"]}" data-tema="{html.escape(t["nome"]["pt"])}"><ul class="cat-cores">{linhas}</ul></div>')
    return '<div class="cat-par">' + "".join(colunas) + "</div>"


def gerar(destino):
    L = i18n.UI["pt"]
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
    escopos = "\n".join(f".tema-{t['id']} {{\n{tema.escopo(t)}\n}}" for t in tema.TEMAS)
    # o botão no rodapé do menu e o conteúdo da janela, numa moldura do catálogo (a janela de verdade tem largura fixa)
    janela = ('<div class="pausa-conta">' + tema.botao("pt", L) + "</div>"
              f'<div class="cat-janela"><div class="profile-form"><h2>{html.escape(L["tema_rotulo"])}</h2>'
              f'<p class="tema-nota">{html.escape(L["tema_nota"])}</p>' + tema.opcoes("pt", L) + "</div></div>")
    corpo.append('<section class="cat-sec" id="tema"><h2>Tema do guia</h2><p class="cat-desc">O botão do tema, como fica no rodapé do menu, e as '
                 'opções da janela que ele abre, com a amostra de cada tema. Os temas moram em <code>site/tema.py</code>; para criar '
                 "um, acrescente a entrada lá e o arquivo com os tokens que mudam.</p>" + par(janela) + "</section>")
    fontes = "\n".join(l for l in layout.ler("cabeca.html").splitlines() if l.startswith(('<link rel="preconnect"', '<link rel="stylesheet"')))
    indice = ('<a href="#cores">cores</a>' + "".join(f'<a href="#{n}"><code>{n}</code></a>' for n in ordem)
              + '<a href="#tema">tema do guia</a>')
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
{escopos}
{layout.ler("catalogo.css").rstrip()}
}}
</style>
</head>
<body>
<main class="cat">
<header class="cat-topo">
<p class="cat-volta"><a href="./">DP-666: o guia definitivo</a></p>
<h1>Catálogo de componentes</h1>
<p class="cat-intro">Cada componente do guia, no lugar onde aparece nas páginas, em cada tema do guia. Os componentes ficam em
<code>site/componentes.py</code> e <code>site/ui/componentes.js</code>, com os mesmos nomes e o mesmo HTML; o build confere os dois
com estes exemplos antes de gerar o site.</p>
<nav class="cat-indice" aria-label="Componentes">{indice}</nav>
</header>
<section class="cat-sec" id="cores"><h2>Cores</h2><p class="cat-desc">Os tokens de cor de <code>site/ui/css/tokens/</code>, em cada tema. Os
componentes usam só estes, nunca a cor direto; os que um tema não muda repetem o valor da base.</p>{cores()}</section>
{"".join(corpo)}
</main>
</body>
</html>
"""
    destino.write_text(pagina, encoding="utf-8")
    print(f"ok: {destino} ({len(ordem)} componentes, {sum(len(v) for v in secoes.values())} exemplos)")
