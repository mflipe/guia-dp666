"""Temas do guia feitos dos temas do firmware: as cores de cada tema do rádio viram os tokens do guia.

As cores vêm de temas.json (tiradas do código da linha oficial por scripts/temas.py, as mesmas da prévia no
explorador de menus). Cada papel da tela do rádio vira um papel da página:
  fundo da tela            → fundo da página; a moldura, misturada a ele, faz as superfícies, as linhas e a grade
  rótulos (ativo)          → títulos e texto
  cor principal (prim)     → destaque: links, botões, o cursor e o item em foco do menu
  frequência (freq)        → a marca do foco
  secundária (sec)         → as notas
  tudo certo (ok)          → o olho mágico (o anel de leitura) e as dicas
  alerta                   → os avisos de perigo
As telas do rádio são pequenas e quase sempre pretas, com cores fortes; para ler um texto longo, cada cor que é
lida como texto tem um contraste mínimo com o fundo e com as superfícies onde aparece (4,5:1, o nível AA). A que não
chega lá é clareada (no escuro) ou escurecida (no claro) só o necessário, sem mudar de matiz.
"""
import json
import pathlib
import re

TEMAS_JSON = pathlib.Path(__file__).parent / "temas.json"
# a linha oficial tem os 17 temas; o Mod17 tem 13 deles e os seus próprios (os que ganharem cores em temas.json
# entram sozinhos, como o Chinese Red e o Retro quando tiverem); o Mod17 chama o Queer de Maroon
RENOMEADOS = {"Maroon": "Queer"}


def paletas():
    """As cores de cada tema do rádio: os da linha oficial e, depois, os que só o Mod17 tem."""
    t = json.loads(TEMAS_JSON.read_text(encoding="utf-8"))
    out = dict(t["oficial"]["temas"])
    for nome, paleta in t["mod17"]["temas"].items():
        if nome not in out and RENOMEADOS.get(nome) not in out:
            out[nome] = paleta
    return out


def _rgb(h):
    h = h.strip().lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def _hex(c):
    return "#" + "".join(f"{max(0, min(255, round(x))):02x}" for x in c)


def mistura(a, b, t):
    """a com b, na proporção t (0: só a; 1: só b)."""
    return _hex(tuple(x + (y - x) * t for x, y in zip(_rgb(a), _rgb(b))))


def luminancia(h):
    def canal(c):
        c /= 255
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = _rgb(h)
    return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b)


def contraste(a, b):
    la, lb = luminancia(a), luminancia(b)
    return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)


def _garantir(cor, fundo, minimo, rumo):
    """Mistura a cor com o rumo (branco ou preto) só até ter o contraste mínimo com o fundo."""
    for i in range(101):
        c = mistura(cor, rumo, i / 100)
        if contraste(c, fundo) >= minimo:
            return c
    return rumo


def _rgba(h, a):
    r, g, b = _rgb(h)
    return f"rgb({r} {g} {b} / {a})"


def tokens(paleta):
    """(esquema, [(token, valor)]) de um tema do rádio. paleta: {papel: [hex, nome no firmware, RGB565]}."""
    cor = {k: v[0].lower() for k, v in paleta.items()}
    bg, moldura, rotulos = cor["fundo"], cor["moldura"], cor["ativo"]
    escuro = luminancia(bg) < 0.4
    rumo = "#ffffff" if escuro else "#000000"

    def legivel(c, minimo, *fundos):
        """A cor com o contraste mínimo sobre cada fundo onde ela aparece (sem fundos: só o da página)."""
        for f in fundos or (bg,):
            c = _garantir(c, f, minimo, rumo)
        return c

    t = {"--bg": bg}
    if escuro:
        t["--grid"] = mistura(bg, moldura, 0.10)
        t["--surface"] = mistura(bg, moldura, 0.14)
        t["--surface-2"] = mistura(bg, moldura, 0.22)
        t["--rule"] = legivel(mistura(bg, moldura, 0.40), 1.6)
        t["--tick"] = legivel(mistura(bg, moldura, 0.65), 2.4)
        t["--trace"] = mistura(bg, moldura, 0.30)
        t["--knob"] = mistura(bg, "#000000", 0.35)
    else:
        t["--grid"] = mistura(bg, moldura, 0.07)
        t["--surface"] = mistura(bg, "#ffffff", 0.6)
        t["--surface-2"] = mistura(bg, moldura, 0.06)
        t["--rule"] = legivel(mistura(bg, moldura, 0.18), 1.4)
        t["--tick"] = legivel(mistura(bg, moldura, 0.38), 2.4)
        t["--trace"] = mistura(bg, moldura, 0.14)
    superficies = (bg, t["--surface"], t["--surface-2"])
    t["--ink"] = legivel(rotulos, 12)
    t["--text"] = legivel(mistura(rotulos, bg, 0.12), 9)
    t["--muted"] = legivel(mistura(rotulos, bg, 0.40), 4.6, *superficies)
    destaque = legivel(cor["prim"], 4.6, *superficies)
    suave = mistura(bg, destaque, 0.16 if escuro else 0.10)
    destaque = legivel(destaque, 4.6, suave)   # o item em foco do menu: o destaque sobre o fundo suave
    t["--accent"], t["--accent-soft"] = destaque, suave
    t["--accent-mark"] = legivel(cor["freq"], 3)
    t["--accent-ink"] = "#000000" if contraste("#000000", destaque) >= contraste("#ffffff", destaque) else "#ffffff"
    t["--brass"] = mistura(moldura, destaque, 0.5)
    olho = legivel(cor["ok"], 3)
    t["--eye"], t["--eye-dark"], t["--eye-border"] = olho, mistura(bg, olho, 0.18), mistura(bg, olho, 0.55)
    t["--eye-glow"] = _rgba(olho, 0.35)
    t["--ok"] = legivel(cor["ok"], 4.6, *superficies)
    t["--danger"] = legivel(cor["alerta"], 4.6, *superficies)
    t["--note"] = legivel(cor["sec"], 4.6, *superficies)
    t["--scrim"] = _rgba(bg, 0.9 if escuro else 0.94)
    return ("dark" if escuro else "light"), list(t.items())


def _id(nome):
    return "radio-" + re.sub(r"[^a-z0-9]+", "-", nome.lower()).strip("-")


def temas():
    """As entradas dos temas do rádio, no formato de tema.TEMAS, na ordem do firmware."""
    out = []
    for nome, paleta in paletas().items():
        esquema, _ = tokens(paleta)
        out.append({"id": _id(nome), "nome": {"pt": nome, "en": nome}, "esquema": esquema,
                    "base": "escuro" if esquema == "dark" else None, "radio": nome, "grupo": "radio"})
    return out


def mudancas(nome):
    return tokens(paletas()[nome])[1]
