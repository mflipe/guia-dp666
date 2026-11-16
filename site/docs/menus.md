# Menus explicados

O que cada grupo de opções faz no Megatron Mod17, com foco no que o manual não explica. O manual marca em vermelho os itens do modo avançado; para ver todos, ative o modo avançado (veja [Configuração para o Brasil](brasil.md)). O menu da linha oficial está em [Uso da linha oficial](oficial.md). Todos os valores possíveis de cada opção estão em [Ajustes do rádio](#ajustes).

## Main settings

- **Model selector:** Base, Portable ou Portable touch. No DP-666, use Portable touch. Algumas funções só funcionam nesse modo, e o firmware avisa.
- **Set AM band:** permite tirar a faixa AIR da rotação do BAND.
- **Screensaver:** Off, 3, 10, 30 ou 60 s, com tela apagada ou brilho de 1%, 25% ou 50%.
- **Set first page:** tela principal, menu, teclado, atalhos, RDS avançada ou AF. O firmware também tem Main page + Keypad.
- **Power Off timer:** desligamento automático de 1 a 480 min.
- **Dynamic SPI speed:** de 5 a 70 MHz ou Auto. Use Auto se ouvir apitos causados pela tela.
- **Auto still screen e Still screen timer:** tela estática automática depois de 0 a 120 s.

## Audio settings

- **Set volume:** ganho interno do TEF, de −60 a +24 dB, padrão 0. Mantenha em 0 para evitar distorção.
- **Stereo threshold:** Off ou de 30 a 60 dBµV. Abaixo do limiar, o rádio força o mono.
- **High cut:** corta agudos entre 1500 e 7000 Hz abaixo de um limiar de 20 a 60 dBµV.
- **Beep at operation (firmware):** bipe a cada operação, além do Beep at band edge.

## Display settings

- 15 temas e 6 fontes de frequência.
- **Intervalo do medidor:** de 30 a 1000 ms. Mais lento significa menos ruído da tela.
- **Extras do firmware:** estilo do medidor; nome, dados e dicas da frequência, com cores; cor do relógio; notificações; logo de abertura com moldura; Power saving mode.

## RDS settings

- **Region:** Europe para o Brasil; USA usa a tabela americana de PTY (RBDS).
- **RDS filter On:** usa blocos já filtrados pelo TEF. Off entrega dados brutos, com mais erros (código-base).
- **Fast PS:** mostra o nome da emissora mais rápido, com risco de lixo na tela.
- **RT buffering:** mostra o RadioText completo, em vez de letra por letra.
- **Use AF:** troca para a frequência alternativa do mesmo programa quando o sinal cai. Desligue em DX e buscas.
- **Show RDS clock:** só exibe a hora. RDS time sync é outra opção.
- **Vista RDS avançada (código-base):** mostra PI, ECC, LIC, PIN, flags DI, AF, EON, RT+, aplicações ODA e erros por bloco.

## FM settings

- **Faixa:** de 76 a 108 MHz, cobre também o FM estendido.
- **Set level offset:** −25 a +15 dB. **Set low level threshold:** −15 a 30 dBµV. No código-base, abaixo dele o rádio acinzenta o RDS e a modulação.
- **FM AGC:** 92, 90, 87 ou 84 dBµV. Em 92 é o mais sensível.
- **FMSI:** só funciona nos chips TEF6687 e TEF6689.
- **Set FML band:** 65 a 74 MHz (OIRT) ou 76 a 87 MHz. Não importa enquanto Set FM band estiver em FM.

## AM settings

- **AM RF Level offset:** −50 a +15 dB.
- **CoChannel:** 100% e 3 são o padrão do código-base.
- **AM ATT:** Off ou de 6 a 36 dB. **AM AGC:** 94 a 102 dBµV.
- **MW default stepsize:** 10 kHz nas Américas.
- **AIR:** exige conversor externo.

## Connectivity

- USB mode XDRGTK ou RDS Spy; Wi-Fi active; Configure Wi-Fi; IP e ID (1 a 10) do Stationlist; tela apagada no XDRGTK; desconexão automática do Wi-Fi (1 a 1440 min); Bluetooth.
- **Extras do firmware:** Wi-Fi por teclado ou navegador; até 3 redes; senha do XDRGTK com até 8 caracteres; Set NTP server; After time sync no Wi-Fi auto disconnect; Config slave host, por Bluetooth, sem documentação.

## Operation settings

- **Toque:** tipo Int33, Int27, Off ou Polling; calibração; intervalo de 300 ms.
- **Knob:** modo Classic ou New, ajuste do squelch pelo knob, girar com a tela apagada, inverter o sentido e aceleração (Off, Medium ou Fast).
- **Toque longo em knob, BW, MODE ou BAND:** ação original, menu, teclado, atalhos, RDS avançada, AF ou trava. O firmware também tem Frequency list e Band keypad.

## Other settings

- Data, hora, fuso, NTP time sync e RDS time sync.
- **Delete RDS dictionary:** "Deleted" e "Not deleted" são só estados. Não indicam que algo foi apagado.
- **System information:** versão, data de compilação, memória, espaço de arquivos, sintonizador, servidor NTP, IP e MAC.
- **Extras do firmware:** Power on timer, correção do relógio em segundos por 24 h, proteção de bateria baixa, Developer mode, Manage my data e resets de esquemas, planos e faixas.

## My settings

- Esquemas de busca (ATS) e de scan.
- Até 4 temas favoritos com troca automática, sequencial ou aleatória.
- **Receive plan:** liga e desliga o rádio por agenda, em faixa e frequência definidas.
- **My Shortcut icon:** 7 atalhos configuráveis, entre eles estéreo, auto BW, iMS, EQ, RDS, AF, tela, squelch pelo knob, relógio, sincronizar hora, tema, plano e tela estática.
- **Save my settings:** um "padrão de fábrica" pessoal. Fica no armazenamento de arquivos e se perde quando o firmware é regravado.

## Fontes

- [Manual DP-666 Megatron Mod17](https://www.deepelec.com/files/dp-666/DP-666_UM_EN_Megatron_Mod17.pdf)
- [Manual em chinês do Mod17](https://www.deepelec.com/files/dp-666/DP-666_UM_CN_Megatron_Mod17.pdf)
- [PE5PVB/TEF6686_ESP32](https://github.com/PE5PVB/TEF6686_ESP32)
