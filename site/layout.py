"""Monta o modelo da página a partir das peças em ui/.

Peças:
  ui/cabeca.html     <head> até as fontes (o <style> é aberto aqui)
  ui/css/*.css       folhas de estilo, na ordem de CSS (abaixo)
  ui/corpo.html      o corpo: fundo, área de leitura, botão de sintonia, menu de pausa
  ui/perfil.html     a janela "Seu rádio"
  ui/navegacao.js    o script da navegação (tela de título, menu, mapa da página, cartão da seção)

O build preenche os marcadores {{PAGES}}, {{MENU}}, {{APPDATA}}, {{APPJS}}, {{SEARCH}} e os demais.
"""
import pathlib

UI = pathlib.Path(__file__).parent / "ui"
CSS = ["tokens.css", "legado.css", "chrome.css"]


def ler(nome):
    return (UI / nome).read_text(encoding="utf-8")


def montar():
    css = "\n".join(ler("css/" + f) for f in CSS)
    rodape = (ler("perfil.html") +
              '\n<script type="application/json" id="app-data">{{APPDATA}}</script>\n<script>\n{{APPJS}}\n</script>\n'
              '<script type="application/json" id="search-data">{{SEARCH}}</script>\n<script>\n' +
              ler("navegacao.js") + "</script>\n</body>\n</html>\n")
    return ler("cabeca.html") + "\n<style>\n" + css + "\n</style>\n</head>\n" + ler("corpo.html") + rodape
