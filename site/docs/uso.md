# Uso do rádio

Controles, sintonia, memórias e buscas no Megatron Mod17. Quando o comportamento vem do código do PE5PVB v2.00, base do Megatron, isso aparece como (código-base). Para o firmware oficial, veja [Uso da linha oficial](oficial.md).

## Onde fica cada coisa

<!--FOTOS3D-->

<div class="fotos">
<figure class="foto foto-larga"><img src="img/dp666-frente.webp" width="1200" height="928" loading="lazy" alt="Frente do rádio: alto-falante à esquerda e tela à direita; embaixo da tela, BW, MODE e BAND, o teclado numérico com DX e Enter e o botão POWER, vermelho. A antena sai do topo, perto da lateral esquerda."><figcaption>Frente</figcaption></figure>
<figure class="foto foto-larga"><img src="img/dp666-verso.webp" width="1200" height="916" loading="lazy" alt="Verso do rádio com a etiqueta: FM de 65 a 108 MHz, LW de 144 a 513 kHz, MW de 520 a 1720 kHz (522 a 1791 kHz), SW de 1700 a 27000 kHz, bateria de 3,7 V e 5000 mAh e alimentação de 5 V pela USB, até 1,5 A."><figcaption>Verso</figcaption></figure>
<figure class="foto foto-lado"><img src="img/dp666-esquerda.webp" width="327" height="1000" loading="lazy" alt="Lateral esquerda, de cima para baixo: botão BOOT, marcado ESP32 BOOT, entrada de fone, LED e porta USB-C, marcada DC-IN 5V."><figcaption>Lateral esquerda</figcaption></figure>
<figure class="foto foto-lado"><img src="img/dp666-direita.webp" width="329" height="813" loading="lazy" alt="Lateral direita, de cima para baixo: knob TUNING, roda SQL com + em cima e − embaixo, e knob VOLUME."><figcaption>Lateral direita</figcaption></figure>
<figure class="foto foto-faixa"><img src="img/dp666-topo.webp" width="1200" height="272" loading="lazy" alt="Topo do rádio: o conector SMA da antena, marcado ANT, perto da lateral esquerda, e uma grade de doze furos ao lado dele."><figcaption>Topo, visto de cima com a frente para baixo</figcaption></figure>
<figure class="foto foto-faixa"><img src="img/dp666-fundo.webp" width="1200" height="254" loading="lazy" alt="Fundo do rádio: a chave geral, marcada Main switch, com ON à esquerda e OFF à direita, e uma grade de doze furos perto da lateral esquerda."><figcaption>Fundo, visto com a frente para cima</figcaption></figure>
</div>

<p class="fotos-credito">Fotos: mflipe, sob a licença CC BY 4.0.</p>

| Lado | O que tem |
| --- | --- |
| Frente | tela de toque, teclado numérico (0 a 9, DX e Enter), BW, MODE, BAND, POWER e alto-falante |
| Lateral direita | de cima para baixo: TUNING, a roda SQL (+ em cima, − embaixo) e VOLUME |
| Lateral esquerda | de cima para baixo: BOOT (marcado ESP32 BOOT), fone de 3,5 mm, LED de carga e USB-C (marcada DC-IN 5V) |
| Topo | conector SMA da antena, marcado ANT, perto da lateral esquerda, e uma grade de doze furos ao lado dele |
| Verso | etiqueta com as faixas, a bateria e a alimentação |
| Fundo | chave geral, marcada Main switch: ON para o lado esquerdo, OFF para o direito; e uma grade de furos embaixo do alto-falante |

## Teclado físico (firmware)

- **0 a 9:** digitam a frequência. A faixa e a frequência ficam verdes enquanto você digita.
- **Enter:** confirma. Fora da digitação, age como o botão do knob.
- **DX durante a digitação:** apaga o último dígito; toque longo limpa tudo.
- **DX:** alterna entre digitar frequência e gravar memória.
- **DX longo:** inicia o DX scan, só na tela principal. Qualquer tecla cancela.
- **0 curto, fora da digitação:** liga e desliga o mudo.

## Tela e toque

