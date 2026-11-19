"""Componentes da interface, com os mesmos nomes e a mesma saída em Python e em JavaScript.

O par deste arquivo é ui/componentes.js: o build usa este, o app.js e o navegacao.js usam aquele. Os dois
precisam dar exatamente o mesmo HTML; o build confere isso com os exemplos de exemplos() (veja conferir) e o
catálogo (catalogo.html) mostra cada exemplo nos dois temas. Mude os dois arquivos juntos.

Convenção dos dois lados:
  - o primeiro argumento é o conteúdo, já em HTML (quem chama escapa o texto);
  - o último é um dicionário de opções (em JavaScript, um objeto), sempre opcional;
  - valores de atributo entram crus e são escapados aqui; True vira atributo sem valor, False e None somem;
  - os atributos saem na ordem em que foram dados.
"""
import json
import pathlib
import subprocess

JS = pathlib.Path(__file__).parent / "ui" / "componentes.js"

VARIANTES = {"solido": "btn-solid", "fantasma": "btn-ghost"}


def esc(s):
    """Escapa texto para HTML (os mesmos quatro caracteres do esc do JavaScript)."""
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def atributos(attrs):
    """Atributos de um elemento, na ordem dada: ' nome="valor"', ' nome' (True) ou nada (False, None)."""
    out = ""
    for k, v in (attrs or {}).items():
        if v is True:
            out += " " + k
        elif v is not False and v is not None:
            out += f' {k}="{esc(v)}"'
    return out


def _classes(*cs):
    return " ".join(c for c in cs if c)


def botao(html, op=None):
    """Botão. variante: "solido" (btn-solid, a ação principal), "fantasma" (btn-ghost) ou nenhuma;
    classe: classes a mais; attrs: os demais atributos."""
    op = op or {}
    c = _classes(VARIANTES.get(op.get("variante") or "", ""), op.get("classe"))
    return '<button type="button"' + (f' class="{c}"' if c else "") + atributos(op.get("attrs")) + ">" + html + "</button>"


def nota(html, op=None):
    """Nota curta, embaixo de um bloco. classe: aj-note (padrão), sim-hint, v3-note; attrs: os demais."""
    op = op or {}
    return f'<p class="{op.get("classe") or "aj-note"}"' + atributos(op.get("attrs")) + ">" + html + "</p>"


def selo(html, op=None):
    """Selo de texto curto ao lado de um título. tom: ok, maybe, warn… (vira a classe tag-<tom>)."""
    tom = (op or {}).get("tom")
    return '<span class="tag' + (f" tag-{tom}" if tom else "") + '">' + html + "</span>"


def seletor(rotulo, op=None):
    """Seletor segmentado (role=radiogroup). opcoes: o HTML das opções (opcao_seletor); o script pode
    preenchê-lo depois."""
    return '<div class="seg" role="radiogroup" aria-label="' + esc(rotulo) + '">' + ((op or {}).get("opcoes") or "") + "</div>"


def opcao_seletor(html, op=None):
    """Uma opção do seletor segmentado. valor: o valor (em data-<chave>); marcado: se está escolhida;
    chave: o nome do dado, "v" por padrão."""
    op = op or {}
    return botao(html, {"attrs": {"role": "radio", "aria-checked": "true" if op.get("marcado") else "false",
                                  "data-" + (op.get("chave") or "v"): op.get("valor")}})


def opcao(html, op=None):
    """Opção da lista de um ajuste. padrao, brasil e ativo marcam a opção (is-def, is-br, is-on); escolha
    {"pv": …, "v": …} faz dela um botão que troca a prévia; desligada, um botão sem efeito (is-off).
    tag: li (padrão) ou outro elemento."""
    op = op or {}
    escolha, desligada = op.get("escolha"), op.get("desligada")
    c = _classes("aj-opt", (escolha is not None or desligada) and "is-pick", op.get("padrao") and "is-def",
                 op.get("brasil") and "is-br", op.get("ativo") and "is-on", desligada and "is-off")
    if desligada:
        dentro = botao(html, {"classe": "aj-pick", "attrs": {"disabled": True}})
    elif escolha is not None:
        dentro = botao(html, {"classe": "aj-pick", "attrs": {"data-pv": escolha["pv"], "data-v": escolha["v"],
                                                            "aria-pressed": "true" if op.get("ativo") else "false"}})
    else:
        dentro = html
    tag = op.get("tag") or "li"
    return f'<{tag} class="{c}">{dentro}</{tag}>'


def amostra(cor):
    """Quadradinho de uma cor."""
    return '<span class="aj-cor-sw" style="background:' + esc(cor) + '"></span>'


