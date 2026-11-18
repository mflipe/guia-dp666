"""Gera as amostras das fontes da frequência para a prévia do explorador de menus.

Desenha o número 98.10 com as fontes do próprio firmware (formato VLW das smooth fonts do TFT_eSPI, guardado
em src/FREQFONT.h do PE5PVB/TEF6686_ESP32) e grava site/fontes_freq.json, que o build embute na página.
As seis fontes são idênticas na linha oficial e no Megatron. A Comic saiu do código em dezembro de 2025, então
o arquivo de entrada deve ser de antes disso, por exemplo:

    git -C TEF6686_ESP32 show 899ad12^:src/FREQFONT.h > /tmp/FREQFONT.h
    python3 scripts/fontes_freq.py /tmp/FREQFONT.h

Precisa do Pillow (pip install pillow). O build do site não precisa: ele só lê o JSON.
"""
import base64
import io
import json
import pathlib
import re
import struct
import sys

from PIL import Image

TEXTO = "98.10"
NOMES = {"BW7UltimateNumMono": "Classic"}  # nome no menu quando difere do comentário


def fontes(caminho):
    texto = pathlib.Path(caminho).read_text(encoding="utf-8")
    padrao = r"const\s+uint8_t\s+\w+\s*\[\]\s*PROGMEM\s*=\s*\{\s*//\s*([^\n]+)\n(.*?)\};"
    for m in re.finditer(padrao, texto, re.S):
        yield m.group(1).strip(), bytes(int(x, 16) for x in re.findall(r"0x([0-9A-Fa-f]{1,2})", m.group(2)))


def glifos(vlw):
    n = struct.unpack(">i", vlw[:4])[0]
    pos, tab = 24 + 28 * n, {}
    for i in range(n):
        u, h, w, avanco, dy, dx, _ = struct.unpack(">7i", vlw[24 + 28 * i: 52 + 28 * i])
        tab[chr(u)] = (w, h, avanco, dy, dx, vlw[pos: pos + w * h])
        pos += w * h
    return tab


def desenhar(vlw, texto):
    tab = glifos(vlw)
    topo = max(tab[c][3] for c in texto)            # maior subida acima da linha de base
    fundo = max(tab[c][1] - tab[c][3] for c in texto)
    largura = sum(tab[c][2] for c in texto) + 8
    img = Image.new("L", (largura, topo + fundo), 0)
    x = 0
    for c in texto:
        w, h, avanco, dy, dx, bits = tab[c]
        if w and h:
            img.paste(Image.frombytes("L", (w, h), bits), (x + dx, topo - dy))
        x += avanco
    img = img.crop(img.getbbox())
    rgba = Image.new("RGBA", img.size, (255, 255, 255, 0))
    rgba.putalpha(img)
    buf = io.BytesIO()
    rgba.save(buf, "PNG", optimize=True)
    return {"w": img.width, "h": img.height, "png": "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()}


def main():
    saida = {"texto": TEXTO, "fontes": {}}
    for nome, vlw in fontes(sys.argv[1]):
        saida["fontes"][NOMES.get(nome, nome)] = desenhar(vlw, TEXTO)
    destino = pathlib.Path(__file__).resolve().parent.parent / "site" / "fontes_freq.json"
    destino.write_text(json.dumps(saida, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    for nome, f in saida["fontes"].items():
        print(f"{nome}: {f['w']}x{f['h']} px, {len(f['png']) // 1024} KB")


if __name__ == "__main__":
    main()
