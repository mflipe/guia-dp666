"""Temas do guia: as cores que a pessoa escolhe no botão de tema (Automático, Claro, Escuro…).

Para criar um tema:
  1. acrescente uma entrada em TEMAS: id, nome em cada idioma, esquema ("light" ou "dark", para os controles do
     navegador) e, se quiser partir de outro tema em vez da base, "base" com o id dele;
  2. crie ui/css/tokens/<id>.css com um bloco :root { … } só com os tokens que mudam em relação à base
     (tokens.css) ou ao tema de "base".
O resto sai daqui: os blocos :root[data-theme="<id>"] da folha de estilos, a cópia que o modo Automático usa
quando o aparelho está no escuro (AUTOMATICO), o papel quadriculado (--grid-img, feito a partir de --grid), a cor
da barra do navegador (a de --bg), o script que aplica a escolha antes de a página aparecer, o botão, a janela
de escolha com a amostra de cada tema e os temas do catálogo.
"""
import html
import json
import pathlib
import re

from componentes import botao as _botao, paleta

TOKENS = pathlib.Path(__file__).parent / "ui" / "css" / "tokens"
CHAVE = "dp666.tema"   # onde o navegador guarda a escolha, em JSON, como o store do app.js

# o primeiro é a base: os tokens dele são os de tokens.css
TEMAS = [
    {"id": "claro", "nome": {"pt": "Claro", "en": "Light"}, "esquema": "light"},
    {"id": "escuro", "nome": {"pt": "Escuro", "en": "Dark"}, "esquema": "dark"},
]
# o tema que o modo Automático usa com o aparelho no claro e no escuro
AUTOMATICO = {"light": "claro", "dark": "escuro"}

POR_ID = {t["id"]: t for t in TEMAS}
BASE = TEMAS[0]


def _tokens(arquivo):
    """Os tokens do bloco :root { … } de um arquivo, na ordem, sem os comentários."""
    texto = (TOKENS / arquivo).read_text(encoding="utf-8")
    m = re.search(r"^:root \{\n(.*?)\n\}", texto, re.S | re.M)
    if not m:
        raise SystemExit(f"tema: {arquivo} precisa de um bloco :root {{ … }}")
    return re.findall(r"(--[\w-]+)\s*:\s*([^;]+);", re.sub(r"/\*.*?\*/", "", m[1], flags=re.S))


def mudancas(t):
    """O que o tema muda em relação à base, contando o tema de que ele parte."""
    if t is BASE:
        return []
    pai = POR_ID.get(t.get("base"))
    return (mudancas(pai) if pai else []) + _tokens(f"{t['id']}.css")


def valores(t):
    """Todos os tokens do tema, já com as mudanças."""
    v = dict(_tokens("tokens.css"))
    v.update(mudancas(t))
    return v


def grade(cor):
    """O papel quadriculado do fundo: uma linha de 1 px a cada 24 px, na cor --grid."""
    return ("url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E"
            f"%3Cpath d='M0 .5H24M.5 0V24' stroke='%23{cor.strip().lstrip('#')}' stroke-width='1' fill='none'/%3E%3C/svg%3E\")")


def _bloco(declaracoes, esquema, recuo="  "):
    linhas = [f"{recuo}{n}: {v.strip()};" for n, v in declaracoes]
    grid = dict(declaracoes).get("--grid")
    if grid:
        linhas.append(f"{recuo}--grid-img: {grade(grid)};")
    linhas.append(f"{recuo}color-scheme: {esquema};")
    return "\n".join(linhas)


def css():
    """Os blocos dos temas, para a camada tokens, depois de tokens.css."""
    out = [f":root {{ --grid-img: {grade(dict(_tokens('tokens.css'))['--grid'])}; }}"]
    for t in TEMAS[1:]:
        out.append(f"/* tema {t['nome']['pt']}: ui/css/tokens/{t['id']}.css */\n"
                   f':root[data-theme="{t["id"]}"] {{\n{_bloco(mudancas(t), t["esquema"])}\n}}')
    for esquema, tid in AUTOMATICO.items():
        t = POR_ID[tid]
        if t is not BASE:
            out.append(f"/* Automático, sem tema escolhido: o aparelho no {'escuro' if esquema == 'dark' else 'claro'} usa o tema {t['nome']['pt']} */\n"
                       f"@media (prefers-color-scheme: {esquema}) {{\n  :root:not([data-theme]) {{\n{_bloco(mudancas(t), t['esquema'], '    ')}\n  }}\n}}")
    return "\n".join(out)