- **Áreas de toque:** a metade esquerda da área de sinal abre os atalhos e a metade direita abre o menu. O volume se ajusta tocando nas metades da área de volume.
- **Abrem o teclado na tela:** a frequência, a barra de passo e o rótulo da faixa.
- **Ícones tocáveis:** MAN/AUTO/MEM, estéreo, mudo, RDS (abre a vista avançada), largura de banda (inclui AUTO BW), iMS, EQ, indicador de desvio, bateria e sono.
- **Squelch pelo toque:** toque em SQ (fica verde) e gire o knob. Requer Rotary adjust squelch ligado.
- **Gestos extras (firmware):** tocar no canto superior esquerdo ativa a tela estática; toque longo no relógio sincroniza a hora; tocar em AUTO no SW ativa as bandas métricas; nas páginas RDS avançada e AF, tocar na metade inferior alterna entre elas.
- **Cores (firmware):** sinal a partir de 60 fica vermelho, a partir de 40 verde e abaixo disso amarelo. A bateria ganha moldura vermelha em 3,3 V. Com Wi-Fi, o ícone mostra "wifi" no lugar da bateria.
- **O que cada marca e mensagem quer dizer:** veja [Mensagens e códigos da tela](#uso--mensagens-e-códigos-da-tela), com um campo para digitar o que aparece no rádio.

## Sintonia

- **Passos:** FM aceita 50, 100 ou 200 kHz. A barra acima da frequência mostra o passo ativo; toda apagada significa passo padrão. No código-base, o knob alterna entre passo padrão, 10 kHz, 100 kHz, 1 MHz e 10 MHz.
- **AUTO:** no código-base, a busca para em sinal com pouco ruído e pouco multipercurso, offset de até ±8 kHz e acima do squelch. Sensibilidade maior deixa a busca mais permissiva.
- **Largura de banda em FM:** AUTO, 56, 64, 72, 84, 97, 114, 133, 151, 168, 184, 200, 217, 236, 254, 287 e 311 kHz. Em AM: 3, 4, 6 e 8 kHz.
- **iMS e EQ:** supressão de multipercurso e equalização de canal do FM.
- **Squelch (Use squelch):** On, Off ou Auto. Em On (código-base), no mínimo fica OFF e no máximo vira "ST", que só abre com sinal estéreo. Auto é um algoritmo próprio do Megatron. Para sinais fracos, use Off.
- **Saída MPX:** Audio output em MPX entrega o sinal multiplex bruto, para decodificadores externos. Não serve para ouvir.

## Memórias

- **Capacidade:** 99 posições. Cada uma guarda faixa, frequência, largura de banda e estéreo/mono (código-base). Há também nomes por frequência (My frequency name).
- **Gravar:** sintonize, aperte MODE até aparecer MEM, aperte o knob (MEM fica vermelho), escolha a posição e aperte de novo. Número vermelho indica posição ocupada; verde, livre.
- **Chamar:** em MEM, gire o knob.
- **Apagar uma:** no teclado da tela, use MEM/Delete no modo MEM, escolha a posição e confirme (firmware). Teste antes numa posição sem importância.
- **Arrange stations:** "brokens" são buracos na lista. Only defrag fecha os buracos; Defrag and sort também ordena e remove duplicadas.

!!! danger "Delete stations apaga a faixa inteira"
    Delete stations não apaga uma memória só. Ele pergunta a faixa e esvazia todas as memórias dela. Auto search em Overwrite também sobrescreve tudo. Só um backup recupera.

- **Band save mode (firmware):** guarda as memórias juntas (Mixed Save), por faixa (Save by band) ou por horário (Save by time segment).

## Auto search (busca automática)

- **Opções:** modo de gravação, faixa, amostras e tempo de retenção, limite de multipercurso, sensibilidade (FM de 1 a 15, AM de 1 a 20), prioridade Quality ou Quantity, largura salva, mudo e tela apagada durante a busca, canal inicial e limites do SW.
- **Modos de gravação:** Overwrite, Append e Continuously append. O terceiro só aparece no firmware.
- **"99 Free":** "Free" mostra as posições disponíveis. Em Overwrite, as 99 contam como livres porque serão sobrescritas.

### Para achar estações com menos chiado

1. Faça o [backup](backup.md) antes.
2. Use Append, com o canal inicial depois da última memória.
3. Use Quality priority e sensibilidade FM entre 3 e 5. No código-base, número menor é mais exigente.
4. Use de 5 a 10 amostras e retenção de 100 a 200 ms.
5. Deixe a tela apagada e o AF desligado durante a busca.

## DX scan (Frequency scanning)

- **Opções:** faixa, canal inicial e final, espera, Exclude/Only, cancelamento por Signal, Off ou Correct PI, Stay/Break, mudo e tela apagada. O firmware acrescenta Wait on signal only e Hold time.
- **Only (código-base):** percorre só as memórias ocupadas entre o canal inicial e o final.
- **Exclude (código-base):** varre a faixa passo a passo, sem usar as memórias.
- **Correct PI** para quando decodifica o PI. **Signal** para quando encontra sinal limpo.
- O scan não grava nada. Qualquer tecla ou toque cancela.

## Mensagens e códigos da tela

Digite o que aparece na tela, como TMC, PTYN N/A ou Tuner: !None!, para ver o que quer dizer.

<!--FERRAMENTA:codigos:topo-->

As tabelas abaixo trazem tudo, separado por tela. As telas de RDS vêm do código-base e valem para o Mod17 e para a linha oficial. As mensagens estão separadas por firmware, e o texto da linha oficial em português vem embaixo do original, em itálico.

### Tela principal

Como aparece no Mod17. A linha oficial tem a mesma base, mas pode mudar posições e cores.

| Na tela | O que quer dizer |
| --- | --- |
| Setas e ponto, no canto de cima à esquerda | Indicador de desvio. Ponto verde: a sintonia está no centro da emissora. Setas acesas: a sintonia está fora do centro, e o lado aceso mostra a direção. |
| Dois círculos | Estéreo. Acesos: a emissora chega em estéreo. Um círculo só indica o modo mono (manual). |
| Alto-falante | Aceso: o som está cortado, pelo squelch ou pelo mudo. Tocar nele liga e desliga o mudo. |
| RDS | Aceso: o rádio está decodificando o RDS. Apagado: sem RDS ou com sinal fraco demais. Tocar nele abre a tela de RDS avançado. |
| Número com kHz, no alto | Largura de banda do filtro. Muda de cor quando está em automático. |
| Wi-Fi | Aceso: Wi-Fi ligado. |
| Bateria | Carga em barras, porcentagem ou volts, conforme o ajuste. Moldura vermelha: chegou a 3,3 V. Com o Wi-Fi ligado, mostra "wifi" no lugar da carga, porque o rádio não mede a bateria nessa situação. |
| MAN, AUTO e MEM | Modo de sintonia, o aceso é o atual. MAN anda de passo em passo, AUTO busca a próxima emissora e MEM percorre as memórias. |
| Número ao lado de MEM | Posição da memória, de 1 a 99. Ao gravar, MEM fica vermelho, e o número fica vermelho se a posição está ocupada e verde se está livre. |
| FM, FML, OIRT, LW, MW, SW e AIR | Faixa atual. FML (Mod17) e OIRT (linha oficial) são o FM baixo do Leste Europeu, de 65,8 a 74 MHz. AIR, no Mod17, é a faixa de aviação. |
| Barrinhas acima da frequência | Passo de sintonia ativo. Todas apagadas: passo padrão. |
| Frequência verde | Você está digitando a frequência no teclado. |
| AUTO BW | Aceso: largura de banda automática. Apagado: largura fixa. |
| iMS | Aceso: supressão de multipercurso do FM ligada. |
| EQ | Aceso: equalização de canal do FM ligada. |
| S | Medidor de sinal, de S1 a S9 e acima (+10, +30). |
| M | Medidor de modulação do FM, de 10 a 100. O tracinho solto é o pico recente. |
| dBμV, dBf e dBm | Unidade do nível do sinal, o número grande à direita. No Mod17, ele fica vermelho a partir de 60 dBμV, verde a partir de 40 e amarelo abaixo disso. |
| C/N | Relação portadora/ruído, em dB (manual): quanto maior, mais limpo o sinal. Mostra "--" quando não há medida no momento. |
| SQ | Nível do squelch; OFF quer dizer squelch desligado (manual). Toque em SQ (fica verde) e gire o knob para ajustar, com Rotary adjust squelch ligado. |
| Ícone de cama | Modo de sono, que apaga a tela; gire o knob para sair (manual). |
| PTY | Tipo de programa informado pelo RDS, como Pop Music ou News. |
| PS | Nome da emissora, com até 8 caracteres. Algumas emissoras fazem o nome correr ou trocar. |
| Barrinhas ao lado do PS | Qualidade do RDS: quanto mais barras acesas, menos erros na recepção. |
| PI | Código da emissora no RDS, com 4 dígitos hexadecimais. Fica no canto do relógio quando ele está desligado. |
| Hora, ou data e hora | Relógio. Tocar nele troca entre data e hora, PI e só a hora, como em Show clock. |
| RT | RadioText, texto livre da emissora, com até 64 caracteres. Corre quando não cabe. |
| Dois pontinhos no fim do RT | Sinalizador A/B do RadioText. A emissora troca o sinalizador quando manda um texto novo, e o ponto aceso muda de lugar. |
| PS, PTY e RT em outra cor | O RDS caiu: o que aparece é o último texto recebido. |

### Tela de RDS avançado

Abre ao tocar em RDS ou ao segurar BAND (manual). BAND fecha.

| Na tela | O que quer dizer |
| --- | --- |
| ERRORS<br>A:, B:, C: e D: | Um ponto para cada um dos quatro blocos de cada grupo RDS. Verde: o bloco chegou sem erro. Vermelho: chegou com erro. Com sinal bom, ficam verdes quase o tempo todo. |
| TP | Traffic Programme: a emissora transmite informações de trânsito. |
| TA | Traffic Announcement: há um boletim de trânsito no ar agora. |
| AF | A emissora envia uma lista de frequências alternativas, em que o mesmo programa também toca. |
| -B | A lista de AF usa o método B, em pares de frequências, comum em redes grandes ou com versões regionais. |
| TMC | Traffic Message Channel: a emissora envia dados de trânsito para aparelhos de navegação. |
| RT+ | RadioText Plus: o RT vem com marcações, como artista e título da música. |
| EON | Enhanced Other Networks: a emissora envia dados de outras emissoras da mesma rede. |
| S e M | Fala (S, de speech) ou música (M), conforme o que a emissora declara. Só um fica aceso. |
| PTYN<br>PTYN N/A | Nome livre do tipo de programa, com até 8 caracteres. PTYN N/A: a emissora não envia. |
| Fileira de pontinhos no meio | Os tipos de grupo RDS, de 0A a 15B, da esquerda para a direita. O verde é o último grupo que chegou; os vermelhos já chegaram antes. |
| Dynamic PTY | Ponto verde: o tipo de programa pode mudar durante a transmissão. Vermelho: não muda. |
| Artif. head | Ponto verde: gravação com cabeça artificial, feita para ouvir com fone. Vermelho: não. |
| Compressed | Ponto verde: o áudio é comprimido. Vermelho: não. |
| Has stereo | Ponto verde: o programa é estéreo. Vermelho: mono. |
| ECC | País da emissora, pelo código estendido de país junto com o primeiro dígito do PI. |
| LIC | Idioma do programa. |
| PIN | Programme Item Number: dia do mês e hora de início do programa, como 21 18:00. |
| N/A | Não disponível: a emissora não envia esse dado. |
| Unknown | A emissora envia um código que o firmware não conhece. Na linha oficial em português, aparece Desconhecido. |

### Listas de AF e EON

Abrem a partir da tela de RDS avançado: tocar na metade de baixo troca de página.

| Na tela | O que quer dizer |
| --- | --- |
| Frequência verde na lista | Frequência alternativa conferida: o rádio checou e é a mesma emissora, com o mesmo PI. |
| Frequência vermelha na lista | Conferida, mas é outra emissora, com PI diferente. |
| Frequência na cor normal | Ainda não conferida. |
| S, M e R | Letras antes da frequência, só no método B. S: mesmo programa. R: versão regional, que pode ter programação local. M: a lista marcou a frequência dos dois jeitos 🟡. |
| PI, TA, TP e PTY | Colunas da lista de EON: cada linha é uma emissora da rede, com o PI, o nome e se ela tem TA, TP e qual PTY. |

### Mensagens nos dois firmwares

| Mensagem | O que quer dizer |
| --- | --- |
| Tuner: !None!<br>*Sintonizador: !Nenhum!* | O ESP32 não achou o chip sintonizador ao ligar. Veja [Tela parada em "Tuner: !None!"](#ajuda--tela-parada-em-tuner-none). |
| Tuner not detected<br>*Sintonizador não detectado* | O chip sintonizador não se identificou como esperado ao ligar, e o rádio para nessa tela. Siga os passos de [Tela parada em "Tuner: !None!"](#ajuda--tela-parada-em-tuner-none). |
| Function only available on TEF6687/6689!<br>*Função disponível apenas no TEF6687/6689!* | O recurso escolhido precisa de outro chip. O DP-666 usa o TEF6686, então ele não funciona aqui. |
| No AF available<br>*AF não disponível* | A emissora não envia lista de frequências alternativas. Não é defeito. |
| No EON available<br>*EON não disponível* | A emissora não envia dados de outras emissoras da rede. |
| No RT+ available<br>*RT+ não disponível* | O RadioText chega sem as marcações do RT+. |
| PRESS BAND TO CLOSE<br>*PRESSIONE BAND PARA FECHAR* | Aperte BAND para fechar a tela e voltar. |
| PRESS MODE TO EXIT AND STORE<br>*PRESSIONE MODE PARA SAIR E SALVAR* | No menu: MODE sai e grava as mudanças. |
| PRESS MODE TO RETURN<br>*PRESSIONE MODO PARA VOLTAR* | Num submenu: MODE volta ao nível anterior. |
| Alarm!!!<br>EMERGENCY!<br>*Alarme – Alarme !* | Tipo de programa 31: a emissora sinaliza um alerta. EMERGENCY! é o mesmo tipo no padrão americano (RBDS), em que Emergency Test é o tipo 30, de teste. |
| Rotary direction changed<br>*Direção rotativa alterada* | Você ligou o rádio segurando BW, e o sentido do knob inverteu. Repita para desfazer. Veja [Ao ligar segurando](#oficial--ao-ligar-segurando). |
| Screen flipped<br>*Tela invertida* | Você ligou segurando MODE, e a tela girou 180°. Repita para desfazer. |
| Calibrate analog meter<br>Release button when ready<br>*Calibrar o medidor analógico* | Você ligou segurando BAND: é a calibração do medidor analógico, que o DP-666 não tem. Solte o botão. |
| Encoder set to optical<br>Encoder set to standard<br>*Codificador definido como óptico*<br>*Codificador definido como padrão* | Você ligou segurando o knob, e o tipo de encoder mudou. Se o knob passar a pular ou falhar, repita para voltar ao anterior. |
| Please release button<br>*Solte o botão, por favor* | Aparece junto dos avisos acima: solte o botão que você segurou ao ligar. |

### Mensagens só do Mod17

| Mensagem | O que quer dizer |
| --- | --- |
| Touch corners as indicated<br>Touch calibration completed! | Calibração do toque, em Operation settings → Touch calibration: toque nos cantos indicados até aparecer completed. |
| Low battery, please charge it | Bateria fraca: ligue o carregador. |
| Wi-Fi not configured | Nenhuma rede foi configurada. Configure o Wi-Fi pelo teclado na tela ou pelo navegador; veja [Conectividade e protocolos](#mod17--conectividade-e-protocolos). |
| Wi-Fi connect failed! | Não conectou à rede salva. Confira a senha e se a rede está ao alcance; o rádio só usa redes de 2,4 GHz. |
| Connecting to Wi-Fi<br>Wi-Fi connected!<br>Wi-Fi disconnected!<br>Wi-Fi closed! | Avisos do Wi-Fi: conectando, conectou, perdeu a conexão ou foi desligado. |
| Please close Wi-Fi first | Desligue o Wi-Fi antes: a função pedida, como o Bluetooth, não funciona com ele ligado. |
| Time has been synchronized<br>Time synchronized | A hora foi acertada, pela internet (NTP) ou pelo RDS. |
| NTP time sync retry... | O acerto da hora pela internet falhou, e o rádio vai tentar de novo. Confira o Wi-Fi. |
| Slave host not configured<br>Slave host connect failed<br>Slave host connect success<br>Slave host connected<br>Slave host disconnected | Avisos do Bluetooth "slave host", em que o rádio controla outro aparelho. Veja [Conectividade e protocolos](#mod17--conectividade-e-protocolos). |
| Bluetooth is turned on<br>Bluetooth is turned off<br>Bluetooth connected<br>Bluetooth disconnected | Avisos do Bluetooth: ligado, desligado, conectado ou desconectado. |
| Input cannot be empty | O campo do teclado na tela ficou vazio. Digite algo antes de confirmar. |
| Abort! No storage space available! | Cancelado por falta de espaço para guardar. Pelo texto, as memórias ou o armazenamento interno estão cheios ❓. |
| Abort! No stations that can be scanned. | Cancelado porque não há emissoras para varrer, como memórias vazias ❓. |
| Load failed! | Não deu para carregar um arquivo ou ajuste salvo ❓. |
| Failed, My settings have not been saved! | Save my settings não conseguiu gravar a cópia dos ajustes. Tente de novo. |
| Serial number error<br>Too many attempts, please restart and try again! | Número de série de apoiador recusado. Depois de várias tentativas, reinicie o rádio. Veja [Número de série de apoiador](#mod17--número-de-série-de-apoiador). |
| Settings has been saved<br>Station has been saved<br>Station has been deleted | Confirmações: os ajustes foram gravados, ou a emissora foi gravada ou apagada da memória. |
| Data change has been saved<br>Data change has been discarded<br>Change pending<br>No changes | Ao sair de um menu: as mudanças foram gravadas, foram descartadas, estão pendentes ou não houve mudança 🟡. |
| Setting completed<br>Done, Restarting | O assistente de configuração terminou, e o rádio vai reiniciar. |
| Enter rotary to adjust squelch mode<br>Exit rotary to adjust squelch mode | O knob passou a ajustar o squelch, ou voltou a sintonizar. |
| Enter still screen mode<br>Exit still screen mode | Tela estática ligada ou desligada, pelo toque no canto de cima à esquerda. Ela ajuda contra o ruído que a tela causa no rádio. |
| Enable sleep mode<br>Disable sleep mode | Modo de sono ligado ou desligado 🟡. |
| Enter power save mode<br>Exit power save mode | Modo de economia de energia ligado ou desligado 🟡. |
| Locked<br>Unlocked | Travado ou destravado, pela ação Lock&Unlock, que vai num toque longo. |
| Switch FM bandwidth<br>Switch AM bandwidth | A largura de banda mudou. |
| Waiting for manage command... | Modo Manage my data: o rádio espera comandos do computador. |
| Reset system files<br>Format internal storage<br>System restart<br>System deep sleep | Avisos de manutenção. O que aciona cada um não está documentado ❓. |
| Easter egg has been opened<br>Easter egg has been closed | Um recurso escondido foi ligado ou desligado ❓. |

### Mensagens só da linha oficial

| Mensagem | O que quer dizer |
| --- | --- |
| Defaults loaded<br>*Padrões carregados* | Você ligou segurando BW e o knob, e os ajustes voltaram ao padrão de fábrica. |
| Press highlighted corner<br>To calibrate touchscreen<br>*Pressione o canto inscrito* | Calibração do toque, que abre ao ligar segurando BW + MODE: toque em cada canto destacado. |
| Error! No RDS signal<br>*Erro! Sem sinal RDS* | Em PI bloqueado CT sync, o rádio precisa de uma emissora com RDS sintonizada para guardar o PI. Sintonize uma e tente de novo. |
| Hold BW button to stop DX scanner<br>*Segure BW para parar* | O scanner de DX está rodando. Segure BW para parar. |
| Abort! The start channel is marked as skipped.<br>*Abortar! O canal inicial é ignorado.* | O scanner de DX nas memórias não começa numa memória marcada para pular. Escolha outra para começar. |
| Abort! Out of memorychannels<br>*Abortar! Sem canais de memória disponíveis* | A memória automática parou porque acabaram as posições livres. |
| Abort! User pressed button<br>*Abortar! Usuário pressionou o botão* | A memória automática parou porque um botão foi apertado. |
| Scan finished without errors<br>*Verificação concluída sem erros* | A memória automática terminou sem problemas. |
| Logbook is empty<br>*O livro de registro está vazio* | O [logbook](#oficial--logbook) ainda não tem nenhuma emissora. |
| Error adding entry to the logbook<br>*Falha na atualização!* | Não deu para registrar a emissora no logbook. |
| Can't add entry! Logbook is full!<br>*Não é possível adicionar! O livro está cheio!* | O logbook encheu. Baixe o CSV pelo navegador e limpe o logbook. |
| Clear failed<br>*Falha ao limpar* | Não deu para limpar o logbook. |
| The logbook contains over 130 entries<br>*O diário de bordo contém mais de 130 entradas* | A página do logbook no navegador não mostra mais de 130 registros. Baixe o arquivo CSV. |

## Fontes

- [Manual DP-666 Megatron Mod17](https://www.deepelec.com/files/dp-666/DP-666_UM_EN_Megatron_Mod17.pdf)
- [PE5PVB/TEF6686_ESP32](https://github.com/PE5PVB/TEF6686_ESP32)
- [PE5PVB — rds.cpp: tela de RDS avançado e listas de AF e EON](https://github.com/PE5PVB/TEF6686_ESP32/blob/main/src/rds.cpp)
- [PE5PVB — language.h: textos do firmware em cada idioma](https://github.com/PE5PVB/TEF6686_ESP32/blob/main/src/language.h)
- [Wikipedia — Radio Data System](https://en.wikipedia.org/wiki/Radio_Data_System)
- [RDS Forum — glossário do RDS](https://rds.org.uk/2010/Glossary-Of-Terms.htm)
