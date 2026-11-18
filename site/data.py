"""Dados estruturados do guia: componentes com datasheets e imagens de referência externas."""

# status: (texto, tom) — tom define a cor do texto: ok, warn, maybe, muted
COMPONENTS = [
    {
        "pn": "TEF6686HN/V102", "ref": "U7", "maker": "NXP",
        "role": "Sintonizador DSP: recepção AM e FM, RDS e áudio",
        "bus": "I²C 0x64 · marcação F8602, patch 102 · cristal de 9,216 MHz",
        "status": [("Ativo", "ok"), ("Datasheet completo só sob pedido", "muted")],
        "links": [
            ("Folheto TEF668x (PDF, NXP)", "https://cache.nxp.com/docs/en/brochure/75017468.pdf"),
            ("Short data sheet (PDF, Rev. 1, 30/07/2013, espelho Farnell)", "https://www.farnell.com/datasheets/2615702.pdf"),
            ("Página do produto", "https://www.nxp.com/products/radio/low-if-tuner-high-performance-one-chip:TEF668X"),
        ],
    },
    {
        "pn": "ESP32-WROOM-32U", "ref": "U8", "maker": "Espressif",
        "role": "Processador: controle, Wi-Fi e Bluetooth, 4 MB de flash",
        "bus": "conector IPEX para a antena de Wi-Fi",
        "status": [("NRND", "warn")],
        "links": [
            ("Datasheet do módulo (PDF, v2.8)", "https://www.espressif.com/sites/default/files/documentation/esp32-wroom-32d_esp32-wroom-32u_datasheet_en.pdf"),
            ("Datasheet do chip ESP32 (PDF)", "https://documentation.espressif.com/esp32_datasheet_en.pdf"),
            ("Manual técnico (TRM, PDF)", "https://www.espressif.com/sites/default/files/documentation/esp32_technical_reference_manual_en.pdf"),
        ],
    },
    {
        "pn": "LCD28IPS", "ref": "—", "maker": "Tela IPS",
        "role": "Tela de 2,8 polegadas, 320×240, ligada por SPI",
        "bus": "o esquema não nomeia o controlador; o firmware a trata como ILI9341",
        "status": [("ILI9341 provável", "maybe")],
        "links": [
            ("ILI9341 (PDF, V1.11, espelho Adafruit)", "https://www.adafruit.com/datasheets/ILI9341.pdf"),
        ],
    },
    {
        "pn": "XPT2046", "ref": "U3", "maker": "XPTEK",
        "role": "Controlador do toque resistivo",
        "bus": "SPI · interrupção no GPIO 33",
        "status": [("Sem link oficial", "muted")],
        "links": [
            ("Datasheet em inglês (PDF, espelho Waveshare)", "https://files.waveshare.com/wiki/common/XPT2046_Datasheet.pdf"),
        ],
    },
    {
        "pn": "XL9555", "ref": "U12", "maker": "Xinluda",
        "role": "Expansor de 16 portas que lê as 12 teclas do teclado numérico, uma por porta; compatível com o PCA9555",
        "bus": "I²C 0x20 · interrupção no GPIO 14",
        "status": [("Ativo", "ok")],
        "links": [
            ("Datasheet XL9535/XL9555 (PDF, espelho LCSC)", "https://atta.szlcsc.com/upload/public/pdf/source/20240911/FFF826D97BDA33B4BE55BC4C2C305DC8.pdf"),
            ("Página do XL9555 na LCSC", "https://www.lcsc.com/product-detail/C609791.html"),
            ("PCA9555, referência NXP (PDF, Rev. 10)", "https://www.nxp.com/docs/en/data-sheet/PCA9555.pdf"),
        ],
    },
    {
        "pn": "RS4C8010", "ref": "U11", "maker": "RTC",
        "role": "Relógio que mantém a hora com o rádio desligado, compatível com o Epson RX8010SJ",
        "bus": "I²C 0x32 · ligado direto à bateria · só em unidades enviadas a partir de 01/04/2025",
        "status": [("Unidades novas", "maybe")],
        "links": [
            ("Epson RX8010SJ, datasheet (PDF, espelho Mouser)", "https://www.mouser.com/datasheet/2/137/RX8010SJ_en-1859944.pdf"),
            ("Anúncio do RTC (DEEPELEC)", "https://www.deepelec.com/en/2025/04/09/dp-666-add-rtc/"),
        ],
    },
    {
        "pn": "TPA6211A1", "ref": "U2", "maker": "Texas Instruments",
        "role": "Amplificador do alto-falante: soma os canais L e R e toca em mono",
        "bus": "alimentado direto pela bateria · desligado quando entra o fone",
        "status": [("Ativo", "ok")],
        "links": [
            ("Datasheet (PDF, SLOS367E)", "https://www.ti.com/lit/ds/symlink/tpa6211a1.pdf"),
            ("Página do produto", "https://www.ti.com/product/TPA6211A1"),
        ],
    },
    {
        "pn": "MAX97220", "ref": "U4", "maker": "Analog Devices (Maxim)",
        "role": "Amplificador do fone de ouvido",
        "bus": "nos esquemas V2.5.3 e V2.5.4: MAX97220BETE+T, a versão B, com ganho por resistores externos e 130 ms para ligar",
        "status": [("Ativo", "ok")],
        "links": [
            ("Datasheet MAX97220A–E (PDF, Rev. 2, 07/2012)", "https://www.analog.com/media/en/technical-documentation/data-sheets/MAX97220A-MAX97220E.pdf"),
            ("Página do produto", "https://www.analog.com/en/products/max97220.html"),
        ],
    },
    {
        "pn": "CH340N", "ref": "U10", "maker": "WCH",
        "role": "Ponte USB-serial da porta USB-C, usada para gravar e conversar com o rádio",
        "bus": "UART0 do ESP32 · alimentado pela USB · sem reinício automático do ESP32",
        "status": [("Ativo", "ok")],
        "links": [
            ("Datasheet CH340 em inglês (PDF, espelho LCSC)", "https://www.lcsc.com/datasheet/lcsc_datasheet_2202231130_WCH-Jiangsu-Qin-Heng-CH340N_C2977777.pdf"),
            ("Driver CH341SER no site da DEEPELEC (zip)", "https://www.deepelec.com/files/dp-666/CH341SER.zip"),
            ("Como instalar o driver (SparkFun, com os links da WCH)", "https://learn.sparkfun.com/tutorials/how-to-install-ch340-drivers"),
        ],
    },
    {
        "pn": "TP4056", "ref": "U20", "maker": "Top Power",
        "role": "Carregador da bateria de lítio de 5000 mAh",
        "bus": "alimentado pela USB-C · carga de cerca de 0,9 A (R104 de 1,3 kΩ) · sensor de temperatura desativado",
        "status": [("Ativo", "ok")],
        "links": [
            ("Datasheet (PDF, REV 2.3)", "https://www.toppwr.com/uploadfile/file/20240130/65b892bb04a3c.pdf"),
        ],
    },
    {
        "pn": "EC8D-01B", "ref": "U1", "maker": "Fabricante não identificado",
        "role": "Controlador do botão POWER: liga e desliga a energia da placa a cada toque",
        "bus": "ligado direto à bateria · comanda o transistor Q1, junto com a chave geral",
        "status": [("Sem ficha técnica encontrada", "muted")],
        "links": [],
    },
    {
        "pn": "RT9193-33 ×3", "ref": "U5 · U6 · U32", "maker": "Richtek",
        "role": "Reguladores de 3,3 V de baixo ruído",
        "bus": "U5 para o processador, U32 para a tela, U6 para o sintonizador",
        "status": [("Disponível", "ok")],
        "links": [
            ("Página do produto (Richtek)", "https://www.richtek.com/Products/Linear%20Regulator/Single%20Output%20Linear%20Regulator/RT9193?sc_lang=en"),
            ("Datasheet (PDF, DS9193-16, espelho Farnell)", "https://www.farnell.com/datasheets/1782159.pdf"),
        ],
    },
    {
        "pn": "PJ-3270", "ref": "—", "maker": "Genérico",
        "role": "Conector de fone de 3,5 mm com chave que desliga o alto-falante",
        "bus": "o contato entre os pinos 6 e 2 escolhe entre fone e alto-falante",
        "status": [("Sem ficha técnica", "muted")],
        "links": [
            ("Artigo da DEEPELEC sobre o alto-falante mudo", "https://www.deepelec.com/dp-666-speaker-cannot-produce-any-sound"),
        ],
    },
]

