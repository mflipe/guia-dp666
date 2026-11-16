"""Explicação didática de cada opção: o que faz, por que é útil e quando vale (ou não) usar.

Cada entrada tem: faz (o que a opção faz), util (o problema que ela resolve), quando (linhas de decisão,
cada uma com um início em negrito e o resto da frase), obs (ressalva sobre a fonte) e tag (para quem importa).
As funções do sintonizador são as mesmas nos dois firmwares, então as explicações comuns ficam em funções
que recebem os nomes das opções de cada um. O comportamento da linha oficial foi conferido no código-fonte.
"""

TAGS = {
    "ajuste": "Vale ajustar",
    "dx": "Para DX",
    "gosto": "Gosto pessoal",
    "padrao": "Deixe no padrão",
    "especial": "Uso especial",
    "na": "Não se aplica ao DP-666",
}

GLOSSARIO = [
    ("DX", "ouvir emissoras distantes ou fracas, de outras cidades ou países."),
    ("RDS", "dados digitais que a emissora de FM manda junto do som: nome (PS), texto (RT), código da emissora (PI), "
            "tipo de programa (PTY), hora (CT) e frequências alternativas (AF)."),
    ("dBµV", "unidade da força do sinal que chega à antena. Abaixo de 20 é fraco; acima de 50, forte."),
    ("AGC", "controle automático de ganho: o rádio reduz a própria amplificação quando o sinal é forte, para não saturar."),
    ("Squelch", "cala o áudio quando não há sinal, para você não ouvir chiado."),
    ("Softmute", "abaixa o volume aos poucos quando o sinal piora."),
    ("Ruído da tela", "cada atualização da tela gera interferência elétrica que o sintonizador capta. Por isso várias opções "
                      "falam em atualizar menos a tela."),
]


def D(faz, util="", *quando, tag=None, obs=""):
    return {"faz": faz, "util": util, "quando": [list(q) for q in quando], "tag": tag, "obs": obs}


def S(t):
    return ("Vale a pena se", t)


def N(t):
    return ("Não vale a pena se", t)


def U(rotulo, t):
    return (rotulo, t)


# ---------------------------------------------------------------- conceitos dos dois firmwares
def modelo(portatil_toque, outros):
    return D(f"Diz ao firmware em que tipo de rádio ele está rodando: {outros}.",
             "O mesmo firmware roda em montagens diferentes. O modelo liga ou desliga o toque, a leitura da bateria "
             "e funções que só existem em cada tipo.",
             U(f"Use {portatil_toque}", "no DP-666, que é o que vem de fábrica."),
             U("Mude só se", "outro modelo foi escolhido por engano e o toque ou a bateria pararam de funcionar."),
             tag="padrao")


def squelch(on, off, auto, oficial=False):
    return D(f"O squelch cala o áudio quando não há sinal útil, para você não ouvir chiado entre as emissoras. "
             f"{on} usa o botão SQL do rádio. {auto} decide sozinho pela qualidade do sinal.",
             "Deixa a busca e a troca de emissoras mais confortáveis: o som só abre quando há emissora.",
             U(f"Use {on} se", "quer escolher o limiar girando o botão SQL."),
             U(f"Use {auto} se", "quer silêncio entre as emissoras sem ajustar nada."),
             U(f"Use {off} se", "procura emissoras fracas: qualquer squelch pode calar um sinal que você ainda entenderia."),
             tag="dx",
             obs="No Auto, o critério é o mesmo da Sensibilidade da varredura do FM e do AM." if oficial else "")


def fm_agc(maximo):
    return D("Define a partir de que força de sinal o rádio começa a reduzir a própria amplificação no FM.",
             "Amplificação alta ouve sinais fracos, mas emissoras muito fortes podem saturar a entrada e criar "
             "estações fantasmas: misturas que aparecem em frequências onde não há emissora.",
             U(f"Use {maximo} se", "está longe das torres ou procura sinais fracos. É o ajuste mais sensível."),
             U("Baixe para 87 ou 84 se", "mora perto de transmissores fortes, usa antena externa e ouve emissoras "
                                          "fantasmas ou chiado de mistura."),
             tag="dx")


def am_agc():
    return D("O mesmo que o FM AGC, no AM e nas ondas curtas: a força de sinal a partir da qual o rádio reduz a "
             "própria amplificação.",
             "Evita que uma emissora de AM muito forte sature a entrada e apareça em outras frequências.",
             U("Deixe no padrão se", "não percebe problemas."),
             U("Baixe se", "uma emissora forte da cidade aparece espalhada em várias frequências ou abafa as outras."),
             tag="dx")


def bandas_fm(fm, outra, nome_outra):
    return D(f"Escolhe quais faixas de FM o botão BAND percorre: {fm}, {outra} ou as duas.",
             "Tirar do ciclo uma faixa que você não usa economiza toques no BAND.",
             U(f"No Brasil, use só {fm}:", f"com as bordas em 76,1 e 108 MHz, o FM estendido já está dentro dele. {nome_outra}"),
             tag="gosto")


def spi(valores, auto, oficial=False):
    extra = ("Teste valores fixos se", "ouvir apitos numa frequência do FM estendido ou do AM: fora de 87,5 a 108 MHz, "
             "o Auto usa sempre a mesma velocidade.") if oficial else \
            ("Teste outros valores se", "ouvir apitos que somem quando a tela para de se atualizar.")
    return D(f"Muda a velocidade da comunicação entre o processador e a tela ({valores}). "
             f"Em {auto}, o rádio escolhe a velocidade conforme a frequência sintonizada.",
             "Cada atualização da tela gera ruído elétrico, que pode cair em cima de uma emissora como um apito. "
             "Mudando a velocidade, esse ruído muda de lugar.",
             U(f"Use {auto}", "no dia a dia: uma tabela escolhe a velocidade de cada frequência do FM." if oficial
               else "no dia a dia."),
             U(*extra),
             tag="padrao")


def volume(faixa):
    return D(f"Ganho interno de áudio do sintonizador ({faixa}), aplicado antes do botão de volume.",
             "Existe para rádios montados sem botão de volume. No DP-666, que tem botão, só muda o nível de base.",
             U("Deixe em 0 dB", "na maioria dos casos: ganho demais distorce, e de menos obriga a girar mais o volume."),
             tag="padrao")


def mpx(stereo):
    return D("No modo MPX, o canal esquerdo sai mono e o direito leva o sinal completo da emissora, com o piloto "
             "estéreo e o RDS.",
             "Permite analisar o sinal no computador, ligando a saída de fone a uma placa de som e usando programas "
             "de MPX ou de RDS.",
             U(f"Use {stereo}", "para ouvir normalmente."),
             U("Use MPX só se", "for analisar o sinal. No fone, o lado direito vira um ruído."),
             tag="especial")


def estereo(off):
    return D("Abaixo desta força de sinal, o rádio reduz a separação estéreo e caminha para o mono.",
             "O estéreo precisa de bem mais sinal que o mono para soar limpo. Com sinal fraco, o mono tira boa parte "
             "do chiado.",
             U("Use perto de 40 dBµV se", "ouve emissoras fracas ou distantes e o chiado incomoda."),
             U(f"Deixe em {off} se", "só ouve emissoras fortes da sua cidade."),
             tag="ajuste")


def highcut_freq():
    return D("Quando o corte de agudos entra, ele atenua o som acima desta frequência.",
             "O chiado de sinal fraco fica nos agudos. Cortá-los deixa a voz mais limpa, com o som mais abafado.",
             U("Baixe, para perto de 3000 Hz, se", "quer o máximo de redução de chiado em sinais muito fracos."),
             U("Deixe alto se", "prefere o som mais aberto."),
             tag="dx")


def highcut_lim(off):
    return D("Abaixo desta força de sinal, o corte de agudos entra.",
             "Liga o corte de agudos só quando o sinal está fraco, sem mexer no som das emissoras boas.",
             U("Use de 30 a 40 dBµV se", "ouve emissoras fracas e o chiado incomoda."),
             U(f"Deixe em {off} se", "prefere ouvir tudo como chega, inclusive para reconhecer uma emissora pelo som."),
             tag="dx")