def paleta(c):
    """Amostra de um tema do rádio: fundo e moldura, com a cor da frequência e a secundária. Sem cores, nada."""
    if not c:
        return ""
    return ('<span class="aj-sw" aria-hidden="true" style="background:' + esc(c["fundo"]) + ";border-color:" + esc(c["moldura"]) + '">'
            '<i style="background:' + esc(c["freq"]) + '"></i><i style="background:' + esc(c["sec"]) + '"></i></span>')


def recolhivel(itens, op=None):
    """Lista que pode começar recolhida. classe: aj-opts, aj-cores…; attrs vão no <ol>; mais: o texto do botão
    que abre a lista inteira (sem ele, a lista fica sempre aberta); n: o que a lista conta (data-n do botão)."""
    op = op or {}
    mais = op.get("mais")
    h = '<ol class="' + _classes(op.get("classe"), mais and "is-many") + '"' + atributos(op.get("attrs")) + ">" + itens + "</ol>"
    if mais:
        h += botao(mais, {"classe": "aj-more", "attrs": {"data-n": op.get("n"), "aria-expanded": "false"}})
    return h


def item_menu(href, nome, op=None):
    """Item do menu do guia. antes e depois: o que vem em volta do nome dentro do link (o número da seção, o
    rótulo "você está aqui"); desc: a descrição que abre no item em foco (None fica de fora); classe: classes a
    mais do <li>; li e a: os demais atributos do <li> e do <a>."""
    op = op or {}
    h = ('<li class="' + _classes("mi-item", op.get("classe")) + '"' + atributos(op.get("li")) +
         '><a class="mi" href="' + esc(href) + '"' + atributos(op.get("a")) + ">" + (op.get("antes") or "") +
         '<span class="mi-nome">' + nome + "</span>" + (op.get("depois") or "") + "</a>")
    if op.get("desc") is not None:
        h += '<p class="mi-desc">' + op["desc"] + "</p>"
    return h + "</li>"