def escopo(t):
    """Os tokens do tema inteiros, para aplicar o tema a um pedaço da página (catálogo)."""
    return _bloco(list(valores(t).items()), t["esquema"])


def cabeca():
    """A cor da barra do navegador e o script que aplica o tema guardado antes de a página aparecer.
    window.dp666Tema(id) troca o tema; um id vazio (ou que não existe mais) volta ao Automático."""
    cores = {t["id"]: valores(t)["--bg"].strip() for t in TEMAS}
    metas = "".join(f'<meta name="theme-color" content="{cores[tid]}" data-auto="{cores[tid]}" media="(prefers-color-scheme: {esq})">\n'
                    for esq, tid in AUTOMATICO.items())
    return metas + (
        "<script>\n"
        "// tema do guia (tema.py): aplica a escolha guardada antes de a página aparecer; sem escolha, segue o aparelho\n"
        "(function () {\n"
        f"  var T = {json.dumps(cores)};\n"
        "  window.dp666Tema = function (t) {\n"
        "    var ok = Object.prototype.hasOwnProperty.call(T, t), r = document.documentElement;\n"
        "    if (ok) r.setAttribute(\"data-theme\", t); else r.removeAttribute(\"data-theme\");\n"
        "    var m = document.querySelectorAll('meta[name=\"theme-color\"]');\n"
        "    for (var i = 0; i < m.length; i++) m[i].setAttribute(\"content\", ok ? T[t] : m[i].getAttribute(\"data-auto\"));\n"
        "  };\n"
        f"  try {{ window.dp666Tema(JSON.parse(window.localStorage.getItem(\"{CHAVE}\"))); }} catch (e) {{ /* sem armazenamento: segue o aparelho */ }}\n"
        "})();\n"
        "</script>\n")


ICONE = ('<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"></circle>'
         '<path class="tema-meia" d="M12 4a8 8 0 0 1 0 16z"></path></svg>')


def botao(lang, L):
    """O botão que abre a janela do tema. Mostra o tema em uso; o app.js atualiza o nome e o rótulo."""
    rotulo = L["tema_rotulo"] + ": " + L["tema_auto"]
    return _botao(ICONE + f'<span class="tema-btn-t">{html.escape(L["tema_auto"])}</span>',
                  {"classe": "tema-btn", "attrs": {"aria-haspopup": "dialog", "data-rotulo": L["tema_rotulo"], "aria-label": rotulo}})


def amostra(t):
    """A amostra de um tema: fundo e moldura, com o âmbar do destaque e o verde do olho mágico."""
    v = valores(t)
    return paleta({"fundo": v["--bg"].strip(), "moldura": v["--rule"].strip(), "freq": v["--accent"].strip(), "sec": v["--eye"].strip()})


def opcoes(lang, L):
    """As opções da janela: o Automático (com as amostras dos dois temas que ele usa) e cada tema."""
    def opcao(valor, desenho, nome, desc=""):
        return (f'<label class="opt opt-tema"><input type="radio" name="tema" value="{valor}">{desenho}'
                f'<span><strong>{html.escape(nome)}</strong>' + (f"<small>{html.escape(desc)}</small>" if desc else "") + "</span></label>")
    auto = '<span class="tema-par">' + "".join(amostra(POR_ID[i]) for i in AUTOMATICO.values()) + "</span>"
    return (f'<fieldset class="tema-lista"><legend class="sr-only">{html.escape(L["tema_rotulo"])}</legend>'
            + opcao("auto", auto, L["tema_auto"], L["tema_auto_desc"])
            + "".join(opcao(t["id"], amostra(t), t["nome"][lang]) for t in TEMAS) + "</fieldset>")


def janela(lang, L):
    """A janela de escolha do tema. A escolha vale na hora; o botão só fecha."""
    return (f'<dialog class="profile-dlg tema-dlg" id="tema-dlg" aria-labelledby="tema-titulo">'
            f'<form method="dialog" class="profile-form"><h2 id="tema-titulo">{html.escape(L["tema_rotulo"])}</h2>'
            f'<p class="tema-nota">{html.escape(L["tema_nota"])}</p>{opcoes(lang, L)}'
            f'<div class="dlg-actions"><button class="btn-solid" value="ok">{html.escape(L["tema_pronto"])}</button></div>'
            "</form></dialog>")