def desenfase(c50, c75, off):
    return D("A emissora reforça os agudos ao transmitir (pré-ênfase), e o rádio os corta na mesma medida ao "
             "receber. O som volta ao natural e o chiado cai.",
             "O valor precisa ser o mesmo da emissora. Se for maior, o som fica abafado; se for menor ou desligado, "
             "fica estridente e com mais chiado.",
             U(f"Use {c50}", "no Brasil, que segue o padrão europeu."),
             U(f"Use {c75} só se", "estiver nos Estados Unidos ou em outro país que use esse padrão."),
             U(f"Use {off} só se", "for analisar o sinal: para ouvir, o som fica estridente."),
             tag="ajuste")


def brilho():
    return D("Brilho da tela, de 1 a 100%.",
             "Menos brilho gasta menos bateria e incomoda menos no escuro.",
             U("Baixe se", "ouve à noite ou quer que a bateria dure mais."),
             U("Suba se", "usa o rádio ao ar livre, no sol."),
             tag="gosto")


def protecao(tempos):
    return D(f"Depois de {tempos} segundos sem uso, a tela apaga ou escurece.",
             "Economiza bateria e tira o ruído elétrico da tela enquanto você só ouve, o que ajuda com sinais fracos.",
             S("você ouve sem olhar a tela, por exemplo na cama."),
             N("quer acompanhar o RDS e o relógio o tempo todo."),
             tag="gosto")


def tema(n):
    return D(f"Esquema de cores da interface. São {n} temas.", "", U("Dica:", "temas escuros cansam menos a vista à noite."),
             tag="gosto")


def fonte():
    return D("Fonte dos números grandes da frequência.", tag="gosto")


def rds_erros(oficial):
    if oficial:
        faz = ("Define quantos erros o rádio aceita nos dados de RDS: Desligado aceita só blocos perfeitos, Pequeno "
               "aceita erros pequenos corrigidos e Grande aceita até erros grandes corrigidos.")
        q = (U("Use Pequeno", "no dia a dia: é o equilíbrio entre rapidez e acerto."),
             U("Use Grande se", "procura emissoras fracas e quer ver o RDS mesmo com letras trocadas."),
             U("Use Desligado se", "só quer dados confiáveis, por exemplo para registrar uma emissora."))
        obs = ""
    else:
        faz = ("Define quantos erros o rádio aceita nos dados de RDS: Small aceita erros pequenos corrigidos, Large "
               "aceita erros maiores e All aceita tudo.")
        q = (U("Use Small", "no dia a dia: é o equilíbrio entre rapidez e acerto."),
             U("Use Large ou All se", "procura emissoras fracas e quer ver o RDS mesmo com letras trocadas."))
        obs = "Explicação do código-base; o manual do Mod17 só lista os valores."
    return D(faz, "Com sinal fraco, quase nenhum bloco de dados chega perfeito. Aceitar mais erros mostra o nome e o "
                  "texto mais cedo, com mais risco de letra errada.", *q, tag="dx", obs=obs)


def regiao(europa, eua):
    return D("Ajusta o RDS à região: a tabela de tipos de programa (PTY) e, nos Estados Unidos e no Canadá, a "
             "conversão do código da emissora em prefixo, como KXYZ.",
             "A tabela europeia e a americana dão nomes diferentes ao mesmo número: o tipo 5 é Educação na Europa e "
             "Rock nos Estados Unidos. Na região errada, o tipo de programa aparece trocado.",
             U(f"Use {europa}", "no Brasil: o RDS brasileiro segue o modelo europeu."),
             U(f"Use {eua} ou Canadá", "só nesses países."),
             tag="ajuste")


def sublinhado(ps_only, on):
    return D(f"Troca os espaços por sublinhado: só no nome da emissora ({ps_only}) ou também no texto ({on}).",
             "Mostra exatamente quantos espaços a emissora manda, o que ajuda a diferenciar nomes parecidos e a "
             "registrar o nome do jeito exato.",
             S("você registra emissoras distantes e quer copiar o nome certinho."),
             N("só quer ler o nome e o texto: os sublinhados poluem a tela."),
             tag="dx")


def rds_filtro(on):
    return D("Passa os dados de RDS por um filtro com memória antes de mostrar.",
             "O nome e o texto ficam mais estáveis, com menos letras trocadas em sinal fraco, ao custo de um pouco "
             "de demora.",
             U(f"Deixe em {on}", "no dia a dia."),
             U("Desligue se", "quer ver os dados crus, o mais rápido possível, aceitando erros."),
             tag="padrao")


def pi_erros():
    return D("Mostra o código PI da emissora mesmo antes de ele chegar sem erros.",
             "O PI identifica a emissora. Em DX, vê-lo cedo, mesmo incerto, ajuda a descobrir quem você está ouvindo.",
             S("você procura emissoras fracas e quer pistas rápidas."),
             N("só quer o PI confirmado, sem chance de engano."),
             tag="dx")


def af(off, reg):
    return D(f"Com o AF ligado, o rádio troca sozinho para outra frequência da mesma emissora quando o sinal piora. "
             f"Com {reg}, só aceita frequências com a mesma programação regional.",
             "Em viagem, mantém a mesma rádio tocando enquanto você passa de uma região para outra.",
             S("você ouve em movimento uma rede que transmite a lista de frequências alternativas."),
             U(f"Use {off} se", "procura emissoras ou faz DX: o rádio pode pular de frequência sem você pedir. "
                                "Sem lista de AF da emissora, a opção não faz nada."),
             tag="ajuste")


def rt_buffer():
    return D("Só mostra o RadioText, o texto que corre na tela, quando ele chega completo, em vez de ir trocando "
             "letra por letra.",
             "Evita ver a mensagem antiga misturada com a nova enquanto a emissora troca o texto.",
             U("Deixe ligado", "no dia a dia."),
             U("Desligue se", "quer ver o texto aparecer o mais cedo possível em sinal fraco."),
             tag="padrao")


def af_sort():
    return D("Ordena a lista de frequências alternativas (AF) da menor para a maior.",
             "Fica mais fácil ler a lista na tela de AF.", tag="gosto")


def ps_longo():
    return D("Mostra o nome longo da emissora (Long PS), com até 32 caracteres, quando ela transmite.",
             "Aparece o nome completo, em vez das 8 letras do nome comum.",
             U("Deixe ligado:", "só aparece quando a emissora manda, e são poucas que mandam."),
             tag="gosto")


def fast_ps(off, inicial, sempre, oficial=True):
    q = [U(f"Use {inicial}", "no dia a dia: nome rápido ao trocar de emissora e estável depois.")]
    if sempre:
        q.append(U(f"Use {sempre} se", "a emissora troca o nome na tela a cada poucos segundos e você quer acompanhar, "
                                      "aceitando letras erradas em sinal fraco."))
    if off:
        q.append(U(f"Use {off} se", "só quer ver letras confirmadas."))
    return D(f"Mostra as letras do nome da emissora (PS) assim que chegam, sem esperar a confirmação. "
             f"{inicial} faz isso só até o nome completar" + (f"; {sempre}, o tempo todo." if sempre else "."),
             "O nome aparece mais rápido quando você troca de emissora.", *q, tag="gosto",
             obs="" if oficial else "O manual do Mod17 só confirma o valor Initial; a explicação vem do código-base.")


def conversor():
    return D("Soma um valor à frequência mostrada, para quem usa um conversor de RF externo.",
             "Um conversor leva outra faixa, como a de radioamador, para dentro da faixa do rádio. Com o valor certo, "
             "a tela mostra a frequência real.",
             U("Deixe em 0 se", "não usa conversor. Com valor diferente de 0, o rádio desliga o AF."),
             tag="especial")


def borda_baixa(oficial):
    q = [U("No Brasil, use 76,1 MHz", "para cobrir o FM estendido, de 76,1 a 87,3 MHz. Com passo de 200 kHz, a "
                                       "sintonia para só nos canais brasileiros."),
         U("Use 87,5 MHz se", "não quer o FM estendido no caminho do knob.")]
    if oficial:
        q.append(U("Para chegar lá:", "a borda sobe 0,1 MHz num sentido do encoder e desce 1 MHz no outro. De 87,5, "
                                     "desça 12 vezes, até 75,5, e suba 6."))
    return D("Frequência mais baixa da faixa de FM. Ao passar dela, o knob volta para o fim da faixa.",
             "Ajusta a faixa ao seu país e evita passar por frequências sem emissoras.", *q, tag="ajuste")


