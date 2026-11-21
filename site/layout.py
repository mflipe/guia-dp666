"""Monta o modelo da página a partir das peças em ui/.

Peças:
  ui/cabeca.html     <head> até as fontes (o <style> é aberto aqui)
  ui/css/<camada>/   folhas de estilo por componente, agrupadas em camadas (CAMADAS, abaixo)
  ui/corpo.html      o corpo: fundo, área de leitura, botão de sintonia, menu de pausa
  ui/perfil.html     a janela "Seu rádio"
  ui/navegacao.js    o script da navegação (tela de título, menu, mapa da página, cartão da seção)
  ui/componentes.js  os componentes (botão, nota, opção, lista recolhível…), par de componentes.py; entra
                     no mesmo <script> do app.js, antes dele, e o navegacao.js também os usa

As camadas (@layer) decidem quem vence sem depender da especificidade: uma regra de uma camada
posterior vence qualquer regra de uma camada anterior. Dentro da camada, vale a ordem dos arquivos.

Os temas do guia (Claro, Escuro e os que vierem) moram em tema.py: a camada tokens leva tokens.css (a base)
e, depois dela, os blocos de cada tema; o <head> leva a cor da barra do navegador e o script que aplica o tema
escolhido antes de a página aparecer. O build põe o botão do tema ({{TEMA_BOTAO}}) e a janela ({{JANELA_TEMA}}).

O build preenche os marcadores {{PAGES}}, {{MENU}}, {{APPDATA}}, {{APPJS}}, {{SEARCH}} e os demais.
"""
import pathlib

import tema

UI = pathlib.Path(__file__).parent / "ui"

# camada: arquivos em ui/css/<camada>/, na ordem em que entram
CAMADAS = {
    "tokens": ["tokens"],                       # cores, fontes e medidas dos dois temas
    "base": ["base"],                           # elementos do HTML, foco, seleção, utilitários
    "conteudo": ["cabecalho", "prosa", "figuras", "tabelas", "blocos", "diagramas", "inicio"],
    "componentes": ["icones", "perfil", "tema", "radio", "botoes", "busca"],
    "ferramentas": ["visualizador-3d", "ferramentas", "simulador", "explorador", "assistente", "placa", "checklist", "codigos"],
    "layout": ["menu", "app", "titulo", "sintonia", "cartao", "mapa", "proximo"],
}


def ler(nome):
    return (UI / nome).read_text(encoding="utf-8")


def folha(camada, arquivo):
    texto = ler(f"css/{camada}/{arquivo}.css").rstrip()
    return texto + "\n" + tema.css() if (camada, arquivo) == ("tokens", "tokens") else texto


def css():
    partes = ["@layer " + ", ".join(CAMADAS) + ";"]
    for camada, arquivos in CAMADAS.items():
        corpo = "\n".join(f"/* ---------- {camada}/{a}.css ---------- */\n" + folha(camada, a) for a in arquivos)
        partes.append(f"@layer {camada} {{\n{corpo}\n}}")
    return "\n".join(partes)


def montar():
    rodape = (ler("perfil.html") + "{{JANELA_TEMA}}" + "{{RADIO_DOCA}}" +
              '\n<script type="application/json" id="app-data">{{APPDATA}}</script>\n<script>\n' + ler("componentes.js") + '{{APPJS}}\n</script>\n'
              '<script type="application/json" id="search-data">{{SEARCH}}</script>\n<script>\n' +
              ler("navegacao.js") + "</script>\n</body>\n</html>\n")
    return ler("cabeca.html").replace("<!--TEMA-->\n", tema.cabeca()) + "\n<style>\n" + css() + "\n</style>\n</head>\n" + ler("corpo.html") + rodape
