# Recursos ocultos do Mod17

Levantamento do que existe no firmware Megatron Mod17 e não aparece no manual. A base foram cerca de 500 textos de interface reconstruídos do firmware (inglês e chinês, alinhados um a um), 56 mensagens e a lista de modelos, cruzados com os manuais em inglês e em chinês e com o changelog do autor (mod11 a mod17).

O firmware não diz em qual submenu cada item fica. Os itens estão agrupados por assunto e podem ser encontrados pelo nome em inglês, com o modo avançado ligado.

## Opções escondidas em itens que o manual já cita

- **Search & save mode:** além de Overwrite e Append, existe Continuously append ✅.
- **Wi-Fi auto disconnect:** além de 1 a 1440 min, há After time sync, que desliga o Wi-Fi depois de acertar a hora ✅.
- **RDS Show underscore:** Off, PS only e On. O manual em inglês só cita Off e On ✅.
- **Keep BAND key 3 sec.:** Power off, Mute screen (apaga a tela) ou Disable. O manual em inglês só cita Power off ✅.
- **Long press Band key:** existe; o manual em inglês repete "Long press Rotary key" no lugar dele ✅.
- **Toques longos (knob, BW, MODE e BAND):** além das opções do manual, há Frequency list e Band keypad. Nome ✅, função 🟡.
- **Set first page:** opção Main page + Keypad 🟡. Com Open menu, aparece Select menu group, para escolher o grupo que abre ✅.
- **Set UI round:** escolhe o que fica arredondado: Menu, Button, Icon ou Border ✅.
- **Region USA (DB):** depende de um banco de emissoras dos EUA que não está no armazenamento do Mod17. Não importa no Brasil 🟡.

## Itens de menu ausentes do manual

### Tela e aparência

- **Meter display style** (Classic ou New) ✅. É o item que o manual chama de "Color bar display mode", nome que não existe no firmware.
- **Show radio name** ✅: mostra o nome definido pelo comando `$name` na abertura e no rodapé, quando não há RadioText.
- **Clock color, Debug info color e Debug refresh interval** ✅.
- **Notificações:** Show notification, Notification mode (Auto, Message bar ou Message box), Notification hold e Notification color ✅.
- **Nomes por frequência:** My frequency name, Show frequency name, Reset frequency name e Frequency name color ✅. Ficam em arquivos internos separados para FM e AM; como editar os nomes ainda não está claro ❓.
- **Show frequency tips** 🟡: etiqueta de força do sinal, de RDX (remoto) e WEK (fraco) a MED (médio), STR (forte) e SPR (super).
- **Logo de abertura:** My logo image usa uma imagem da pasta interna de logos ✅, e My logo border aplica molduras como retângulo, elipse, círculo, hexágono ou coração ✅. Como enviar a imagem não está documentado.
- **Troca automática de tema:** Auto switch Interval, Theme switch range e Theme switch method (Sequential ou Random) ✅.
- **Show communication** 🟡: mostra na tela os comandos recebidos numa sessão remota.
- **Power saving mode:** nome ✅, efeito desconhecido ❓.
- **Developer mode** ❓: melhor não mexer.

### Operação

- **Beep at operation** ✅: bipe a cada operação.
- **Auto save change e handle data change** ✅: com o salvamento automático desligado, ao sair do menu o rádio mostra "Change pending" e pergunta Save ou Discard.
- **Off screen tuning** ❓: o rótulo chinês significa "operação às cegas"; parece ligado a operar com a tela apagada.

### Busca, scan e memórias

- **Band save mode** 🟡: Mixed Save, Save by band ou Save by time segment.
- **TTM** 🟡: conjuntos de memórias por horário, com troca automática ou manual.
- **SW seek by range** 🟡: limita a busca manual em SW à faixa de SW search start/stop.
- **Wait on signal only** ✅: no DX scan, só espera nas frequências com sinal.
- **Hold time** ❓: provavelmente o tempo de parada no modo Stay.
- **Resets:** Reset ATS Scheme, Reset Scan Scheme, Reset Receive Plan e Reset All bands ✅.
- **Delete my settings** ✅: apaga o "My settings" salvo.

### Energia e relógio

- **Power on timer** ✅: liga o rádio por horário.
- **Sleep clock correction** ✅: corrige o relógio, em segundos por 24 h, enquanto o rádio está desligado. Útil em aparelhos sem RTC.
- **Low battery protect e Low battery threshold** ✅: provavelmente desligam o rádio abaixo de um limite de tensão 🟡.
- **Set NTP server** ✅: troca o servidor de hora. O padrão é cn.pool.ntp.org.

## Páginas e telas sem documentação