def borda_alta():
    return D("Frequência mais alta da faixa de FM. Ao passar dela, o knob volta para a borda baixa.", "",
             U("Use 108,0 MHz:", "o último canal brasileiro é o 107,9."), tag="padrao")


def nivel_offset(faixa):
    return D(f"Soma ou subtrai decibéis da leitura de sinal{faixa}.",
             "Compensa um amplificador, um atenuador ou um cabo longo entre a antena e o rádio, para que a leitura "
             "mostre o sinal real da antena. Como o squelch e os limiares usam essa leitura, eles mudam junto.",
             S("você pôs um amplificador ou atenuador na antena e quer leituras comparáveis às de outros ouvintes."),
             U("Deixe em 0 se", "usa só a antena do rádio."),
             tag="especial")


def nivel_baixo(oficial):
    return D("Abaixo desta força de sinal, o rádio acinzenta o medidor de modulação e os rótulos do RDS.",
             "É um aviso visual de que o sinal está fraco demais para confiar no que aparece na tela.",
             U("Deixe no mínimo,", "−15 dBµV, no dia a dia: o aviso quase nunca aparece."),
             U("Suba se", "quer o aviso sempre que o sinal ficar fraco."),
             tag="padrao", obs="" if oficial else "Explicação do código-base.")


def softmute_fm(on, off):
    return D("Abaixa o volume aos poucos quando o sinal enfraquece e o chiado sobe.",
             "Evita rajadas de chiado quando o sinal oscila, por exemplo andando com o rádio.",
             U(f"Use {on} se", "ouve em movimento ou não quer sustos com o chiado."),
             U(f"Use {off} se", "procura emissoras fracas: o softmute abaixa justamente o que você quer ouvir."),
             tag="dx")


def softmute_am(on, off):
    return D("Abaixa o volume aos poucos quando o sinal de AM enfraquece e o ruído sobe.",
             "No AM o ruído é mais áspero, e o softmute deixa a escuta menos cansativa.",
             U(f"Deixe em {on}", "no dia a dia."),
             U(f"Use {off} se", "tenta entender uma emissora fraca à noite: ele abaixa justamente esse sinal."),
             tag="dx")


def noise_blanker(banda):
    if banda == "fm":
        util = "No FM esse ruído incomoda menos que no AM, mas aparece em sinais fracos."
    else:
        util = "No AM e nas ondas curtas esse ruído é comum e pode cobrir a emissora."
    return D("Corta ruídos de impulso: os estalos curtos de motores, cercas elétricas e aparelhos elétricos. "
             "A porcentagem é a força do corte.", util,
             S("você ouve estalos regulares que não vêm da emissora. Comece em 50% e suba aos poucos."),
             N("o ruído é um chiado contínuo: o supressor só age em impulsos e, forte demais, distorce o som."),
             tag="dx")


def passo_fm(c200, c100, c50):
    return D("Quanto a frequência anda a cada clique do knob no FM.",
             "No Brasil, os canais ficam a cada 200 kHz. Com esse passo, cada clique cai numa emissora possível; "
             "com passos menores, sobram cliques em frequências vazias.",
             U(f"Use {c200}", "com a borda baixa em 76,1 MHz, para andar só pelos canais brasileiros."),
             U(f"Use {c100} se", "quer passar também pelos decimais pares, por exemplo procurando emissoras fora da grade."),
             U(f"Use {c50} se", "precisa de ajuste fino, por exemplo para se afastar de uma emissora forte ao lado."),
             tag="ajuste")


def fmsi():
    return D("Liga um processamento que melhora o estéreo em sinais fracos. Só existe nos sintonizadores TEF6687 e "
             "TEF6689.", "",
             U("No DP-666 não faz nada:", "o sintonizador dele é o TEF6686."),
             tag="na")


def sens_busca(banda, faixa, oficial=True):
    extra = (" O Squelch Auto e a Memória automática usam o mesmo critério." if banda == "FM" else
             " O Squelch Auto do AM usa o mesmo critério.") if oficial else ""
    return D(f"Quão exigente a busca é para parar numa emissora de {banda}{faixa}.",
             "Valores maiores param em sinais mais fracos e ruidosos; menores, só em sinais limpos." + extra,
             U("Suba se", "a busca pula emissoras que você consegue ouvir."),
             U("Baixe se", "a busca para em frequências vazias ou só com chiado."),
             tag="dx", obs="" if oficial else "O sentido dos números vem do código-base; confira no seu aparelho.")


def onda_sw():
    return D("Mostra em que faixa de ondas curtas você está, em metros, como 49 m ou 31 m, junto da frequência.",
             "As emissoras de ondas curtas se agrupam nessas faixas, e as listas de horários usam os metros.",
             U("Deixe ligado:", "ajuda a se localizar e não atrapalha."), tag="gosto")


def cochannel(padrao):
    return D("Liga o detector de co-canal: o rádio mostra CO na tela quando percebe duas emissoras na mesma "
             "frequência. O número é a sensibilidade.",
             "À noite, emissoras de AM distantes chegam na mesma frequência das locais e fazem um assobio. O aviso "
             "mostra que a interferência vem de outra emissora, não do rádio.",
             U(f"Deixe em {padrao}", "no dia a dia."),
             U("Suba se", "quer saber de qualquer co-canal, mesmo fraco, aceitando alarmes falsos."),
             tag="dx")


def cochannel_lim():
    return D("Quantas detecções seguidas o detector de co-canal precisa para mostrar CO.",
             "Valores maiores evitam alarmes falsos; menores avisam mais rápido.",
             U("Deixe em 3,", "que é o padrão."), tag="padrao")


def atenuador_am(nome_ganho):
    faz = "Atenua a entrada de AM em 6 a 36 dB."
    if nome_ganho:
        faz += (" O nome fala em ganho porque a ideia é você informar o ganho da sua antena ativa, e o rádio "
                "atenua o mesmo tanto.")
    return D(faz, "Uma antena ativa ou um fio longo podem mandar sinal demais e saturar o rádio: aparecem emissoras "
                  "misturadas e assobios.",
             S("você usa antena ativa ou fio longo e ouve emissoras fantasmas ou distorção."),
             N("você usa a antena telescópica: atenuar só enfraquece o sinal."),
             tag="especial")


def passo_am(c10, c9):
    return D("Quanto a frequência anda a cada clique nas ondas médias: 9 ou 10 kHz.",
             "As Américas usam canais de AM a cada 10 kHz; a Europa, a Ásia e a África, a cada 9 kHz. No passo "
             "errado, a sintonia nunca cai certinho numa emissora.",
             U(f"Use {c10}", "no Brasil."),
             U(f"Use {c9} se", "for ouvir à noite emissoras de outros continentes."),
             tag="ajuste")


def usb():
    return D("Escolhe com qual programa de computador a porta USB conversa: XDR-GTK ou RDS Spy.",
             "O XDR-GTK controla o rádio pelo computador, com espectro e RDS. O RDS Spy decodifica e registra o RDS "
             "em detalhe.",
             U("Use XDRGTK", "para controlar o rádio pelo computador."),
             U("Use RDS Spy", "para estudar o RDS das emissoras."),
             tag="especial")


def wifi():
    return D("Liga o Wi-Fi do rádio.",
             "É preciso para acertar a hora pela internet, mandar dados ao StationList e usar o XDR-GTK pela rede.",
             S("você vai usar a internet ou a rede."),
             N("não vai usar: o Wi-Fi gasta bateria e, no DP-666, faz sumir a leitura da bateria enquanto está ligado."),
             tag="especial")


def wifi_config():
    return D("Abre o assistente que conecta o rádio a uma rede.",
             "Depois de configurado, o rádio se conecta sozinho sempre que o Wi-Fi está ligado.",
             U("Atenção:", "só funciona com redes de 2,4 GHz."), tag="especial")


def stationlist_ip(texto):
    return D(texto, "O rádio manda para esse computador os dados da emissora sintonizada, para montar listas e "
                    "registros no programa StationList.",
             U("Ignore se", "não usa o StationList."), tag="especial")


def stationlist_id():
    return D("Número deste rádio no StationList.", "Diferencia os rádios quando mais de um manda dados para o mesmo "
                                                    "computador.",
             U("Ignore se", "tem um rádio só."), tag="especial")


