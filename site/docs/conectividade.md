# Conectividade e controle remoto

O que dá para fazer com o DP-666 pelo Wi-Fi, pelo USB e pelo Bluetooth.

## Wi-Fi

- **Configurar:** pelo teclado na tela ou pelo navegador. No navegador, conecte-se à rede `ESP_…` do rádio e abra http://192.168.4.1. O Mod17 guarda até 3 redes. Só funcionam redes de 2,4 GHz.
- **Para que serve:** acertar a hora pela internet (NTP) e as conexões descritas abaixo. O Wi-Fi não transmite áudio.
- **Cuidado com a bateria:** com o Wi-Fi ligado, o rádio não mede a bateria, e o indicador e a proteção de bateria baixa deixam de funcionar. Use Wi-Fi auto disconnect em After time sync.

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

## Programas compatíveis

O que cada programa faz, o que você precisa e o passo a passo de cada ligação estão em [Usar com o computador](computador.md).

- **XDR-GTK (Windows e Linux):** controle completo e gráficos de sinal e espectro.
- **fm-dx-webserver:** servidor de código aberto, criado por Marek Farkaš (Noobish) e pela comunidade FMDX, que põe o rádio no navegador de qualquer aparelho, com áudio, painel de administração e chat. Roda em Windows e Linux com Node.js. O áudio vem da entrada de som do computador, por cabo ligado à saída de fone do rádio. Declara suporte a receptores TEF668x com o firmware do PE5PVB; com o Mod17, a compatibilidade é provável, mas não confirmada.
- **RDS Spy (Windows):** análise detalhada do RDS, pelo USB (19200 baud) ou pelo Wi-Fi, e sintonia de FM.
- **StationList (PC):** o rádio envia PI, PS, AF e outros dados por UDP (portas 9030 e 9031), e o programa pode mudar a frequência.
- **TEF Logger App:** só para Android e só com o firmware oficial v2.20 ou mais novo.

## iPhone

Não há app de iPhone que fale direto com o rádio, e o iPhone não consegue usar o adaptador USB-serial (CH340) do DP-666. O caminho é o fm-dx-webserver num computador ligado ao rádio, aberto no navegador do iPhone.

## Comandos pelo USB

- **Megatron:** `$time: HH:MM:SS`, `$name: NOME` e `$reboot`, a 115200 baud. O pacote traz arquivos .bat para Windows. Veja também os comandos internos em [Recursos ocultos do Mod17](mod17.md).
- **Linha oficial:** `s` lista todas as memórias; `S` grava uma memória (posição, frequência, filtro, mono/estéreo, PI e PS) e responde com um código de erro; `l` ou `L` exporta o registro de estações em CSV. Esses comandos só funcionam pelo USB.
- **Linha oficial pelo Wi-Fi:** o rádio serve uma página com o registro de estações em http://tef.local ou no IP dele. Como registrar estações está em [Uso da linha oficial](oficial.md).

## Bluetooth

- **Áudio:** não funciona. O firmware não tem perfis de áudio, então fones e caixas Bluetooth não se conectam. Quem quer Bluetooth de áudio precisa de outro rádio (veja [Comparação](comparacao.md)).
- **Mod17:** usa o Bluetooth só na função "slave host", em que o rádio se conecta a outro aparelho e o controla. O firmware pede para desligar o Wi-Fi antes.
- **Linha oficial:** não usa Bluetooth.

## Fontes

- [FMDX.org — FM-DX Webserver](https://fmdx.org/projects/webserver.php)
- [FM-DX Webserver no GitHub](https://github.com/NoobishSVK/fm-dx-webserver)
- [TEF Logger App — documentação](https://highpoint.fmdx.org/manuals/TEF-Logger-App-Documentation.html)
- [PE5PVB — código de comunicação](https://github.com/PE5PVB/TEF6686_ESP32/blob/main/src/comms.cpp)
- [PE5PVB — protocolo de canais de memória](https://github.com/PE5PVB/TEF6686_ESP32/blob/main/docs/Memory%20channel%20protocol.pdf)
- [Fórum da Apple — USB-serial no iPhone](https://origin-devforums.apple.com/forums/thread/834899)