# ---------------------------------------------------------------- exemplos: conferência e catálogo
def exemplos():
    """Cada exemplo: (componente, argumentos, moldura do catálogo com {} no lugar do componente, legenda).
    Os argumentos são os mesmos nos dois lados; a moldura dá ao componente o lugar onde ele aparece no guia."""
    tema = {"fundo": "#000000", "moldura": "#3a3a3a", "freq": "#f8f8f8", "sec": "#a0a0a0"}
    vulcao = {"fundo": "#200000", "moldura": "#8a1a00", "freq": "#ffb000", "sec": "#ff5000"}
    sem = "<small>padrão</small>"
    opcoes = (opcao(paleta(tema) + "Default" + sem, {"escolha": {"pv": "tema", "v": "Default"}, "padrao": True, "ativo": True}) +
              opcao(paleta(vulcao) + "Volcano", {"escolha": {"pv": "tema", "v": "Volcano"}}) +
              opcao("Chinese Red", {"desligada": True}))
    lista = "".join(opcao(f"{n} kHz", {"padrao": n == 50, "brasil": n == 75}) for n in (50, 75, 100))
    lista_longa = "".join(opcao(str(n)) for n in range(1, 15))
    cores = ('<li class="aj-cor">' + '<div class="aj-cor-b">' + amostra("#ffb000") + '<span class="aj-cor-n">Frequência</span>'
             '<span class="aj-cor-v">Amber <code>#ffb000</code> <code>0xFD80</code></span></div><p class="aj-cor-d">O número grande.</p></li>')
    sec = item_menu("#uso--ligar", "Ligar e desligar", {"antes": '<span class="sec-n">1</span>'})
    return [
        ("botao", ["Ligar o rádio", {"variante": "solido", "attrs": {"data-power": True}}], '<div class="hlp-ask">{}</div>', "Sólido: a ação principal"),
        ("botao", ["Não, próximo passo", {"variante": "fantasma", "attrs": {"data-step-next": "1"}}], '<div class="hlp-ask">{}</div>', "Fantasma: a ação ao lado"),
        ("botao", ["← Todos os problemas", {"variante": "fantasma", "classe": "hlp-back", "attrs": {"data-go": "home"}}], "{}", "Fantasma de voltar"),
        ("botao", ["Volume", {"classe": "chip-btn", "attrs": {"data-hw": "volume"}}], '<div class="sim-extra">{}</div>', "Chip"),
        ("seletor", ["Firmware", {"opcoes": opcao_seletor("Megatron Mod17", {"valor": "mod17", "marcado": True}) +
                                  opcao_seletor("Linha oficial", {"valor": "oficial"})}], '<div class="tool-bar">{}</div>', "Seletor segmentado"),
        ("opcao_seletor", ["Todas<span>42</span>", {"valor": "", "marcado": True, "chave": "t"}], '<div class="aj-filtro" role="radiogroup">{}</div>', "Opção com contagem"),
        ("nota", ["Toque num tema para ver a tela com as cores dele."], "{}", "Nota de ajuste"),
        ("nota", ["Toque num controle do painel.", {"classe": "sim-hint"}], "{}", "Dica do simulador"),
        ("selo", ["linha oficial"], "<h3>Sem som no fone {}</h3>", "Selo"),
        ("selo", ["Confirmado", {"tom": "ok"}], '<p class="card-tags">{}</p>', "Selo com tom"),
        ("opcao", ["50 kHz<small>padrão</small>", {"padrao": True}], '<ol class="aj-opts">{}</ol>', "Opção padrão"),
        ("opcao", ["Volcano", {"escolha": {"pv": "tema", "v": "Volcano"}, "ativo": True}], '<ol class="aj-opts">{}</ol>', "Opção que troca a prévia, escolhida"),
        ("opcao", ["Chinese Red", {"desligada": True}], '<ol class="aj-opts">{}</ol>', "Opção sem prévia"),
        ("amostra", ["#ffb000"], "{}", "Amostra de cor"),
        ("paleta", [vulcao], "{}", "Amostra de tema"),
        ("recolhivel", [lista, {"classe": "aj-opts", "attrs": {"aria-label": "Opções na ordem do ciclo"}}], "{}", "Lista curta, sempre aberta"),
        ("recolhivel", [lista_longa, {"classe": "aj-opts", "attrs": {"aria-label": "Opções na ordem do ciclo"}, "mais": "Ver as 14 opções"}], "{}", "Lista longa, recolhida"),
        ("recolhivel", [opcoes, {"classe": "aj-opts", "attrs": {"aria-label": "Opções na ordem do ciclo"}}], "{}", "Lista de temas com prévia"),
        ("recolhivel", [cores, {"classe": "aj-cores", "attrs": {"data-pv-cores": True, "aria-label": "Cores do tema Volcano"}, "mais": "Ver as 1 cores", "n": "cores"}],
         "{}", "Cores de um tema"),
        ("item_menu", ["#uso", "Uso no dia a dia", {"li": {"data-route": "uso"}, "depois": '<span class="mi-aqui">Você está aqui</span>',
                                                    "desc": "Ligar, sintonizar, gravar memórias."}], '<ul class="mi-lista">{}</ul>', "Item do menu"),
        ("item_menu", ["#uso--ligar", "Ligar e desligar", {"classe": "atual", "a": {"aria-current": "location"}, "antes": '<span class="sec-n">1</span>'}],
         '<ul class="mi-lista">{}</ul>', "Seção atual no menu de pausa"),
        ("item_menu", ["#inicio", "Continuar", {"classe": "mi-continuar", "depois": '<span class="mi-sub"></span>', "desc": ""}],
         '<ul class="mi-lista">{}</ul>', "Continuar"),
        ("item_menu", ["#uso--memorias", "Memórias", {"antes": '<span class="sec-n">2</span>'}], '<ul class="mi-lista">' + sec + "{}</ul>", "Seções em sequência"),
    ]


_NODE = """
const fs = require('fs'), vm = require('vm');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(process.argv[1], 'utf8'), ctx);
const ex = JSON.parse(fs.readFileSync(0, 'utf8'));
process.stdout.write(JSON.stringify(ex.map(([n, a]) => ctx.Componentes[n].apply(null, a))));
"""


def conferir():
    """Roda os exemplos nos dois lados e para o build se algum der HTML diferente."""
    ex = [(nome, args) for nome, args, *_ in exemplos()]
    py = [globals()[nome](*args) for nome, args in ex]
    try:
        r = subprocess.run(["node", "-e", _NODE, str(JS)], input=json.dumps(ex), capture_output=True, text=True, check=True)
    except FileNotFoundError:
        print("componentes: sem Node.js, a conferência com o JavaScript ficou de fora")
        return
    except subprocess.CalledProcessError as e:
        raise SystemExit("componentes: o JavaScript falhou\n" + e.stderr)
    js = json.loads(r.stdout)
    dif = [(nome, p, j) for (nome, _), p, j in zip(ex, py, js) if p != j]
    if dif:
        raise SystemExit("componentes: Python e JavaScript dão HTML diferente:\n" +
                         "\n".join(f"  {n}\n    py: {p}\n    js: {j}" for n, p, j in dif))
    print(f"componentes: {len(ex)} exemplos iguais em Python e JavaScript")


if __name__ == "__main__":
    conferir()
