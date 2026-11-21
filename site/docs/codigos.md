# Mensagens e códigos da tela

Digite o que aparece na tela do rádio, como TMC, PTYN N/A ou Tuner: !None!, para ver o que quer dizer.

<!--FERRAMENTA:codigos:topo-->

As tabelas abaixo trazem tudo, separado por tela. As telas de RDS vêm do código-base e valem para o Mod17 e para a linha oficial. As mensagens estão separadas por firmware, e o texto da linha oficial em português vem embaixo do original, em itálico.

## Tela principal

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
| PI | Código que identifica a emissora no RDS, com 4 caracteres de 0 a 9 e de A a F. Não é erro: cada emissora tem o seu, e ele muda quando você troca de emissora. Na especificação de RDS da Anatel, o primeiro caractere de um PI brasileiro é B, C, D ou 3, o segundo indica a área de cobertura e os dois últimos identificam a emissora, mas há emissoras que usam outro código. Fica no canto do relógio quando ele está desligado. |
| PI com ? no fim | O PI chegou com erros e pode estar errado. Um ? indica poucos erros; dois, mais. Some quando chega um PI sem erro. Aparece com Show PI errors ligado. |
| Hora, ou data e hora | Relógio. Tocar nele troca entre data e hora, PI e só a hora, como em Show clock. |
| RT | RadioText, texto livre da emissora, com até 64 caracteres. Corre quando não cabe. |
| Dois pontinhos no fim do RT | Sinalizador A/B do RadioText. A emissora troca o sinalizador quando manda um texto novo, e o ponto aceso muda de lugar. |
| PS, PTY e RT em outra cor | O RDS caiu: o que aparece é o último texto recebido. |

## Tela de RDS avançado

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

## Listas de AF e EON

Abrem a partir da tela de RDS avançado: tocar na metade de baixo troca de página.

| Na tela | O que quer dizer |
| --- | --- |
| Frequência verde na lista | Frequência alternativa conferida: o rádio checou e é a mesma emissora, com o mesmo PI. |
| Frequência vermelha na lista | Conferida, mas é outra emissora, com PI diferente. |
| Frequência na cor normal | Ainda não conferida. |
| S, M e R | Letras antes da frequência, só no método B. S: mesmo programa. R: versão regional, que pode ter programação local. M: a lista marcou a frequência dos dois jeitos 🟡. |
| PI, TA, TP e PTY | Colunas da lista de EON: cada linha é uma emissora da rede, com o PI, o nome e se ela tem TA, TP e qual PTY. |

## Mensagens nos dois firmwares

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

## Mensagens só do Mod17

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

## Mensagens só da linha oficial

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

- [PE5PVB — rds.cpp: tela de RDS avançado e listas de AF e EON](https://github.com/PE5PVB/TEF6686_ESP32/blob/main/src/rds.cpp)
- [PE5PVB — language.h: textos do firmware em cada idioma](https://github.com/PE5PVB/TEF6686_ESP32/blob/main/src/language.h)
- [Wikipedia — Radio Data System](https://en.wikipedia.org/wiki/Radio_Data_System)
- [RDS Forum — glossário do RDS](https://rds.org.uk/2010/Glossary-Of-Terms.htm)
- [PE5PVB — TEF668X.cpp: decodificação do RDS, do PI e das AF](https://github.com/PE5PVB/TEF6686_ESP32/blob/main/src/TEF668X.cpp)
- [Manual DP-666 Megatron Mod17](https://www.deepelec.com/files/dp-666/DP-666_UM_EN_Megatron_Mod17.pdf)
- [SBrT 2017 — Radio Data System em Rádio Definido por Software, com a especificação de RDS da Anatel](https://biblioteca.sbrt.org.br/articlefile/573.pdf)
