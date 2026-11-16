# Laboratório

Ideias de projeto em torno do DP-666, com o que já se sabe sobre cada uma. Nada aqui está pronto: são caminhos estudados, com os limites encontrados.

## Rádio controlado por IA

Um agente de IA que roda comandos no computador, como o Claude Code, pode falar com o rádio pelo protocolo do XDR-GTK: sintonizar (`T99500` vai para 99,5 MHz), mudar filtro e AGC e ler sinal e RDS de volta.

- **Direto pela USB:** um script fala com a porta serial. É o mais simples, mas ocupa a porta só para ele.
- **Pelo fm-dx-webserver:** ele também aceita comandos de outros programas, como faz o cliente de terminal fm-dx-console. Assim o rádio continua acessível pelo navegador.
- **Como empacotar:** um servidor MCP local com ferramentas como "sintonizar", "ler RDS" e "varrer faixa". O Claude Code aceita servidores MCP que rodam como processos na máquina, e o modo não interativo (`claude -p`) permite agendar rotinas, como uma varredura de madrugada.

**Limites:** a IA lê números e RDS, mas não ouve o áudio. Cada ação leva alguns segundos, então monitorar por horas exige um script que rode sozinho. E a compatibilidade do Mod17 com o protocolo precisa de teste.

## Monitorar notícias das rádios

A IA não processa áudio, mas dá para colocar uma transcrição no meio:

1. **Captura:** cabo da saída de fone do rádio para uma placa de som no computador.
2. **Transcrição:** um modelo de fala para texto, como o Whisper, transcreve o português.
3. **Filtro:** um script separa os trechos com palavras como "acidente", "interditada" ou "incêndio". Isso mantém o custo baixo.
4. **Análise:** a IA resume e organiza cada caso (o que, onde, quando, gravidade) e confere na web.
5. **Entrega:** alerta no celular ou resumo diário.

**Limites:** o DP-666 sintoniza uma emissora por vez; para várias ao mesmo tempo, é preciso mais rádios ou um SDR. Muitas emissoras também transmitem pela internet, o que é mais simples para notícias. O DP-666 não recebe rádio de polícia, bombeiros ou resgate, só emissoras de FM, AM e ondas curtas.

## Emular a interface no computador

- **Linha oficial:** viável no Wokwi, simulador de ESP32 gratuito para uso pessoal, com ESP32, tela ILI9341, encoder e botões. Sem o sintonizador, o firmware travaria em "Tuner: !None!", mas o código aberto permite trocar o TEF6686 por um falso ou criar um chip virtual com a API de chips I²C do Wokwi. O toque não funcionaria, porque a tela com toque do Wokwi é capacitiva (FT6206), e não resistiva como a do DP-666.
- **Megatron:** só na teoria. Seria preciso rodar o binário como está e criar versões virtuais do sintonizador, do teclado e do toque que deem as respostas esperadas. O QEMU da Espressif não serve na prática, porque dispositivos SPI, como a tela, não funcionam bem nele.
- **Espelhar a tela do rádio no PC:** nenhum dos dois firmwares envia a imagem da tela.

## Configurador no computador e no celular

A ideia: montar ajustes e memórias no computador ou no celular e enviar para o rádio.

**O que já existe:**

- **Linha oficial, pelo USB:** `s` lista as memórias, `S` grava uma e `l` exporta o registro de estações.
- **Mod17:** os dados ficam em arquivos internos (veja [Recursos ocultos do Mod17](mod17.md)), e o modo Manage my data espera comandos do PC, mas o protocolo não é público.

**Três caminhos:**

1. **Editar o backup:** ler o flash com o esptool, editar memórias, nomes e ajustes e gravar de volta. No Mod17, o formato se descobre comparando dois backups, antes e depois de mudar um ajuste. É seguro, mas só funciona pelo USB, com o rádio em modo de gravação.
2. **Página web pelo USB:** o Web Serial deixa uma página falar com o rádio sem instalar nada, no Chrome e no Edge do computador. Não funciona no Safari.
3. **Página de ajustes no próprio rádio:** a linha oficial já tem um servidor web. Modificando o firmware, dá para acrescentar uma página de configuração, que qualquer celular abre pelo Wi-Fi.

