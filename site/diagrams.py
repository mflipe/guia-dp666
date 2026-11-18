"""Diagramas próprios do guia, em SVG, coloridos pelas variáveis de tema da página."""
from html import escape


def _box(x, y, w, h, title, sub="", key=False, sub2=""):
    cls = "d-key" if key else "d-box"
    cx = x + w / 2
    out = [f'<rect class="{cls}" x="{x}" y="{y}" width="{w}" height="{h}" rx="8"/>']
    if sub2:
        ty = y + h / 2 - 10
    elif sub:
        ty = y + h / 2 - 3
    else:
        ty = y + h / 2 + 5
    out.append(f'<text class="d-title" x="{cx}" y="{ty}" text-anchor="middle">{escape(title)}</text>')
    if sub:
        out.append(f'<text class="d-sub" x="{cx}" y="{ty + 17}" text-anchor="middle">{escape(sub)}</text>')
    if sub2:
        out.append(f'<text class="d-sub" x="{cx}" y="{ty + 33}" text-anchor="middle">{escape(sub2)}</text>')
    return "".join(out)


def _line(x1, y1, x2, y2, cls="d-line", arrow=False):
    m = ' marker-end="url(#d-arrow)"' if arrow else ""
    return f'<line class="{cls}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}"{m}/>'


def _path(d, cls="d-line", arrow=False):
    m = ' marker-end="url(#d-arrow)"' if arrow else ""
    return f'<path class="{cls}" d="{d}" fill="none"{m}/>'


def _text(x, y, s, cls="d-lbl", anchor="middle"):
    return f'<text class="{cls}" x="{x}" y="{y}" text-anchor="{anchor}">{escape(s)}</text>'


DEFS = ('<defs><marker id="d-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" '
        'orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="d-arrowhead"/></marker></defs>')


def _svg(w, h, title, desc, body, cls="diagram"):
    tid = title[0]
    body = body.replace("url(#d-arrow)", f"url(#{tid}-arrow)")
    defs = DEFS.replace('id="d-arrow"', f'id="{tid}-arrow"')
    return (f'<svg class="{cls}" viewBox="0 0 {w} {h}" role="img" aria-labelledby="{title[0]} {title[0]}-d">'
            f'<title id="{title[0]}">{escape(title[1])}</title><desc id="{title[0]}-d">{escape(desc)}</desc>'
            f'{defs}{body}</svg>')


def figure(svg, caption, wide=True):
    return (f'<figure class="figure{" figure-scroll" if wide else ""}"><div class="figure-body">{svg}</div>'
            f'<figcaption>{caption}</figcaption></figure>')


