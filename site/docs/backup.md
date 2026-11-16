# Backup, gravação e restauração

Um backup completo do flash guarda tudo: firmware, configurações, memórias e arquivos internos. Com ele, qualquer experimento pode ser desfeito.

## Mapa do flash (4 MB)

<!--DIAGRAM:flash-->

| Partição | Endereço | Tamanho | Conteúdo |
| --- | --- | --- | --- |
| nvs | 0x9000 | 20 KB | configurações e memórias |
| otadata | 0xE000 | 8 KB | controle de inicialização |
| app0 | 0x10000 | 3072 KB | o firmware |
| spiffs | 0x310000 | 896 KB | logos, esquemas, planos, nomes e My settings |
| coredump | 0x3F0000 | 64 KB | registro de falhas |

Os pacotes analisados do Mod17 e da v2.20 usam o mesmo mapa.

## Modo de gravação

Com a chave geral em ON, segure o BOOT e aperte POWER. No Windows, instale antes o [driver CH340 que a DEEPELEC disponibiliza](https://www.deepelec.com/files/dp-666/CH341SER.zip). O rádio aparece como uma porta COM no Windows, /dev/ttyUSB0 no Linux ou /dev/cu.wchusbserial… no macOS.

O esptool é a ferramenta de linha de comando da Espressif. Ela instala com `pip install esptool`.

## Fazer o backup completo

```
esptool --chip esp32 --port COM3 --baud 921600 read_flash 0 0x400000 dp666_backup.bin
```

Troque COM3 pela sua porta. Se der erro, repita com `--baud 460800`. Guarde o arquivo de 4 MB em mais de um lugar.

## Restaurar o backup

```
esptool --chip esp32 --port COM3 --baud 921600 write_flash 0 dp666_backup.bin
```

O rádio volta exatamente ao estado do backup, com firmware, ajustes e memórias.

## Como o flash.bat grava o Mod17

O script do pacote usa o esptool a 921600 baud, modo DIO, 80 MHz e 4 MB. Ele grava o bootloader em 0x1000, a tabela de partições em 0x8000, o boot_app0 em 0xE000, o firmware em 0x10000 e a área de arquivos em 0x310000.

!!! warning "Gravar firmware apaga dados"
    O flash.bat reescreve a área de arquivos inteira (896 KB), onde ficam esquemas, planos, nomes e My settings. O changelog do Megatron também avisa que as atualizações zeram as configurações. Faça o backup antes.

## Instalar a linha oficial

### Pacote pronto

O GitHub do PE5PVB tem uma página de Releases, com as versões mais estáveis, que nem sempre são as mais novas. Os pacotes com ARS no nome são dos kits da AmateurRadioShop. Para o DP-666, prefira o pacote da DEEPELEC, já preparado para ele.

1. Coloque o rádio no modo de gravação (veja acima). A wiki descreve o jeito genérico: segurar BOOT ao ligar o cabo USB, com o rádio ligado e a tela apagada.
2. Descompacte o pacote e rode o `flash.bat`.
3. Informe a porta COM. Se o script não listar as portas, abra o Gerenciador de Dispositivos (Win+R e `devmgmt.msc`) e veja em Portas.
4. Espere a mensagem "Leaving... Hard resetting via RTS pin...". Desligue o rádio, tire o cabo e ligue de novo.

### Compilar o código

É o caminho para ter as correções que saíram depois do último pacote, como as do teclado e do sintonizador de novembro de 2026.

1. Baixe o código com `git clone https://github.com/PE5PVB/TEF6686_ESP32` ou pelo ZIP do repositório.
2. No Arduino IDE, em Preferences, acrescente o endereço de placas `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`. Depois instale o pacote esp32 da Espressif, na versão 3.x, pelo Boards Manager e escolha a placa ESP32 Dev Module.
3. Instale as bibliotecas TFT_eSPI, ESP32Time e Hash em Sketch → Include Library → Add .ZIP Library, sem descompactar os ZIPs. Os links estão no começo do arquivo TEF6686_ESP32.ino.
4. Em Partition scheme, escolha Custom.

No arquivo `User_Setup.h` da biblioteca TFT_eSPI (em Documents/Arduino/libraries/TFT_eSPI), deixe ativas só as linhas abaixo e comente todo o resto. A primeira linha ativa os padrões do DP-666.

```
#define DEEPELEC_DP_66X
#define ILI9341_DRIVER
#define TFT_DMA_SUPPORT
#define TFT_CS   5
#define TFT_DC   17
#define TFT_RST  16
#define TOUCH_CS 32
#define SPI_FREQUENCY        7500000
#define SPI_READ_FREQUENCY  20000000
#define SPI_TOUCH_FREQUENCY  2500000
#define SMOOTH_FONT
```

Se aparecer ruído perto de 90 MHz, diminua o `SPI_FREQUENCY`. Para gravar, clique em Verify, escolha a porta em Tools → Port, coloque o rádio no modo de gravação e clique em Upload. No fim aparece "Done uploading".

!!! warning "O código atual usa outro mapa de partições"
    Desde 16/02/2026, o `partitions.csv` do repositório dá mais espaço ao firmware e menos aos arquivos. Na v2.20.12, são nvs de 16 KB, firmware de 3.776 KB, coredump de 64 KB e área de arquivos de 192 KB, sem OTA. O mapa dos pacotes analisados acima tem firmware de 3.072 KB e área de arquivos de 896 KB. Ao trocar de mapa, a área de arquivos é recriada e o logbook começa vazio; as configurações também podem voltar ao padrão. Faça o backup completo antes e, para voltar, restaure o backup inteiro.

## Depois de gravar

- Calibre o toque e reconfigure o Wi-Fi.
- Confira o fuso, o servidor NTP e os ajustes da [Configuração para o Brasil](brasil.md).
- Baixe firmwares só do site da DEEPELEC, que alerta para a existência de clones. Pacotes de repositórios de clones podem ser de outra placa.

## Fontes

- [DEEPELEC DP-666 — downloads](https://www.deepelec.com/en/dp-666/)
- [esptool — documentação](https://docs.espressif.com/projects/esptool/en/latest/esp32/)
- [DEEPELEC — driver CH341SER para Windows (zip)](https://www.deepelec.com/files/dp-666/CH341SER.zip)
- [SparkFun — como instalar o driver CH340, com os links da WCH](https://learn.sparkfun.com/tutorials/how-to-install-ch340-drivers)
- [Wiki do TEF6686_ESP32 — Installing the software](https://github.com/PE5PVB/TEF6686_ESP32/wiki/Installing-the-software)
- [PE5PVB — Releases](https://github.com/PE5PVB/TEF6686_ESP32/releases/)
- [PE5PVB — partitions.csv atual](https://github.com/PE5PVB/TEF6686_ESP32/blob/main/partitions.csv)
- [PE5PVB — histórico do partitions.csv](https://github.com/PE5PVB/TEF6686_ESP32/commits/main/partitions.csv)
- [Random Nerd Tutorials — ESP32 no Arduino IDE](https://randomnerdtutorials.com/installing-the-esp32-board-in-arduino-ide-windows-instructions/)
- [Vídeo indicado pela wiki: instalar e atualizar o firmware](https://www.youtube.com/watch?v=cXZ5rHwfRz4)