**No celular:** o iPhone não fala com adaptadores USB-serial comuns, então só pelo Wi-Fi ou por Bluetooth Low Energy. No Android, dá para usar o cabo, com a biblioteca usb-serial-for-android, compatível com o CH340.

## Bluetooth como canal de configuração

- **Vantagens:** o Bluetooth Low Energy (BLE) é a única forma de um app de iPhone falar com o rádio sem roteador, porque aparelhos BLE não dependem do programa MFi da Apple. Também gasta menos bateria que o Wi-Fi.
- **Desvantagens:** o Bluetooth clássico, no modo serial, não funciona com apps de iPhone. Pelo navegador, o Web Bluetooth funciona no Chrome e no Edge, mas não no Safari nem no iOS.
- **No firmware:** o Mod17 já inclui o Bluetooth, mas só para a função "slave host". A linha oficial não usa Bluetooth, e um pacote v2.20 para o DP-666 ocupa 3.064 dos 3.072 KB reservados ao programa. Para caber, seria preciso reorganizar a memória do rádio.

## Trocar o ESP32 por um modelo mais novo?

O DP-666 usa o ESP32-WROOM-32U: 4 MB de flash, sem PSRAM e com conector para antena externa. A Espressif classifica esse módulo como não recomendado para projetos novos. O modelo atual da mesma família é o WROOM-32UE, com o mesmo formato. Nele, os seis pinos da flash (17 a 22) ficam sem conexão, mas o DP-666 não usa esses pinos.

Resposta curta: só o WROOM-32UE sem PSRAM serve no lugar do atual. Os outros pedem placa nova, e nenhum melhora a recepção.

A figura abaixo mostra os módulos em escala. Toque num pino para ver o que ele faz no DP-666.

<!--VIEWER3D-->

| Módulo | Medidas | Memória | Serve no DP-666? |
| --- | --- | --- | --- |
| WROOM-32U (o atual) | 18 × 19,2 × 3,2 mm | 4 MB de flash | É o original |
| WROOM-32UE, versões N4, N8 e N16 | 18 × 19,2 × 3,2 mm | 4, 8 ou 16 MB de flash | **Sim:** os pinos que o DP-666 usa ficam nos mesmos lugares |
| WROOM-32UE com PSRAM (N4R2, N8R2 e N16R2) | 18 × 19,2 × 3,2 mm | Até 16 MB de flash e 2 MB de PSRAM | **Não:** o GPIO 16, reset da tela, fica preso à PSRAM |
| WROVER-IE | 18 × 31,4 × 3,3 mm | Até 16 MB de flash e 8 MB de PSRAM | **Não:** é 12 mm mais longo, e os GPIO 16 e 17 (reset e DC da tela) vão para a PSRAM |
| S3-WROOM-1U | 18 × 19,2 × 3,2 mm | Até 16 MB de flash e de PSRAM | **Não:** 41 pinos em outra ordem |
| C5-WROOM-1U | 18 × 21,2 × 3,3 mm | Até 32 MB de flash e 8 MB de PSRAM | **Não:** outra pinagem e até 22 GPIOs |

### O que daria para ganhar

- **Mais flash (WROOM-32UE N8 ou N16):** o programa já ocupa quase toda a área reservada. O pacote v2.20 usava 3.064 dos 3.072 KB, e a v2.20.12 aumentou essa área para 3.776 KB, deixando 192 KB para os arquivos, onde fica o registro de estações. Com 8 ou 16 MB, caberiam um registro maior e duas cópias do programa, o que permite atualizar pelo Wi-Fi. Para usar o espaço, é preciso compilar com outra tabela de partições, e a linha oficial não tem atualização pelo Wi-Fi.
- **PSRAM:** daria memória para montar a tela inteira antes de mostrar, sem piscar. Hoje o código desenha em pedaços pequenos (o maior, o da frequência, tem 200 × 50 pontos), porque a tela inteira, de 320 × 240 pontos em 16 bits, ocupa 150 KB e disputaria a RAM interna com o Wi-Fi.
- **USB nativo (S3):** o rádio apareceria no computador como porta serial sem o CH340. Daria até para funcionar como placa de som, se a placa nova levasse o áudio até o ESP32.
- **Mais entradas analógicas (S3):** o ADC1 do S3 tem 10 canais, então a bateria poderia ficar num canal que funciona com o Wi-Fi ligado. No DP-666, ela está no GPIO 13, do ADC2, e por isso a leitura some com o Wi-Fi.
- **Wi-Fi 6 em 5 GHz (C5):** ajuda só na conexão com o roteador. O C5 tem um núcleo só e Bluetooth só no modo LE.