def arquitetura():
    b = []
    # processador
    b.append('<rect class="d-key" x="380" y="60" width="200" height="300" rx="10"/>')
    b.append(_text(480, 92, "ESP32-WROOM-32U", "d-title"))
    b.append(_text(480, 110, "U8 · 4 MB · Wi-Fi e Bluetooth", "d-sub"))
    b.append(_text(396, 158, "ENTRADAS", "d-cap", "start"))
    for i, s in enumerate(["Encoder: GPIO 34 · 36 · 39", "BAND 4 · BW 25 · MODE 26", "Squelch (pot.): GPIO 35", "Bateria (ADC2): GPIO 13"]):
        b.append(_text(396, 182 + i * 24, s, "d-mono", "start"))
    b.append(_text(396, 300, "BARRAMENTOS", "d-cap", "start"))
    b.append(_text(396, 324, "I²C · SPI · UART", "d-mono", "start"))
    # rádio
    b.append(_box(120, 40, 170, 56, "Antena", "SMA, ligada por IPEX"))
    b.append(_line(205, 96, 205, 168, arrow=True))
    b.append(_text(213, 138, "RF", "d-lbl", "start"))
    b.append(_box(120, 170, 170, 80, "TEF6686", "U7 · sintonizador DSP", key=True, sub2="rádio, RDS e áudio"))
    b.append(_line(290, 210, 380, 210, "d-acc"))
    b.append(_text(335, 202, "I²C 0x64", "d-lbl"))
    # periféricos do processador
    right = [
        ("Tela IPS 2,8\"", "320×240 · ILI9341 (provável)", "SPI"),
        ("XPT2046 · U3", "toque resistivo", "SPI · IRQ 33"),
        ("XL9555 · U12", "teclado físico", "I²C 0x20 · INT 14"),
        ("RTC · U11", "RS4C8010 (RX8010SJ)", "I²C 0x32"),
        ("CH340N · U10", "ponte USB-serial", "UART"),
    ]
    for i, (t, s, bus) in enumerate(right):
        y = 60 + i * 64
        cy = y + 26
        b.append(_box(700, y, 180, 52, t, s))
        b.append(_line(580, cy, 700, cy, "d-acc" if "I²C" in bus else "d-line"))
        b.append(_text(640, cy - 7, bus, "d-lbl"))
    b.append(_line(880, 342, 906, 342, arrow=True))
    b.append(_text(911, 346, "USB-C", "d-sub", "start"))
    # áudio
    b.append(_path("M205,250 V290 M120,290 H295 M120,290 V318 M295,290 V318", arrow=False))
    b.append(_line(120, 300, 120, 319, arrow=True))
    b.append(_line(295, 300, 295, 319, arrow=True))
    b.append(_text(207, 310, "áudio analógico", "d-lbl"))
    b.append(_box(40, 320, 160, 52, "TPA6211A1 · U2", "amplificador"))
    b.append(_box(220, 320, 150, 52, "MAX97220 · U4", "amplificador de fone"))
    b.append(_line(120, 372, 120, 408, arrow=True))
    b.append(_line(295, 372, 295, 408, arrow=True))
    b.append(_box(40, 410, 160, 48, "Alto-falante", "4 Ω · 3 W"))
    b.append(_box(220, 410, 150, 48, "Fone P2", "PJ-3270"))
    b.append(_line(220, 434, 202, 434, "d-dash", arrow=True))
    b.append(_text(205, 478, "a chave do P2 desliga o alto-falante", "d-lbl"))
    # energia
    b.append(_text(40, 500, "ENERGIA", "d-cap", "start"))
    power = [(40, 120, "USB-C", "5 V"), (190, 150, "TP4056 · U20", "carregador"),
             (370, 160, "Bateria", "3,7 V · 5000 mAh"), (560, 130, "Q1 · SI2305", "chave geral e POWER"),
             (720, 170, "RT9193-33 ×3", "U5 · U6 · U32 → 3,3 V")]
    for i, (x, w, t, s) in enumerate(power):
        b.append(_box(x, 510, w, 52, t, s))
        if i:
            px = power[i - 1][0] + power[i - 1][1]
            b.append(_line(px, 536, x - 2, 536, arrow=True))
    svg = _svg(960, 580, ("fig-arq", "Arquitetura do DP-666"),
               "Diagrama de blocos: antena, sintonizador TEF6686, processador ESP32, tela, toque, teclado, RTC, ponte USB, amplificadores de áudio e alimentação.",
               "".join(b))
    return figure(svg, "Arquitetura do DP-666, conforme os esquemas V2.5.3 e V2.5.4 da DEEPELEC e o código oficial. Os códigos U são as referências do esquema.")


