# Computador e conectividade

Ligado ao computador, o DP-666 ganha uma tela grande. Dá para sintonizar pelo mouse, ver em que frequências há sinal, ler o RDS em detalhe, guardar registros, ouvir o rádio pelo navegador de qualquer lugar e atualizar o firmware. Os comandos e os dados passam pelo cabo USB-C ou pelo Wi-Fi. O som não passa por nenhum dos dois: para ouvir no computador, é preciso um cabo de áudio.

Se os nomes dos programas, ou termos como RDS, porta COM e baud, forem novos para você, comece por [O que é cada coisa](#computador--o-que-é-cada-coisa).

<!--DIAGRAM:remoto-->

## Para que serve

| O que você quer | Programa | Ligação |
| --- | --- | --- |
| Controlar o rádio pelo computador, com o gráfico da faixa e o RDS na tela | [XDR-GTK](#computador--xdr-gtk) | USB ou Wi-Fi |
| Ver tudo o que a emissora manda no RDS e guardar registros | [RDS Spy](#computador--rds-spy) | USB, Wi-Fi ou pelo XDR-GTK |
| Ouvir e controlar o rádio pelo navegador, em casa ou longe dela, até no iPhone | [FM-DX Webserver](#computador--fm-dx-webserver) | USB e cabo de áudio |
| Mandar os dados de cada emissora para uma lista no computador | [StationList](#computador--stationlist) | Wi-Fi |
| Ler o logbook e as memórias, acertar a hora ou dar nome ao rádio | [navegador ou terminal](#computador--logbook-memórias-e-hora) | Wi-Fi ou USB |
| Atualizar o firmware e fazer backup | [esptool ou flash.bat](backup.md) | USB |

## O que é cada coisa

Cada nome aparece explicado aqui uma vez. O resto da página usa os mesmos nomes.

### Os programas

- **XDR-GTK:** programa gratuito que vira o painel de controle do rádio no computador, para Windows e Linux. O nome conta a história: ele nasceu para o Sony XDR-F1HD, um sintonizador de aparelho de som que fãs de rádio modificaram para controlar pelo computador. GTK é a biblioteca usada para desenhar as janelas do programa. Hoje ele também aceita rádios com o chip TEF6686, como o DP-666. Foi criado por Konrad Kosmatka e Mateusz Walkowiak.
- **RDS Spy:** programa gratuito para Windows que decodifica e analisa o RDS, os dados digitais que as emissoras mandam junto com o som (veja abaixo). O nome, "espião" em inglês, combina com o que ele faz: mostra tudo o que a emissora transmite, inclusive o que um rádio comum não exibe. É da PIRA.cz, que fabrica codificadores de RDS para emissoras.
- **FMDX e FM-DX Webserver:** FMDX é a comunidade de quem pratica DX em FM (veja abaixo), reunida no site fmdx.org. O FM-DX Webserver é o programa gratuito dessa comunidade que põe o rádio numa página web: pelo navegador de qualquer aparelho, você ouve o som e controla o rádio. Foi criado por Marek Farkaš.
- **xdrd:** programa auxiliar, sem janela, que põe um rádio na rede para o XDR-GTK e o FM-DX Webserver. Com o DP-666, você não precisa dele: no Wi-Fi, o próprio rádio faz esse papel, e pelo cabo os programas falam direto com ele.
- **StationList:** programa de computador que recebe pelo Wi-Fi os dados da emissora sintonizada e monta uma lista de estações.
- **TEF Logger App:** app de Android para acompanhar e registrar recepções de rádios com o chip TEF que rodam o firmware oficial.
- **PuTTY:** programa gratuito para Windows que abre um terminal (veja abaixo) numa porta serial ou numa conexão de rede.
- **esptool:** ferramenta da Espressif, fabricante do processador do rádio, para copiar e gravar o firmware. Veja [Backup e gravação](backup.md).

### Termos de rádio

- **DX:** abreviação do tempo do telégrafo para "distância". Fazer DX é o passatempo de captar e identificar emissoras distantes ou fracas. No FM, muitas chegam de longe só em condições especiais da atmosfera. Quem pratica é o DXista.
- **RDS (Radio Data System):** dados digitais que a emissora de FM manda junto com o som, numa parte do sinal que não se ouve. É o RDS que põe no visor o nome da rádio e a música que está tocando. As partes que aparecem nesta página:
    - **PI:** código de 4 caracteres que identifica a emissora, como um documento. Como vai em todos os pacotes de RDS, costuma ser o primeiro dado a aparecer com sinal fraco, e é o que o DXista usa para descobrir qual emissora está ouvindo.
    - **PS:** o nome da emissora no visor, com até 8 caracteres.
    - **RadioText (RT):** texto livre de até 64 caracteres, como o nome da música ou um recado.
    - **RT+:** marca, dentro do RadioText, qual parte é o título da música e qual é o artista.
    - **PTY:** o tipo de programa, como notícias, esporte ou rock.
    - **AF:** lista de frequências alternativas da mesma emissora, para o rádio trocar sozinho quando o sinal piora.
    - **CT:** a hora certa, enviada pela emissora.
    - **EON:** dados sobre outras emissoras da mesma rede.
    - **Grupo:** cada pacote de dados do RDS. Cada tipo de grupo leva um tipo de informação.
- **Espectro e varredura:** o espectro é um gráfico da faixa inteira, com a força do sinal em cada frequência; cada pico é uma emissora. A varredura é o rádio passar frequência por frequência para desenhar esse gráfico.
- **Multipercurso:** o sinal chega por dois caminhos ao mesmo tempo, direto e refletido em prédios ou morros, e se embaralha. Causa chiado e distorção.
- **Filtro (largura de banda):** quanto o rádio abre em volta da frequência sintonizada. O filtro estreito separa emissoras vizinhas; o largo dá som melhor.
- **Diagrama de antena:** o mapa de quanto uma antena direcional capta em cada direção.
- **Logbook:** o registro das emissoras captadas, com data, hora, frequência e RDS.
- **Firmware:** o programa que roda dentro do rádio. O DP-666 tem duas linhas, o Megatron Mod17 e a oficial; veja [Megatron × oficial](firmwares.md).

Os outros ajustes de recepção que o XDR-GTK controla, como AGC, deênfase e softmute, estão explicados em [Ajustes do rádio](#ajustes).

### Termos de computador

- **Driver:** programa que ensina o computador a falar com um chip. Aqui, o CH340, que fica dentro do rádio e transforma o USB numa porta serial.
- **Porta serial ou porta COM:** o canal de conversa que o computador cria quando você liga o rádio pelo cabo. No Windows, cada porta ganha um número (COM3, COM5…); no Mac e no Linux, um nome como /dev/ttyUSB0. Os programas pedem esse número para saber com qual aparelho falar.
- **Baud:** a velocidade da conversa pela porta serial, em bits por segundo. O programa e o rádio precisam usar a mesma; se não, chegam letras embaralhadas ou nada.
- **IP:** o endereço de cada aparelho na rede, como 192.168.0.31. O roteador dá um IP ao rádio quando ele entra no Wi-Fi.
- **Porta de rede:** um número que diz qual programa, dentro do aparelho, recebe a conexão. Se o IP é o endereço do prédio, a porta é o apartamento. O rádio atende o XDR-GTK e o RDS Spy na porta 7373.
- **TCP e UDP:** dois jeitos de mandar dados pela rede. O TCP confirma cada entrega e mantém a conversa aberta, como no XDR-GTK. O UDP só manda, sem esperar resposta, como no StationList.
- **Firewall:** o porteiro do computador, que barra conexões desconhecidas. Às vezes é preciso autorizar um programa ou uma porta.
- **Terminal:** janela em que você digita comandos em vez de clicar. No Windows, o Prompt de Comando e o PowerShell são terminais; o PuTTY é um terminal para portas seriais.
- **Node.js e npm:** o Node.js é o motor que roda programas escritos em JavaScript fora do navegador, como o FM-DX Webserver. O npm vem junto e baixa as peças de que o programa precisa: é o que faz o comando `npm install`.
- **Servidor e localhost:** servidor é um programa que fica esperando outros aparelhos se conectarem para responder a eles. localhost é o nome que o computador usa para si mesmo: http://localhost:8080 abre a página que o próprio computador serve, na porta 8080.
- **IP público, túnel e VPN:** o IP público é o endereço da sua casa na internet, dado pela operadora. Abrir uma porta no roteador, ou usar um túnel, deixa qualquer pessoa da internet chegar ao servidor. A VPN faz o contrário: põe o seu celular, de longe, dentro da rede de casa, sem expor o servidor.
- **tef.local:** o nome que o rádio da linha oficial anuncia na rede, para você não precisar saber o IP. Se não abrir, use o IP.
- **CSV:** arquivo de texto com os dados separados por vírgulas, que qualquer planilha abre.

## Antes de começar

- **Cabo:** use um cabo USB-C que passe dados. Muitos cabos só carregam: se o computador não reagir quando você liga o rádio, troque o cabo antes de mexer em qualquer outra coisa.
- **Driver no Windows:** dentro do rádio, um chip CH340 faz a ponte entre o USB e o processador. O Windows Update costuma instalar o driver sozinho. Se não instalar, use o [driver CH340 da DEEPELEC](https://www.deepelec.com/files/dp-666/CH341SER.zip). O rádio aparece no Gerenciador de Dispositivos, em Portas (COM e LPT), como "USB-SERIAL CH340" seguido do número da porta, como COM5. Anote esse número.
- **Driver no Mac e no Linux:** o Linux já traz o driver, e a porta aparece como /dev/ttyUSB0. O Mac também reconhece o chip sozinho, com a porta /dev/cu.usbserial seguida de um número. Se a conexão falhar no Mac, instale o [driver da WCH](https://github.com/WCHSoftGroup/ch34xser_macos) e autorize-o em Ajustes do Sistema → Privacidade e Segurança. Com ele, a porta passa a ser /dev/cu.wchusbserial seguida de um número.
- **Som:** ligue um cabo P2–P2 da saída de fone do rádio à entrada de linha do computador, ou a uma placa de som USB. Prefira entrada estéreo: muitas placas USB baratas só têm entrada de microfone mono, e o som chega mono.
- **Wi-Fi:** só funcionam redes de 2,4 GHz, e o rádio e o computador precisam estar na mesma rede. Para pôr o rádio na rede, use o teclado na tela ou o navegador: conecte-se à rede `ESP_…` do rádio e abra http://192.168.4.1. O Mod17 guarda até 3 redes. O IP do rádio aparece no Mod17 em Other settings → System information e, na linha oficial, ao lado de Wi-Fi ativo, no grupo Conectividade e relógio.
- **Bateria com Wi-Fi:** com o Wi-Fi ligado, o rádio não mede a bateria, e o indicador e a proteção de bateria baixa param de funcionar. Pelo cabo, com o Wi-Fi desligado, isso não acontece. Se o Wi-Fi é só para acertar a hora, use Wi-Fi auto disconnect em After time sync.
- **Um programa por vez:** o rádio atende um programa de cada vez. Para usar o XDR-GTK e o RDS Spy juntos, ligue o RDS Spy pelo XDR-GTK, como explicado abaixo.
- **Menu fechado:** com o menu aberto, o rádio ignora os comandos do computador.
- **Se não funcionar:** as causas mais comuns, como o computador não ver o rádio ou o programa conectar sem receber nada, estão no assistente de [Problemas comuns](#ajuda--conexao-com-o-computador).

## Preparar o rádio

| Ajuste | Megatron Mod17 | Linha oficial |
| --- | --- | --- |
| Modo da porta USB | Connectivity → USB mode | Conectividade e relógio → Modo USB |
| Para XDR-GTK e FM-DX Webserver | XDRGTK | XDRGTK (a porta passa a 115200 baud) |
| Para o RDS Spy pelo cabo | RDS Spy | RDS Spy (a porta passa a 19200 baud) |
| Senha para conexões pelo Wi-Fi | Connectivity → Set XDRGTK password, até 8 caracteres | Na página que abre em Configurar Wi-Fi, campo "Definir senha XDRGTK", até 8 caracteres. Vem "password" |
| Apagar a tela durante a sessão | Connectivity → Screen off on XDRGTK | Conectividade e relógio → Tela mudo na conexão XDRGTK |

Apagar a tela durante a sessão vale a pena: você já vê tudo no computador, e a tela apagada economiza bateria e deixa de gerar ruído no rádio. Na linha oficial, ela volta quando a conexão termina.

## O que dá para controlar à distância

No Mod17, o controle remoto usa o protocolo do XDR-GTK, pelo Wi-Fi (porta TCP 7373, com senha) ou pelo USB (sem senha, com USB mode em XDRGTK).

| Dá para controlar | Não dá |
| --- | --- |
| frequência em FM, MW, LW e SW; busca para cima e para baixo; troca entre FM e AM | menus e ajustes (Wi-Fi, fuso, temas, memórias) |
| largura de banda, AGC, deênfase, estéreo/mono, iMS/EQ e softmute | ligar o rádio à distância (só por timer ou plano configurado nele) |
| volume, mudo e squelch, inclusive o automático | receber o áudio pela rede |
| varredura de espectro e início ou parada do DX scan | usar com o menu aberto (os comandos são ignorados) |
| apagar a tela durante a sessão (Screen off on XDRGTK) | mais de um programa ao mesmo tempo |

O rádio também envia em tempo real o sinal, o estéreo, o multipercurso, o C/N e todo o RDS.

## XDR-GTK

**Para que serve:** é o painel de controle do rádio no computador, feito para quem pratica DX. Você sintoniza pelo mouse e pelo teclado, muda os ajustes de recepção (filtro, AGC, deênfase, estéreo e softmute) e acompanha num gráfico a força do sinal, o multipercurso e o RDS. A varredura de espectro desenha a faixa inteira e mostra de relance as frequências ocupadas. Também mede o diagrama de uma antena direcional. Roda no Windows e no Linux e é gratuito.

**Funciona com:** os dois firmwares. O que dá e o que não dá para controlar está em [O que dá para controlar à distância](#computador--o-que-dá-para-controlar-à-distância).

**Pelo cabo USB:**

1. No rádio, ponha o modo da porta USB em XDRGTK e feche o menu.
2. Baixe o XDR-GTK na [página de versões do projeto](https://github.com/kkonradpl/xdr-gtk/releases) e instale.
3. Ligue o rádio ao computador pelo cabo e abra o XDR-GTK.
4. Na janela de conexão, escolha a porta serial do rádio (a COM que você anotou) e conecte. Pelo cabo, não há senha.
5. O XDR-GTK passa a mostrar o sinal e o RDS. Na linha oficial, o rádio vai para o FM ao conectar.

**Pelo Wi-Fi:**

1. Conecte o rádio à sua rede e defina a senha do XDR-GTK (veja a tabela acima).
2. Na janela de conexão do XDR-GTK, escolha TCP/IP, digite o IP do rádio, a porta 7373 e a senha.

!!! tip "XDR-GTK e RDS Spy ao mesmo tempo"
    O XDR-GTK repassa o RDS para o RDS Spy. Ligue o botão RDS Spy no XDR-GTK. No RDS Spy, escolha Configure → Select RDS Source → ASCII G Protocol, com a conexão TCP/IP na porta 7376. O RDS Spy recebe só os grupos que chegaram sem erro.

## RDS Spy

**Para que serve:** decodifica tudo o que a emissora manda no RDS, grupo por grupo: o código PI, o nome (PS), o RadioText, o tipo de programa, as frequências alternativas, a hora, os dados de outras emissoras da rede (EON), o RT+ e as aplicações extras, além da contagem de erros. Também grava registros. É a ferramenta clássica para identificar uma emissora fraca pelo código e para conferir se o RDS de uma rádio está certo. É gratuito e só roda no Windows.

**Funciona com:** os dois firmwares. Pelo RDS Spy, também dá para trocar a frequência do FM.

**Pelo cabo USB:**

1. No rádio, ponha o modo da porta USB em RDS Spy e feche o menu.
2. Instale o [RDS Spy](https://rdsspy.com/).
3. No RDS Spy, abra Configure → Select RDS Source e escolha ASCII G Protocol.
4. Escolha a conexão pela porta serial, com a COM do rádio e 19200 baud.

**Pelo Wi-Fi:** na mesma fonte (ASCII G Protocol), escolha a conexão por TCP/IP, com o IP do rádio e a porta 7373. O modo da porta USB não importa nesse caso.

## FM-DX Webserver

**Para que serve:** transforma um computador ligado ao rádio num servidor. Qualquer aparelho da casa, inclusive celulares e o iPhone, abre o rádio no navegador, ouve o som e muda a frequência, o filtro e o resto. Com acesso pela internet, você ouve o seu rádio de longe, por exemplo deixando-o em casa com uma boa antena. O servidor também pode entrar no [mapa público](https://servers.fmdx.org/) da comunidade FMDX, para outras pessoas ouvirem, e tem painel de administração, chat e plugins.

**Funciona com:** a linha oficial, que o projeto declara compatível. No Mod17, a compatibilidade é provável, mas não confirmada.

**O que você precisa:** um computador com Windows ou Linux, os sistemas que o projeto lista, que fique ligado enquanto o servidor estiver no ar (um mini PC serve), o cabo USB e o cabo de áudio.

1. No rádio, ponha o modo da porta USB em XDRGTK e feche o menu.
2. Ligue o cabo USB e o cabo de áudio, da saída de fone do rádio à entrada de som do computador. Comece com o volume do rádio na metade.
3. Instale o [Node.js](https://nodejs.org/).
4. Baixe o [FM-DX Webserver](https://github.com/NoobishSVK/fm-dx-webserver) e descompacte.
5. Abra um terminal na pasta do programa e rode `npm install` e depois `npm run webserver`. Deixe essa janela aberta: fechar a janela desliga o servidor.
6. No navegador, abra http://localhost:8080/setup. Escolha a ligação direta pela porta serial do rádio, sem o programa intermediário xdrd. Escolha a entrada de som em que o cabo está ligado e defina uma senha de administrador.
7. Abra http://localhost:8080 para ouvir. Nos outros aparelhos da casa, use o IP do computador com a porta 8080, como http://192.168.0.20:8080.

!!! warning "Antes de abrir o servidor para a internet"
    Para acesso de fora de casa, é preciso um IP público com a porta liberada no roteador, ou um túnel. Um servidor aberto deixa qualquer pessoa ouvir as emissoras pelo seu rádio, e repassar a programação pela internet pode esbarrar nos direitos das emissoras e dos autores (Lei nº 9.610/1998). Para entrar no mapa, siga as regras da comunidade FMDX. Para ouvir de longe só você, prefira uma VPN até a sua rede em vez de abrir a porta.

## StationList

**Para que serve:** pelo Wi-Fi, o rádio manda para o programa StationList, num computador da mesma rede, os dados de cada emissora sintonizada: frequência, força do sinal, filtro, código PI, nome, tipo de programa, RadioText e frequências alternativas. O programa monta a lista de estações e pode pedir para o rádio mudar de frequência.

**Funciona com:** os dois firmwares.

1. Ligue o Wi-Fi do rádio.
2. Na linha oficial, em IP do cliente da lista de estações, ponha o último número do IP do computador. Se o computador é 192.168.0.25, use 25. No Mod17, o ajuste é Connectivity → Stationlist client IP.
3. Se houver mais de um rádio, dê um número a cada um em ID da lista de estações (Stationlist ID, no Mod17).
4. No firewall do computador, libere a entrada pela porta UDP 9030. O rádio recebe os pedidos do programa na porta 9031.

Não encontramos uma página oficial do StationList. Os dados acima vêm do código do firmware.

## Logbook, memórias e hora

**Linha oficial pelo Wi-Fi:** com o rádio na rede, abra no navegador o IP do rádio, como http://192.168.0.31, ou http://tef.local. A página mostra o logbook, com as emissoras que você registrou segurando o encoder (veja [Uso da linha oficial](#oficial--logbook)), e tem o botão Baixar livro de registro, que salva tudo num arquivo CSV para abrir em qualquer planilha.

**Pelo cabo, num terminal:** o terminal é um programa que manda e recebe texto pela porta do rádio. No Windows, use o PuTTY: escolha Serial, a porta COM do rádio e a velocidade do modo USB (115200 em XDRGTK, 19200 em RDS Spy). No Mac e no Linux, o comando `screen /dev/ttyUSB0 115200` faz o mesmo; troque pelo nome da sua porta. Depois digite o comando:

- **Linha oficial:** `L` (ou `l`) devolve o logbook em CSV. `s` lista as 99 memórias, e `S` grava uma memória (posição, frequência, filtro, mono/estéreo, PI e PS) e responde com um código de erro, no formato do [protocolo de memórias do PE5PVB](https://github.com/PE5PVB/TEF6686_ESP32/blob/main/docs/Memory%20channel%20protocol.pdf). Esses comandos só funcionam pelo cabo.
- **Megatron, com o modo USB em XDRGTK:** `$time: 14:30:00` acerta o relógio sem Wi-Fi; `$name: MEU RADIO` dá um nome ao rádio, que aparece na abertura e no rodapé quando não há RadioText; `$reboot` reinicia. O jeito mais simples é usar os arquivos .bat que vêm no pacote do firmware, no Windows.

!!! danger "Não teste comandos sem documentação"
    O Mod17 tem comandos internos que podem apagar ajustes e memórias (veja [Recursos ocultos do Mod17](mod17.md)). Use só os comandos acima e faça o [backup](backup.md) antes de experimentar qualquer outra coisa.

## Pelo celular, sem computador

- **Android:** o [TEF Logger App](https://highpoint.fmdx.org/manuals/TEF-Logger-App-Documentation.html) recebe os dados do rádio pelo Wi-Fi, com o firmware oficial v2.20 ou mais novo, para acompanhar e registrar recepções.
- **iPhone:** não há app que fale direto com o rádio, e o iPhone não consegue usar o adaptador USB-serial (CH340) do DP-666. O caminho é o FM-DX Webserver num computador, aberto no navegador do iPhone.

## Bluetooth

- **Áudio:** não funciona. O firmware não tem perfis de áudio, então fones e caixas Bluetooth não se conectam. Quem quer Bluetooth de áudio precisa de outro rádio (veja [Comparação](comparacao.md)).
- **Mod17:** usa o Bluetooth só na função "slave host", em que o rádio se conecta a outro aparelho e o controla. O firmware pede para desligar o Wi-Fi antes.
- **Linha oficial:** não usa Bluetooth.

## Fontes

- [PE5PVB — código de comunicação (portas, velocidades e protocolos)](https://github.com/PE5PVB/TEF6686_ESP32/blob/main/src/comms.cpp)
- [PE5PVB — protocolo de canais de memória](https://github.com/PE5PVB/TEF6686_ESP32/blob/main/docs/Memory%20channel%20protocol.pdf)
- [Wiki do PE5PVB — como usar o logbook](https://github.com/PE5PVB/TEF6686_ESP32/wiki/How-to-use-the-logbook)
- [FMDX.org — XDR-GTK](https://fmdx.org/projects/xdr-gtk.php)
- [FMDX.pl — XDR-I2C, a modificação do Sony XDR-F1HD](https://pl.fmdx.org/?p=93)
- [FMDX.org — xdrd](https://fmdx.org/projects/xdrd.php)
- [PIRA.cz — RDS Spy e outros programas](https://pira.cz/)
- [Wikipedia — DXing](https://en.wikipedia.org/wiki/DXing)
- [Wikipedia — Radio Data System](https://en.wikipedia.org/wiki/Radio_Data_System)
- [RDS Forum — glossário do RDS](https://rds.org.uk/2010/Glossary-Of-Terms.htm)
- [XDR-GTK — versões para baixar](https://github.com/kkonradpl/xdr-gtk/releases)
- [FMDX.pl — XDR-GTK e o RDS Spy Link](https://pl.fmdx.org/?p=100)
- [FMDX.org — FM-DX Webserver](https://fmdx.org/projects/webserver.php)
- [FM-DX Webserver no GitHub](https://github.com/NoobishSVK/fm-dx-webserver)
- [Kanto Aalto — ligação direta pela porta COM no FM-DX Webserver](https://kantoaalto.blogspot.com/2024/03/new-control-system-for-fm-receivers-fm.html)
- [TEF Logger App — documentação](https://highpoint.fmdx.org/manuals/TEF-Logger-App-Documentation.html)
- [DEEPELEC — driver CH340 para Windows](https://www.deepelec.com/files/dp-666/CH341SER.zip)
- [WCH — driver CH34x para macOS](https://github.com/WCHSoftGroup/ch34xser_macos)
- [Soldered — portas do CH340 no Mac e no Linux](https://docs.soldered.com/ch340-drivers/)
- [Planalto — Lei nº 9.610/1998, direitos autorais](https://www.planalto.gov.br/ccivil_03/leis/l9610.htm)
- [Fórum da Apple — USB-serial no iPhone](https://origin-devforums.apple.com/forums/thread/834899)