def canais_mem(only, exclude):
    return D(f"Em {only}, a varredura passa só pelas memórias do intervalo. Em {exclude}, varre a faixa toda e pula "
             f"as frequências gravadas nesse intervalo.",
             f"{exclude} é ótimo para DX: grave as emissoras da sua cidade e a varredura só para em frequências novas.",
             U(f"Use {only} se", "quer vigiar uma lista de frequências escolhidas."),
             U(f"Use {exclude} se", "quer achar emissoras novas, sem parar nas que já conhece."),
             tag="dx")


def cancelar(off, pi, sinal, oficial=True):
    return D(f"Faz a varredura parar sozinha: ao decodificar o código de uma emissora ({pi}) ou ao achar sinal "
             f"({sinal}). {off} nunca para.",
             "Você deixa a varredura rodando, e ela para quando aparece algo.",
             U(f"Use {pi} se", "quer parar só em emissoras identificáveis."),
             U(f"Use {sinal} se", "quer parar em qualquer sinal" + (", com o limiar da Sensibilidade da varredura do FM."
                                                                    if oficial else ".")),
             U(f"Use {off} se", "quer que a varredura continue e só registre."),
             tag="dx")


def espera_sinal(on):
    return D("Usa o tempo de espera só nas frequências com sinal; nas vazias, a varredura segue na hora.",
             "A varredura fica bem mais rápida sem perder emissoras.",
             U(f"Deixe em {on}", "no dia a dia."), tag="padrao")


def calibrar_toque():
    return D("Abre a calibração do toque: você toca nos pontos indicados na tela.",
             "Corrige toques que caem fora do lugar.",
             U("Use quando", "o toque ficar impreciso ou depois de uma reposição de fábrica."), tag="especial")


def inverter_knob():
    return D("Inverte o sentido do knob: girar para a direita passa a descer a frequência, e vice-versa.",
             "Encoders de montagens diferentes giram ao contrário; isto acerta o sentido.",
             S("girar para a direita estiver descendo a frequência."), tag="padrao")


