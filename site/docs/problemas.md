# Problemas comuns

Problemas reconhecidos pela DEEPELEC, relatados pela comunidade ou previstos no código do firmware. Escolha o que está acontecendo e siga os passos, do mais simples ao mais trabalhoso. Antes de qualquer reparo ou regravação, faça o [backup completo](backup.md).

## Tela parada em "Tuner: !None!"

Na abertura aparecem o logo e a versão do firmware e, em vermelho, "Tuner: !None!". Às vezes o rádio reinicia sozinho, no meio do uso, e para nessa tela.

<!--DIAGRAM:boot-->

- **O que significa:** o processador carregou o firmware, mas não conseguiu falar com o sintonizador TEF6686. Sem ele, o rádio não recebe nada, e o firmware trava de propósito nessa tela.
- **Marcadores da abertura (código-base):** o primeiro (amarelo) indica que a inicialização do sintonizador foi tentada; o segundo (vermelho), que ele não respondeu; o terceiro seria o Wi-Fi.
- **Causa provável:** uma queda ou oscilação de energia enquanto o firmware carrega o chip deixa o sintonizador preso. Bateria baixa sem aviso, com o Wi-Fi ligado por horas, é um cenário típico, porque o Wi-Fi impede a leitura da bateria e tem picos de consumo.
- **A correção da linha oficial:** desde 13/11/2026, o código oficial força o chip a reiniciar nesse caso. O Mod17 não tem essa correção.
- **Não faça reset de fábrica (BW + TUNING):** o problema não está nas configurações, e os ajustes seriam perdidos.

Passos, em ordem:

1. Desligue no POWER, tire o cabo USB, ponha a chave geral em OFF e espere 1 a 2 minutos. Volte a chave para ON e ligue sem apertar nada durante a abertura. Desligar só no POWER pode não cortar a alimentação do chip.
2. Se repetir, carregue o rádio desligado por cerca de 1 hora e repita o passo 1.
3. Se continuar depois de 2 ou 3 tentativas, o defeito provavelmente é de hardware (solda, alimentação ou cristal do sintonizador). Procure o vendedor ou a DEEPELEC e não abra o rádio na garantia.

Para prevenir, use Wi-Fi auto disconnect em After time sync ou deixe o Wi-Fi desligado quando não estiver usando.

## Inicialização e firmware

- **Atualização não grava pelo USB:** entre no modo de gravação segurando BOOT ao ligar e instale o driver CH340 no Windows. Há relato, não confirmado, de que a porta USB de unidades antigas não serve para atualizar.
- **Configurações sumiram depois de atualizar:** é esperado. As atualizações zeram as configurações, pedem nova calibração do toque e, em algumas versões, nova configuração do Wi-Fi.
- **Rádio em chinês ou sem as opções avançadas:** troque o idioma em 显示设置 → 语言 → English. Para o modo avançado, com o idioma em chinês, ative 高级模式 em 主要设置 → 系统使用模式 e volte para English.

## Áudio

- **Alto-falante mudo depois de usar fone:** em alguns lotes, falha o contato interno do conector de fone (PJ-3270) que religa o alto-falante. A DEEPELEC indica abrir o rádio e limpar os contatos PIN6 e PIN2. Na garantia, prefira acionar o suporte. Se o fone funciona e o alto-falante não, a causa provável é essa.
- **Sem som mesmo com sinal:** confira o squelch (Use squelch em Off para testar), o mudo (ícone na tela ou tecla 0), o VOLUME e o Set volume em 0 dB.
- **Chiado agudo no lugar do áudio:** Audio output está em MPX, que entrega o sinal multiplex bruto. Volte para Stereo.

## Squelch

- **Instável ou sem resposta no botão SQL:** o potenciômetro pode ter mau contato. Use o knob: Audio settings → Use squelch em On; Operation settings → Rotary adjust squelch em On; toque em SQ na tela e gire até o chiado sumir.

## Recepção

- **Perda súbita de sinal e de áudio:** pode ser o cabo interno da antena solto do conector SMA. A correção é trocar o adaptador IPEX1-SMA ou ressoldar o fio central.
- **AM fraco ou só chiado em MW e LW:** o DP-666 não tem antena interna para essas faixas. Use fio externo ou loop no SMA e teste à noite, longe de eletrônicos e carregadores.
- **Apitos ou ruído em algumas frequências de FM:** interferência da tela. Use Dynamic SPI speed em Auto, tela estática, tela apagada nas buscas e brilho menor. A linha oficial chegou a fixar o SPI em 27 MHz para reduzir esse ruído. Nela, desligar o Medidor de modulação também ajuda com sinal fraco, e quem compila pode diminuir o `SPI_FREQUENCY` se o ruído aparecer perto de 90 MHz.
- **Estações fantasmas perto de emissoras fortes:** reduza FM AGC para 87 ou 84 dBµV. Em AM, use AM ATT.
- **Rádio pula sozinho para outra frequência:** é o AF. Desligue Use AF em DX e buscas.
- **PS ou RT com caracteres errados:** use Fast PS em Initial ou Off e RDS filter em On.

