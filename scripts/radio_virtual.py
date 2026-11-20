"""Gera site/radio/dados.json, os dados do rádio virtual: as fontes da tela, os nomes dos tipos de programa (PTY)
em cada idioma do firmware e as cores dos temas do Megatron Mod17.

Fontes: as smooth fonts do TFT_eSPI (formato VLW) guardadas nos .h do PE5PVB/TEF6686_ESP32 (FONT16, FONT28,
FONT48DEC e as seis da frequência, FREQFONT). A tela do Mod17 segue o código da linha oficial no commit ee2e338
(06/02/2025), então os arquivos de entrada devem ser desse commit:

    mkdir -p /tmp/fontes && for f in FONT16.h FONT28.h FONT48DEC.h FREQFONT.h language.h; do
      git -C TEF6686_ESP32 show ee2e338:src/$f > /tmp/fontes/$f; done
    python3 scripts/radio_virtual.py /tmp/fontes

Para cada glifo vão as métricas do VLW (largura, altura, avanço, dY, dX) e o alfa em base64. As fontes de texto
levam só os caracteres que a tela usa (ASCII, Latin-1, o μ e as letras dos nomes de PTY); as de número vão
inteiras. As fontes e os textos são do firmware, sob a GPL-3.0 do projeto PE5PVB/TEF6686_ESP32, e não entram nas
licenças CC BY e MIT do guia.

Idiomas: o ajuste Language muda o nome do tipo de programa (os textos 228 a 259 do language.h) e os avisos
das telas de RDS (33, 87, 88 e 89). O chinês simplificado fica de fora: com ele, o firmware troca a fonte da
tela inteira.

Cores: as do Mod17 em site/temas.json. O Essence foi conferido numa foto da tela do Mod17, e ali o firmware usa
um cinza-azulado claro para o que está apagado (ícones, traços do passo, parte vazia dos medidores), diferente do
cinza escuro do fundo das etiquetas. Os outros temas ainda não têm foto: valem as cores do código.
"""
import base64
import json
import pathlib
import re
import struct
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
SAIDA = RAIZ / "site" / "radio" / "dados.json"
TEXTO = set(range(0x21, 0x7F)) | set(range(0xA0, 0x100)) | {0x3BC}  # μ: o firmware escreve dBμV com o mi grego
ORDEM_MOD17 = ["Essence", "Cyan", "Crimson", "Monochrome", "Volcano", "Dendro", "Sakura", "Whiteout", "Tangerine",
               "Ocean", "Indigo", "Maroon", "Chinese Red", "Retro", "GoldBrite"]
# Essence no Mod17, pela foto: o que difere das cores do código (o resto vale como está em temas.json)
FOTO_ESSENCE = {"apagado": "#8C9CCE", "cinza": "#101010", "bw": "#00FFFF", "bat": "#00FFFF", "relogio": "#00FFFF"}


def ler(caminho):
    texto = pathlib.Path(caminho).read_text(encoding="utf-8")
    padrao = r"const\s+uint8_t\s+(\w+)\s*\[\]\s*PROGMEM\s*=\s*\{(?:[ \t]*//[ \t]*([^\n]*))?\n(.*?)\};"
    for m in re.finditer(padrao, texto, re.S):
        yield m.group(1), (m.group(2) or "").strip(), bytes(int(x, 16) for x in re.findall(r"0x([0-9A-Fa-f]{1,2})", m.group(3)))


def fonte(vlw, so=None):
    n, _, tamanho, _, subida, descida = struct.unpack(">6i", vlw[:24])
    pos, glifos, desc_max = 24 + 28 * n, {}, descida
    for i in range(n):
        u, h, w, avanco, dy, dx, _ = struct.unpack(">7i", vlw[24 + 28 * i: 52 + 28 * i])
        bits = vlw[pos: pos + w * h]
        pos += w * h
        # como o TFT_eSPI: a maior descida vem dos glifos, sem os códigos que dão valores ruins
        if h - dy > desc_max and ((0x20 < u < 0xA0 and u != 0x7F) or u > 0xFF):
            desc_max = h - dy
        if so is None or u in so:
            glifos[chr(u)] = [w, h, avanco, dy, dx, base64.b64encode(bits).decode()]
    return {"tamanho": tamanho, "subida": subida, "descida": descida, "descidaMax": desc_max,
            "espaco": (subida + descida) * 2 // 7, "glifos": glifos}


def idiomas(caminho):
    """Os textos de cada idioma que as telas usam, na ordem do menu do firmware (sem o chinês): os nomes dos 32
    tipos de programa (textos 228 a 259) e os avisos das telas de RDS (33, 87, 88 e 89)."""
    texto = pathlib.Path(caminho).read_text(encoding="utf-8")
    pty, avisos = {}, {}
    for bloco in re.split(r'\n  \{ "', texto)[1:]:
        nome = bloco.split('"', 1)[0]
        if nome == "Simplified Chinese":
            continue
        linhas = re.findall(r'^\s*"((?:[^"\\]|\\.)*)",?\s*//\s*(\d+)', bloco, re.M)
        textos = {int(n): s.replace("\\n", " ").replace('\\"', '"') for s, n in linhas}
        pty[nome] = [textos[228 + i] for i in range(32)]
        avisos[nome] = {"fechar": textos[33], "semAF": textos[87], "semEON": textos[88], "semRTmais": textos[89]}
    return pty, avisos


def temas():
    mod17 = json.loads((RAIZ / "site" / "temas.json").read_text(encoding="utf-8"))["mod17"]["temas"]
    out = {}
    for nome in ORDEM_MOD17:
        chave = "Maroon" if nome == "Maroon" else nome
        if chave not in mod17:
            out[nome] = None  # sem cores conhecidas (Chinese Red e Retro): fica sem prévia
            continue
        p = {k: v[0] for k, v in mod17[chave].items()}
        p.setdefault("apagado", p["cinza"])
        p.setdefault("relogio", p["bw"])
        if nome == "Essence":
            p.update(FOTO_ESSENCE)
            p["foto"] = True
        out[nome] = p
    return out


def main(pasta):
    pasta = pathlib.Path(pasta)
    out = {"origem": "Fontes e textos: PE5PVB/TEF6686_ESP32, commit ee2e338 (GPL-3.0). Cores: temas do Megatron Mod17.",
           "texto": {}, "freq": {}, "temas": temas()}
    out["pty"], out["avisos"] = idiomas(pasta / "language.h")
    letras = {ord(c) for nomes in out["pty"].values() for c in "".join(nomes)}
    letras |= {ord(c) for av in out["avisos"].values() for c in "".join(av.values())}
    for _, _, vlw in ler(pasta / "FONT16.h"):
        out["texto"]["16"] = fonte(vlw, TEXTO | letras)
    for _, _, vlw in ler(pasta / "FONT28.h"):
        out["texto"]["28"] = fonte(vlw, TEXTO)
    for _, _, vlw in ler(pasta / "FONT48DEC.h"):
        out["texto"]["48"] = fonte(vlw)
    for _, comentario, vlw in ler(pasta / "FREQFONT.h"):
        out["freq"][{"BW7UltimateNumMono": "Classic"}.get(comentario, comentario)] = fonte(vlw)
    SAIDA.parent.mkdir(parents=True, exist_ok=True)
    SAIDA.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(SAIDA, SAIDA.stat().st_size, "bytes; fontes da frequência:", ", ".join(out["freq"]))


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else ".")
