"""Todas as opções de menu dos dois firmwares, com tipo, valores possíveis, padrão e recomendação para o Brasil.

Linha oficial: lida no código-fonte da v2.20.12 (gui.cpp: MenuUpDown e os submenus de Definições;
TEF6686_ESP32.ino: DefaultSettings, compilação DEEPELEC_DP_66X, com DYNAMIC_SPI_SPEED e sem HAS_AIR_BAND).
Megatron Mod17: manual oficial V1.1 (M), changelog da DEEPELEC (C), strings do firmware (F, não oficial),
wiki da linha oficial (W) e opção vista num aparelho (O). As listas estão na ordem em que o rádio as percorre.

Cada item tem: nome no rádio, nome em inglês (linha oficial), especificação, padrão de fábrica, descrição
(quando o guia não tem uma), submenu, valor para o Brasil e a chave do texto do guia de onde vem a descrição.
"""
import json
import pathlib



def L(*opts, nota=""):
    return {"tipo": "lista", "opcoes": list(opts), "nota": nota}


def LR(resumo, nota=""):
    return {"tipo": "lista", "resumo": resumo, "nota": nota}


def T(a="Desligado", b="Ligado", nota=""):
    return {"tipo": "liga", "opcoes": [a, b], "nota": nota}


def R(mn, mx, passo=None, un="", off=False, nota=""):
    return {"tipo": "faixa", "min": mn, "max": mx, "passo": passo, "unidade": un, "off": off, "nota": nota}


def A(resumo, nota=""):
    return {"tipo": "acao", "resumo": resumo, "nota": nota}


def X(resumo, nota=""):
    return {"tipo": "texto", "resumo": resumo, "nota": nota}


def V(resumo, nota=""):
    return {"tipo": "leitura", "resumo": resumo, "nota": nota}


def o(nome, en, spec, padrao="", desc="", sub="", br="", guia=""):
    return {"nome": nome, "en": en, "spec": spec, "padrao": padrao, "desc": desc, "sub": sub, "br": br,
            "guia": guia or en, "fontes": "", "adv": False}


def m(nome, spec, fontes, padrao="", desc="", br="", adv=False, guia=""):
    return {"nome": nome, "en": "", "spec": spec, "padrao": padrao, "desc": desc, "sub": "", "br": br,
            "guia": guia or nome, "fontes": fontes, "adv": adv}


LANGS = ["English", "Nederlands", "Polski", "Hrvatski", "Ελληνικά", "Română", "Deutsch", "Čeština", "Magyar",
         "Français", "Български", "Русский", "Українська", "Italiano", "Simplified Chinese", "Norsk", "Español",
         "Português", "Srpski", "Suomi", "Dansk", "Svenska", "Gaeilge"]
THEMES = ["Essence", "Cyan", "Crimson", "Monochrome", "Volcano", "Dendro", "Sakura", "Whiteout", "Tangerine",
          "Ocean", "Indigo", "Queer", "GoldBrite", "Bubblegum", "Aurora", "Ember", "Glacier"]
# cores de cada tema, geradas por scripts/temas.py a partir do código do firmware: para cada papel
# (fundo, moldura, frequência...), o hex, o nome da cor no firmware e o valor RGB565. Linha oficial: v2.20.12.
# Megatron: o código é fechado, então vale a linha oficial em 532c4ef (01/09/2024), o estado mais novo com os
# mesmos 13 temas em comum (ainda chama o Queer de Maroon e não tem o Bubblegum). Chinese Red e Retro ficam
# sem prévia até termos fotos da tela.
_TEMAS = json.loads((pathlib.Path(__file__).parent / "temas.json").read_text(encoding="utf-8"))
THEME_PALETTE = {t: {k: v[0] for k, v in pp.items()} for t, pp in _TEMAS["oficial"]["temas"].items()}
THEME_NAMES = {t: {k: v[1:] for k, v in pp.items()} for t, pp in _TEMAS["oficial"]["temas"].items()}
THEME_PALETTE_MOD17 = {t: {k: v[0] for k, v in pp.items()} for t, pp in _TEMAS["mod17"]["temas"].items()}
THEME_NAMES_MOD17 = {t: {k: v[1:] for k, v in pp.items()} for t, pp in _TEMAS["mod17"]["temas"].items()}
# Megatron: ordem da tabela de temas e de fontes no binário do Mod17 (o Mod16 não tem o Retro)
THEMES_MOD17 = ["Essence", "Cyan", "Crimson", "Monochrome", "Volcano", "Dendro", "Sakura", "Whiteout", "Tangerine",
                "Ocean", "Indigo", "Maroon", "Chinese Red", "Retro", "GoldBrite"]
FONTS = ["Classic", "Roubenstil", "Motoya", "Aura2", "Modern"]
FONTS_MOD17 = ["Classic", "Roubenstil", "Motoya", "Aura2", "Comic", "Modern"]
# fusos do menu, em quartos de hora (gui.cpp, Definir deslocamento de tempo NTP)
_Q = [-48, -44, -40, -38, -36, -32, -28, -24, -20, -16, -14, -12, -8, -4, 0, 4, 8, 12, 14, 16, 18, 20, 22, 23,
      24, 26, 28, 32, 35, 36, 38, 40, 42, 44, 48, 51, 52, 56]