def flash():
    b = []
    x0, x1, y, h = 40, 920, 56, 38
    kb = (x1 - x0) / 4096

    def X(addr_kb):
        return x0 + addr_kb * kb

    b.append(_text(x0, 34, "FLASH DE 4 MB", "d-cap", "start"))
    b.append(f'<rect class="d-box" x="{X(0):.1f}" y="{y}" width="{X(64) - X(0):.1f}" height="{h}"/>')
    b.append(f'<rect class="d-key" x="{X(64):.1f}" y="{y}" width="{X(3136) - X(64):.1f}" height="{h}"/>')
    b.append(f'<rect class="d-box2" x="{X(3136):.1f}" y="{y}" width="{X(4032) - X(3136):.1f}" height="{h}"/>')
    b.append(f'<rect class="d-box" x="{X(4032):.1f}" y="{y}" width="{X(4096) - X(4032):.1f}" height="{h}"/>')
    b.append(_text((X(64) + X(3136)) / 2, y + 24, "app0 · firmware · 3072 KB", "d-title"))
    b.append(_text((X(3136) + X(4032)) / 2, y + 24, "spiffs · 896 KB", "d-title"))
    for a, lbl in [(0, "0x000000"), (64, "0x010000"), (3136, "0x310000"), (4096, "0x400000")]:
        b.append(_line(X(a), y + h, X(a), y + h + 6))
        b.append(_text(X(a), y + h + 20, lbl, "d-mono", "start" if a == 0 else ("end" if a == 4096 else "middle")))
    b.append(_line(X(4064), y, X(4064), y - 14))
    b.append(_text(X(4096), y - 18, "coredump · 64 KB", "d-lbl", "end"))
    # zoom dos primeiros 64 KB
    zx0, zx1, zy, zh = 40, 520, 150, 32
    zk = (zx1 - zx0) / 64
    b.append(_path(f"M{X(0):.1f},{y + h} L{zx0},{zy} M{X(64):.1f},{y + h} L{zx1},{zy}", "d-guide"))
    segs = [(0, 4, "", "d-box"), (4, 32, "bootloader", "d-box2"), (32, 36, "", "d-acc-fill"),
            (36, 56, "nvs · 20 KB", "d-key"), (56, 64, "", "d-box2")]
    for a, z, lbl, cls in segs:
        b.append(f'<rect class="{cls}" x="{zx0 + a * zk:.1f}" y="{zy}" width="{(z - a) * zk:.1f}" height="{zh}"/>')
        if lbl:
            b.append(_text(zx0 + (a + z) / 2 * zk, zy + 21, lbl, "d-sub"))
    b.append(_text(zx0 + 34 * zk, zy + zh + 18, "tabela de partições", "d-lbl"))
    b.append(_text(zx0 + 60 * zk, zy - 8, "otadata", "d-lbl"))
    b.append(_text(zx1 + 16, zy + 14, "primeiros 64 KB ampliados:", "d-sub", "start"))
    b.append(_text(zx1 + 16, zy + 32, "a nvs guarda configurações e memórias", "d-sub", "start"))
    svg = _svg(960, 214, ("fig-flash", "Mapa do flash"),
               "Flash de 4 MB: bootloader, tabela de partições, nvs, otadata, firmware de 3072 KB, área de arquivos de 896 KB e coredump.",
               "".join(b))
    return figure(svg, "Mapa do flash de 4 MB, igual nos pacotes analisados do Mod17 e da v2.20. A nvs guarda configurações e memórias; a spiffs, logos, esquemas, planos, nomes e My settings.")


