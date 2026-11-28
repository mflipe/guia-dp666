#!/usr/bin/env python3
"""Verificação periódica do guia: os links das fontes ainda abrem? Saiu versão nova de firmware?

- Links: cada link externo das páginas (site/docs/*.md e site/docs/en/*.md) é aberto. Erro 404, 410 ou falha de
  conexão conta como quebrado; 401, 403 e 429 contam como "o site recusa robôs" (o link pode estar bom para pessoas)
  e só aparecem no relatório.
- Firmware: a linha oficial (PE5PVB/TEF6686_ESP32, no GitHub) é conferida em dois lugares: a última versão
  publicada (a tag costuma ter só dois números, como v2.20) e a versão escrita no código em desenvolvimento
  (src/constants.h), que é a que o guia documenta. O maior número de Mod do Megatron citado na página do DP-666 da
  DEEPELEC também é conferido. Tudo é comparado, número a número, com as versões que o guia documenta
  (scripts/versoes.json), e só uma versão maior vira aviso, com o que conferir no guia.

Só usa a biblioteca padrão do Python. Uso:
  python3 scripts/verificar.py                       relatório na tela
  python3 scripts/verificar.py --relatorio r.md --problemas p.md
  python3 scripts/verificar.py --sem-rede            só lista os links (para conferir o script)
O arquivo de problemas só é criado quando há algo a fazer; o fluxo mensal do GitHub abre um aviso com ele.
"""
import argparse
import concurrent.futures
import json
import os
import pathlib
import re
import sys
import urllib.error
import urllib.request

RAIZ = pathlib.Path(__file__).resolve().parent.parent
DOCS = RAIZ / "site" / "docs"
AGENTE = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36 guia-dp666-verificacao"
RECUSA_ROBO = {401, 403, 429}
DEEPELEC = "https://www.deepelec.com/en/dp-666/"
OFICIAL_API = "https://api.github.com/repos/PE5PVB/TEF6686_ESP32/releases/latest"
OFICIAL_CODIGO = "https://raw.githubusercontent.com/PE5PVB/TEF6686_ESP32/main/src/constants.h"


def links():
    """Os links externos das páginas, com as páginas onde aparecem."""
    achados = {}
    for md in sorted(DOCS.glob("*.md")) + sorted((DOCS / "en").glob("*.md")):
        for url in re.findall(r"\]\((https?://[^)\s]+)\)", md.read_text(encoding="utf-8")):
            achados.setdefault(url, set()).add(str(md.relative_to(DOCS)))
    return achados


def abrir(url, metodo="GET", cabecalhos=None, limite=20):
    pedido = urllib.request.Request(url, method=metodo, headers={"User-Agent": AGENTE, "Accept": "*/*", **(cabecalhos or {})})
    with urllib.request.urlopen(pedido, timeout=limite) as resp:
        return resp.status, resp.read(2_000_000) if metodo == "GET" else b""


def conferir(url):
    """(url, situação, detalhe): ok, quebrado ou robo."""
    for metodo in ("HEAD", "GET"):   # alguns sites recusam HEAD e aceitam GET
        try:
            status, _ = abrir(url, metodo)
            return url, "ok", str(status)
        except urllib.error.HTTPError as e:
            if metodo == "HEAD" and e.code in (400, 403, 405, 501):
                continue
            if e.code in RECUSA_ROBO:
                return url, "robo", str(e.code)
            return url, "quebrado", str(e.code)
        except Exception as e:  # noqa: BLE001 — qualquer falha de rede conta
            if metodo == "HEAD":
                continue
            return url, "quebrado", type(e).__name__ + ": " + str(e)[:120]
    return url, "quebrado", "sem resposta"


def maior_mod(texto):
    """O maior (versão, número do Mod) citado num texto, como 2.0.15mod17 ou "2.0.15 Mod 16"."""
    achados = [(tuple(int(x) for x in v.split(".")), int(m)) for v, m in re.findall(r"(\d+\.\d+\.\d+)\s*[-_ ]?\s*[Mm]od\s*(\d+)", texto)]
    return max(achados) if achados else None


def numeros(versao):
    """'v2.20.12' vira (2, 20, 12); o que não for versão vira None. Tuplas se comparam número a número, e uma tag
    mais curta, como v2.20, fica abaixo de v2.20.12."""
    m = re.fullmatch(r"v?(\d+(?:\.\d+)*)", (versao or "").strip())
    return tuple(int(x) for x in m.group(1).split(".")) if m else None