### O que não muda

- **Recepção e som:** quem sintoniza e processa o sinal é o TEF6686. O ESP32 cuida da tela, dos botões e da comunicação, então um processador mais rápido não muda sensibilidade, seletividade nem áudio.
- **Velocidade da tela:** a wiki da linha oficial manda usar o SPI da tela a 7,5 MHz, e até menos se aparecer ruído perto de 90 MHz. O limite é a interferência no rádio, não o processador.
- **Pinos livres:** o código oficial usa 25 dos 26 GPIOs do módulo. Sobra o GPIO 12, que não pode estar em nível alto na partida. Uma função nova pediria um expansor de pinos.

### Na prática

- **Se o módulo queimar:** use o WROOM-32UE sem PSRAM (N4, N8 ou N16). Ele tem o mesmo chip com revisão mais nova (ESP32-D0WD-V3) e o mesmo conector de antena. A troca pede estação de ar quente, por causa do pad de terra que fica embaixo do módulo.
- **Para ter PSRAM, USB nativo ou 5 GHz:** é projeto de placa nova, com o firmware adaptado. A linha oficial é feita para o ESP32 clássico.

## Fontes

- [Espressif — ESP32-WROOM-32D e WROOM-32U, datasheet](https://documentation.espressif.com/esp32-wroom-32d_esp32-wroom-32u_datasheet_en.pdf)
- [Espressif — ESP32-WROOM-32E e WROOM-32UE, datasheet](https://documentation.espressif.com/esp32-wroom-32e_esp32-wroom-32ue_datasheet_en.html)
- [Espressif — ESP32-WROVER-E e WROVER-IE, datasheet](https://documentation.espressif.com/esp32-wrover-e_esp32-wrover-ie_datasheet_en.pdf)
- [Espressif — ESP32-S3-WROOM-1 e WROOM-1U, datasheet](https://documentation.espressif.com/esp32-s3-wroom-1_wroom-1u_datasheet_en.html)
- [Espressif — ESP32-C5-WROOM-1 e WROOM-1U, datasheet](https://documentation.espressif.com/esp32-c5-wroom-1_wroom-1u_datasheet_en.html)
- [PE5PVB — TEF6686_ESP32.ino, com os pinos usados](https://github.com/PE5PVB/TEF6686_ESP32/blob/main/TEF6686_ESP32.ino)
- [PE5PVB wiki — Installing the software (SPI da tela)](https://github.com/PE5PVB/TEF6686_ESP32/wiki/Installing-the-software)
- [three.js, biblioteca usada na visão 3D (licença MIT)](https://threejs.org/)
- [Claude Code — MCP](https://code.claude.com/docs/en/mcp)
- [Claude Code — modo não interativo](https://code.claude.com/docs/en/headless)
- [fm-dx-console](https://github.com/bkram/fm-dx-console)
- [Wokwi — simulação de ESP32](https://docs.wokwi.com/guides/esp32)
- [Wokwi — chips personalizados](https://docs.wokwi.com/chips-api/getting-started)
- [Fórum ESP32 — dispositivos no QEMU](https://esp32.com/viewtopic.php?p=151786)
- [Web Serial — compatibilidade](https://www.testmuai.com/web-technologies/web-serial/)
- [Fórum da Apple — USB-serial no iPhone](https://origin-devforums.apple.com/forums/thread/834899)
- [usb-serial-for-android](https://github.com/mik3y/usb-serial-for-android)
- [Fórum da Apple — BLE e MFi](https://developer.apple.com/forums/thread/765687)
- [Web Bluetooth — compatibilidade](https://web-platform-dx.github.io/web-features-explorer/features/web-bluetooth)
