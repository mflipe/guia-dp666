"""Gera site/temas.json: as cores de cada tema do firmware, para a prévia e a tabela de cores do explorador de menus.

Lê do código do PE5PVB/TEF6686_ESP32 a lista de temas (Theme[] em src/constants.h), as cores em RGB565
(#define em src/constants.h) e o que cada tema atribui a cada variável de cor (doTheme em src/gui.cpp).
O Megatron tem código fechado; para ele vale o estado da linha oficial em 532c4ef (01/09/2024), o mais novo
com os mesmos 13 temas em comum (ainda chama o Queer de Maroon e não tem o Bubblegum).

    python3 scripts/temas.py /caminho/para/TEF6686_ESP32 [ref-da-linha-oficial]

O build do site não precisa disso: ele só lê o JSON.
"""
import json
import pathlib
import re
import subprocess
import sys

# papel na tabela do guia -> variável do firmware (as variantes *Smooth, usadas no antisserrilhado, ficam de fora)
PAPEIS = {
    "fundo": "BackgroundColor", "moldura": "FrameColor", "freq": "FreqColor", "ativo": "ActiveColor",
    "prim": "PrimaryColor", "sec": "SecondaryColor", "rds": "RDSColor", "rdsQueda": "RDSDropoutColor",
    "st": "StereoColor", "cinza": "GreyoutColor", "bar": "BarInsignificantColor", "barS": "BarSignificantColor",
    "mod": "ModBarInsignificantColor", "modS": "ModBarSignificantColor", "bw": "BWAutoColor",
    "alerta": "SignificantColor", "ok": "InsignificantColor", "bat": "BatteryValueColor",
    "wifi": "WifiColorLow", "wifiS": "WifiColorHigh",
}
MOD17_BASE = "532c4ef"


def ler(repo, ref, caminho):
    return subprocess.run(["git", "-C", repo, "show", f"{ref}:{caminho}"], check=True, capture_output=True,
                          text=True, encoding="utf-8").stdout


def hex24(v):
    r, g, b = (v >> 11) & 31, (v >> 5) & 63, v & 31
    return "#%02X%02X%02X" % ((r * 527 + 23) >> 6, (g * 259 + 33) >> 6, (b * 527 + 23) >> 6)


def temas(repo, ref):
    cons, gui = ler(repo, ref, "src/constants.h"), ler(repo, ref, "src/gui.cpp")
    nomes = re.findall(r'"([^"]+)"', re.search(r"Theme\[\]\s*=\s*\{([^}]*)\}", cons).group(1))
    cores = {m.group(1): int(m.group(2), 16) for m in re.finditer(r"#define\s+(\w+)\s+0x([0-9A-Fa-f]{4})\b", cons)}
    corpo = gui[gui.index("void doTheme()"):]
    corpo = corpo[:corpo.index("\n}\n")]
    saida = {}
    for m in re.finditer(r"case\s+(\d+):[^\n]*\n(.*?)break;", corpo, re.S):
        atrib = {}
        for var, valor in re.findall(r"(\w+)\s*=\s*(\w+)\s*;", m.group(2)):
            atrib[var] = atrib[valor] if valor in atrib else (valor, cores[valor])
        # versões antigas não têm todas as variáveis (as cores do Wi-Fi vieram depois)
        saida[nomes[int(m.group(1))]] = {p: [hex24(atrib[v][1]), atrib[v][0], "0x%04X" % atrib[v][1]]
                                         for p, v in PAPEIS.items() if v in atrib}
    return saida


def main():
    repo = sys.argv[1]
    ref = sys.argv[2] if len(sys.argv) > 2 else "HEAD"
    versao = re.search(r'#define VERSION\s+"([^"]+)"', ler(repo, ref, "src/constants.h"))
    dados = {
        "oficial": {"base": versao.group(1) if versao else ref, "temas": temas(repo, ref)},
        "mod17": {"base": MOD17_BASE, "temas": temas(repo, MOD17_BASE)},
    }
    destino = pathlib.Path(__file__).resolve().parent.parent / "site" / "temas.json"
    destino.write_text(json.dumps(dados, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    for fw, d in dados.items():
        print(f"{fw}: {len(d['temas'])} temas de {d['base']}")


if __name__ == "__main__":
    main()