def fm_dial():
    lo, hi, w, x0 = 76.0, 108.0, 960, 30
    span = w - 2 * x0

    def x(mhz):
        return x0 + (mhz - lo) / (hi - lo) * span

    b = [f'<rect class="d-box" x="{x0 - 10}" y="22" width="{span + 20}" height="46" rx="8"/>',
         f'<rect class="d-band-efm" x="{x(76.1):.1f}" y="30" width="{x(87.3) - x(76.1):.1f}" height="8" rx="2"/>',
         f'<rect class="d-band-rc" x="{x(87.4):.1f}" y="30" width="{x(88.0) - x(87.4):.1f}" height="8" rx="2"/>',
         f'<rect class="d-band" x="{x(88.1):.1f}" y="30" width="{x(107.9) - x(88.1):.1f}" height="8" rx="2"/>']
    mhz = lo
    while mhz <= hi + 1e-9:
        major = abs(mhz - round(mhz / 4) * 4) < 1e-6
        b.append(f'<line class="d-tick{" major" if major else ""}" x1="{x(mhz):.1f}" y1="46" x2="{x(mhz):.1f}" y2="{64 if major else 56}"/>')
        if major:
            b.append(_text(x(mhz), 86, f"{int(mhz)}", "d-mono"))
        mhz += 1.0
    b.append(_text((x(76.1) + x(87.3)) / 2, 16, "eFM 76,1–87,3", "d-band-lbl"))
    b.append(_text((x(87.4) + x(88.0)) / 2, 16, "RadCom", "d-band-lbl"))
    b.append(_text((x(88.1) + x(107.9)) / 2, 16, "FM 88,1–107,9", "d-band-lbl"))
    b.append(_text(x0 + span, 104, "MHz", "d-lbl", "end"))
    svg = _svg(w, 110, ("fig-dial", "Faixas de FM no Brasil"),
               "FM estendido de 76,1 a 87,3 MHz, rádios comunitárias de 87,4 a 88,0 MHz e FM de 88,1 a 107,9 MHz, "
               "em canais de 200 kHz com decimal ímpar.",
               "".join(b))
    return figure(svg, "Faixas de FM no Brasil, segundo o Ato Anatel nº 8.104/2022 e a Resolução nº 721/2020. Os canais têm "
                       "200 kHz e terminam em decimal ímpar (.1, .3, .5, .7, .9). RadCom é a faixa das rádios comunitárias.", wide=False)


def boot():
    b = ['<rect class="d-screen" x="20" y="20" width="320" height="240" rx="6"/>',
         _text(180, 70, "FM/AM Receiver", "d-scr-title"),
         '<rect class="d-scr-logo" x="125" y="88" width="110" height="40" rx="4"/>',
         _text(180, 113, "logo", "d-scr-dim"),
         _text(180, 158, "Software Ver2.00.15-Mod17 by Megatron", "d-scr-text"),
         _text(180, 192, "Tuner: !None!", "d-scr-err"),
         '<rect class="d-mk1" x="140" y="250" width="16" height="6"/>',
         '<rect class="d-mk2" x="172" y="250" width="16" height="6"/>',
         '<rect class="d-mk3" x="204" y="250" width="16" height="6"/>']
    notes = [
        ((262, 188), (372, 70), "Tuner: !None!", "o firmware para aqui de propósito"),
        ((148, 250), (372, 134), "Marcador 1, amarelo", "tentou iniciar o sintonizador"),
        ((180, 250), (372, 188), "Marcador 2, vermelho", "o sintonizador não respondeu"),
        ((212, 250), (372, 242), "Marcador 3", "etapa do Wi-Fi, não alcançada"),
    ]
    for (px, py), (tx, ty), t, s in notes:
        b.append(_path(f"M{px},{py} L{px},{py - 6 if py > 240 else py} L{tx - 8},{ty - 5}", "d-guide"))
        b.append(f'<circle class="d-dot" cx="{px}" cy="{py if py <= 240 else py}" r="2.5"/>')
        b.append(_text(tx, ty - 6, t, "d-title", "start"))
        b.append(_text(tx, ty + 12, s, "d-sub", "start"))
    svg = _svg(700, 280, ("fig-boot", "Tela de abertura com Tuner: !None!"),
               "Esquema da tela de abertura: título, logo, versão do firmware, a mensagem Tuner: !None! em vermelho e três marcadores no rodapé.",
               "".join(b), cls="diagram diagram-boot")
    return figure(svg, "Esquema da tela de abertura com o erro, conforme o código-base (PE5PVB v2.00) e a tela do Mod17. O logo foi omitido.", wide=False)


