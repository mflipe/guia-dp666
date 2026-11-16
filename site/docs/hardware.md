# Hardware

O DP-666 junta um sintonizador NXP TEF6686, que faz todo o trabalho de rádio, a um módulo ESP32, que cuida da tela, dos botões e das conexões. Esta página mostra como as peças se ligam e traz o datasheet de cada uma. A referência é o esquema elétrico V2.5.4, publicado pela DEEPELEC.

## Arquitetura

<!--DIAGRAM:arquitetura-->

O sintonizador, o teclado e o relógio dividem o mesmo barramento I²C do ESP32, cada um no seu endereço. A tela e o toque usam SPI. A porta USB-C serve para carregar a bateria e, pelo CH340N, para gravar firmware e conversar com programas no computador.

## Componentes e datasheets

Os códigos U2, U3 e assim por diante são as referências do esquema V2.5.4. Quando o fabricante não publica o documento, o link aponta para um espelho e isso aparece no nome do link.

<!--COMPONENTS-->

Também aparecem no esquema transistores de uso geral, como o SI2305 (MOSFET P) e o SS8050 (NPN), que chaveiam a alimentação. São peças genéricas, de vários fabricantes.

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

## Pinos e endereços no código oficial

| Função | Ligação |
| --- | --- |
| Encoder | GPIO 34, 36 e 39 |
| BAND, BW e MODE | GPIO 4, 25 e 26 |
| Potenciômetro do squelch | GPIO 35 |
| Leitura da bateria | GPIO 13 |
| Tela (SPI): CS, DC e RST | GPIO 5, 17 e 16 |
| Toque (SPI): CS | GPIO 32 |
| Interrupção do toque | GPIO 33 |
| Interrupção do teclado | GPIO 14 |
| Sintonizador | I²C 0x64 (0x65 em alguns módulos) |
| Teclado (XL9555) | I²C 0x20 |
| Relógio (RTC) | I²C 0x32 |

O GPIO 13 usa o conversor ADC2 do ESP32, que não funciona com o Wi-Fi ligado. Por isso a leitura da bateria some quando o Wi-Fi está ativo, nos dois firmwares.

## Revisões da placa

- **Original:** a DEEPELEC diz que as unidades originais usam a placa V2.5.3. O esquema publicado no site dela é o V2.5.4.
- **Clones:** a placa V2.5 aparece em clones como os da SPARKELEC, sem RTC. O manual V2.0 distribuído pela Raddy é o mesmo do repositório da SPARKELEC, por isso não serve de referência para o aparelho original.
- **Relógio interno:** só as unidades enviadas a partir de 01/04/2025 têm RTC. A DEEPELEC não oferece a atualização para as anteriores e diz que quem quiser pode tentar instalar o chip por conta própria. O anúncio dela chama o chip de RX8010SJ; o esquema V2.5.4 marca RS4C8010BW, com a nota de que ele é compatível com o RX8010SJ.

## Antena

As especificações citam só a antena externa no SMA, ligada à placa por um cabo IPEX. Não há antena de ferrite interna, por isso o AM depende de fio externo ou loop.

## Teste de RTC

Para saber se o seu aparelho tem relógio interno: acerte a hora, desligue a chave geral por 1 minuto e religue com o Wi-Fi desligado. Se a hora continuar certa, há RTC.

Segundo a DEEPELEC, acertar a data e a hora do relógio pede o Megatron Mod17 de 05/04/2025 (pacote TEF6686_ESP32_2.0.15mod17-20250405).

## Imagens de referência

As fotos de terceiros têm direitos reservados, então o guia não as copia: cada item abaixo abre a imagem ou a página no site de origem.

<!--REFS:hardware-->

## Fontes

- [DEEPELEC — esquema elétrico V2.5.4](https://www.deepelec.com/files/dp-666/Schematic_DP-666_V2.5.4.pdf)
- [DEEPELEC DP-666](https://www.deepelec.com/en/dp-666/)
- [DEEPELEC — RTC no DP-666](https://www.deepelec.com/en/2025/04/09/dp-666-add-rtc/)
- [Wiki do TEF6686_ESP32 — configuração da tela, com os pinos](https://github.com/PE5PVB/TEF6686_ESP32/wiki/Installing-the-software)
- [DEEPELEC — clones](https://www.deepelec.com/2025/10/10/stay_away_from_cloned_products)
- [Manual DP-666 Megatron Mod17](https://www.deepelec.com/files/dp-666/DP-666_UM_EN_Megatron_Mod17.pdf)
- [Radiomuseum — DEEPELEC DP-666](https://radiomuseum.org/r/unknownprc_deepelec_dp_666.html)
- [PE5PVB/TEF6686_ESP32](https://github.com/PE5PVB/TEF6686_ESP32)
- [flyoob/TEF6686_ESP32 (projeto do DP-666)](https://github.com/flyoob/TEF6686_ESP32)