DEEP = "https://www.deepelec.com/files/dp-666/img/"
REFS = {
    "hardware": [
        ("Esquema elétrico V2.5.4", "Esquema completo: rádio, processador, áudio e energia (PDF)", "DEEPELEC", "https://www.deepelec.com/files/dp-666/Schematic_DP-666_V2.5.4.pdf"),
        ("Linha atual, quatro cores", "Aparência vendida desde julho de 2025", "DEEPELEC", DEEP + "dp666_new_four_c3.JPG"),
        ("Conteúdo da caixa", "Itens que acompanham o rádio", "DEEPELEC", DEEP + "dp666_new_ship_list2.JPG"),
        ("Etiquetas de série", "Etiqueta antiga e nova, com QR code", "DEEPELEC", DEEP + "dp666_old_new_sn.JPEG"),
        ("Gabinete de março de 2025", "Versão com cantos arredondados", "DEEPELEC", DEEP + "dp666_dinggao_3.JPG"),
        ("Gabinete de lançamento", "Versão de setembro de 2024, com cantos retos", "DEEPELEC", DEEP + "four_dp666_1.JPG"),
        ("Placa e exterior", "Galeria com a placa Mini6686 V2.5 e o esquema", "Radiomuseum.org", "https://radiomuseum.org/r/unknownprc_deepelec_dp_666.html"),
        ("Review com fotos", "O rádio em uso, por Jock Elliott (KB2GOM)", "SWLing Post", "https://swling.com/blog/2026/03/the-deepelec-dp-666-a-very-interesting-radio/"),
        ("Review com fotos", "O rádio em uso no FM, por James Cridland", "james.cridland.net", "https://james.cridland.net/blog/2025/review-deepelec-dp-666/"),
        ("Clone SPARKELEC", "Caixa, laterais, topo e verso de um clone", "Blog or Die!", "https://www.blogordie.com/?p=7729"),
    ],
    "telas": [
        ("Megatron, tela principal", "Interface do Mod17", "DEEPELEC", DEEP + "dp666_wzt_1.JPG"),
        ("Megatron, outras telas", "Interface do Mod17", "DEEPELEC", DEEP + "dp666_wzt_2.JPG"),
        ("Megatron, menu em inglês", "Menu principal do Mod17", "DEEPELEC", DEEP + "dp666_wzt_menu_en.jpg"),
        ("Megatron, tela adicional", "Interface do Mod17", "DEEPELEC", DEEP + "dp666_wzt_4.JPG"),
        ("Megatron, áreas de toque", "Mapa das áreas sensíveis ao toque", "DEEPELEC", DEEP + "dp666_touch_area2.jpg"),
        ("Oficial v2.20.x, tela 1", "Tela principal da linha oficial", "DEEPELEC", DEEP + "dp666_sjef_1_en.jpg"),
        ("Oficial v2.20.x, tela 2", "Tela de RDS ou de menu", "DEEPELEC", DEEP + "dp666_sjef_2_en.jpg"),
        ("Oficial v2.20.x, tela 3", "Tela de RDS ou de menu", "DEEPELEC", DEEP + "dp666_sjef_3_en.jpg"),
        ("Oficial v2.20.x, foto da tela", "Foto do rádio com a linha oficial", "DEEPELEC", DEEP + "dp666_sjef_4.JPG"),
        ("Manual do Mod17", "Telas anotadas, teclado na tela e atalhos (PDF)", "DEEPELEC", "https://www.deepelec.com/files/dp-666/DP-666_UM_EN_Megatron_Mod17.pdf"),
        ("Manual da linha oficial v2.11", "Telas e menus da v2.11 (PDF)", "DEEPELEC", "https://www.deepelec.com/files/dp-666/DP-666_Product_Manual_EN.pdf"),
        ("Wiki do PE5PVB", "Tela principal e RDS avançada da v2.x", "PE5PVB/TEF6686_ESP32", "https://github.com/PE5PVB/TEF6686_ESP32/wiki"),
    ],
}