def remoto():
    b = []
    b.append(_box(16, 60, 150, 76, "DP-666", "Mod17 ou linha oficial", key=True))
    b.append('<rect class="d-box" x="368" y="20" width="200" height="156" rx="10"/>')
    b.append(_text(468, 50, "Computador", "d-title"))
    for i, s in enumerate(["XDR-GTK", "fm-dx-webserver", "RDS Spy", "StationList"]):
        b.append(_text(468, 80 + i * 22, s, "d-mono"))
    b.append(_box(650, 60, 144, 76, "Navegador", "celular, tablet ou PC", key=True))
    links = [(76, "USB · XDR-GTK sem senha", "d-acc"), (98, "Wi-Fi · TCP 7373 com senha", "d-acc"),
             (120, "cabo de áudio → placa de som", "d-dash")]
    for y, lbl, cls in links:
        b.append(_line(166, y, 366, y, cls, arrow=True))
        b.append(_text(266, y - 6, lbl, "d-lbl"))
    b.append(_line(568, 98, 648, 98, "d-acc", arrow=True))
    b.append(_text(608, 90, "página web", "d-lbl"))
    b.append(_text(608, 118, "com áudio", "d-lbl"))
    desc = ("O rádio liga ao computador por USB ou Wi-Fi para controle e por cabo de áudio para o som; "
            "o fm-dx-webserver leva tudo ao navegador.")
    svg = _svg(810, 196, ("fig-remoto", "Controle remoto do DP-666"), desc, "".join(b), cls="diagram d-wide")
    return figure(svg + _remoto_estreito(desc), "Controle e som pelo computador. O Wi-Fi do rádio não transmite áudio: o som vai por cabo até a placa de som, e o fm-dx-webserver leva controle e áudio ao navegador.")


def _remoto_estreito(desc):
    """Versão em L do diagrama remoto, para telas de celular."""
    b = [_box(8, 40, 92, 100, "DP-666", "Mod17 ou", key=True, sub2="linha oficial")]
    b.append('<rect class="d-box" x="214" y="20" width="118" height="140" rx="10"/>')
    b.append(_text(273, 46, "Computador", "d-title"))
    for i, s in enumerate(["XDR-GTK", "fm-dx-webserver", "RDS Spy", "StationList"]):
        b.append(_text(273, 72 + i * 20, s, "d-mono"))
    for y, lbl, cls in [(62, "USB · sem senha", "d-acc"), (90, "Wi-Fi · TCP 7373", "d-acc"), (118, "cabo de áudio", "d-dash")]:
        b.append(_line(100, y, 212, y, cls, arrow=True))
        b.append(_text(156, y - 6, lbl, "d-lbl"))
    b.append(_line(273, 160, 273, 226, "d-acc", arrow=True))
    b.append(_text(262, 190, "página web", "d-lbl", anchor="end"))
    b.append(_text(262, 206, "com áudio", "d-lbl", anchor="end"))
    b.append(_box(214, 228, 118, 60, "Navegador", "celular, tablet, PC", key=True))
    return _svg(340, 300, ("fig-remoto-n", "Controle remoto do DP-666"), desc, "".join(b), cls="diagram d-narrow")


CARGAS = [("U5 · RT9193", "3,3 V para o processador"), ("U32 · RT9193", "3,3 V para a tela"),
          ("U6 · RT9193", "3,3 V para o sintonizador"), ("U2 · TPA6211A1", "alto-falante, sem regulador")]


