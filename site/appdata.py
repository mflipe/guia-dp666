"""Dados estruturados para as ferramentas do app (botões, ajustes, problemas e placa).

Os botões e a placa são escritos à mão a partir dos textos do guia (uso.md, oficial.md,
hardware.md e data.py). Os ajustes e os problemas são lidos dos próprios textos, para que
uma correção no texto apareça também na ferramenta.
"""
import re
import unicodedata

import data
import i18n
import menuspec as MS
import didatica as DD

LANG, T = "pt", i18n.UI["pt"]


def slug(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
    return s[:60] or "item"


def norm(s):
    """Texto sem acentos e em minúsculas, para a busca das ferramentas."""
    s = re.sub(r"<[^>]+>", " ", s)
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower()
    return re.sub(r"\s+", " ", s).strip()


# ---------------------------------------------------------------- botões
CHAVE = "Chave geral: em OFF desconecta a bateria. Use para guardar o rádio e para cortar a energia de verdade quando ele travar."

BUTTONS = {
    "mod17": {
        "nome": "Megatron Mod17",
        "longo_ms": 500,
        "ref": "uso--botões",
        "controles": [
            {"id": "band", "rotulo": "BAND", "acoes": [
                ["curto", "Toque curto", "Alterna entre LW, MW, SW, FML e FM, pulando as faixas desativadas. No menu, desce uma página."],
                ["longo", "Toque longo", "Abre o teclado na tela."],
                ["segurar", "Segurar 3 s", "Executa a ação de Keep BAND key 3 sec.: Power off, Mute screen ou Disable.", 3000],
            ]},
            {"id": "bw", "rotulo": "BW", "acoes": [
                ["curto", "Toque curto", "Em FM, alterna estéreo e mono. Em AM, alterna entre 3, 4, 6 e 8 kHz. No menu, sobe uma página."],
                ["longo", "Toque longo", "Abre a página de atalhos."],
            ]},
            {"id": "mode", "rotulo": "MODE", "acoes": [
                ["curto", "Toque curto", "Alterna entre MAN, AUTO e MEM. Dentro do menu, dos atalhos ou do teclado, sai e salva."],
                ["longo", "Toque longo", "Abre o menu."],
            ]},
            {"id": "enc", "rotulo": "TUNING", "knob": True, "acoes": [
                ["girar", "Girar", "Muda a frequência ou navega no menu."],
                ["curto", "Toque curto", "Troca o passo e, no menu, confirma."],
                ["longo", "Toque longo (500 ms)", "Trava ou destrava. A ação é configurável."],
            ]},
            {"id": "power", "rotulo": "POWER", "acoes": [
                ["curto", "Toque curto", "Liga e desliga. A opção Power off, em Main settings, desliga pelo software; para religar, use o BW."],
            ]},
            {"id": "boot", "rotulo": "BOOT", "acoes": [
                ["curto", "Sozinho", "Não faz nada com o rádio ligado. Segure ao ligar para entrar no modo de gravação."],
            ]},
        ],
        "ligar": [
            [["bw"], "Inverte o sentido do encoder.", ""],
            [["mode"], "Gira a tela.", ""],
            [["enc"], "Escolhe entre encoder padrão e óptico.", ""],
            [["bw", "enc"], "Restaura o padrão de fábrica. Desde o mod12, não apaga as memórias e abre o assistente de configuração: idioma, modelo, calibração do toque e modo de uso.", "aviso"],
            [["boot"], "Modo de gravação, para atualizar o firmware.", ""],
        ],
        "notas": [
            "VOLUME e SQL são potenciômetros: volume analógico e nível do squelch.",
            "O teclado físico digita frequências e memórias. Veja [Uso do rádio](uso.md).",
            CHAVE,
        ],
    },
    "oficial": {
        "nome": "Linha oficial",
        "longo_ms": 1000,
        "ref": "oficial--botões",
        "controles": [
            {"id": "band", "rotulo": "BAND", "acoes": [
                ["curto", "Toque curto", "Troca de faixa. Nas telas de AF e de estatísticas, volta ao RDS avançado; no RDS avançado, sai dele."],
                ["longo", "Toque longo (1 s)", "No FM, abre o RDS avançado e, de dentro dele, a tela de AF. No AM, ativa na hora a proteção de tela."],
                ["segurar", "Segurar 2,5 s", "Executa a ação escolhida em “Pressione o botão banda por 5 seg.”: nada, desligar ou apagar a tela. Apesar do nome, o código usa 2,5 s.", 2500],
            ]},
            {"id": "bw", "rotulo": "BW", "acoes": [
                ["curto", "Toque curto", "Abre o seletor de largura de banda."],
                ["longo", "Toque longo (1 s)", "No FM, alterna entre mono forçado e estéreo automático. No AM, abre o seletor de largura."],
            ]},
            {"id": "mode", "rotulo": "MODE", "acoes": [
                ["curto", "Toque curto", "Alterna entre MAN, AUTO e MEM. No menu, sai."],
                ["longo", "Toque longo (1 s)", "Abre o menu."],
                ["segurar", "Segurar 3 s, no menu", "Abre os jogos escondidos no firmware.", 3000],
            ]},
            {"id": "enc", "rotulo": "Encoder", "knob": True, "acoes": [
                ["girar", "Girar", "Sintoniza e, no menu, percorre as opções. Com a proteção de tela ativa, só acende a tela."],
                ["curto", "Toque curto", "Em MAN, troca o passo. Em MEM, entra no modo de gravação."],
                ["longo", "Toque longo (1 s)", "No FM, grava a estação no logbook. No SW, liga e desliga a busca por bandas métricas."],
            ]},
            {"id": "boot", "rotulo": "BOOT", "acoes": [
                ["curto", "Sozinho", "Não faz nada com o rádio ligado. Segure ao ligar para entrar no modo de gravação."],
            ]},
        ],
        "ligar": [
            [["bw"], "Inverte o sentido do encoder.", ""],
            [["mode"], "Gira a tela em 180°.", ""],
            [["band"], "Calibra o medidor analógico, só em montagens que têm um.", ""],
            [["enc"], "Alterna entre encoder comum e óptico.", ""],
            [["bw", "mode"], "Calibra o toque.", ""],
            [["bw", "band"], "Inverte as cores da tela.", ""],
            [["mode", "enc"], "Troca o tipo de painel (ARS ou comum), para quando o menu fica ilegível.", ""],
            [["bw", "enc"], "Volta ao padrão de fábrica e também esvazia as 99 memórias e o logbook. Faça o [backup](backup.md) antes.", "perigo"],
            [["boot"], "Modo de gravação, para atualizar o firmware. É do próprio ESP32 e vale para qualquer firmware.", ""],
        ],
        "notas": [
            "Com a proteção de tela ativa, apertar BAND ou girar o encoder só acende a tela.",
            "iMS e EQ alternam com um toque na tela.",
            CHAVE,
        ],
    },
}


# ---------------------------------------------------------------- ajustes
# Lista para configurar o rádio no Brasil, na ordem de uso. Conteúdo de brasil.md.
# (id, opção ou opções do menu, nome na lista, onde fica, valor, motivo). A primeira opção recebe o link.
CHECKLIST = {
    "mod17": [
        ("avancado", ("System usage mode",), "Modo avançado", "Main settings → System usage mode, pelo menu em chinês", "Advanced mode",
         "Muitas opções desta lista só aparecem nele. Troque o idioma para 简体中文, escolha 高级模式 em 主要设置 → 系统使用模式 e volte para English."),
        ("desenfase", ("FM deemphasis",), "FM deemphasis", "", "50us",
         "O Brasil usa 50 µs, como manda o Ato Anatel nº 8.104/2022, ao contrário do resto das Américas."),
        ("squelch", ("Use squelch",), "Use squelch", "", "Off", "Para caçar emissoras fracas. Em Auto, o rádio pode esconder sinais distantes."),
        ("estereo", ("Stereo threshold",), "Stereo threshold", "", "≈ 40 dBµV", "Com sinal fraco, força o mono e reduz o chiado."),
        ("bordas", ("Set low band edge", "Set high band edge"), "Set low band edge e Set high band edge", "", "76,1 e 108,0 MHz",
         "A faixa passa a cobrir o FM estendido, de 76,1 a 87,3 MHz."),
        ("passo", ("FM default stepsize",), "FM default stepsize", "", "200 kHz",
         "Com a borda em 76,1 MHz, a sintonia deve andar pelos canais brasileiros, que terminam em decimal ímpar; confira no seu aparelho. "
         "Em DX, use 100 kHz para parar também nos decimais pares."),
        ("agc", ("FM AGC",), "FM AGC", "", "92 dBµV", "É o mais sensível. Se aparecerem estações fantasmas perto de emissoras fortes, teste 87 ou 84."),
        ("mw", ("MW default stepsize",), "MW default stepsize", "", "10 kHz", "É a grade de ondas médias das Américas, de 520 a 1720 kHz."),
        ("regiao", ("Region",), "Region", "", "Europe", "O RDS brasileiro segue o modelo europeu, com PI distribuído pela Anatel."),
        ("af", ("Use AF",), "Use AF", "", "Off", "Em DX e buscas, evita que o rádio pule sozinho para outra frequência."),
        ("rdshora", ("RDS time sync",), "RDS time sync", "", "Off", "Com o NTP funcionando, porque algumas emissoras mandam a hora errada."),
        ("fuso", ("Set local time zone",), "Set local time zone", "", "GMT−03:00", "Horário de Brasília. Escolha o fuso do seu estado."),
        ("ntp", ("Set NTP server",), "Set NTP server", "", "a.st1.ntp.br", "É o servidor do NTP.br, que usa os relógios atômicos do Observatório Nacional."),
        ("wifi", ("Wi-Fi auto disconnect",), "Wi-Fi auto disconnect", "", "After time sync",
         "O Wi-Fi desliga depois de acertar a hora, o que economiza bateria e mantém a leitura dela."),
    ],
    "oficial": [
        ("desenfase", ("FM deemphasis",), "Desênfase FM", "", "50 µs",
         "O Brasil usa 50 µs, como manda o Ato Anatel nº 8.104/2022, ao contrário do resto das Américas."),
        ("squelch", ("Use squelch",), "Usar squelch", "", "Desligado", "Para caçar emissoras fracas. Em Auto, o rádio pode esconder sinais distantes."),
        ("estereo", ("Stereo separation threshold",), "Limiar de separação estéreo", "", "≈ 40 dBµV", "Com sinal fraco, força o mono e reduz o chiado."),
        ("bordas", ("Low band edge", "High band edge"), "Definir borda da faixa baixa e alta", "", "76,1 e 108,0 MHz",
         "A faixa passa a cobrir o FM estendido, de 76,1 a 87,3 MHz."),
        ("passo", ("FM default stepsize",), "Passo padrão FM", "", "200 kHz",
         "Com a borda em 76,1 MHz, a sintonia anda pelos canais brasileiros, que terminam em decimal ímpar. "
         "Em DX, use 100 kHz para parar também nos decimais pares."),
        ("agc", ("FM AGC",), "FM AGC", "", "92 dBµV", "É o mais sensível. Se aparecerem estações fantasmas perto de emissoras fortes, teste 87 ou 84."),
        ("am", ("MW default stepsize",), "Tamanho padrão da etapa AM", "", "10 kHz", "É a grade de ondas médias das Américas, de 520 a 1720 kHz."),
        ("regiao", ("Region",), "Região", "", "Europa", "O RDS brasileiro segue o modelo europeu, com PI distribuído pela Anatel."),
        ("af", ("Use AF",), "Usar AF", "", "Desligado", "Em DX e buscas, evita que o rádio pule sozinho para outra frequência."),
        ("ntp", ("Set NTP time offset",), "Definir deslocamento de tempo NTP", "", "GMT −3", "Horário de Brasília."),
        ("dst", ("Auto DST on NTP time",), "DST automático no horário NTP", "", "Desligado",
         "O Brasil não tem horário de verão desde o Decreto nº 9.772, de 2019."),
    ],
}


def _key(fw, it):
    return (it.get("en") or it["nome"]) if fw == "oficial" else it["nome"]


def build_checklist(menus, inline):
    out = {}
    for fw, rows in CHECKLIST.items():
        found = {}
        for g in menus[fw]["grupos"]:
            for it in g["itens"]:
                found.setdefault(_key(fw, it), (g, it))
        lst = []
        for cid, keys, name, where, value, why in rows:
            hits = [found[k] for k in keys if k in found]
            if len(hits) != len(keys):
                raise SystemExit(f"checklist {fw}/{cid}: opção não encontrada em {keys}")
            g, first = hits[0]
            onde = where or (g["titulo"] + (f" → {first['sub']}" if first.get("sub") else ""))
            entry = {"id": cid, "nome": name, "onde": onde, "valor": value, "porque": inline(why), "item": first["id"]}
            for _, it in hits:
                it["motivo"] = entry["porque"]
            lst.append(entry)
        out[fw] = lst
    return out


def cap(h):
    """Primeira letra do texto em maiúscula, pulando as tags."""
    return re.sub(r"^((?:<[^>]+>)*)([a-zà-ú])", lambda m: m.group(1) + m.group(2).upper(), h, count=1)


def parse_official_menu(md, inline):
    sec = md.split(T["menu_full"], 1)[1].split("\n## ", 1)[0]
    intro, *blocks = re.split(r"\n### ", sec)
    groups = []
    for block in blocks:
        title, body = block.split("\n", 1)
        items = []
        for line in body.splitlines():
            s = line.strip()
            if s.startswith("|") and not s.startswith("| ---") and not s.startswith(T["opt_header"]):
                name, vals, desc = [c.strip() for c in s.strip("|").split("|")]
                mm = re.match(r"^(.*?) \(([^)]*)\)$", name)
                pt, en = (mm.group(1), mm.group(2)) if mm else (name, "")
                fora = desc.startswith(T["not_wiki"])
                if fora:
                    desc = desc[len(T["not_wiki"]):].strip()
                items.append({"nome": pt, "en": en, "html": cap(inline(desc)) if desc else "", "fora": fora})
            elif s.startswith("- "):
                mm = re.match(r"- \*\*(.+?):\*\*\s*(.*)", s)
                if mm:
                    items.append({"nome": mm.group(1), "en": "", "html": cap(inline(mm.group(2))), "fora": False})
        groups.append({"titulo": title.strip(), "itens": items})
    return groups


def parse_mod17_menu(md, inline):
    groups = []
    for block in re.split(r"\n## ", md)[1:]:
        title, body = block.split("\n", 1)
        if title.strip() == T["sources_h"]:
            continue
        items = []
        for line in body.splitlines():
            mm = re.match(r"- \*\*(.+?)\*\*\s*(.*)", line.strip())
            if mm:
                items.append({"nome": mm.group(1).rstrip(":").strip(), "en": "",
                              "html": cap(inline(mm.group(2).lstrip(": ").strip())), "fora": False})
        groups.append({"titulo": title.strip(), "itens": items})
    return groups


def _guide_index(groups):
    idx = {}
    for g in groups:
        for it in g["itens"]:
            for k in (it["en"], it["nome"]):
                if k:
                    idx.setdefault(norm(k), it)
    return idx


def fmtn(v):
    """107.9 → 107,9; −15 com o sinal de menos tipográfico."""
    s = ("%g" % abs(v)).replace(".", T["decimal"])
    return ("−" if v < 0 else "") + s


def _num(s):
    mm = re.search(r"[−-]?\d+(?:[.,]\d+)?", s or "")
    return float(mm.group(0).replace("−", "-").replace(",", ".")) if mm else None


OFF = set(T["off_words"])
TIPO = T["tipo"]


def _spec(fw, raw, padrao, br):
    s = {k: v for k, v in raw.items() if not (v is None or v is False or v == "")}
    t = s["tipo"]
    s["tl"] = T["tipo_short"]["lista"] if t == "lista" and "opcoes" not in s else TIPO[t]
    if t == "faixa":
        un = s.get("unidade", "")
        s["minf"], s["maxf"] = fmtn(s["min"]), fmtn(s["max"])
        if s.get("passo"):
            p = fmtn(s["passo"])
            s["passof"] = T["step_fmt"].format(p=p) + ("%" if un == "%" else f" {un}" if un else "")
        s["offlbl"] = T["off_label"][fw]

        def pos(v):
            if not v:
                return None
            n = _num(v)
            if n is None or not s["min"] <= n <= s["max"]:
                return None
            return round((n - s["min"]) / (s["max"] - s["min"]) * 100, 1)
        if norm(padrao) in OFF:
            s["pd_off"] = True
        elif pos(padrao) is not None:
            s["pd"] = pos(padrao)
        if norm(br) in OFF:
            s["pb_off"] = True
        elif pos(br) is not None:
            s["pb"] = pos(br)
        rng = T["range_fmt"].format(a=s["minf"], b=s["maxf"]) + (f" {un}" if un else "")
        s["rsum"] = rng
        s["valores"] = (s["offlbl"] + T["or"] if s.get("off") else "") + rng
    elif "opcoes" in s:
        s["rsum"] = TIPO["liga"] if t == "liga" else T["n_opts"].format(n=len(s["opcoes"]))
        s["valores"] = ", ".join(s["opcoes"])
    else:
        s["rsum"] = T["tipo_short"][t]
        s["valores"] = s.get("resumo", "")
    return s


def build_menus(oficial_md, menus_md, inline):
    guides = {"oficial": _guide_index(parse_official_menu(oficial_md, inline)),
              "mod17": _guide_index(parse_mod17_menu(menus_md, inline))}
    res = {}
    for fw, spec in (("oficial", MS.OFICIAL), ("mod17", MS.MOD17)):
        used, groups = set(), []
        for entry in spec:
            titulo, notas, itens = entry[:3]
            tid = entry[3] if len(entry) > 3 else titulo
            g = {"titulo": titulo, "id": f"ajustes--{fw}-{slug(tid)}", "notas": [inline(n) for n in notas], "itens": []}
            for raw in itens:
                idnome = raw.get("idnome") or raw["nome"]
                base = f"ajustes--{fw}-{slug(idnome)}"
                iid, k = base, 2
                while iid in used:
                    iid, k = f"{base}-{k}", k + 1
                used.add(iid)
                guide = guides[fw].get(norm(raw["guia"]))
                html = cap(inline(raw["desc"])) if raw["desc"] else (guide["html"] if guide else "")
                d = DD.lookup(fw, idnome, tid)
                if d is None:
                    raise SystemExit(f"sem explicação didática: {fw} / {tid} / {idnome}")
                did = {}
                html = cap(inline(d["faz"]))
                if d["util"]:
                    did["util"] = cap(inline(d["util"]))
                if d["quando"]:
                    did["quando"] = [[inline(a), inline(b)] for a, b in d["quando"]]
                if d["obs"]:
                    did["obs"] = inline(d["obs"])
                s = _spec(fw, raw["spec"], raw["padrao"], raw["br"])
                fontes = "; ".join(MS.FONTES[c] for c in raw["fontes"].split()) if raw["fontes"] else ""
                it = {"id": iid, "nome": raw["nome"], "en": raw["en"], "sub": raw["sub"], "html": html,
                      "fora": bool(guide and guide["fora"]), "padrao": raw["padrao"], "br": raw["br"],
                      "adv": raw["adv"], "fontes": fontes, "spec": s, "valores": s.pop("valores"),
                      "did": did, "tag": d["tag"] or ""}
                g["itens"].append({k: v for k, v in it.items() if v not in ("", False)})
            groups.append(g)
        res[fw] = {"grupos": groups}
    res["tags"] = DD.TAGS
    res["glossario"] = [[t, inline(x)] for t, x in DD.GLOSSARIO]
    return res


# ---------------------------------------------------------------- problemas
def build_problems(md, inline, diagram_html):
    blocks = re.split(r"\n## ", md)[1:]
    cats = []
    for block in blocks:
        title, body = block.split("\n", 1)
        title = title.strip()
        if title == T["sources_h"]:
            continue
        cid = slug(title)
        cat = {"id": f"ajuda--{cid}", "titulo": title, "ref": "problemas--" + _heading_id(title),
               "intro": [], "itens": [], "passos": [], "depois": []}
        for raw in body.split("\n"):
            s = raw.strip()
            if not s:
                continue
            m_item = re.match(r"- \*\*(.+?):\*\*\s*(.*)", s)
            m_step = re.match(r"\d+\. (.*)", s)
            if s.startswith("<!--DIAGRAM:"):
                cat["intro"].append(diagram_html(re.search(r"DIAGRAM:(\w+)", s).group(1)))
            elif m_item:
                t = m_item.group(1)
                tag = "oficial" if T["official_marker"] in t.lower() else ""
                cat["itens"].append({"id": f"ajuda--{cid}-{slug(t)}", "titulo": t, "html": inline(m_item.group(2)), "tag": tag,
                                     "busca": norm(t + " " + m_item.group(2))})
            elif m_step:
                cat["passos"].append(inline(m_step.group(1)))
            elif s.startswith(T["steps_line"]):
                continue
            elif cat["passos"]:
                cat["depois"].append(inline(s))
            else:
                cat["intro"].append(f"<p>{inline(s)}</p>")
        cats.append(cat)
    return cats


def _heading_id(title):
    """Mesmo id que o markdown (slugify_unicode) dá ao título em problemas.md."""
    from markdown.extensions.toc import slugify_unicode
    return slugify_unicode(title, "-")


# ---------------------------------------------------------------- placa em 3D
COMP = {c["pn"]: c for c in data.COMPONENTS}

BUSES = {
    "som": ("Caminho do som", "Da antena ao sintonizador TEF6686, que entrega áudio analógico aos dois amplificadores: o do alto-falante e o do fone. O conector do fone desliga o alto-falante quando o plugue entra. O volume é analógico."),
    "i2c": ("I²C", "Dois fios, nos GPIO 21 e 22, ligam o ESP32 ao sintonizador (0x64), ao expansor do teclado (0x20) e ao relógio (0x32)."),
    "spi": ("SPI", "Tela e toque dividem o barramento SPI: clock no GPIO 18, dados para a tela no 23 e dados do toque no 19. A seleção usa o GPIO 5 (tela) e o 32 (toque)."),
    "usb": ("USB e serial", "A porta USB-C chega ao CH340N, que converte para a serial do ESP32 (GPIO 1 e 3). É por ela que se grava o firmware e se conversa com o rádio."),
    "energia": ("Energia", "A USB-C alimenta o carregador TP4056, que carrega a bateria. Depois da chave geral, três reguladores de 3,3 V alimentam o resto."),
    "gpio": ("Botões e teclado", "Encoder (GPIO 34, 36 e 39), BAND, BW e MODE (GPIO 4, 25 e 26) e squelch (GPIO 35) vão direto ao ESP32. O teclado numérico passa pelo XL9555, que avisa pelo GPIO 14."),
}

# x para a direita, z para a frente; tamanhos simbólicos, fora de escala e fora da posição real
BLOCKS = [
    {"id": "antena", "tipo": "antena", "rotulo": "Antena", "pos": [-64, -30], "tam": [4, 4],
     "titulo": "Antena (conector SMA)", "texto": "Antena externa no conector SMA, ligada à placa por um cabo IPEX. Não há antena de ferrite interna, por isso o AM depende de fio externo ou loop."},
    {"id": "tef", "tipo": "chip", "rotulo": "TEF6686", "pos": [-38, -30], "tam": [10, 10], "pn": "TEF6686HN/V102"},
    {"id": "tpa", "tipo": "chip", "rotulo": "TPA6211A1", "pos": [-12, -36], "tam": [6, 6], "pn": "TPA6211A1"},
    {"id": "falante", "tipo": "falante", "rotulo": "Alto-falante", "pos": [12, -36], "tam": [14, 14],
     "titulo": "Alto-falante", "texto": "Alto-falante de 4 Ω. O amplificador TPA6211A1 o aciona com até 3 W."},
    {"id": "max", "tipo": "chip", "rotulo": "MAX97220", "pos": [-12, -22], "tam": [6, 6], "pn": "MAX97220"},
    {"id": "fone", "tipo": "fone", "rotulo": "Fone", "pos": [12, -22], "tam": [6, 8], "pn": "PJ-3270"},
    {"id": "esp32", "tipo": "modulo", "rotulo": "ESP32", "pos": [-38, 4], "tam": [18, 19.2], "pn": "ESP32-WROOM-32U",
     "extra": "Os pinos do módulo, um a um, estão na visão 3D do Laboratório.", "link": ["Ver os pinos do ESP32", "#laboratorio--trocar-o-esp32-por-um-modelo-mais-novo"]},
    {"id": "controles", "tipo": "controles", "rotulo": "Controles", "pos": [-66, 4], "tam": [16, 10],
     "titulo": "Encoder, botões e squelch", "texto": "Encoder, BAND, BW, MODE e o potenciômetro do squelch, ligados direto ao ESP32. O volume também é um potenciômetro, mas fica no caminho do áudio.", "link": ["Ver os controles em 3D", "#botoes"]},
    {"id": "tela", "tipo": "tela", "rotulo": "Tela", "pos": [2, 2], "tam": [24, 18], "pn": "LCD28IPS"},
    {"id": "xpt", "tipo": "chip", "rotulo": "XPT2046", "pos": [2, 28], "tam": [5, 5], "pn": "XPT2046"},
    {"id": "xl", "tipo": "chip", "rotulo": "XL9555", "pos": [-38, 28], "tam": [6, 6], "pn": "XL9555"},
    {"id": "teclado", "tipo": "teclado", "rotulo": "Teclado", "pos": [-66, 28], "tam": [12, 12],
     "titulo": "Teclado numérico", "texto": "Teclas de 0 a 9, Enter e DX, lidas pelo expansor XL9555. Na linha Megatron, digitam frequências e memórias."},
    {"id": "rtc", "tipo": "chip", "rotulo": "RTC", "pos": [-18, 28], "tam": [4, 4], "pn": "RS4C8010", "rtc": True},
    {"id": "ch340", "tipo": "chip", "rotulo": "CH340N", "pos": [34, 2], "tam": [5, 4], "pn": "CH340N"},
    {"id": "usbc", "tipo": "usb", "rotulo": "USB-C", "pos": [60, 2], "tam": [9, 4],
     "titulo": "Porta USB-C", "texto": "Carrega a bateria e, pelo CH340N, liga o computador à serial do ESP32 para gravar o firmware. Use carregador de 5 V e 1 A ou mais, sem carga rápida."},
    {"id": "tp4056", "tipo": "chip", "rotulo": "TP4056", "pos": [60, 18], "tam": [5, 4], "pn": "TP4056"},
    {"id": "bateria", "tipo": "bateria", "rotulo": "Bateria", "pos": [60, 34], "tam": [26, 12],
     "titulo": "Bateria de lítio", "texto": "Bateria de 5000 mAh, carregada pelo TP4056. A DEEPELEC cita cerca de 15 horas de uso."},
    {"id": "chave", "tipo": "chave", "rotulo": "Chave geral", "pos": [34, 34], "tam": [6, 4],
     "titulo": "Chave geral", "texto": "Em OFF, desconecta a bateria. Use para guardar o rádio e para cortar a energia de verdade quando ele travar."},
    {"id": "rt9193", "tipo": "chip", "rotulo": "RT9193 ×3", "pos": [34, 18], "tam": [4, 3], "pn": "RT9193-33 ×3",
     "extra": "Os três reguladores alimentam o resto da placa com 3,3 V."},
]

# ligações: origem, destino, barramento e o traçado completo (x, z), de borda a borda
LINKS = [
    ["antena", "tef", "som", [[-62, -30], [-43, -30]]],
    ["tef", "tpa", "som", [[-33, -32], [-24, -32], [-24, -36], [-15, -36]]],
    ["tef", "max", "som", [[-33, -28], [-24, -28], [-24, -22], [-15, -22]]],
    ["tpa", "falante", "som", [[-9, -36], [5, -36]]],
    ["max", "fone", "som", [[-9, -22], [9, -22]]],
    ["tef", "esp32", "i2c", [[-38, -25], [-38, -5.6]]],
    ["esp32", "xl", "i2c", [[-38, 13.6], [-38, 25]]],
    ["esp32", "rtc", "i2c", [[-32, 13.6], [-32, 20], [-18, 20], [-18, 26]]],
    ["esp32", "tela", "spi", [[-29, 0], [-10, 0]]],
    ["esp32", "xpt", "spi", [[-29, 8], [-24, 8], [-24, 16], [2, 16], [2, 25.5]]],
    ["tela", "xpt", "spi", [[10, 11], [10, 28], [4.5, 28]]],
    ["controles", "esp32", "gpio", [[-58, 4], [-47, 4]]],
    ["teclado", "xl", "gpio", [[-60, 28], [-41, 28]]],
    ["xl", "esp32", "gpio", [[-35, 25], [-35, 13.6]]],
    ["usbc", "ch340", "usb", [[55.5, 2], [36.5, 2]]],
    ["ch340", "esp32", "usb", [[34, 0], [34, -11], [-33, -11], [-33, -5.6]]],
    ["usbc", "tp4056", "energia", [[60, 4], [60, 16]]],
    ["tp4056", "bateria", "energia", [[60, 20], [60, 28]]],
    ["bateria", "chave", "energia", [[47, 34], [37, 34]]],
    ["chave", "rt9193", "energia", [[34, 32], [34, 19.5]]],
]


def build_board(inline):
    blocks = []
    for b in BLOCKS:
        b = dict(b)
        c = COMP.get(b.get("pn"))
        if c:
            b.setdefault("titulo", f"{c['pn']} · {c['maker']}")
            b.setdefault("texto", c["role"] + ".")
            b["ref"] = c["ref"]
            b["bus"] = c["bus"]
            b["status"] = c["status"]
            b["links"] = c["links"][:3]
        if b.get("texto"):
            b["texto"] = inline(b["texto"])
        if b.get("extra"):
            b["extra"] = inline(b["extra"])
        blocks.append(b)
    buses = {k: {"nome": v[0], "texto": inline(v[1])} for k, v in BUSES.items()}
    return {"blocos": blocks, "ligacoes": LINKS, "barramentos": buses}


# ---------------------------------------------------------------- índice de busca
def search_entries(menus, problems):
    out = []
    for fw, label in (("oficial", T["search_official"]), ("mod17", T["search_mod17"])):
        for g in menus[fw]["grupos"]:
            for it in g["itens"]:
                name = it["nome"] + (f" ({it['en']})" if it.get("en") else "")
                text = re.sub(r"<[^>]+>", "", it.get("html", ""))
                out.append({"r": "ajustes", "p": label, "h": name, "id": it["id"], "t": f"{it.get('valores', '')} {text}".strip()})
    for c in problems:
        for it in c["itens"]:
            out.append({"r": "ajuda", "p": T["search_help"], "h": it["titulo"], "id": it["id"],
                        "t": re.sub(r"<[^>]+>", "", it["html"])})
    return out


# ---------------------------------------------------------------- painel em 3D: controles sem firmware
# Os botões que o firmware lê (BAND, BW, MODE, TUNING, POWER, BOOT) vêm de BUTTONS.
PAINEL = {
    "volume": {"titulo": "VOLUME", "texto": "Potenciômetro de volume analógico, no caminho do áudio. Deixe o volume interno do firmware em 0 dB (Set volume no Mod17, Definir volume na linha oficial) e ajuste por aqui."},
    "sql": {"titulo": "SQL (squelch)", "texto": "Potenciômetro do nível do squelch, lido pelo ESP32 no GPIO 35. Só age com Use squelch (Mod17) ou Usar squelch (linha oficial) ligado. Para caçar emissoras fracas, deixe o squelch desligado. Se o nível oscilar, o potenciômetro pode ter mau contato: veja [Problemas comuns](problemas.md)."},
    "chave": {"titulo": "Chave geral", "texto": "Em OFF, desconecta a bateria. Use para guardar o rádio e para cortar a energia de verdade quando ele travar. Sem relógio interno (RTC), a hora se perde quando ela vai para OFF."},
    "fone": {"titulo": "Fone (3,5 mm)", "texto": "Conector de fone PJ-3270. Quando o plugue entra, um contato interno desliga o alto-falante. Em alguns lotes, esse contato falha e o alto-falante fica mudo depois de usar o fone: se o fone funciona e o alto-falante não, a causa provável é essa."},
    "falante": {"titulo": "Alto-falante", "texto": "Alto-falante de 4 Ω, acionado pelo amplificador TPA6211A1 com até 3 W. Fica mudo enquanto há um fone ligado."},
    "usbc": {"titulo": "USB-C", "texto": "Carrega a bateria e, pelo CH340N, liga o computador ao rádio para gravar o firmware. Use carregador de 5 V e 1 A ou mais, no máximo 5 W, sem carga rápida, de preferência com o rádio desligado. O LED fica vermelho carregando e verde quando termina."},
    "antena": {"titulo": "Antena (SMA)", "texto": "Conector SMA para a antena externa, ligado à placa por um cabo IPEX. Não há antena de ferrite interna: para AM, use fio externo ou loop. Se o sinal e o áudio somem de repente, o cabo interno pode ter se soltado do SMA."},
    "tela": {"titulo": "Tela de toque", "texto": {
        "mod17": "Tela de toque de 2,8 polegadas. Na área de sinal, a metade esquerda abre os atalhos e a direita, o menu. Tocar na frequência, na barra de passo ou no rótulo da faixa abre o teclado na tela. Se o toque desalinhar, refaça a calibração em Operation settings → Touch calibration.",
        "oficial": "Tela de toque de 2,8 polegadas. Na linha oficial, iMS e EQ alternam com um toque. Para calibrar o toque, ligue o rádio segurando BW + MODE ou use Definições do ecrã."}},
    "teclado": {"titulo": "Teclado numérico", "texto": {
        "mod17": "De 0 a 9, digitam a frequência, que fica verde enquanto você digita. Enter confirma. DX alterna entre digitar frequência e gravar memória; segurado, inicia o DX scan na tela principal. Fora da digitação, o 0 liga e desliga o mudo.",
        "oficial": "O código oficial lê o teclado pelo expansor XL9555, mas o guia ainda não descreve as teclas nessa linha."}},
    "power": {"titulo": "POWER", "texto": {
        "oficial": "O guia ainda não descreve o POWER na linha oficial. No Megatron, o toque curto liga e desliga o rádio."}},
}


def build_panel(inline):
    out = {}
    for k, v in PAINEL.items():
        t = v["texto"]
        out[k] = {"titulo": v["titulo"], "texto": {fw: inline(x) for fw, x in t.items()} if isinstance(t, dict) else inline(t)}
    return out


# ---------------------------------------------------------------- idioma
_PT = {"BUTTONS": BUTTONS, "CHECKLIST": CHECKLIST, "BUSES": BUSES, "BLOCKS": BLOCKS, "PAINEL": PAINEL, "CHAVE": CHAVE}


def set_lang(lang, data_mod=None):
    """Troca os textos e os dados das ferramentas. Os ids continuam os do português, iguais nos dois idiomas."""
    global LANG, T, OFF, TIPO, MS, DD, COMP
    global BUTTONS, CHECKLIST, BUSES, BLOCKS, PAINEL, CHAVE
    LANG, T = lang, i18n.UI[lang]
    OFF, TIPO = set(T["off_words"]), T["tipo"]
    content = _PT
    import menuspec
    import didatica
    MS, DD = menuspec, didatica
    if lang == "en":
        import didatica_en
        import menuspec_en
        cat = i18n.catalog("appdata_en")
        content = {k: i18n.deep_tr(v, cat) for k, v in _PT.items()}
        MS, DD = menuspec_en.spec(), didatica_en
    BUTTONS, CHECKLIST, BUSES, BLOCKS = content["BUTTONS"], content["CHECKLIST"], content["BUSES"], content["BLOCKS"]
    PAINEL, CHAVE = content["PAINEL"], content["CHAVE"]
    COMP = {c["pn"]: c for c in (data_mod or data).COMPONENTS}
