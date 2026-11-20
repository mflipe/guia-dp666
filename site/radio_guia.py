"""O rádio virtual no guia: o botão ao lado do tema e do idioma (no rodapé do menu, na tela de título e no alto de
cada página) e a doca onde o painel abre, por cima de qualquer página.

O rádio mora em radio/ (radio.js, painel.js, painel.css e dados.json), que o build copia para preview/radio; as
duas versões do guia buscam ali, e só no primeiro toque no botão. O app.js liga o botão à doca: abre, minimiza e
lembra se o rádio estava aberto ao trocar de idioma. A página radio/index.html mostra o mesmo rádio sozinho.
"""
import pathlib
import shutil

from componentes import botao as _botao, esc

ROOT = pathlib.Path(__file__).parent
ARQUIVOS = ["radio.js", "painel.js", "painel.css", "dados.json", "index.html"]

# um rádio de traço, como os outros ícones do guia: a caixa, a antena, o alto-falante e o dial
ICONE = ('<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="8" width="18" height="12" rx="2"></rect>'
         '<path d="M8 8l9-5"></path><circle cx="15.5" cy="14" r="2.75"></circle><path d="M6.5 12.5h3M6.5 15.5h3"></path></svg>')


def botao(L):
    """O botão do rádio. data-fechar fecha o menu quando o toque vem do rodapé dele (nas outras cópias, não faz nada)."""
    return _botao(ICONE + '<span class="radio-btn-t">' + esc(L["radio_rotulo"]) + "</span>", {
        "classe": "radio-btn",
        "attrs": {"aria-label": L["radio_rotulo"], "aria-expanded": "false", "aria-controls": "radio-doca",
                  "data-estado": "fechado", "data-fechar": True},
    })


def doca(L):
    """Onde o painel abre. A versão em inglês fica uma pasta abaixo, então busca o rádio uma pasta acima."""
    base = "../radio/" if L["dir"] else "radio/"
    return (f'<div class="rv-doca" id="radio-doca" data-base="{base}" role="region" '
            f'aria-label="{esc(L["radio_rotulo"])}" hidden></div>\n')


def copiar(destino):
    """Copia o rádio para destino (preview/radio)."""
    destino.mkdir(parents=True, exist_ok=True)
    for a in ARQUIVOS:
        shutil.copy2(ROOT / "radio" / a, destino / a)