def energia():
    b = ['<rect class="d-guide" x="146" y="30" width="350" height="180" rx="12" fill="none"/>',
         _text(146, 20, "SEMPRE LIGADOS À BATERIA", "d-cap", "start"),
         _text(746, 20, "DEPOIS DO TRANSISTOR", "d-cap", "start")]
    b.append(_box(16, 44, 104, 52, "USB-C", "5 V"))
    b.append(_line(120, 70, 154, 70, arrow=True))
    b.append(_box(156, 44, 150, 52, "TP4056 · U20", "carrega com ~0,9 A"))
    b.append(_line(306, 70, 334, 70, arrow=True))
    b.append(_box(336, 44, 150, 52, "Bateria", "3,7 V · 5000 mAh", key=True))
    b.append(_line(486, 70, 564, 70, "d-acc", arrow=True))
    b.append(_text(525, 62, "BATT", "d-lbl"))
    b.append(_box(566, 44, 140, 52, "Q1 · SI2305", "transistor da placa", key=True))
    # a bateria também alimenta o U1 e o relógio
    b.append(_line(411, 96, 411, 146, arrow=True))
    b.append(_path("M411,120 H231 V146", arrow=True))
    b.append(_box(156, 148, 150, 50, "RTC · U11", "quando existe"))
    b.append(_box(336, 148, 150, 50, "U1 · EC8D-01B", "controle do POWER"))
    b.append(_line(486, 173, 564, 173, arrow=True))
    b.append(_text(525, 165, "comando", "d-lbl"))
    b.append(_box(566, 148, 140, 50, "Chave geral", "SW5 · ON e OFF"))
    b.append(_line(636, 148, 636, 98, arrow=True))
    b.append(_box(336, 236, 150, 44, "POWER", "KEY1, na frente"))
    b.append(_line(411, 236, 411, 200, arrow=True))
    # cargas depois do transistor
    b.append(_path("M706,70 H724 M724,55 V235", "d-acc"))
    for i, (t, s) in enumerate(CARGAS):
        y = 32 + i * 60
        b.append(_box(746, y, 198, 46, t, s))
        b.append(_line(724, y + 23, 744, y + 23, "d-acc", arrow=True))
    desc = ("Diagrama de energia: USB-C, carregador TP4056, bateria, relógio, controlador U1 com o botão POWER, "
            "chave geral, transistor Q1 e, depois dele, três reguladores de 3,3 V e o amplificador do alto-falante.")
    svg = _svg(960, 290, ("fig-energia", "Caminho da energia do DP-666"), desc, "".join(b), cls="diagram d-wide")
    return figure(svg + _energia_estreito(desc), "Caminho da energia no esquema V2.5.3. A chave geral e o POWER não ficam no caminho da corrente: os dois comandam o transistor Q1, que alimenta a placa. O carregador, o relógio e o U1 ficam sempre ligados à bateria.")


def _energia_estreito(desc):
    """Versão em coluna do diagrama de energia, para telas de celular."""
    b = [_box(8, 12, 96, 46, "USB-C", "5 V"),
         _line(104, 35, 126, 35, arrow=True),
         _box(128, 12, 192, 46, "TP4056 · U20", "carrega com ~0,9 A"),
         _line(224, 58, 224, 80, arrow=True),
         _box(128, 82, 192, 46, "Bateria", "3,7 V · 5000 mAh", key=True),
         _line(128, 105, 106, 105, arrow=True),
         _box(8, 82, 96, 46, "RTC · U11", "quando existe"),
         _line(224, 128, 224, 150, arrow=True),
         _box(128, 152, 192, 46, "U1 · EC8D-01B", "controle do POWER"),
         _line(104, 175, 126, 175, arrow=True),
         _box(8, 152, 96, 46, "POWER", "KEY1"),
         _line(224, 198, 224, 220, arrow=True),
         _box(128, 222, 192, 46, "Chave geral", "SW5 · ON e OFF"),
         _line(224, 268, 224, 290, arrow=True),
         _box(128, 292, 192, 46, "Q1 · SI2305", "transistor da placa", key=True),
         _path("M320,105 H332 V315 H322", "d-acc", arrow=True),
         _text(326, 213, "BATT", "d-lbl", "end"),
         _path("M224,338 V356 H110 V567", "d-acc")]
    for i, (t, s) in enumerate(CARGAS):
        y = 370 + i * 58
        b.append(_box(124, y, 196, 46, t, s))
        b.append(_line(110, y + 23, 122, y + 23, "d-acc", arrow=True))
    return _svg(340, 600, ("fig-energia-n", "Caminho da energia do DP-666"), desc, "".join(b), cls="diagram d-narrow")