## Tela e toque

- **Toque desalinhado ou falhando:** refaça a calibração em Operation settings → Touch calibration, obrigatória depois de instalar o firmware de toque. Se continuar, teste outro Touch Type (Int33, Int27 ou Polling).
- **Tela de cabeça para baixo ou com cores invertidas:** ligar segurando MODE gira a tela; Invert screen color inverte as cores.
- **Na linha oficial:** calibre o toque ligando o rádio com BW + MODE ou em Definições do ecrã. Ligar com BW + BAND inverte as cores, e MODE + encoder troca o tipo de painel quando o menu fica ilegível (veja [Uso da linha oficial](oficial.md)).

## Relógio, Wi-Fi e bateria

- **Hora adiantada 8 horas:** é o fuso padrão chinês. Ajuste Set local time zone para o seu fuso (Brasília: GMT−03:00) e, com o NTP funcionando, deixe RDS time sync em Off.
- **Indicador de bateria some:** limitação do ESP32 com o Wi-Fi ligado. Use Wi-Fi auto disconnect em After time sync.
- **Hora se perde com a chave geral desligada:** indica que o aparelho não tem RTC. Sleep clock correction compensa em parte.
- **Carga:** carregador de 5 V e 1 A ou mais, no máximo 5 W, sem carga rápida, de preferência com o rádio desligado. LED vermelho carregando, verde carregado.

## Configurações e memórias

- **Ajustes não ficam salvos:** saia do menu com MODE ("PRESS MODE TO EXIT AND STORE") e, se aparecer Save/Discard, escolha Save.
- **Memórias apagadas de uma vez:** Delete stations esvazia a faixa inteira e Auto search em Overwrite sobrescreve. Só a restauração de um backup recupera.
- **Padrão de fábrica na linha oficial:** ligar o rádio com BW + encoder restaura os ajustes e também esvazia as 99 memórias e o logbook.
- **Rádio desliga sozinho:** confira Power Off timer, Low battery protect, plano de recepção ativo ou BAND segurado por 3 s com a ação Power off.
- **Rádio liga sozinho:** confira Power on timer e Using receive plan. O mod14 corrigiu um ligamento automático que acontecia sem plano configurado.

## Conexão com o computador

- **O computador não vê o rádio:** quase sempre é o cabo, que só carrega. Troque por um cabo que passe dados, teste outra porta USB e confira o driver do CH340 no Gerenciador de Dispositivos. O passo a passo está em [Computador e conectividade](computador.md).
- **O programa conecta, mas não chega nada:** o modo da porta USB não combina com o programa (XDRGTK para XDR-GTK e FM-DX Webserver; RDS Spy para o RDS Spy), outro programa já está usando a porta, ou o menu do rádio está aberto.
- **Pelo Wi-Fi, o XDR-GTK não conecta:** confira se a rede é de 2,4 GHz, se o computador está na mesma rede, o IP do rádio, a porta 7373 e a senha do XDR-GTK. O firewall do Windows pode bloquear a conexão.
- **Sem som no FM-DX Webserver:** confira se a entrada de som escolhida é a do cabo e se o volume do rádio não está no mínimo. Som só mono costuma vir da placa de som.

## Clones

Segundo a DEEPELEC, clones como o SPARKELEC usam placa antiga (V2.5, contra V2.5.3 do original), têm toque que não funciona, não têm antena de Wi-Fi nem RTC e não recebem atualizações nem suporte. A DEEPELEC também diz que a SPARKELEC usa capturas de tela copiadas do DP-666 original. O logo na abertura não prova originalidade, porque é desenhado pelo firmware.

O manual V2.0 distribuído pela Raddy é o mesmo do repositório da SPARKELEC no GitHub, então trate esse material como sendo de um clone.

## Fontes

- [DEEPELEC — alto-falante sem som](https://www.deepelec.com/dp-666-speaker-cannot-produce-any-sound)
- [DEEPELEC — ajuste do SQ](https://www.deepelec.com/how-to-adjust-the-sq-value)
- [DEEPELEC — reparo do conector de antena](https://www.deepelec.com/how-to-repair-the-antenna-connector/)
- [DEEPELEC — clones](https://www.deepelec.com/2025/10/10/stay_away_from_cloned_products)
- [DEEPELEC DP-666](https://www.deepelec.com/en/dp-666/)
- [Manual DP-666 Megatron Mod17](https://www.deepelec.com/files/dp-666/DP-666_UM_EN_Megatron_Mod17.pdf)
- [PE5PVB — correção de detecção do sintonizador](https://github.com/PE5PVB/TEF6686_ESP32/commit/6d90a22cefae3f7c9a248cad9f77dc0592b3555d)
- [PE5PVB — discussão #885](https://github.com/PE5PVB/TEF6686_ESP32/discussions/885)
- [Blog or Die — DX-286 × DP-666](https://www.blogordie.com/?p=7848)