# ---------------------------------------------------------------- linha oficial (nome no rádio)
OFICIAL = {
    "Seletor de modelo": modelo("Toque portátil", "de mesa (Básico), portátil com bateria (Portátil) ou portátil com "
                                                  "tela de toque (Toque portátil)"),
    "Inverter rotação": D("Inverte o sentido do encoder: girar para a direita passa a descer a frequência, e vice-versa.",
                          "Encoders de montagens diferentes giram ao contrário. A compilação para o DP-666 já vem "
                          "invertida, para que a direita suba a frequência.",
                          S("girar para a direita estiver descendo a frequência."),
                          U("Atalho:", "segurar o BW ao ligar o rádio também inverte o sentido."), tag="padrao"),
    "Codificador óptico": D("Muda a contagem de pulsos do encoder para o padrão dos encoders ópticos.",
                            "Encoders ópticos geram pulsos de outro jeito. No DP-666, que sai de fábrica com o modo "
                            "comum, ligar isto deixa o knob irregular e sem aceleração.",
                            U("Deixe desligado", "no DP-666."), tag="padrao"),
    "Inverter cores": D("Inverte as cores da tela, como um negativo de foto.",
                        "Alguns painéis de tela vêm com a lógica de cor invertida, e isto corrige a imagem.",
                        S("as cores aparecerem trocadas."), N("a tela está normal, como no DP-666."), tag="padrao"),
    "ARS display": D("Muda o tamanho, a orientação e a ordem das cores da tela para o painel de outra montagem (ARS).",
                     "Existe para rádios com outro tipo de tela.",
                     U("Deixe desligado no DP-666:", "ligado, a imagem sai girada ou com as cores trocadas."), tag="na"),
    "Medidor analógico": D("Põe o ponteiro de um medidor de sinal analógico no fim da escala, para você ajustá-lo.",
                           "Algumas montagens caseiras têm um medidor de ponteiro. O DP-666 não tem.",
                           U("Ignore:", "no DP-666 não há o que calibrar."), tag="na"),
    "Reposição de fábrica": D("Volta todos os ajustes ao padrão de fábrica e apaga as 99 memórias. O rádio pede "
                              "confirmação.",
                              "Resolve comportamentos estranhos depois de uma atualização ou de mexer em muitos ajustes.",
                              U("Use quando", "o rádio estiver se comportando mal e você não souber qual ajuste causou."),
                              U("Antes,", "anote as memórias que quer manter: elas serão apagadas."), tag="especial"),
    "Parar tela de despertar ao sintonizar": D(
        "Com a proteção de tela ativa, girar o knob passa a sintonizar sem acender a tela. Desligado, o primeiro "
        "giro só acorda a tela.",
        "Dá para trocar de emissora no escuro sem acender a tela, que gasta bateria e gera ruído captado pelo rádio.",
        S("você ouve à noite ou quer o mínimo de ruído da tela em sinais fracos."),
        N("você quer ver a frequência enquanto sintoniza."), tag="gosto"),
    "Desligamento automático": D(
        "Põe o rádio em espera depois de 15, 30, 60 ou 90 minutos sem você tocar em nada.",
        "Funciona como timer para dormir: se você pegar no sono ouvindo, a bateria não acaba.",
        S("você ouve na cama ou costuma esquecer o rádio ligado."),
        N("você ouve por horas sem mexer no rádio, por exemplo gravando um programa: ele desliga no meio."),
        tag="gosto"),
    "Usar squelch": squelch("Ligado", "Desligado", "Auto", oficial=True),
    "FM AGC": fm_agc("92 dBµV"),
    "AM AGC": am_agc(),
    "Selecionar faixa FM": bandas_fm("FM", "OIRT", "A OIRT, de 65,8 a 74 MHz, é uma faixa do Leste Europeu e não tem "
                                                   "emissoras no Brasil."),
    "Selecionar faixa AM": D("Escolhe quais faixas de AM o botão BAND percorre: LW (ondas longas), AM (ondas médias) e "
                             "SW (ondas curtas).",
                             "Tirar do ciclo uma faixa que você não usa economiza toques no BAND.",
                             U("No Brasil, AM e SW bastam:", "não há emissoras de ondas longas nas Américas."),
                             U("Deixe só AM se", "você não ouve ondas curtas."), tag="gosto"),
    "Pressione o botão banda por 5 seg.": D(
        "Define o que acontece ao segurar o BAND: pôr o rádio em espera (Desligar), apagar só a tela (Tela "
        "desligada) ou nada (Inativo).",
        "Apagar a tela com o rádio tocando economiza bateria e tira o ruído da tela. É ótimo para ouvir na cama ou "
        "caçar sinais fracos.",
        U("Use Tela desligada se", "quer um atalho para ouvir com a tela apagada. Gire o knob para acendê-la."),
        U("Use Inativo se", "costuma segurar o BAND sem querer."), tag="gosto"),
    "Velocidade dinâmica de SPI": spi("10 a 60 MHz", "Auto", oficial=True),
    "Definir volume": volume("de −10 a +10 dB"),
    "Sinais sonoros": D("Liga sons de navegação: bipes no menu, no fim da faixa e ao gravar no logbook. Em Ligado + "
                        "morse, números e letras também tocam em código Morse.",
                        "Foi pensado para quem não enxerga ou enxerga pouco usar o rádio só pelo som.",
                        S("você usa o rádio sem olhar a tela ou quer confirmação sonora."),
                        N("você ouve em silêncio ou grava o áudio: os bipes entram na gravação."), tag="gosto"),
    "Saída de áudio": mpx("Stereo"),
    "Limiar de separação estéreo": estereo("Desligado"),
    "Frequência do canto de corte alto": highcut_freq(),
    "Definir limiar de corte alto": highcut_lim("Desligado"),
    "Desênfase FM": desenfase("50 µs", "75 µs", "Desligado"),
    "Idioma": D("Idioma do menu. Há português.", "",
                U("Dica:", "se trocar sem querer para um idioma que não lê, o Idioma é o primeiro item deste grupo."),
                tag="gosto"),
    "Definir brilho da tela": brilho(),
    "Medidor de modulação": D("Liga a barra que mostra a modulação da emissora, ou seja, o volume do som transmitido.",
                              "Desligada, a tela se redesenha menos e gera menos ruído elétrico, o que ajuda com "
                              "sinais fracos.",
                              S("você quer comparar o volume das emissoras."),
                              N("você procura sinais fracos: a wiki recomenda desligar para reduzir a interferência "
                                "da tela."), tag="dx"),
    "Proteção de tela": protecao("3, 10, 30 ou 60"),
    "Opções de proteção de tela": D("Define o que a proteção de tela faz: apagar a tela ou deixá-la com 1%, 25% ou 50% "
                                    "de brilho.",
                                    "Escurecer mantém a informação legível; apagar economiza mais.",
                                    U("Use Desligar a tela se", "quer o máximo de bateria e de silêncio."),
                                    U("Use 1% ou 25% se", "quer espiar a frequência e o RDS no escuro."), tag="gosto"),
    "Opções de bateria": D("Mostra a bateria em volts, em porcentagem ou não mostra.",
                           "A tensão é a leitura direta; a porcentagem é uma estimativa feita a partir dela.",
                           U("Use voltagem se", "quer precisão: cheia fica perto de 4,2 V, quase vazia perto de 3,3 V."),
                           U("Use porcentagem se", "prefere uma leitura simples."),
                           U("Saiba que", "com o Wi-Fi ligado a leitura some: é uma limitação do ESP32."), tag="gosto"),
    "Unidade de medidor de sinal": D("Unidade em que o rádio mostra a força do sinal.",
                                     "O dBµV é a unidade dos outros ajustes do menu, como o AGC e os limiares, e a "
                                     "mais usada por quem faz DX. O dBf aparece em fichas técnicas americanas; o dBm, "
                                     "em instrumentos de medição.",
                                     U("Use dBµV", "para comparar com os limiares do menu e com relatos de outros "
                                                  "ouvintes."), tag="padrao"),
    "Mostrar relógio": D("Mostra a hora na tela quando o rádio tem a hora certa, recebida pelo RDS ou pela internet.",
                         "", U("Fica escondido", "até o rádio receber a hora."), tag="gosto"),
    "Tema": tema(17),
    "Fonte de frequência": fonte(),
    "Rodar ecrã 180°": D("Gira a imagem da tela de cabeça para baixo.",
                         "Serve para montagens com a tela instalada ao contrário. A compilação para o DP-666 já vem "
                         "girada do jeito certo.",
                         U("Deixe ligado no DP-666:", "desligado, a imagem fica de cabeça para baixo. Segurar o MODE "
                                                       "ao ligar faz o mesmo."), tag="padrao"),
    "Teclado frequência": D("Liga o teclado numérico na tela, para digitar a frequência.",
                            "É o jeito mais rápido de ir a uma frequência distante, sem girar o knob.",
                            N("você toca na tela sem querer e o teclado atrapalha."), tag="gosto"),
    "Calibração da tela de toque": calibrar_toque(),
    "Mostrar erros RDS": rds_erros(True),
    "Região": regiao("Europa", "Estados Unidos"),
    "Mostrar sublinhado no RDS": sublinhado("PS apenas", "Ligado"),
    "Filtro RDS": rds_filtro("Ligado"),
    "Mostrar erros PI": pi_erros(),
    "Usar AF": af("Desligado", "REG ligado"),
    "Buffering RT": rt_buffer(),
    "Classificar AF automaticamente": af_sort(),
    "PS rápido": fast_ps("Desligado", "Inicial", "Sempre"),
    "Mostrar PS longo": ps_longo(),
    "Definir deslocamento do conversor": conversor(),
    "Definir borda da faixa baixa": borda_baixa(True),
    "Definir borda da faixa alta": borda_alta(),
    "Definir deslocamento de nível": nivel_offset(""),
    "Definir limiar de nível baixo": nivel_baixo(True),
    "Silenciamento suave FM": softmute_fm("Ligado", "Desligado"),
    "Supressor de ruído FM": noise_blanker("fm"),
    "Passo padrão FM": passo_fm("200 kHz", "100 kHz", "50 kHz"),
    "FMSI melhoria do som estéreo": fmsi(),
    "Sensibilidade da varredura@Configurações FM": sens_busca("FM", ", de 1 a 30"),
    "Silenciamento suave AM": softmute_am("Ligado", "Desligado"),
    "Supressor de ruído AM": noise_blanker("am"),
    "Deslocamento de nível de RF AM": nivel_offset(" no AM"),
    "Mostrar comprimento de onda SW": onda_sw(),
    "Detector CoChannel": cochannel("100%"),
    "Limiar do CoChannel Det": cochannel_lim(),
    "AM Ganho da antena": atenuador_am(True),
    "Tamanho padrão da etapa AM": passo_am("10 kHz", "9 kHz"),
    "Sensibilidade da varredura@Configurações AM": sens_busca("AM", ", de 1 a 30"),
    "Modo USB": usb(),
    "Wi-Fi": wifi(),
    "Configurar Wi-Fi": wifi_config(),
    "IP do cliente da lista de estações": stationlist_ip("Último número do IP do computador que roda o StationList, "
                                                         "na mesma rede do rádio."),
    "ID da lista de estações": stationlist_id(),
    "Tela mudo na conexão XDRGTK": D("Apaga a tela do rádio enquanto o XDR-GTK está conectado.",
                                     "Você já vê tudo no computador. Com a tela apagada, o rádio gasta menos e gera "
                                     "menos ruído.",
                                     S("você usa o XDR-GTK para caçar emissoras."),
                                     N("quer olhar o rádio e o computador ao mesmo tempo."), tag="especial"),
    "Definir deslocamento de tempo NTP": D("Fuso horário aplicado à hora que vem da internet, que chega no horário "
                                           "universal (UTC).",
                                           "Sem o fuso certo, o relógio fica algumas horas adiantado ou atrasado.",
                                           U("Use GMT −3", "no horário de Brasília. Amazonas e Mato Grosso usam GMT −4, "
                                                          "e o Acre, GMT −5."), tag="ajuste"),
    "DST automático no horário NTP": D("Adianta o relógio em 1 hora no horário de verão, pela regra europeia: do "
                                       "último domingo de março ao último domingo de outubro.",
                                       "Serve para países com horário de verão. O Brasil não tem desde 2019.",
                                       U("No Brasil, desligue:", "ligado, o relógio fica 1 hora adiantado de março a "
                                                                 "outubro."), tag="ajuste"),
    "Modo de relógio": D("Mostra o relógio em 24 h ou 12 h.", tag="gosto"),
    "PI bloqueado CT sync": D("Ao ligar, o rádio passa a aceitar a hora do RDS só da emissora sintonizada naquele "
                              "momento, identificada pelo código PI.",
                              "Algumas emissoras mandam a hora errada. Travando numa emissora de confiança, o relógio "
                              "não muda quando você sintoniza outra.",
                              S("você acerta a hora pelo RDS e conhece uma emissora com a hora certa. Ligue com ela "
                                "sintonizada."),
                              N("você acerta a hora pela internet."), tag="gosto"),
    "Comece a pesquisar DX": D("Começa a varredura de DX: o rádio passa pelas memórias escolhidas, ou pela faixa, "
                               "procurando emissoras distantes.",
                               "Automatiza a procura, para o tempo escolhido em cada frequência e pode registrar "
                               "sozinho o que encontrar.",
                               U("Atalho:", "fora do menu, aperte MODE até aparecer MEM e depois BAND. Durante a "
                                            "varredura, MEM pisca."), tag="dx"),
    "Comece a pesquisar canais de memória": D("Primeira memória do intervalo da varredura.", "",
                                              U("Saiba que", "só entram memórias de FM e OIRT."), tag="dx"),
    "Pare de pesquisar canais de memória": D("Última memória do intervalo da varredura.", tag="dx"),
    "Tempo de espera": D("Quanto tempo o rádio fica em cada frequência antes de seguir: 0,5 s ou de 1 a 30 s.",
                         "Mais tempo dá chance de o RDS de uma emissora fraca chegar; menos tempo varre mais rápido.",
                         U("Use de 3 a 5 s se", "quer identificar as emissoras pelo RDS."),
                         U("Use 0,5 a 1 s se", "quer só uma passada rápida para ver o que tem sinal."), tag="dx"),
    "Canais memorizados": canais_mem("Apenas", "Excluir"),
    "Cancelar automatic. a pesquisa": cancelar("Desligado", "PI correto", "Sinal"),
    "Mudo áudio enquanto procura": D("Deixa o áudio mudo durante a varredura.", "Evita o chiado entre as frequências.",
                                     S("você deixa a varredura rodando e confere o logbook depois."),
                                     N("quer ouvir o que passa."), tag="gosto"),
    "Registrador automático": D("Grava sozinho no logbook as emissoras com PI correto achadas na varredura.",
                                "Você volta depois e vê o que foi ouvido, com frequência e código.",
                                S("você deixa a varredura rodando sem acompanhar."),
                                N("prefere registrar só o que confirmar de ouvido."), tag="dx"),
    "Espera tempo apenas quando sinal": espera_sinal("Ligado"),
    "Limpar livro de registro": D("Apaga o logbook inteiro.", "",
                                  U("Antes,", "exporte o logbook se quiser guardá-lo."), tag="especial"),
    "Iniciar memória automática": D("Varre a faixa de 100 em 100 kHz e grava nas memórias as emissoras que passam no "
                                    "critério da Sensibilidade da varredura.",
                                    "Preenche as memórias da sua cidade em poucos minutos.",
                                    U("Antes,", "escolha a faixa e o intervalo de memórias abaixo: as memórias do "
                                                "intervalo são sobrescritas."), tag="especial"),
    "Iniciar frequência": D("Início da busca da memória automática.", "",
                            U("No Brasil,", "use 76,1 MHz para incluir o FM estendido."), tag="especial"),
    "Parar frequência": D("Fim da busca da memória automática.", tag="especial"),
    "Iniciar canal de memória": D("Primeira posição que a memória automática pode gravar.",
                                  "Separar um intervalo protege as memórias que você montou à mão.", tag="especial"),
    "Parar canal de memória": D("Última posição que a memória automática pode gravar.", tag="especial"),
    "Somente armazenar com RDS": D("Só grava as emissoras em que o rádio detectou RDS.",
                                   "Evita gravar frequências com ruído ou com reflexos de emissoras fortes.",
                                   N("você quer incluir emissoras sem RDS: nem toda emissora transmite."), tag="gosto"),
    "Prevenir PI duplo": D("Não grava uma emissora cujo código PI já está na memória: Intervalo compara com as "
                           "memórias do intervalo; Completo, com as 99.",
                           "Redes que transmitem a mesma rádio em várias frequências não ocupam várias memórias.",
                           S("na sua região há retransmissoras da mesma rede."),
                           N("você quer gravar todas as frequências, inclusive as repetidas."), tag="gosto"),
    "Sensibilidade da varredura@Memória automática": D(
        "É o mesmo ajuste de Configurações FM → Sensibilidade da varredura: decide quão fraco pode ser o sinal para a "
        "memória automática gravar.", "", U("Suba se", "a memória automática deixa de fora emissoras que você ouve."),
        U("Baixe se", "ela grava frequências vazias."), tag="dx"),
    "Limpar canais de memória": D("Apaga as memórias.", "", U("Antes,", "anote as que quer guardar."), tag="especial"),
    "Sobre o software": D("Mostra os créditos de quem desenvolveu o firmware."),
}