def audio():
    b = [_box(16, 92, 150, 56, "TEF6686 · U7", "conversor interno (DAC)"),
         _line(166, 120, 194, 120, "d-acc", arrow=True),
         _box(196, 92, 170, 56, "VOLUME · SW4", "potenciômetro duplo", key=True),
         _path("M366,120 H400 M400,58 V182", "d-acc"),
         _line(400, 58, 428, 58, "d-acc", arrow=True),
         _line(400, 182, 428, 182, "d-acc", arrow=True),
         _box(430, 30, 180, 56, "MAX97220 · U4", "fone, estéreo, 3,3 V"),
         _box(430, 154, 180, 56, "TPA6211A1 · U2", "soma L e R, na bateria"),
         _line(610, 58, 648, 58, "d-acc", arrow=True),
         _line(610, 182, 648, 182, "d-acc", arrow=True),
         _box(650, 30, 170, 56, "Fone P2", "conector PJ-3270"),
         _box(650, 154, 170, 56, "Alto-falante", "4 Ω · mono"),
         # o contato do conector liga um amplificador e desliga o outro
         _path("M735,86 V120 H520", "d-dash"),
         _line(520, 120, 520, 88, "d-dash", arrow=True),
         _line(520, 120, 520, 152, "d-dash", arrow=True),
         _text(628, 112, "contato 6–2 do conector", "d-lbl"),
         _text(628, 138, "plugue: liga U4, desliga U2", "d-lbl")]
    desc = ("Diagrama de áudio: o TEF6686 entrega som analógico ao potenciômetro de volume, que alimenta o amplificador "
            "do fone (MAX97220) e o do alto-falante (TPA6211A1); um contato do conector de fone liga um e desliga o outro.")
    svg = _svg(840, 226, ("fig-audio", "Caminho do som do DP-666"), desc, "".join(b), cls="diagram d-wide")
    return figure(svg + _audio_estreito(desc), "Caminho do som no esquema V2.5.3. O volume é analógico e fica antes dos dois amplificadores. O próprio conector de fone escolhe a saída: com o plugue, o contato entre os pinos 6 e 2 se abre, liga o U4 e, por um transistor, desliga o U2.")


def _audio_estreito(desc):
    """Versão em coluna do diagrama de áudio, para telas de celular."""
    b = [_box(60, 10, 220, 50, "TEF6686 · U7", "conversor interno (DAC)"),
         _line(170, 60, 170, 82, "d-acc", arrow=True),
         _box(60, 84, 220, 50, "VOLUME · SW4", "potenciômetro duplo", key=True),
         _path("M170,134 V150 M85,150 H255", "d-acc"),
         _line(85, 150, 85, 170, "d-acc", arrow=True),
         _line(255, 150, 255, 170, "d-acc", arrow=True),
         _box(8, 172, 154, 56, "MAX97220 · U4", "fone, estéreo"),
         _box(178, 172, 154, 56, "TPA6211A1 · U2", "soma L e R"),
         _line(85, 228, 85, 254, "d-acc", arrow=True),
         _line(255, 228, 255, 254, "d-acc", arrow=True),
         _box(8, 256, 154, 50, "Fone P2", "conector PJ-3270"),
         _box(178, 256, 154, 50, "Alto-falante", "4 Ω · mono"),
         _path("M85,306 V324 H255 V308", "d-dash", arrow=True),
         _text(170, 342, "com o plugue, o alto-falante fica mudo", "d-lbl")]
    return _svg(340, 352, ("fig-audio-n", "Caminho do som do DP-666"), desc, "".join(b), cls="diagram d-narrow")


DIAGRAMS = {"arquitetura": arquitetura, "flash": flash, "boot": boot, "remoto": remoto, "energia": energia, "audio": audio}