def firmware(versoes):
    """Lista de (o que, achado, documentado, novo?) para os dois firmwares."""
    out = []
    doc = numeros(versoes["oficial"])
    try:
        cab = {"Accept": "application/vnd.github+json"}
        if os.environ.get("GH_TOKEN"):
            cab["Authorization"] = "Bearer " + os.environ["GH_TOKEN"]
        _, corpo = abrir(OFICIAL_API, cabecalhos=cab)
        tag = json.loads(corpo)["tag_name"]
        achado = numeros(tag)
        out.append(("Linha oficial, versão publicada (PE5PVB)", tag, versoes["oficial"], bool(achado and doc and achado > doc)))
    except Exception as e:  # noqa: BLE001
        out.append(("Linha oficial, versão publicada (PE5PVB)", "não consegui ler: " + type(e).__name__, versoes["oficial"], False))
    try:
        _, corpo = abrir(OFICIAL_CODIGO)
        m = re.search(r'#define\s+VERSION\s+"([^"]+)"', corpo.decode("utf-8", "replace"))
        texto = m.group(1) if m else "versão não encontrada"
        achado = numeros(texto)
        out.append(("Linha oficial, código em desenvolvimento (PE5PVB)", texto, versoes["oficial"], bool(achado and doc and achado > doc)))
    except Exception as e:  # noqa: BLE001
        out.append(("Linha oficial, código em desenvolvimento (PE5PVB)", "não consegui ler: " + type(e).__name__, versoes["oficial"], False))
    try:
        _, corpo = abrir(DEEPELEC)
        achado = maior_mod(corpo.decode("utf-8", "replace"))
        doc = maior_mod(versoes["megatron"])
        texto = f"{'.'.join(map(str, achado[0]))}mod{achado[1]}" if achado else "nenhuma versão citada"
        out.append(("Megatron (DEEPELEC)", texto, versoes["megatron"], bool(achado and doc and achado > doc)))
    except Exception as e:  # noqa: BLE001
        out.append(("Megatron (DEEPELEC)", "não consegui ler: " + type(e).__name__, versoes["megatron"], False))
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--relatorio", help="arquivo Markdown com o relatório completo")
    ap.add_argument("--problemas", help="arquivo Markdown criado só quando há algo a fazer")
    ap.add_argument("--sem-rede", action="store_true", help="só lista os links, sem abrir nenhum")
    a = ap.parse_args()

    todos = links()
    if a.sem_rede:
        print(f"{len(todos)} links em {len({p for ps in todos.values() for p in ps})} páginas")
        for url in sorted(todos):
            print(url)
        return 0

    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:
        resultados = list(ex.map(conferir, sorted(todos)))
    quebrados = [r for r in resultados if r[1] == "quebrado"]
    robos = [r for r in resultados if r[1] == "robo"]
    versoes = json.loads((RAIZ / "scripts" / "versoes.json").read_text(encoding="utf-8"))
    fw = firmware(versoes)
    novos = [f for f in fw if f[3]]

    linhas = ["# Verificação do guia", "",
              f"- Links conferidos: {len(resultados)}; quebrados: {len(quebrados)}; recusados a robôs: {len(robos)}.", ""]
    linhas += ["## Firmware", "", "| Firmware | Encontrado | No guia |", "| --- | --- | --- |"]
    linhas += [f"| {o} | {achado}{' (novo)' if novo else ''} | {doc} |" for o, achado, doc, novo in fw] + [""]
    if quebrados:
        linhas += ["## Links quebrados", ""] + [f"- {u} ({d}), em {', '.join(sorted(todos[u]))}" for u, _, d in quebrados] + [""]
    if robos:
        linhas += ["## Sites que recusam robôs (confira à mão se quiser)", ""] + [f"- {u} ({d})" for u, _, d in robos] + [""]
    relatorio = "\n".join(linhas)
    print(relatorio)
    if a.relatorio:
        pathlib.Path(a.relatorio).write_text(relatorio, encoding="utf-8")

    if a.problemas and (quebrados or novos):
        p = ["Encontrado pela verificação mensal do guia.", ""]
        if novos:
            p += ["## Versão nova de firmware", ""]
            p += [f"- **{o}:** saiu {achado}; o guia documenta {doc}. Confira menus, mensagens e a página de firmwares, "
                  "e atualize scripts/versoes.json." for o, achado, doc, _ in novos] + [""]
        if quebrados:
            p += ["## Links quebrados", ""] + [f"- {u} ({d}), em {', '.join(sorted(todos[u]))}" for u, _, d in quebrados] + [""]
        pathlib.Path(a.problemas).write_text("\n".join(p), encoding="utf-8")
    return 0


if __name__ == "__main__":
    sys.exit(main())