def _zone(q):
    mins = abs(q) * 15
    return "GMT " + ("−" if q < 0 else "+") + str(mins // 60) + (f":{mins % 60}" if mins % 60 else "")


ZONES = [_zone(q) for q in _Q]

EDGE_LOW = ("Girando para um lado, sobe 0,1 MHz; para o outro, desce 1 MHz. "
            "Para ir de 87,5 a 76,1 MHz, desça 12 vezes, até 75,5, e suba 6.")
EDGE = "Girando para um lado, sobe 0,1 MHz; para o outro, desce 1 MHz."
DA, DE = "Definições do aparelho", "Definições do ecrã"

OFICIAL = [
    ("Configurações principais", [], [
        o("Seletor de modelo", "Model selector", L("Básico", "Portátil", "Toque portátil"), "Toque portátil", sub=DA,
          desc="Tipo de rádio. No DP-666, use Toque portátil: algumas funções dependem dele."),
        o("Inverter rotação", "Reverse encoder", T(), "Ligado", sub=DA,
          desc="Inverte o sentido do encoder. A compilação para o DP-66X já vem invertida."),
        o("Codificador óptico", "Optical encoder", T(), "Desligado", sub=DA,
          desc="Para rádios com encoder óptico no lugar do mecânico."),
        o("Inverter cores", "Invert colors", T(), "Desligado", sub=DA,
          desc="Inverte as cores da tela, para painéis que precisam disso."),
        o("ARS display", "ARS display", T(), "Desligado", sub=DA,
          desc="Para rádios com a tela da versão ARS. Deixe desligado no DP-666."),
        o("Medidor analógico", "Analog meter", A("Põe o ponteiro em escala completa, para ajustar."), sub=DA,
          desc="Calibra um medidor analógico de sinal. O DP-666 não tem esse medidor."),
        o("Reposição de fábrica", "Factory reset", A("Pede confirmação: “Apagar definições e estações guardadas?”"), sub=DA,
          desc="Volta todos os ajustes ao padrão e apaga as memórias."),
        o("Parar tela de despertar ao sintonizar", "Stop screen wake on tune", T(), "Desligado"),
        o("Desligamento automático", "Auto Power off", L("Desligado", "15 min", "30 min", "60 min", "90 min"), "Desligado"),
        o("Usar squelch", "Use squelch", L("Ligado", "Desligado", "Auto"), "Ligado", br="Desligado"),
        o("FM AGC", "FM AGC", R(84, 92, 1, "dBµV"), "92 dBµV", br="92 dBµV"),
        o("AM AGC", "AM AGC", R(94, 102, 1, "dBµV"), "100 dBµV"),
        o("Selecionar faixa FM", "Select FM Band", L("FM, OIRT", "OIRT", "FM", "Nenhum"), "FM, OIRT"),
        o("Selecionar faixa AM", "Select AM Band",
          L("LW, AM, SW", "LW, AM", "LW, SW", "AM, SW", "LW", "AM", "SW", "Nenhum",
            nota="Com o menu em português, a faixa MW (ondas médias) aparece como AM."), "LW, AM, SW"),
        o("Pressione o botão banda por 5 seg.", "5 sec. bandbutton press", L("Desligar", "Tela desligada", "Inativo"), "Desligar"),
        o("Velocidade dinâmica de SPI", "Dynamic SPI speed",
          L("Predefinição", "10 MHz", "20 MHz", "30 MHz", "40 MHz", "50 MHz", "60 MHz", "Auto",
            nota="Predefinição usa a velocidade fixa da compilação."), "Auto"),
    ]),
    ("Configurações de áudio", [], [
        o("Definir volume", "Set volume", R(-10, 10, 1, "dB", nota="Para nas pontas, sem voltar ao início."), "0 dB"),
        o("Sinais sonoros", "Audio feedback", L("Desligado", "Ligado", "Ligado + morse"), "Desligado"),
        o("Saída de áudio", "Audio output", L("Stereo", "MPX"), "Stereo"),
        o("Limiar de separação estéreo", "Stereo separation threshold", R(30, 60, 1, "dBµV", off=True), "Desligado", br="≈ 40 dBµV"),
        o("Frequência do canto de corte alto", "High cut corner frequency", R(1500, 7000, 100, "Hz"), "7000 Hz"),
        o("Definir limiar de corte alto", "High cut threshold", R(20, 60, 1, "dBµV", off=True), "Desligado"),
        o("Desênfase FM", "FM deemphasis", L("Desligado", "50 µs", "75 µs"), "50 µs", br="50 µs"),
    ]),
    ("Configurações de exibição", [], [
        o("Idioma", "Language", L(*LANGS), "English"),
        o("Definir brilho da tela", "Display brightness", R(1, 100, 1, "%"), "50%"),
        o("Medidor de modulação", "Audio level meter", T(), "Ligado"),
        o("Proteção de tela", "Screensaver", L("Desligado", "3 s", "10 s", "30 s", "60 s"), "Desligado"),
        o("Opções de proteção de tela", "Screensaver options", L("Desligar a tela", "1% de brilho", "25% de brilho", "50% de brilho"), "1% de brilho"),
        o("Opções de bateria", "Battery options", L("Desligado", "Mostrar voltagem", "Mostrar porcentagem"), "Mostrar voltagem"),
        o("Unidade de medidor de sinal", "Signalmeter unit", L("dBµV", "dBf", "dBm"), "dBµV"),
        o("Mostrar relógio", "Show clock", T(), "Ligado"),
        o("Tema", "Theme", dict(L(*THEMES, nota="Aurora, Ember e Glacier só existem no código da v2.20.12; o pacote "
                                "v2.20.8 da DEEPELEC tem os outros 14. Nos pacotes v2.11.x, o Queer se chama Maroon, com "
                                "as mesmas cores, e o Bubblegum aparece a partir da v2.11.5. O Whiteout é o único tema "
                                "claro."), paleta=THEME_PALETTE, nomes=THEME_NAMES, previa="tema"), "Essence"),
        o("Fonte de frequência", "Frequency font",
          dict(L(*FONTS, nota="Essas fontes só têm os algarismos e o ponto. A Comic saiu do código em dezembro de 2025, "
                              "para liberar espaço no flash; os pacotes da DEEPELEC até a v2.20 ainda a trazem."),
               previa="fonte"),
          "Aura2", sub=DE, desc="Fonte dos números da frequência."),
        o("Rodar ecrã 180°", "Flip screen 180°", T(), "Ligado", sub=DE,
          desc="Gira a imagem da tela. A compilação para o DP-66X já vem girada."),
        o("Teclado frequência", "Frequency keypad", T(), "Ligado", sub=DE,
          desc="Teclado numérico na tela, para digitar a frequência."),
        o("Calibração da tela de toque", "Touch calibration", A("Pede confirmação: “Iniciar calibração?”"), sub=DE,
          desc="Calibra o toque. Só aparece no modelo Toque portátil."),
    ]),
    ("Configurações RDS", [], [
        o("Mostrar erros RDS", "Show RDS errors", L("Desligado", "Pequeno", "Grande"), "Pequeno"),
        o("Região", "Region", L("Europa", "Estados Unidos DB", "Estados Unidos", "Canadá"), "Europa", br="Europa"),
        o("Mostrar sublinhado no RDS", "Show underscore in RDS", L("Desligado", "PS apenas", "Ligado"), "Desligado"),
        o("Filtro RDS", "RDS filter", T(), "Ligado"),
        o("Mostrar erros PI", "Show PI errors", T(), "Desligado"),
        o("Usar AF", "Use AF", L("Desligado", "Ligado / REG ligado", "Ligado / REG desligado",
                                 nota="Fica desligado quando há um conversor configurado."), "Desligado", br="Desligado"),
        o("Buffering RT", "RT buffering", T(), "Ligado", desc="Mostra o RadioText completo, em vez de letra por letra."),
        o("Classificar AF automaticamente", "Auto sort AF", T(), "Ligado"),
        o("PS rápido", "Fast PS", L("Desligado", "Inicial", "Sempre"), "Inicial",
          desc="Mostra o nome da emissora mais rápido, com risco de lixo na tela."),
        o("Mostrar PS longo", "Show long PS", T(), "Ligado",
          desc="Mostra o nome longo da emissora (Long PS), quando ela transmite."),
    ]),
    ("Configurações FM", [], [
        o("Definir deslocamento do conversor", "Converter offset", R(0, 2400, 1, "MHz"), "0 MHz"),
        o("Definir borda da faixa baixa", "Low band edge", R(65, 107.9, None, "MHz", nota=EDGE_LOW), "87,5 MHz",
          br="76,1 MHz", desc="Limite inferior da faixa de FM. Em 76,1 MHz, a faixa cobre o FM estendido."),
        o("Definir borda da faixa alta", "High band edge", R(66, 108, None, "MHz", nota=EDGE), "108,0 MHz",
          br="108,0 MHz", desc="Limite superior da faixa de FM."),
        o("Definir deslocamento de nível", "Level offset", R(-25, 15, 1, "dB"), "0 dB"),
        o("Definir limiar de nível baixo", "Low level threshold", R(-15, 30, 1, "dBµV"), "−15 dBµV",
          desc="Abaixo desse nível, o rádio trata o sinal como fraco e acinzenta o RDS e a modulação."),
        o("Silenciamento suave FM", "Softmute FM", T(), "Desligado"),
        o("Supressor de ruído FM", "FM Noise blanker", R(50, 150, 1, "%", off=True), "Desligado"),
        o("Passo padrão FM", "FM default stepsize", L("50 kHz", "100 kHz", "200 kHz"), "100 kHz", br="200 kHz",
          desc="Passo do encoder no FM. O código soma o passo a partir da borda da faixa, por isso a borda decide em que decimais a sintonia para."),
        o("FMSI melhoria do som estéreo", "FMSI stereo improvement", T(), "Ligado"),
        o("Sensibilidade da varredura", "Scan sensitivity", R(1, 30, 1), "4"),
    ]),
    ("Configurações AM", [], [
        o("Silenciamento suave AM", "Softmute AM", T(), "Ligado"),
        o("Supressor de ruído AM", "AM Noise blanker", R(50, 150, 1, "%", off=True), "Desligado"),
        o("Deslocamento de nível de RF AM", "AM RF Level offset", R(-50, 15, 1, "dB"), "0 dB",
          desc="Compensa perda ou ganho de sinal antes do rádio, no AM."),
        o("Mostrar comprimento de onda SW", "Show SW wavelength", T(), "Ligado",
          desc="Mostra a faixa de ondas curtas em metros, como 49 m, junto da frequência."),
        o("Detector CoChannel", "CoChannel Detector", R(50, 150, 1, "%", off=True), "100%",
          desc="Sensibilidade do detector de co-canal, que avisa quando há duas emissoras na mesma frequência."),
        o("Limiar do CoChannel Det", "CoChannel Detector threshold", R(1, 15, 1), "3", guia="CoChannel Detector",
          desc="Contagem que o detector de co-canal precisa atingir para avisar."),
        o("AM Ganho da antena", "AM Antenna gain", R(6, 36, 6, "dB", off=True), "Desligado"),
        o("Tamanho padrão da etapa AM", "MW default stepsize", L("9 kHz", "10 kHz"), "9 kHz", br="10 kHz"),
        o("Sensibilidade da varredura", "Scan sensitivity", R(1, 30, 1), "4"),
    ]),
    ("Conectividade e relógio", [], [
        o("Modo USB", "USB mode", L("XDRGTK", "RDS Spy"), "XDRGTK"),
        o("Wi-Fi", "Wi-Fi", T(), "Desligado"),
        o("Configurar Wi-Fi", "Configure Wi-Fi", A("Abre o assistente de conexão."), ""),
        o("IP do cliente da lista de estações", "Stationlist client IP", R(1, 254, 1), "1", guia="Stationlist client IP e ID",
          desc="Último número do IP do computador que roda o StationList."),
        o("ID da lista de estações", "Stationlist ID", R(1, 10, 1), "1", guia="Stationlist client IP e ID",
          desc="Número deste rádio no StationList."),
        o("Tela mudo na conexão XDRGTK", "Mute screen on XDRGTK connection", T(), "Desligado",
          desc="Apaga a tela enquanto o XDRGTK está conectado."),
        o("Definir deslocamento de tempo NTP", "Set NTP time offset", L(*ZONES), "GMT +1", br="GMT −3"),
        o("DST automático no horário NTP", "Auto DST on NTP time", T(), "Ligado", br="Desligado"),
        o("Modo de relógio", "Clock mode", L("24 h", "12 h"), "24 h", desc="Formato do relógio."),
        o("PI bloqueado CT sync", "PI locked CT sync",
          T(nota="Ao ligar, o rádio trava no PI da estação sintonizada e mostra o código ao lado. "
                 "Sem RDS, aparece “Erro! Sem sinal RDS”."), "Desligado"),
    ]),
    ("Opções FM DX", [], [
        o("Comece a pesquisar DX", "Start DX scanning", A("Inicia a varredura."), "",
          desc="Fora do menu, aperte MODE até aparecer MEM e depois BAND. Durante a varredura, MEM pisca."),
        o("Comece a pesquisar canais de memória", "Begin scanning memory channels", R(1, 98, 1, nota="Sempre menor que o canal final."), "1",
          desc="Primeira memória do intervalo. Só entram memórias de FM e OIRT."),
        o("Pare de pesquisar canais de memória", "Stop scanning memory channels", R(2, 99, 1, nota="Sempre maior que o canal inicial."), "10",
          desc="Última memória do intervalo."),
        o("Tempo de espera", "Wait time", R(0.5, 30, None, "s", nota="Começa em 0,5 s; depois vai de 1 a 30 s, de 1 em 1."), "5 s",
          desc="Quanto tempo o rádio fica em cada frequência antes de seguir."),
        o("Canais memorizados", "Memory channels", L("Excluir", "Apenas"), "Apenas",
          desc="Em Apenas, passa só pelas memórias do intervalo. Em Excluir, varre a faixa e pula as frequências gravadas no intervalo."),
        o("Cancelar automatic. a pesquisa", "Auto cancel scan", L("Desligado", "PI correto", "Sinal"), "Desligado",
          desc="Desligado nunca para. PI correto para ao decodificar um PI. Sinal para ao encontrar sinal, com o limiar de "
               "Configurações FM → Sensibilidade da varredura."),
        o("Mudo áudio enquanto procura", "Mute audio while scanning", T(), "Desligado", desc="Deixa o áudio mudo durante a varredura."),
        o("Registrador automático", "Autologger", T(), "Ligado",
          desc="Grava sozinho no logbook as estações com PI correto encontradas na varredura."),
        o("Espera tempo apenas quando sinal", "Wait time on signal only", T(), "Ligado",
          desc="Usa o tempo de espera só nas frequências com sinal."),
        o("Limpar livro de registro", "Clear logbook", A("Apaga o logbook inteiro."), "", desc="Exporte o logbook antes, se quiser guardá-lo."),
    ]),
    ("Memória automática", [], [
        o("Iniciar memória automática", "Start auto memory", A("Busca as estações e grava nas memórias."), "",
          desc="Preenche as memórias numa faixa de frequências e num intervalo de posições."),
        o("Iniciar frequência", "Start frequency", R(65, 107.9, None, "MHz", nota=EDGE), "87,5 MHz", desc="Início da busca."),
        o("Parar frequência", "Stop frequency", R(66, 108, None, "MHz", nota=EDGE), "108,0 MHz", desc="Fim da busca."),
        o("Iniciar canal de memória", "Start memory channel", R(1, 98, 1), "2", desc="Primeira posição a gravar."),
        o("Parar canal de memória", "Stop memory channel", R(2, 99, 1), "11", desc="Última posição a gravar."),
        o("Somente armazenar com RDS", "Only store with RDS", T(), "Ligado", desc="Só grava estações com RDS."),
        o("Prevenir PI duplo", "Prevent double PI", L("Desligado", "Intervalo", "Completo"), "Desligado",
          desc="Evita gravar a mesma emissora duas vezes: Intervalo compara com as memórias do intervalo; Completo, com todas."),
        o("Sensibilidade da varredura", "Scan sensitivity", R(1, 30, 1), "4",
          desc="É o mesmo ajuste de Configurações FM → Sensibilidade da varredura."),
        o("Limpar canais de memória", "Clear memory channels", A("Apaga as memórias."), "", desc="Faça backup antes, se quiser guardá-las."),
    ]),
    ("Sobre o software", [], [
        o("Sobre o software", "About", V("Créditos dos desenvolvedores e colaboradores."), "", guia="-"),
    ]),
]

LONGPRESS = ["Lock&Unlock", "Original operation", "Open menu", "Digital keypad", "Shortcut page", "Advanced RDS", "AF Screen"]
LP_DESC = "O que o toque longo nesta tecla faz. Cada tecla começa a lista num ponto diferente do ciclo."
LP_NOTE = "O firmware também tem Frequency list e Band keypad."
ADV = "Boa parte destas opções só aparece no modo avançado."

MOD17 = [
    ("Main settings", [], [
        m("System usage mode", L("Simple mode", "Advanced mode"), "C", br="Advanced mode",
          desc="Simple mode esconde as opções avançadas. A DEEPELEC orienta ligar o Advanced mode pelo menu em chinês: "
               "Language → 简体中文, depois 主要设置 → 系统使用模式 → 高级模式, e de volta para English."),
        m("Model selector", L("Portable touch", "Base", "Portable"), "M W"),
        m("Set FM band", LR("Combinações de FM e FML, ou None. O texto do manual está truncado; a ordem provável é "
                            "FM + FML, FML, FM, None."), "M",
          desc="Quais faixas de FM o BAND percorre. FML é a faixa baixa escolhida em Set FML band."),
        m("Set AM band", LR("Combinações de LW, MW, SW e AIR, ou NONE. O texto do manual está truncado."), "M"),
        m("Screensaver", L("Off", "3 s", "10 s", "30 s", "60 s", nota="Junto do tempo, escolha a ação: tela apagada ou brilho de 1%, 25% ou 50%."),
          "F W", desc="Tempo sem uso até a proteção de tela."),
        m("Set first page", L("Main page", "Open menu", "Digital keypad", "Shortcut page", "Advanced RDS", "AF Screen",
                              nota="O firmware também tem Main page + Keypad. Com Open menu, aparece Select menu group."),
          "M F", desc="Tela que aparece ao ligar o rádio."),
        m("Power Off timer", R(1, 480, None, "min", off=True), "F"),
        m("Keep BAND key 3 sec.", L("Power off", "Mute screen", "Disable", nota="O manual cita só Power off; as outras duas vêm do firmware."),
          "M F", desc="O que acontece ao segurar o BAND por 3 s."),
        m("Dynamic SPI speed", LR("De 5 a 70 MHz, ou Auto"), "F W"),
        m("Auto still screen", T("Off", "On"), "M", desc="Deixa a tela estática depois do tempo de Still screen timer."),
        m("Still screen timer", R(0, 120, None, "s"), "M", desc="Tempo sem uso até a tela ficar estática."),
        m("Power off", A("Desliga pelo software."), "F", desc="Para ligar de novo, aperte o BW."),
    ]),
    ("Audio settings", [], [
        m("Set volume", R(-60, 24, None, "dB"), "M", padrao="0 dB"),
        m("Audio output", L("Stereo", "MPX"), "M W",
          desc="MPX manda o áudio mono no canal esquerdo e o sinal MPX completo no direito, para analisar o RDS e o estéreo."),
        m("Stereo threshold", R(30, 60, None, "dBµV", off=True), "M W", br="≈ 40 dBµV"),
        m("High cut corner", R(1500, 7000, None, "Hz"), "F W",
          desc="A partir de que frequência os agudos são cortados quando o sinal fica abaixo do limiar."),
        m("High cut threshold", R(20, 60, None, "dBµV", off=True), "M W", desc="Abaixo desse nível de sinal, o corte de agudos entra."),
        m("Use squelch", L("On", "Off", "Auto"), "M W", br="Off",
          desc="On usa o botão SQL. Auto controla o squelch sozinho e pode esconder sinais distantes."),
        m("FM deemphasis", L("50us", "75us", "Off"), "M", br="50us", desc="Curva de desênfase do áudio de FM. O Brasil usa 50 µs."),
        m("Beep at band edge", T("Off", "On"), "W F", desc="Bipe ao passar do fim da faixa."),
        m("Beep at operation", T("Off", "On"), "F", desc="Bipe a cada operação. Não está no manual."),
    ]),
    ("Display settings", [], [
        m("Language", L("English", "简体中文"), "M", desc="O Megatron só tem inglês e chinês simplificado."),
        m("Brightness", R(1, 100, None, "%"), "W", desc="Brilho da tela."),
        m("Theme", dict(L(*THEMES_MOD17, nota="Chinese Red e Retro só existem no Megatron. O Retro entrou no Mod17; o Mod16 "
                                          "tem 14 temas. Faltam Bubblegum, Aurora, Ember e Glacier, que vieram depois na "
                                          "linha oficial. A troca automática entre favoritos fica em My settings › My theme."),
                        paleta=THEME_PALETTE_MOD17, nomes=THEME_NAMES_MOD17, previa="tema"),
          "F C", desc="Tema de cores."),
        m("Frequency font", dict(L(*FONTS_MOD17, nota="As mesmas da linha oficial até a v2.20, incluindo a Comic."),
                                 previa="fonte"), "F", desc="Fonte dos números da frequência."),
        m("Meter refresh interval", R(30, 1000, None, "ms"), "F",
          desc="Intervalo de atualização do medidor. Mais lento significa menos ruído da tela."),
        m("Meter display style", L("Classic", "New"), "M F", desc="Estilo do medidor de sinal. O manual chama de Color bar display mode."),
        m("Set UI round", L("Menu", "Button", "Icon", "Border"), "M F", desc="Onde a interface usa cantos arredondados."),
        m("Menu display style", L("New (Vertical)", "New (Horizontal)", "Classic"), "M", desc="Layout do menu."),
        m("Show notification", T("Off", "On"), "F", desc="Mostra avisos na tela."),
        m("Notification mode", L("Auto", "Message bar", "Message box"), "F", desc="Onde os avisos aparecem."),
        m("Clock, Debug info e Frequency name color", LR("Uma cor fixa ou Dynamic"), "F",
          desc="Cores do relógio, das informações de depuração e do nome da frequência."),
        m("Show frequency tips", T("Off", "On"), "F",
          desc="Mostra rótulos junto da frequência, como RDX, WEK, MED, STR e SPR. A função foi deduzida das strings do firmware."),
        m("My logo image", X("Arquivo JPG, BMP ou PNG."), "F", desc="Imagem da tela de abertura."),
        m("My logo border", LR("Retângulo, tambor, elipse, círculo, hexágono, paralelogramo, losango ou coração"), "F",
          desc="Moldura do logo da tela de abertura."),
        m("Power saving mode", T("Off", "On"), "F", desc="O efeito não está documentado."),
    ]),
    ("RDS settings", [ADV, "A vista RDS avançada do código-base mostra PI, ECC, LIC, PIN, flags DI, AF, EON, RT+, "
                           "aplicações ODA e erros por bloco."], [
        m("Show RDS errors", L("Small", "Large", "All", "Off"), "M", desc="Limite de erros aceito na decodificação do RDS."),
        m("Region", L("Europe", "USA(DB)", "USA", "Canada"), "M W", br="Europe"),
        m("RDS Show underscore", L("Off", "On", "PS only", nota="PS only vem do firmware."), "M F W",
          desc="Troca os espaços por sublinhado no PS e no RT."),
        m("RDS filter", T("Off", "On"), "M", guia="RDS filter On"),
        m("Show PI errors", T("Off", "On"), "W", desc="Mostra os erros no código PI quando o sinal está fraco."),
        m("Use AF", L("Off", "On/REG On", "On/REG Off"), "M", br="Off"),
        m("RT buffering", T("Off", "On"), "O"),
        m("Auto sort AF", T("Off", "On"), "O", desc="Ordena a lista de AF por frequência."),
        m("Show long PS", T("Off", "On"), "O", desc="Mostra o nome longo da emissora (Long PS), quando ela transmite."),
        m("Fast PS", LR("Inclui Initial; os outros valores não foram confirmados"), "O"),
        m("Show RDS clock", T("Off", "On"), "M"),
        m("Disable all RDS", T("Off", "On"), "M C", desc="Desliga toda a decodificação de RDS. Entrou no Mod16."),
    ]),
    ("FM settings", [], [
        m("Set converter offset", R(0, 2400, None, "MHz"), "M W", desc="Só para quem usa conversor de RF externo."),
        m("Set low band edge", R(65, 107.9, None, "MHz"), "M W", br="76,1 MHz",
          desc="Limite inferior da faixa de FM. Em 76,1 MHz, a faixa cobre o FM estendido."),
        m("Set high band edge", R(66, 108, None, "MHz"), "M W", br="108,0 MHz", desc="Limite superior da faixa de FM."),
        m("Set level offset", R(-25, 15, None, "dB"), "M W", adv=True, desc="Compensa perda ou ganho de sinal antes do rádio."),
        m("Set low level threshold", R(-15, 30, None, "dBµV"), "M", adv=True,
          desc="No código-base, abaixo desse nível o rádio acinzenta o RDS e a modulação."),
        m("Softmute FM", T("Off", "On"), "M", adv=True, desc="Baixa o volume quando detecta chiado."),
        m("FM Noise blanker", R(50, 150, None, "%", off=True), "M W", adv=True, desc="Reduz a interferência de ruído."),
        m("FM default stepsize", L("100 kHz", "200 kHz", "50 kHz"), "M", padrao="100 kHz", br="200 kHz",
          desc="Passo do knob no FM."),
        m("FM AGC", L("92 dBµV", "90 dBµV", "87 dBµV", "84 dBµV"), "M F W", br="92 dBµV"),
        m("FMSI stereo improve", T("Off", "On"), "M", adv=True, guia="FMSI"),
        m("Set FML band", L("65–74 MHz", "76–87 MHz", nota="A faixa de 76 a 87 MHz entrou no Mod16."), "M C", adv=True),
    ]),
    ("AM settings", [], [
        m("Softmute AM", T("Off", "On"), "O", adv=True, desc="Baixa o volume quando detecta chiado."),
        m("AM Noise blanker", R(50, 150, None, "%", off=True), "M", adv=True, desc="Reduz a interferência de ruído."),
        m("AM RF Level offset", R(-50, 15, None, "dB"), "M", adv=True, desc="Compensa perda ou ganho de sinal antes do rádio, no AM."),
        m("Show SW wavelength", T("Off", "On"), "M", adv=True, desc="Mostra a faixa de ondas curtas em metros, como 49 m."),
        m("CoChannel Detector sensitivity", R(50, 150, None, "%", off=True), "M", adv=True,
          desc="Sensibilidade do detector de co-canal, que avisa quando há duas emissoras na mesma frequência. 100% é o padrão do código-base."),
        m("CoChannel Detector threshold", R(1, 15, None), "M", adv=True,
          desc="Contagem que o detector precisa atingir para avisar. 3 é o padrão do código-base."),
        m("AM ATT", R(6, 36, None, "dB", off=True), "F", desc="Atenuador da entrada de AM, para sinais fortes demais."),
        m("AM AGC", R(94, 102, None, "dBµV"), "F W", desc="Limiar do controle automático de ganho no AM."),
        m("MW default stepsize", L("9 kHz", "10 kHz"), "M W", br="10 kHz"),
        m("AIR band Conversion", X("Frequência do oscilador do conversor externo, em MHz."), "O",
          desc="A faixa aérea só funciona com um conversor externo vendido à parte."),
        m("AIR start frequency", X("Início da faixa AIR, em MHz."), "O", desc="Também depende do conversor externo."),
    ]),
    ("Connectivity", [], [
        m("USB mode", L("XDRGTK", "RDS Spy"), "F W", desc="Modo da porta USB, já com a velocidade de cada programa."),
        m("Wi-Fi active", T("Off", "On"), "F", desc="Liga o Wi-Fi."),
        m("Configure Wi-Fi", X("Até 3 redes, só de 2,4 GHz: pelo teclado na tela (SSID e senha), pelo navegador "
                               "(portal em 192.168.4.1) ou Delete Wi-Fi."), "F W", desc="Conecta o rádio a uma rede."),
        m("Set XDRGTK password", X("Até 8 caracteres."), "F", desc="Senha para o XDRGTK controlar o rádio pela rede."),
        m("Stationlist client IP", X("Endereço IP."), "F", desc="Computador que recebe a lista de estações (StationList)."),
        m("Stationlist ID", R(1, 10, None), "F", desc="Número deste rádio no StationList."),
        m("Screen off on XDRGTK", T("Off", "On"), "M F", desc="Apaga a tela enquanto o XDR-GTK está conectado."),
        m("Wi-Fi auto disconnect", LR("De 1 a 1440 min, ou After time sync"), "F", br="After time sync",
          desc="Desliga o Wi-Fi depois do tempo escolhido. Em After time sync, desliga logo depois de acertar a hora, "
               "o que economiza bateria e mantém a leitura dela."),
        m("Set NTP server", X("Endereço do servidor."), "F", padrao="cn.pool.ntp.org", br="a.st1.ntp.br",
          desc="Servidor de hora pela internet."),
        m("Bluetooth", X("Config slave host: controle de outro aparelho, sem áudio."), "F", desc="Sem documentação."),
    ]),
    ("Operation settings", [], [
        m("Touch type", L("Int33", "Int27", "Off", "Polling"), "F",
          desc="Como o firmware lê o toque: por interrupção (Int33 ou Int27) ou por consulta (Polling). Off desliga o toque."),
        m("Touch calibration", A("Abre a calibração."), "M", desc="Calibra a tela de toque."),
        m("Rotary adjust squelch", T("Off", "On"), "M", desc="O knob de sintonia passa a ajustar o limiar do squelch."),
        m("Knob mode", L("Classic", "New"), "F", desc="Modo de funcionamento do knob."),
        m("Knob reverse", T("Off", "On"), "F", desc="Inverte o sentido do knob."),
        m("Knob acceleration", L("Off", "Medium", "Fast"), "F", desc="Acelera a sintonia quando o knob gira rápido."),
        m("Quickly switch menu", T("Off", "On"), "M", desc="Troca mais rápida entre os grupos do menu."),
        m("Long press Rotary key", L(*LONGPRESS, nota=LP_NOTE), "M F", desc=LP_DESC),
        m("Long press BW key", L(*LONGPRESS, nota=LP_NOTE), "M F", desc=LP_DESC),
        m("Long press MODE key", L(*LONGPRESS, nota=LP_NOTE), "M F", desc=LP_DESC),
        m("Long press BAND key", L(*LONGPRESS, nota=LP_NOTE + " O manual em inglês repete “Long press Rotary key” no lugar desta."),
          "M F", desc=LP_DESC),
        m("Auto save change", T("Off", "On"), "F", desc="Grava as mudanças sozinho. Em Off, o rádio pergunta Save ou Discard ao sair."),
    ]),
    ("Other settings", [ADV], [
        m("Set date and time", X("Data, hora e modo data + hora."), "C", desc="Acerta o relógio à mão. Entrou no Mod16."),
        m("12/24 h", L("12 h", "24 h"), "C", desc="Formato do relógio."),
        m("Set local time zone", X("Fuso em GMT±hh:mm."), "M", br="GMT−03:00",
          desc="Fuso aplicado à hora do NTP. O horário de Brasília é GMT−03:00."),
        m("NTP time sync", T("Off", "On"), "O C", desc="Acerta a hora pela internet. Desde o Mod16, a cada 30 min."),
        m("RDS time sync", T("Off", "On"), "O", br="Off", desc="Acerta a hora pelo RDS (CT) da emissora. Algumas mandam a hora errada."),
        m("Sleep clock correction", X("Segundos por 24 h."), "F", desc="Corrige o atraso ou o adianto do relógio."),
        m("Power on timer", X("Horário."), "F", desc="Liga o rádio num horário."),
        m("Low battery protect", X("Limite da bateria."), "F", desc="Desliga o rádio com a bateria baixa."),
        m("Delete RDS dictionary", A("Mostra Deleted ou Not deleted."), "F"),
        m("System information", V("Versão, data de compilação, RAM, armazenamento, sintonizador, NTP, IP e MAC."), "M"),
        m("Developer mode e Manage my data", X("Não documentado."), "F", desc="Para desenvolvimento. Não use."),
    ]),
    ("My settings", [], [
        m("ATS / Scan schemes", X("Esquemas salvos."), "M F", desc="Esquemas de busca automática (ATS) e de varredura."),
        m("My theme", L("Sequential", "Random"), "M F", desc="Até 4 temas favoritos, trocados em sequência ou ao acaso."),
        m("Receive plan", X("Faixa, frequência e horário."), "M F"),
        m("My Shortcut icon", X("7 atalhos."), "M F"),
        m("Save / Delete my settings", A("Grava ou apaga o conjunto pessoal."), "M F", guia="Save my settings"),
    ]),
    ("Auto search", [], [
        m("Search & save mode", L("Overwrite", "Append", "Continuously append", nota="Continuously append vem do firmware."), "M F",
          desc="Como a busca grava: sobrescreve as memórias ou acrescenta depois das existentes."),
        m("Search band", LR("FM, LW, MW, SW, AIR e outras; a lista do manual continua"), "M", desc="Faixa da busca."),
        m("FM scan sensitivity", R(1, 15, None), "F", desc="Sensibilidade da busca no FM."),
        m("AM scan sensitivity", R(1, 20, None), "F", desc="Sensibilidade da busca no AM."),
        m("Judgment mode", L("Quality priority", "Quantity priority"), "F O", desc="Prioriza sinais bons ou o maior número de estações."),
        m("Start channel", R(1, 99, None), "F", desc="Primeira memória que a busca usa."),
        m("SW search start / stop", R(1800, 27000, None, "kHz"), "F", desc="Limites da busca em ondas curtas."),
        m("Arrange stations", L("Only defrag", "Defrag and sort"), "F",
          desc="Reorganiza as memórias: só tira os buracos, ou tira e ordena por frequência."),
        m("Delete stations", A("Esvazia a faixa inteira escolhida."), "F", desc="Apaga todas as memórias da faixa, não só uma."),
    ]),
    ("Frequency scanning", [], [
        m("Scanning band", L("FM", "LW", "MW", "SW", "AIR", "Default", "FML"), "M", desc="Faixa da varredura DX."),
        m("Begin / End channel", X("Valores não documentados."), "M F", desc="Primeira e última memória da varredura."),
        m("Wait time", X("Valores não documentados."), "M F", desc="Tempo em cada frequência."),
        m("Exclude / Only", L("Exclude", "Only"), "M F", desc="Pula as memórias ou varre só elas."),
        m("Cancel", L("Signal", "Off", "Correct PI"), "M F", desc="Para a varredura ao achar sinal ou um PI correto. Off não para."),
        m("Stay / Break", L("Stay", "Break"), "M F", desc="O que a varredura faz quando para."),
        m("Wait on signal only", T("Off", "On"), "M F", desc="Só espera nas frequências com sinal."),
        m("Hold time", X("Valores não documentados."), "M F", desc="A função não está documentada."),
    ]),
]

FONTES = {"M": "manual oficial", "C": "changelog da DEEPELEC", "F": "strings do firmware (não oficial)",
          "W": "wiki da linha oficial", "O": "visto num aparelho"}
