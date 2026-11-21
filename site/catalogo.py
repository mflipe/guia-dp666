"""Gera o catálogo de componentes (preview/catalogo.html).

Cada componente de componentes.py aparece com os exemplos de componentes.exemplos(), no lugar onde ele fica no
guia (a moldura do exemplo), uma vez em cada tema do guia (tema.py), lado a lado; os temas do rádio aparecem numa
seção própria, cada um com uma amostra curta. A página usa a mesma folha de
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


GUIA = [t for t in tema.TEMAS if t.get("grupo") != "radio"]    # os temas dos exemplos: Claro, Escuro…
RADIO = [t for t in tema.TEMAS if t.get("grupo") == "radio"]   # os temas do firmware têm uma seção própria


def par(conteudo, temas=GUIA):
    """O mesmo conteúdo em cada tema, lado a lado."""
    return ('<div class="cat-par">' + "".join(f'<div class="cat-tema tema-{t["id"]}" data-tema="{html.escape(t["nome"]["pt"])}">{conteudo}</div>'
                                            for t in temas) + "</div>")


def amostra_radio():
    """O pedaço do guia que mostra um tema do rádio: o item em foco do menu, um texto com link, uma dica e botões."""
    item = componentes.item_menu("#brasil", "Configuração para o Brasil", {"classe": "foco", "desc": "Ajustes que fazem diferença no Brasil."})
    return ('<ul class="mi-lista">' + item + "</ul>"
            '<p class="cat-texto">Os nomes das opções estão em inglês. Todos os valores estão em <a href="#tema">Ajustes do rádio</a>.</p>'
            '<div class="admonition tip"><p class="admonition-title">Libere o modo avançado</p><p>Muitas opções só aparecem nele.</p></div>'
            '<div class="hp-actions">' + componentes.botao("Girar em 3D", {"variante": "solido"})
            + componentes.botao("Mudar", {"variante": "fantasma"}) + "</div>")


def cores():
    """Os tokens de cor, cada tema com os seus valores; a amostra usa o token de verdade, dentro do tema."""
    nomes = [n for n, v in tema.valores(tema.BASE).items() if COR.fullmatch(v.strip())]
    colunas = []
    for t in GUIA:
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
    corpo.append('<section class="cat-sec" id="temas-radio" data-telas="pc"><h2>Temas do rádio</h2><p class="cat-desc">Os temas do firmware viram temas do '
                 'guia em <code>site/temas_radio.py</code>, com as cores de <code>site/temas.json</code>: o fundo da tela vira o fundo da '
                 "página, a moldura faz as linhas e as superfícies, a cor principal vira o destaque. Cada cor lida como texto tem contraste "
                 "de pelo menos 4,5:1 com o fundo e as superfícies.</p>" + par(amostra_radio(), RADIO) + "</section>")
    indice = ('<a href="#cores">cores</a>' + "".join(f'<a href="#{n}"><code>{n}</code></a>' for n in ordem)
              + '<a href="#tema">tema do guia</a><a href="#temas-radio">temas do rádio</a>')
    pagina = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>DP-666: catálogo de componentes</title>
<style>
@layer catalogo;
{layout.css().replace("{{RAIZ}}", "")}
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
<p class="cat-intro">Cada componente do guia, no lugar onde aparece nas páginas, nos temas Claro e Escuro; os temas do rádio têm uma seção
própria, no fim. Os componentes ficam em
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