- **Frequency list** 🟡: lista de frequências, provavelmente as memórias.
- **Band keypad** 🟡: teclado para escolher a faixa diretamente.
- **Select FM/AM bandwidth filter** 🟡: seletor de largura de banda em lista.
- **Select SW meter band** ✅: seletor de banda métrica do SW.
- **Assistente de configuração** ✅: roda depois do reset de fábrica. Etapas: idioma, modelo do rádio, girar a tela, se a tela tem toque, tipo de toque, sentido do encoder, inverter cores, calibração e modo de uso. Modelos listados: Unknown, Original DIY, Hong6686 V1, V2 Basic, V2 Touch, V3 Mini, TabbyCat6686 Basic e Touch, e DEEP DP-666.
- **RDS avançada** ✅: PI, PS e Long PS, PTY, RT e eRT, RT+, AF, EON, ECC, LIC, PIN, flags DI, TP, TMC, referência DAB, aplicações ODA e erros por bloco.
- **Créditos** ✅: "Main code: PE5PVB" e lista de colaboradores.

## Arquivos internos de dados

O Mod17 guarda parte dos dados em arquivos no armazenamento interno (SPIFFS), e não na área de configurações:

| Arquivo | Conteúdo provável |
| --- | --- |
| /datas/scan.sch | esquemas de scan e de busca |
| /datas/plan.dat | planos de recepção |
| /datas/fmname.idx e .dat | nomes por frequência em FM |
| /datas/amname.idx e .dat | nomes por frequência em AM |
| /datas/settings.dat | cópia dos ajustes feita por Save my settings |

Regravar o firmware reescreve essa área inteira, por isso esses dados se perdem numa atualização sem backup.

## Conectividade e protocolos

- **Wi-Fi** ✅: guarda até 3 redes. Configure Wi-Fi aceita teclado na tela ou navegador, pelo portal em http://192.168.4.1 ao entrar na rede do rádio. O manual descreve o Wi-Fi como "em desenvolvimento".
- **XDR-GTK pelo Wi-Fi** ✅: porta TCP 7373, com senha de até 8 caracteres. Inclui comandos que entraram na linha oficial depois da v2.00, como squelch automático, estéreo/mono e iniciar ou parar o DX scan 🟡.
- **RDS Spy por TCP e Stationlist (UDP 9030/9031)** ✅: herdados do código-base.
- **Leitura das memórias pelo USB** 🟡: o firmware contém as respostas do comando `s` do protocolo oficial de memórias. Não há sinal do comando de gravação `S`.
- **Manage my data** ✅: modo em que o rádio fica esperando comandos do PC ("Waiting for manage command..."). No mod16, servia para transferir esquemas, nomes, planos e esquemas de scan. Não há ferramenta pública.
- **Bluetooth "slave host"** 🟡: Config slave host, lista de hosts, Connect, Online control mode (Action ou Result) e Pause/Recovery control. Parece servir para o rádio controlar outro aparelho, não para áudio. O aviso "Please close Wi-Fi first" indica que Wi-Fi e Bluetooth não funcionam juntos.

## Comandos seriais

- **Documentados no pacote:** `$time: HH:MM:SS`, `$name: NOME` e `$reboot` ✅, a 115200 baud.
- **Internos, sem documentação:** `manager`, `test_rds`, `set_sn`, `clear_nvs`, `still_auto`, `unstill` e `touch_main` ✅. Pelos nomes: gerenciamento de dados, teste de RDS, número de série, apagar a memória de configuração, ligar e desligar a tela estática e algo ligado ao toque.

!!! danger "Não teste os comandos internos"
    Pelo nome, `clear_nvs` deve apagar todas as configurações e memórias. Os outros comandos internos também não têm documentação. Se for experimentar, faça o [backup completo](backup.md) antes.

## Número de série de apoiador ❓

O firmware verifica um número de série (comando `set_sn`), com as mensagens "Serial number passed — Thank you support!", "Serial number error" e "Too many attempts", e tem os rótulos "Enhanced version" e "Customized version". Parece um esquema para apoiadores, já que o pacote traz um QR code de doação. Nada do manual depende disso.

## Comportamentos que só o changelog explica

- **Teclado na tela:** toque longo em FM vai para OIRT e em SW vai para AIR; frequências AIR aceitam 3 dígitos; há um modo de digitação "loose".
- **Página de atalhos:** volume e brilho se ajustam arrastando o dedo; MODE longo alterna para o modo sem toque; desligar exige toque longo.
- **Diálogos de várias páginas:** toque longo no OK encerra antes.
- **Manutenção:** existem os avisos "Reset system files", "Format internal storage" e "System deep sleep"; o que os aciona não está documentado.

## Fontes

- [Manual DP-666 Megatron Mod17](https://www.deepelec.com/files/dp-666/DP-666_UM_EN_Megatron_Mod17.pdf)
- [Manual em chinês do Mod17](https://www.deepelec.com/files/dp-666/DP-666_UM_CN_Megatron_Mod17.pdf)
- [DEEPELEC — anúncio do Mod16](https://www.deepelec.com/en/2025/03/09/dp-666-megatron-2-0-15mod16/)
- [PE5PVB — protocolo de canais de memória](https://github.com/PE5PVB/TEF6686_ESP32/blob/main/docs/Memory%20channel%20protocol.pdf)
