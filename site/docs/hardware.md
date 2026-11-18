# Hardware

O DP-666 junta um sintonizador NXP TEF6686, que faz todo o trabalho de rádio, a um módulo ESP32, que cuida da tela, dos botões e das conexões. Esta página mostra como as peças se ligam, por onde passam a energia e o som, e traz o datasheet de cada uma. A base são os esquemas elétricos da DEEPELEC: o V2.5.3, da placa das unidades originais ([cópia no device.report](https://device.report/m/c8b05dfa698c6509bcbf880e0996877211eb1dd541aa5d5131874db1b65809c9)), e o V2.5.4, [publicado no site dela](https://www.deepelec.com/files/dp-666/Schematic_DP-666_V2.5.4.pdf).

## Arquitetura

<!--DIAGRAM:arquitetura-->

O sintonizador, o teclado e o relógio dividem o mesmo barramento I²C do ESP32, cada um no seu endereço. A tela e o toque usam SPI. A porta USB-C serve para carregar a bateria e, pelo CH340N, para gravar firmware e conversar com programas no computador.

## Desempenho e faixas

| Parâmetro | Valor |
| --- | --- |
| Sensibilidade em FM | ≤0,5 µV (S/N 30 dB) |
| Sensibilidade em SW, MW e LW | ≤10 µV (S/N 20 dB) |
| Seletividade | ≥60 dB |
| FM | 65 a 108 MHz, bordas configuráveis |
| OIRT | passo de 30 kHz |
| SW | 1700 a 27000 kHz, passo de 5 kHz |
| MW | 522 a 1791 kHz (9 kHz) ou 520 a 1720 kHz (10 kHz) |
| LW | 144 a 513 kHz, passo de 9 kHz |
| AIR | só com conversor externo |
| Bateria | 3,7 V, 5000 mAh (18,5 Wh), cerca de 350 mA e 15 h de uso |
| Medidas | 142×30×80 mm, 300 g |

## Por dentro do rádio

As [fotos de desmontagem de Guido Schotmans](https://wijnants.info/fmdx/august-4-2025-deepelec-dp-666-novice-hurdles-part-2/), publicadas no blog FMDX de wijnants.info, mostram como o rádio é montado; a placa delas é a Mini6686-V2.5.3. Os links para cada foto estão em [Imagens de referência](#hardware--imagens-de-referência).

- **Gabinete:** seis painéis feitos de placa de circuito preta, com as legendas impressas: frente, verso, topo, fundo e as duas laterais. Parafusos pretos e espaçadores de latão os prendem.
- **Verso:** o painel leva a bateria e o alto-falante, este dentro de uma caixa fechada. Os dois chegam à placa por conectores de 2 pinos (J1 e J5).
- **Placa principal:** de um lado ficam o módulo ESP32 e o sintonizador, sob uma blindagem metálica; do outro, a tela e os botões da frente. O encoder e o volume saem pela lateral direita, presos por porcas, e os botões giratórios só se encaixam no eixo.
- **Antenas:** o SMA, no topo, chega à placa por um cabinho coaxial. O ESP32 é a versão WROOM-32U, sem antena própria: o Wi-Fi e o Bluetooth usam uma antena ligada ao módulo por outro cabinho.
- **Bateria:** célula de lítio-polímero com o código 105565 (cerca de 10 × 55 × 65 mm), 3,7 V e 5000 mAh, com plugue de 2 pinos do tipo PH. Numa troca, confira a polaridade antes de ligar: baterias com o mesmo plugue podem vir com os fios invertidos.

Na garantia, não abra o rádio: acione o vendedor ou a DEEPELEC. Para abrir, os parafusos pedem uma chave Allen de 0,7 mm. Solte e encaixe os cabinhos com cuidado, porque o conector deles (U.FL) aguenta cerca de 30 encaixes.

## Alimentação

<!--DIAGRAM:energia-->

A bateria fica sempre ligada a três peças: o carregador, o relógio (quando existe) e o U1, o controlador do botão POWER. O resto da placa recebe energia por um transistor (Q1, SI2305), que só conduz com duas condições juntas:

- **Chave geral em ON:** ela não fica no caminho da corrente. Em OFF, desliga o transistor, e o POWER deixa de ter efeito.
- **POWER ligado:** cada toque alterna o U1. O botão não passa pelo ESP32, então funciona igual em qualquer firmware, mesmo com o rádio travado.

Depois do transistor, três reguladores de 3,3 V dividem as cargas: o U5 alimenta o processador, o U32 a tela e o U6 o sintonizador, que ainda separa a parte analógica da digital com filtros. O amplificador do alto-falante usa a tensão da bateria direto.

- **Carga:** o TP4056 (U20) carrega a bateria com cerca de 0,9 A, valor definido pelo resistor R104, de 1,3 kΩ. Por isso o carregador de 1 A basta, e uma carga completa leva mais de 5 horas. Como o carregador fica antes do transistor, a bateria carrega com a chave em OFF.
- **USB-C:** a porta tem os resistores de 5,1 kΩ que os carregadores USB-C exigem, então funciona também com cabo USB-C nas duas pontas. A ponte USB-serial (CH340N) é alimentada pelo cabo, e não pela bateria.
- **Temperatura:** o sensor de temperatura do TP4056 não é usado, então a carga não para se a bateria esquentar. Carregue longe do sol e de fontes de calor.
- **LED de carga:** duplo, atrás de um guia de luz. Pelo esquema V2.5.3, fica vermelho enquanto carrega e azul quando termina.
- **Leitura da bateria:** dois resistores de 100 kΩ entregam metade da tensão ao GPIO 13.

## Caminho do som

<!--DIAGRAM:audio-->

O áudio sai do TEF6686 já em analógico, pelo conversor interno dele, e o ESP32 não tem acesso ao som. Por isso o Wi-Fi e o Bluetooth não transmitem áudio.

- **Volume:** o VOLUME é um potenciômetro duplo de 10 kΩ, entre o sintonizador e os amplificadores, e vale para o fone e para o alto-falante. Deixe o volume do firmware em 0 dB e ajuste por ele.
- **Fone:** o MAX97220 (U4), alimentado com 3,3 V, entrega som estéreo ao conector de 3,5 mm.
- **Alto-falante:** o TPA6211A1 (U2) soma os canais esquerdo e direito, então o alto-falante toca em mono. Ele é alimentado direto pela bateria.
- **Troca de saída:** quem faz é o próprio conector de fone, sem o firmware. Sem plugue, um contato interno, entre os pinos 6 e 2 do PJ-3270, mantém o alto-falante ligado. Com o plugue, o contato se abre: o amplificador do fone liga e um transistor (QA3) desliga o do alto-falante.

Isso explica o [alto-falante mudo depois de usar fone](#ajuda--audio-alto-falante-mudo-depois-de-usar-fone): se o contato entre os pinos 6 e 2 não volta a fechar, o circuito continua como se houvesse um plugue. Por isso a DEEPELEC manda limpar justamente esses dois pinos.

## Antena

As especificações citam só a antena externa no SMA. Não há antena de ferrite interna, por isso o AM depende de fio externo ou loop.

Na placa, o cabinho do SMA chega a um conector U.FL (J7). Logo na entrada, um diodo (D4) protege o sintonizador contra descargas de eletricidade estática, e o sinal se divide entre uma entrada de FM e outra de AM. Se o sinal sumir de repente, esse cabinho pode ter se soltado.

## Pinos e endereços

Conferidos no esquema V2.5.3 e no código oficial.

| Função | Ligação |
| --- | --- |
| Encoder | A no GPIO 34, B no 36 e o toque no 39 |
| BAND, BW e MODE | GPIO 4, 25 e 26 (no esquema, o 4 se chama STB) |
| Potenciômetro do squelch | GPIO 35 |
| Leitura da bateria | GPIO 13 |
| I²C | SDA no GPIO 21 e SCL no 22 |
| SPI da tela e do toque | MOSI no GPIO 23, MISO no 19 e clock no 18 |
| Tela: CS, DC e RST | GPIO 5, 17 e 16 |
| Luz da tela, em PWM | GPIO 2 |
| Toque: CS e interrupção | GPIO 32 e 33 |
| Interrupção do teclado | GPIO 14 |
| Cristal do sintonizador | GPIO 15 |
| BOOT | GPIO 0 |
| Serial do CH340N | UART0 (TX0 e RX0) |
| Sintonizador | I²C 0x64 (0x65 em alguns módulos) |
| Teclado (XL9555) | I²C 0x20 |
| Relógio (RTC) | I²C 0x32 |

- **Bateria e Wi-Fi:** o GPIO 13 usa o conversor ADC2 do ESP32, que não funciona com o Wi-Fi ligado. Por isso a leitura da bateria some quando o Wi-Fi está ativo, nos dois firmwares.
- **Cristal:** o código lê a tensão no GPIO 15 para saber o cristal do sintonizador. Na V2.5.3, um resistor para o terra deixa o pino em 0 V, que indica 9,216 MHz. Na V2.5.4, um segundo resistor leva o pino a cerca de 1,1 V, que indica 12 MHz.
- **Gravação:** o CH340N não tem como reiniciar o ESP32 sozinho, porque o pino RTS# dele fica solto. Por isso o [modo de gravação](#backup) pede o BOOT na mão.
- **POWER:** não aparece na tabela porque não chega ao ESP32. Ele age direto na alimentação.
- **S-meter analógico:** o código oficial manda o nível de sinal em PWM pelo GPIO 27, para um medidor de ponteiro. No DP-666, essa saída (METER-DRV no esquema) não vai a nenhum conector. O GPIO 12 fica sem ligação.

## Componentes e datasheets

Os códigos U2, U3 e assim por diante são as referências do esquema, iguais no V2.5.3 e no V2.5.4. Quando o fabricante não publica o documento, o link aponta para um espelho e isso aparece no nome do link.

<!--COMPONENTS-->

O esquema também usa transistores genéricos, de vários fabricantes: o SI2305 (Q1, MOSFET P), que liga a placa; o SS8050 (Q3, NPN), que acende a luz da tela; e o WNM2030 (QA3, MOSFET N), que desliga o amplificador do alto-falante quando entra o fone.

## Revisões da placa

As notas de cada versão vêm dos próprios esquemas: o V2.5.3 traz as de v2.5.1 a v2.5.3, e o V2.5.4 repete essas e acrescenta as dele.

- **Original:** a DEEPELEC diz que as unidades originais usam a placa V2.5.3, impressa Mini6686-V2.5.3.
- **v2.5.1:** os capacitores de entrada do alto-falante (C51 e C9) passaram de 0,1 para 0,33 µF. Com isso, a frequência abaixo da qual os graves são cortados cai para cerca de um terço.
- **v2.5.2:** entrou o C15, de 1 µF, no pino EN do ESP32. É o capacitor que a Espressif recomenda para atrasar o reset na partida.
- **v2.5.3:** entrou o relógio (RTC, U11).
- **v2.5.4:** é a versão do esquema que a DEEPELEC publica; a página do rádio não diz a partir de quando as unidades saem com ela. O relógio passou a ser o RS4C8010BW, compatível com o RX8010SJ. O R33, entre a chave geral e o transistor que liga a placa, passou de 1 kΩ para 100 kΩ, o que faz esse transistor ligar e desligar mais devagar. E o sintonizador passou a usar um cristal de 12 MHz, no lugar do de 9,216 MHz; o novo R49, de 20 kΩ, avisa o firmware pelo GPIO 15. O código oficial e o do projeto do DP-666 leem esse pino, então se ajustam sozinhos às duas placas.
- **Clones:** a placa V2.5 aparece em clones como os da SPARKELEC, sem RTC. O que muda neles está em [Clones](#ajuda--clones), nos Problemas comuns.
- **Relógio interno:** só as unidades enviadas a partir de 01/04/2025 têm RTC. Como o esquema V2.5.3 já o inclui, as placas V2.5.3 anteriores devem ter o lugar dele vazio, o que combina com a sugestão da DEEPELEC de instalar o chip por conta própria; ela não oferece essa atualização. O esquema V2.5.3 e o anúncio chamam o chip de RX8010SJ.

## Como saber a revisão da sua placa

O firmware não mostra a versão da placa: o System information traz a versão do firmware, a data de compilação, o sintonizador e o patch. Com certeza, só abrindo o rádio. Sem abrir, dá para estreitar:

- **Relógio interno:** faça o [teste de RTC](#hardware--teste-de-rtc). Sem RTC, a placa é uma V2.5.3 enviada antes de 01/04/2025. Com RTC, pode ser uma V2.5.3 mais nova ou uma V2.5.4, porque o relógio continua na v2.5.4.
- **Clone:** se for um clone, a placa é a V2.5 ([como reconhecer](#ajuda--clones)).
- **Data e número de série:** a página do DP-666 não liga datas nem números de série às versões da placa. A DEEPELEC pode informar a versão pelo número de série da etiqueta lateral.
- **Abrindo:** a versão vem impressa na placa principal, ao lado da blindagem metálica do sintonizador; nas fotos do Guido, Mini6686-V2.5.3. Os parafusos pedem chave Allen de 0,7 mm. Na garantia, não abra.

### Pelo cristal, sem abrir

A diferença que o firmware enxerga é o cristal do sintonizador: 9,216 MHz na V2.5.3 e 12 MHz na V2.5.4. O código oficial só escreve qual cristal achou numa compilação de depuração. O teste dá trabalho e troca o firmware do rádio, então só vale se você já pensa em mexer nele:

1. Faça o [backup completo](#backup--fazer-o-backup-completo).
2. Siga [Compilar o código](#backup--compilar-o-código) e, antes de gravar, escolha Tools → Core Debug Level → Debug no Arduino IDE.
3. Com o cabo ligado e o monitor serial aberto em 115200 bauds, ligue o rádio no POWER. Procure a linha com `TEF668X XTAL`: `9.216M` indica V2.5.3 e `12M` indica V2.5.4. Se o texto sair embaralhado, tente 19200 bauds.
4. [Restaure o backup](#backup--restaurar-o-backup) para voltar ao firmware de antes.

## Teste de RTC

Para saber se o seu aparelho tem relógio interno: acerte a hora, desligue a chave geral por 1 minuto e religue com o Wi-Fi desligado. Se a hora continuar certa, há RTC.

O RTC é alimentado direto pela bateria, antes da chave geral, e não tem bateria própria. Por isso ele mantém a hora com a chave em OFF, mas a perde se a bateria for desconectada ou se esgotar por completo.

Segundo a DEEPELEC, no Megatron acertar a data e a hora do relógio pede o Mod17 de 05/04/2025 (pacote TEF6686_ESP32_2.0.15mod17-20250405). Na linha oficial, o suporte veio no pacote v2.20.8.

## Imagens de referência

As fotos de terceiros têm direitos reservados, então o guia não as copia: cada item abaixo abre a imagem ou a página no site de origem.

<!--REFS:hardware-->

## Fontes

- [DEEPELEC — esquema elétrico V2.5.3 (cópia no device.report)](https://device.report/m/c8b05dfa698c6509bcbf880e0996877211eb1dd541aa5d5131874db1b65809c9)
- [DEEPELEC — esquema elétrico V2.5.4](https://www.deepelec.com/files/dp-666/Schematic_DP-666_V2.5.4.pdf)
- [Guido Schotmans — DP-666 desmontado e o erro do encoder (wijnants.info, 04/08/2025)](https://wijnants.info/fmdx/august-4-2025-deepelec-dp-666-novice-hurdles-part-2/)
- [DEEPELEC DP-666](https://www.deepelec.com/en/dp-666/)
- [DEEPELEC — RTC no DP-666](https://www.deepelec.com/en/2025/04/09/dp-666-add-rtc/)
- [PE5PVB — TEF6686_ESP32.ino, com os pinos usados](https://github.com/PE5PVB/TEF6686_ESP32/blob/main/TEF6686_ESP32.ino)
- [PE5PVB — TEF668X.cpp, com a leitura do cristal no GPIO 15](https://github.com/PE5PVB/TEF6686_ESP32/blob/main/src/TEF668X.cpp)
- [Wiki do TEF6686_ESP32 — configuração da tela, com os pinos](https://github.com/PE5PVB/TEF6686_ESP32/wiki/Installing-the-software)
- [Espressif — checklist do esquema do ESP32 (atraso no CHIP_PU)](https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32/schematic-checklist.html)
- [Hirose U.FL — 30 ciclos de encaixe (DigiKey)](https://www.digikey.co.nz/en/ptm/h/hirose-electric/u_fl-and-w_fl-series-connectors/tutorial?slide=8)
- [DEEPELEC — clones](https://www.deepelec.com/2025/10/10/stay_away_from_cloned_products)
- [Manual DP-666 Megatron Mod17](https://www.deepelec.com/files/dp-666/DP-666_UM_EN_Megatron_Mod17.pdf)
- [Radiomuseum — DEEPELEC DP-666](https://radiomuseum.org/r/unknownprc_deepelec_dp_666.html)
- [PE5PVB/TEF6686_ESP32](https://github.com/PE5PVB/TEF6686_ESP32)
- [flyoob/TEF6686_ESP32 (projeto do DP-666)](https://github.com/flyoob/TEF6686_ESP32)