# ---------------------------------------------------------------- Megatron Mod17 (nome no rádio)
LP = D("Escolhe o que o toque longo nesta tecla faz: travar as teclas, a função original, abrir o menu, o teclado, "
       "a página de atalhos, o RDS avançado ou a tela de AF.",
       "Dá para deixar nas teclas os atalhos que você mais usa.",
       U("Dica:", "Lock&Unlock trava as teclas, bom para levar o rádio ligado na bolsa."), tag="gosto")

MOD17 = {
    "System usage mode": D("Simple mode esconde as opções avançadas do menu; Advanced mode mostra todas.",
                           "O modo simples evita que iniciantes mexam no que não conhecem. Muitas opções, inclusive as "
                           "da lista do Brasil, só aparecem no avançado.",
                           U("Use Advanced mode", "para configurar o rádio para o Brasil e para DX."),
                           U("Para ligar,", "a DEEPELEC orienta passar o idioma para 简体中文, escolher 高级模式 em "
                                            "主要设置 → 系统使用模式 e voltar para English."), tag="ajuste"),
    "Model selector": modelo("Portable touch", "de mesa (Base), portátil com bateria (Portable) ou portátil com tela "
                                               "de toque (Portable touch)"),
    "Set FM band": bandas_fm("FM", "FML", "FML é a faixa baixa escolhida em Set FML band."),
    "Set AM band": D("Escolhe quais faixas de AM o botão BAND percorre: LW, MW, SW e AIR.",
                     "Tirar do ciclo uma faixa que você não usa economiza toques no BAND.",
                     U("No Brasil, MW e SW bastam:", "não há ondas longas nas Américas, e a faixa AIR só funciona com "
                                                     "um conversor externo."), tag="gosto"),
    "Screensaver": protecao("3, 10, 30 ou 60"),
    "Set first page": D("Escolhe a tela que aparece ao ligar o rádio.",
                        "Se você sempre começa pelo teclado ou pela tela de RDS, economiza um passo.", tag="gosto"),
    "Power Off timer": D("Desliga o rádio sozinho depois do tempo escolhido, de 1 a 480 minutos.",
                         "Funciona como timer para dormir e evita gastar a bateria se você esquecer o rádio ligado.",
                         S("você ouve na cama."),
                         N("você ouve por horas seguidas, por exemplo gravando: confira se ele não desliga no meio."),
                         tag="gosto"),
    "Keep BAND key 3 sec.": D("Define o que acontece ao segurar o BAND por 3 s: desligar (Power off), apagar só a tela "
                              "(Mute screen) ou nada (Disable).",
                              "Mute screen é um atalho para ouvir com a tela apagada, o que economiza bateria e tira o "
                              "ruído da tela.",
                              U("Use Mute screen se", "quer esse atalho para ouvir no escuro."),
                              U("Use Disable se", "costuma segurar o BAND sem querer."), tag="gosto"),
    "Dynamic SPI speed": spi("de 5 a 70 MHz", "Auto"),
    "Auto still screen": D(
        "Depois do tempo de Still screen timer sem uso, a tela congela: continua acesa, mostrando a última imagem, mas "
        "para de se atualizar. Quando você mexe no rádio, ela volta ao normal.",
        "Cada atualização da tela, como o medidor de sinal, o RDS e o relógio, gera ruído elétrico que o sintonizador "
        "capta. Com a tela parada, esse ruído some sem você perder a frequência de vista, ao contrário da proteção de "
        "tela, que apaga tudo.",
        S("você ouve emissoras fracas, principalmente no AM e nas ondas curtas, e percebe chiado ou apitos que mudam "
          "quando a tela se mexe."),
        N("você quer acompanhar o RDS, o medidor de sinal e o relógio: com a tela parada, eles não mudam."),
        U("Para economizar bateria,", "ajuda pouco: a tela continua acesa, e o que mais gasta nela é a luz de fundo. "
                                      "Baixe o brilho ou use a proteção de tela."),
        tag="dx", obs="O manual não diz para que serve; a explicação vem de como o rádio funciona."),
    "Still screen timer": D("Quantos segundos sem uso até a tela congelar, de 0 a 120.",
                            "Tempo curto congela logo depois de você sintonizar; tempo longo dá para ler o RDS antes.",
                            U("Use de 10 a 30 s", "para ler o nome da emissora antes de a tela parar."), tag="dx"),
    "Power off": D("Desliga o rádio pelo menu. Para ligar de novo, aperte o BW.", tag="especial"),
    "Set volume": volume("de −60 a +24 dB"),
    "Audio output": mpx("Stereo"),
    "Stereo threshold": estereo("Off"),
    "High cut corner": highcut_freq(),
    "High cut threshold": highcut_lim("Off"),
    "Use squelch": squelch("On", "Off", "Auto"),
    "FM deemphasis": desenfase("50us", "75us", "Off"),
    "Beep at band edge": D("Toca um bipe quando a sintonia passa do fim da faixa e volta ao começo.",
                           "Avisa que você deu a volta na faixa sem precisar olhar.",
                           N("você ouve em silêncio ou grava o áudio."), tag="gosto"),
    "Beep at operation": D("Toca um bipe a cada botão ou giro do knob.", "Confirma cada comando pelo som.",
                           N("você ouve em silêncio ou grava o áudio: os bipes entram na gravação."), tag="gosto"),
    "Language": D("Idioma do menu: inglês ou chinês simplificado.", "",
                  U("Dica:", "o chinês também é o caminho para ligar o Advanced mode. Depois, volte para English."),
                  tag="gosto"),
    "Brightness": brilho(),
    "Theme": tema(15),
    "Frequency font": fonte(),
    "Meter refresh interval": D("De quanto em quanto tempo o medidor de sinal se atualiza, de 30 a 1000 ms.",
                                "Atualizar menos vezes gera menos ruído da tela e deixa a leitura mais calma; mais "
                                "vezes mostra variações rápidas, como o sinal subindo e descendo.",
                                U("Aumente se", "procura sinais fracos e quer menos ruído da tela."),
                                U("Diminua se", "quer ver o sinal reagir rápido, por exemplo ao apontar a antena."),
                                tag="dx"),
    "Meter display style": D("Visual do medidor de sinal: Classic ou New.", tag="gosto"),
    "Set UI round": D("Escolhe onde a interface usa cantos arredondados: menu, botões, ícones ou bordas.", tag="gosto"),
    "Menu display style": D("Layout do menu: o novo, na vertical ou na horizontal, ou o clássico.", tag="gosto"),
    "Show notification": D("Mostra avisos na tela, como hora sincronizada ou ajustes salvos.", "",
                           N("os avisos atrapalham a leitura do RDS."), tag="gosto"),
    "Notification mode": D("Onde os avisos aparecem: numa barra discreta (Message bar), numa caixa no meio da tela "
                           "(Message box) ou onde o rádio decidir (Auto).", tag="gosto"),
    "Clock, Debug info e Frequency name color": D("Cores do relógio, das informações de depuração e do nome da "
                                                  "frequência: uma cor fixa ou Dynamic.", tag="gosto"),
    "Show frequency tips": D("Mostra uma etiqueta junto da frequência: RDX, WEK, MED, STR ou SPR. Pelos nomes, "
                             "parecem classes de força do sinal: WEK (fraco), MED (médio), STR (forte) e SPR (muito "
                             "forte).", "",
                             U("Teste:", "se a etiqueta ajudar, mantenha."), tag="gosto",
                             obs="O manual não explica; a função foi deduzida das strings do firmware."),
    "My logo image": D("Troca a imagem da tela de abertura por um arquivo seu, em JPG, BMP ou PNG.", tag="gosto"),
    "My logo border": D("Moldura do logo da tela de abertura.", tag="gosto"),
    "Power saving mode": D("Liga um modo de economia de energia. O rádio avisa ao entrar e ao sair dele.",
                           "Deve fazer a bateria durar mais.",
                           U("Teste se", "quer mais bateria: ligue e veja se algo deixa de funcionar ou de atualizar."),
                           tag="gosto", obs="O firmware não diz o que muda nesse modo."),
    "Show RDS errors": rds_erros(False),
    "Region": regiao("Europe", "USA"),
    "RDS Show underscore": sublinhado("PS only", "On"),
    "RDS filter": rds_filtro("On"),
    "Show PI errors": pi_erros(),
    "Use AF": af("Off", "REG On"),
    "RT buffering": rt_buffer(),
    "Auto sort AF": af_sort(),
    "Show long PS": ps_longo(),
    "Fast PS": fast_ps("", "Initial", "", oficial=False),
    "Show RDS clock": D("Mostra na tela a hora que a emissora manda pelo RDS.",
                        "Serve para conferir a hora da emissora. Não acerta o relógio do rádio: isso é o RDS time sync.",
                        tag="gosto"),
    "Disable all RDS": D("Desliga toda a decodificação de RDS.",
                         "Deixa a tela mais limpa, só com a frequência e o sinal, para quem só quer ouvir.",
                         S("você quer uma tela limpa."), N("quer ver o nome das emissoras."), tag="gosto"),
    "Set converter offset": conversor(),
    "Set low band edge": borda_baixa(False),
    "Set high band edge": borda_alta(),
    "Set level offset": nivel_offset(""),
    "Set low level threshold": nivel_baixo(False),
    "Softmute FM": softmute_fm("On", "Off"),
    "FM Noise blanker": noise_blanker("fm"),
    "FM default stepsize": passo_fm("200 kHz", "100 kHz", "50 kHz"),
    "FM AGC": fm_agc("92 dBµV"),
    "FMSI stereo improve": fmsi(),
    "Set FML band": D("Define a faixa baixa de FM (FML) que o BAND oferece: 65 a 74 MHz, a OIRT do Leste Europeu, ou "
                      "76 a 87 MHz.",
                      "A opção de 76 a 87 MHz cobre quase todo o FM estendido brasileiro (76,1 a 87,3 MHz).",
                      U("Use 76–87 MHz se", "prefere o FM estendido como faixa separada no BAND."),
                      U("Não importa se", "o FML está fora do ciclo em Set FM band."), tag="gosto"),
    "Softmute AM": softmute_am("On", "Off"),
    "AM Noise blanker": noise_blanker("am"),
    "AM RF Level offset": nivel_offset(" no AM"),
    "Show SW wavelength": onda_sw(),
    "CoChannel Detector sensitivity": cochannel("100%"),
    "CoChannel Detector threshold": cochannel_lim(),
    "AM ATT": atenuador_am(False),
    "AM AGC": am_agc(),
    "MW default stepsize": passo_am("10 kHz", "9 kHz"),
    "AIR band Conversion": D("Frequência do oscilador do conversor externo de banda aérea, em MHz.",
                             "O DP-666 não recebe a banda aérea (118 a 137 MHz) sozinho. Com um conversor, este valor "
                             "faz a tela mostrar a frequência real.",
                             U("Ignore se", "não tem o conversor."),
                             U("Antes de ouvir,", "veja as regras de escuta em Configuração para o Brasil."),
                             tag="especial"),
    "AIR start frequency": D("Onde começa a faixa AIR, em MHz.", "", U("Ignore se", "não tem o conversor."),
                             tag="especial"),
    "USB mode": usb(),
    "Wi-Fi active": wifi(),
    "Configure Wi-Fi": wifi_config(),
    "Set XDRGTK password": D("Senha que o XDR-GTK precisa para controlar o rádio pela rede.",
                             "Impede que outra pessoa da rede assuma o rádio.",
                             U("Defina uma senha se", "usa o XDR-GTK pela rede."), tag="especial"),
    "Stationlist client IP": stationlist_ip("Endereço IP do computador que roda o StationList."),
    "Stationlist ID": stationlist_id(),
    "Screen off on XDRGTK": OFICIAL["Tela mudo na conexão XDRGTK"],
    "Wi-Fi auto disconnect": D("Desliga o Wi-Fi depois do tempo escolhido, ou logo depois de acertar a hora (After "
                               "time sync).",
                               "O Wi-Fi gasta bateria e, no DP-666, faz sumir a leitura da bateria enquanto está ligado.",
                               U("Use After time sync se", "liga o Wi-Fi só para acertar o relógio."), tag="ajuste"),
    "Set NTP server": D("Servidor de hora pela internet. Vem com o cn.pool.ntp.org, da China.",
                        "Um servidor perto de você responde mais rápido.",
                        U("No Brasil, use a.st1.ntp.br,", "do NTP.br, que usa os relógios atômicos do Observatório "
                                                          "Nacional."), tag="ajuste"),
    "Bluetooth": D("Liga o Bluetooth para o rádio controlar outro aparelho (Config slave host).",
                   "Pelo firmware, serve para um rádio comandar outro. Não há documentação.",
                   U("Não serve para", "fone ou caixa de som: não transmite áudio."), tag="especial"),
    "Touch type": D("Como o firmware lê a tela de toque: por interrupção (Int33 ou Int27) ou por consulta periódica "
                    "(Polling). Off desliga o toque.",
                    "Se o toque não responde ou responde errado, outro tipo pode resolver. O assistente de configuração "
                    "pede para escolher um que funcione.",
                    U("Troque só se", "o toque não funcionar."),
                    U("Use Off se", "não usa o toque e quer evitar toques acidentais."), tag="padrao"),
    "Touch calibration": calibrar_toque(),
    "Rotary adjust squelch": D("Permite ajustar o limiar do squelch girando o knob de sintonia, num modo que você liga "
                               "e desliga.",
                               "Útil para quem prefere o knob ao botão SQL.",
                               N("você prefere o botão SQL do rádio."), tag="gosto"),
    "Knob mode": D("Modo de funcionamento do knob: Classic ou New.", "",
                   U("Teste", "os dois e fique com o que parecer mais natural."), tag="gosto",
                   obs="O manual não explica a diferença."),
    "Knob reverse": inverter_knob(),
    "Knob acceleration": D("Acelera a sintonia quando você gira o knob rápido: Medium ou Fast.",
                           "Atravessa a faixa sem dezenas de cliques.",
                           N("você faz ajustes finos e o salto atrapalha."), tag="gosto"),
    "Quickly switch menu": D("Atalho para trocar de grupo no menu com menos passos.", tag="gosto",
                             obs="O manual não detalha como o atalho funciona."),
    "Long press Rotary key": LP,
    "Long press BW key": LP,
    "Long press MODE key": LP,
    "Long press BAND key": LP,
    "Auto save change": D("Grava sozinho as mudanças do menu. Em Off, o rádio pergunta Save ou Discard ao sair.",
                          "Perguntar evita salvar uma mudança feita sem querer.",
                          U("Use Off se", "costuma testar ajustes e quer decidir ao sair."), tag="gosto"),
    "Set date and time": D("Acerta a data e a hora à mão.",
                           "Útil sem Wi-Fi. Nos rádios com relógio interno (RTC), a hora continua certa com o rádio "
                           "desligado.", tag="gosto"),
    "12/24 h": D("Mostra o relógio em 12 h ou 24 h.", tag="gosto"),
    "Set local time zone": D("Fuso aplicado à hora que vem da internet, em GMT±hh:mm.",
                             "Sem o fuso certo, o relógio mostra a hora da China (GMT+8), com que o Megatron vem.",
                             U("Use GMT−03:00", "no horário de Brasília. Amazonas e Mato Grosso usam GMT−04:00, e o "
                                                "Acre, GMT−05:00."), tag="ajuste"),
    "NTP time sync": D("Acerta o relógio pela internet quando o Wi-Fi está ligado; desde o Mod16, a cada 30 minutos.",
                       "É o jeito mais preciso de manter a hora certa.",
                       S("você tem o Wi-Fi configurado."), N("você não usa Wi-Fi: não há como sincronizar."),
                       tag="ajuste"),
    "RDS time sync": D("Acerta o relógio pela hora que a emissora manda no RDS.",
                       "Funciona sem internet, mas depende da emissora mandar a hora certa.",
                       U("Use Off se", "acerta pela internet: algumas emissoras mandam a hora errada e desacertariam "
                                       "o relógio."),
                       U("Use On se", "não tem Wi-Fi e a emissora que você ouve manda a hora certa."), tag="ajuste"),
    "Sleep clock correction": D("Corrige o relógio em alguns segundos a cada 24 horas.",
                                "Com o rádio em espera, o relógio do ESP32 adianta ou atrasa um pouco por dia; isto "
                                "compensa a diferença.",
                                S("o relógio erra sempre o mesmo tanto e você não usa NTP nem relógio interno (RTC)."),
                                tag="gosto"),
    "Power on timer": D("Liga o rádio sozinho num horário.", "Funciona como despertador com rádio.", tag="gosto"),
    "Low battery protect": D("Desliga o rádio quando a bateria chega ao limite escolhido.",
                             "Descarregar demais uma bateria de lítio encurta a vida dela.",
                             U("Deixe ligado:", "protege a bateria."), tag="padrao"),
    "Delete RDS dictionary": D("Apaga o dicionário de RDS guardado pelo rádio.", tag="especial",
                               obs="Deleted e Not deleted são só estados; não confirmam que algo foi apagado. O manual "
                                   "não explica o que o dicionário guarda."),
    "System information": D("Mostra a versão do firmware, a data de compilação, a memória, o armazenamento, o "
                            "sintonizador, o servidor de hora, o IP e o MAC.",
                            "É onde você confere a versão instalada e se o Wi-Fi conseguiu IP.", tag="especial"),
    "Developer mode e Manage my data": D("Funções de desenvolvimento e de gestão de dados.", "",
                                         U("Não mexa:", "não há documentação e dá para perder ajustes."), tag="padrao"),
    "ATS / Scan schemes": D("Guarda esquemas de busca automática (ATS) e de varredura, com faixa e critérios.",
                            "Você troca de configuração de busca sem refazer tudo.", tag="gosto"),
    "My theme": D("Troca o tema sozinho entre até 4 favoritos, em sequência ou ao acaso.", tag="gosto"),
    "Receive plan": D("Liga e desliga o rádio por agenda, numa faixa e frequência definidas.",
                      "Bom para não perder um programa de horário fixo.", tag="gosto"),
    "My Shortcut icon": D("Escolhe os 7 atalhos da página de atalhos.",
                          "Deixa à mão as funções que você mais usa, como estéreo, iMS, EQ, RDS, tela e squelch pelo knob.",
                          tag="gosto"),
    "Save / Delete my settings": D("Grava os seus ajustes como um padrão de fábrica pessoal, ou apaga essa gravação.",
                                   "Depois de configurar tudo, você volta a esse ponto quando quiser.",
                                   U("Atenção:", "fica no armazenamento de arquivos e se perde quando o firmware é "
                                                 "regravado."), tag="gosto"),
    "Search & save mode": D("Como a busca automática grava: Overwrite apaga as memórias da faixa e grava de novo; Append "
                            "acrescenta depois das que já existem.", "",
                            U("Use Append se", "quer manter as memórias que já tem."), tag="gosto"),
    "Search band": D("Faixa da busca automática.", tag="gosto"),
    "FM scan sensitivity": sens_busca("FM", ", de 1 a 15", oficial=False),
    "AM scan sensitivity": sens_busca("AM", ", de 1 a 20", oficial=False),
    "Judgment mode": D("Critério da busca automática: Quality priority grava só sinais bons; Quantity priority grava o "
                       "máximo de estações.", "",
                       U("Use Quality priority", "no dia a dia."),
                       U("Use Quantity priority se", "quer achar tudo e limpar depois."), tag="gosto"),
    "Start channel": D("Primeira memória que a busca automática usa.",
                       "Separar um intervalo protege as memórias que você montou à mão.", tag="gosto"),
    "SW search start / stop": D("Limites da busca em ondas curtas, de 1800 a 27000 kHz.",
                                "Limitar a uma faixa de radiodifusão, como a de 49 m (5900 a 6200 kHz), deixa a busca "
                                "bem mais rápida.", tag="gosto"),
    "Arrange stations": D("Reorganiza as memórias: só tira os buracos (Only defrag) ou tira e ordena por frequência "
                          "(Defrag and sort).", tag="gosto"),
    "Delete stations": D("Apaga todas as memórias da faixa escolhida, não só uma.", "",
                         U("Cuidado:", "não dá para desfazer."), tag="especial"),
    "Scanning band": D("Faixa da varredura de DX.", tag="dx"),
    "Begin / End channel": D("Primeira e última memória da varredura.", tag="dx"),
    "Wait time": D("Tempo em cada frequência durante a varredura.",
                   "Mais tempo dá chance de o RDS de uma emissora fraca chegar; menos tempo varre mais rápido.", tag="dx"),
    "Exclude / Only": canais_mem("Only", "Exclude"),
    "Cancel": cancelar("Off", "Correct PI", "Signal", oficial=False),
    "Stay / Break": D("O que a varredura faz quando para numa emissora: fica nela (Stay) ou encerra (Break).",
                      tag="dx", obs="Pelos nomes; o manual não detalha."),
    "Wait on signal only": espera_sinal("On"),
    "Hold time": D("Tempo de espera da varredura.", tag="dx", obs="A função exata não está documentada."),
}


def lookup(fw, nome, grupo):
    d = OFICIAL if fw == "oficial" else MOD17
    return d.get(f"{nome}@{grupo}") or d.get(nome)
