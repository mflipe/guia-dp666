# Uso da linha oficial

Botões, combinações ao ligar, memórias, scanner de DX, logbook e o menu completo do firmware oficial do PE5PVB. A base é a [wiki do projeto](https://github.com/PE5PVB/TEF6686_ESP32/wiki), conferida no código da v2.20.12, de 13/11/2026. Onde as duas diferem, o guia segue o código e avisa. Para o Megatron, veja [Uso do rádio](uso.md) e [Menus explicados](menus.md).

!!! note "Wiki incompleta, firmware sem garantia"
    O próprio autor avisa que a wiki ainda está em construção e pode não cobrir tudo. O firmware é distribuído sem garantia de nenhum tipo, e quem grava assume o risco.

## O que a linha oficial faz

- **Faixas:** FM de 65 a 108 MHz e AM de 144 kHz a 27 MHz.
- **Conexões:** RDS Spy, XDR-GTK, fm-dx-webserver e StationList pelo Wi-Fi (veja [Conectividade](conectividade.md)).
- **Recursos:** quase todo o RDS, com uma tela de RDS avançado; busca automática e manual; squelch; bateria, S-meter e medidor de modulação na tela; temas; vários idiomas, entre eles o português; troca automática para a frequência alternativa (AF); 99 memórias; e registro de estações (logbook).
- **Só nos chips TEF6687 e TEF6689:** a busca completa de RDS (FullSearch RDS) e a melhoria de estéreo FMSI. O DP-666 usa o TEF6686, então essas duas funções não existem nele.

## Botões

Na v2.20.12, toque longo é segurar por 1 segundo. O encoder é o knob TUNING.

| Botão | Toque curto | Toque longo |
| --- | --- | --- |
| BAND | Troca de faixa. Nas telas de AF e de estatísticas, volta ao RDS avançado; no RDS avançado, sai dele. | No FM, abre o RDS avançado e, de dentro dele, a tela de AF. No AM, ativa na hora a proteção de tela. |
| MODE | Alterna entre MAN, AUTO e MEM. No menu, sai. | Abre o menu. |
| BW | Abre o seletor de largura de banda. | No FM, alterna entre mono forçado e estéreo automático. No AM, abre o seletor de largura. |
| Encoder | Em MAN, troca o passo. Em MEM, entra no modo de gravação. | No FM, grava a estação no logbook. No SW, liga e desliga a busca por bandas métricas. |

- **BAND segurado por 2,5 s:** executa a ação escolhida em "Pressione o botão banda por 5 seg.": nada, desligar ou apagar a tela. Apesar do nome, o código usa 2,5 s.
- **Com a proteção de tela ativa:** apertar BAND ou girar o encoder só acende a tela.
- **iMS e EQ:** na versão atual, alternam com um toque na tela.
- **No menu, MODE segurado por 3 s:** abre os jogos escondidos no firmware.

!!! note "Onde a wiki está desatualizada"
    A página inicial da wiki inverte os toques do BW e diz que o toque longo no encoder alterna iMS e EQ. No código atual, o toque curto do BW abre a largura de banda, o longo alterna mono e estéreo, e o toque longo no encoder grava no logbook, como a própria página do logbook descreve.

## Ao ligar segurando

| Botões | Efeito |
| --- | --- |
| BW | inverte o sentido do encoder |
| MODE | gira a tela em 180° |
| BAND | calibra o medidor analógico, só em montagens que têm um |
| Encoder | alterna entre encoder comum e óptico |
| BW + MODE | calibra o toque |
| BW + BAND | inverte as cores da tela |
| MODE + encoder | troca o tipo de painel (ARS ou comum), para quando o menu fica ilegível |
| BW + encoder | volta ao padrão de fábrica |

!!! danger "O padrão de fábrica apaga as memórias e o logbook"
    Na v2.20.12, a restauração pelo BW + encoder também esvazia as 99 memórias e recria o logbook vazio. Faça o [backup](backup.md) antes.

- **Pelo menu:** a v2.20.12 também traz esses ajustes no menu, o que a wiki ainda não mostra. Definições do aparelho reúne modelo, sentido do encoder, encoder óptico, cores, painel ARS, medidor analógico e padrão de fábrica. Definições do ecrã reúne fonte da frequência, tela girada, teclado de frequência e calibração do toque.
- **Compilado para o DP-666:** com a opção `DEEPELEC_DP_66X`, o padrão de fábrica já vem com o modelo Portable touch, a tela girada, o encoder invertido e as cores sem inversão. O passo a passo está em [Backup e gravação](backup.md).

## Memórias

- **Capacidade:** 99 posições, cada uma em qualquer faixa: FM, OIRT, LW, MW ou SW.
- **Gravar:** sintonize a estação, aperte MODE até aparecer MEM e aperte o encoder (MEM fica vermelho). Gire até a posição: número vermelho indica posição ocupada, verde indica livre. Aperte o encoder de novo para gravar.
- **Pular uma posição:** com MEM vermelho, escolha a posição e aperte BAND. O código grava nela a frequência 0, o valor que o firmware usa para posições que devem ser puladas.
- **Memória automática:** preenche as memórias sozinha, numa faixa de frequências e num intervalo de posições. Dá para gravar só estações com RDS, evitar PI repetido (Off, Range ou Full), ajustar a sensibilidade e limpar as memórias. A wiki só cita a função; as opções vêm do código.

## Scanner de DX

Existe desde a v2.10 e fica em Opções FM DX. Ele procura DX em frequências vazias, varrendo a faixa ou passando pelas memórias.

- **Comece a pesquisar DX (Start DX scanning):** inicia a varredura. Fora do menu, aperte MODE até aparecer MEM e depois BAND. Durante a varredura, MEM pisca.
- **Comece e Pare de pesquisar canais de memória:** primeira e última memória do intervalo. Só entram memórias de FM e OIRT.
- **Tempo de espera (Wait time):** quanto tempo o rádio fica em cada frequência antes de seguir, a partir de 0,5 s.
- **Canais memorizados (Memory channels):** em Only, passa só pelas memórias do intervalo. Em Exclude, varre a faixa e pula as frequências gravadas no intervalo. A faixa varrida é a da primeira memória do intervalo: se ela for OIRT, a varredura é no OIRT.
- **Cancelar automaticamente (Auto cancel scan):** Off nunca para; Correct PI para quando decodifica um PI correto; Signal para quando encontra sinal, com o limiar de Configurações FM → Sensibilidade da varredura.
- **Mudo áudio enquanto procura:** deixa o áudio mudo durante a varredura.
- **Fora da wiki:** Registrador automático (Autologger), que grava sozinho no logbook as estações em que o rádio decodificou um PI correto durante a varredura; Espera tempo apenas quando sinal; e Limpar livro de registro.

## Logbook

Existe desde a v2.20.

- **Registrar:** no FM, segure o encoder por mais de 1 s. Com os sinais sonoros ligados, o rádio bipa. Se faltar espaço no armazenamento, a tela avisa.
- **Ler pelo Wi-Fi:** abra no navegador o IP do rádio, como http://192.168.1.75, ou http://tef.local.
- **Ler pelo USB:** num terminal como o PuTTY, conecte na porta do rádio e mande `L`. Ele responde com o logbook em CSV.
- **Apagar:** Opções FM DX → Limpar livro de registro.

## Menu completo

Cada opção aparece com o nome do menu em português e, entre parênteses, o nome em inglês usado pela wiki. Os valores vêm da wiki e foram conferidos no código da v2.20.12. "Fora da wiki" marca opções que a wiki não descreve. A ordem de cada lista, os passos e os padrões de fábrica estão em [Ajustes do rádio](#ajustes).

### Configurações principais

| Opção | Valores | O que faz |
| --- | --- | --- |
| Definições do aparelho (Device settings) | submenu | Fora da wiki. Modelo (Base, Portable ou Portable touch), sentido do encoder, encoder óptico, cores invertidas, painel ARS, medidor analógico e padrão de fábrica. No DP-666, use Portable touch e calibre o toque. |
| Parar tela de despertar ao sintonizar (Stop screen wake on tune) | Ligado, Desligado | Ligado mantém a proteção de tela ativa enquanto você sintoniza. |
| Desligamento automático (Auto Power off) | Desligado, 15, 30, 60 ou 90 min | Põe o sintonizador, a tela e o processador em espera depois do tempo sem uso. |
| Usar squelch (Use squelch) | Ligado, Desligado, Auto | Ligado usa o botão de squelch, que o DP-666 tem (SQL). Auto controla o squelch sozinho. |
| FM AGC | 84 a 92 dBµV | Limiar do controle automático de ganho no FM. |
| AM AGC | 94 a 102 dBµV | O mesmo, no AM. |
| Selecionar faixa FM (Select FM Band) | FM e OIRT, juntas ou separadas, ou nenhuma | Quais faixas de FM o BAND percorre. |
| Selecionar faixa AM (Select AM Band) | LW, MW e SW, juntas ou separadas, ou nenhuma | Quais faixas de AM o BAND percorre. |
| Pressione o botão banda por 5 seg. (5 sec. bandbutton press) | desligar, apagar a tela, nada | Ação de segurar o BAND, que no código dispara com 2,5 s. |
| Velocidade dinâmica de SPI (Dynamic SPI speed) | Default, 10 a 60 MHz, Auto | Velocidade de comunicação com a tela, ajustável para evitar ruído causado por ela. A wiki recomenda Auto. |

### Configurações de áudio

| Opção | Valores | O que faz |
| --- | --- | --- |
| Definir volume (Set volume) | −10 a +10 dB | Volume padrão. Em rádios com botão de volume, como o DP-666, deixe em 0 dB. |
| Sinais sonoros (Audio feedback) | Desligado, Ligado, Ligado + morse | Sons de navegação pensados para quem não enxerga ou enxerga pouco. Em Ligado + morse, números e letras também tocam em código Morse. Inclui o bipe de fim de faixa e o de registro no logbook, que a wiki chama de Beep at band edge. |
| Saída de áudio (Audio output) | Stereo, MPX | MPX manda o áudio mono no canal esquerdo e o sinal MPX completo no direito, para analisar o RDS e o estéreo. |
| Limiar de separação estéreo (Stereo separation threshold) | Desligado, 30 a 60 dBµV | Abaixo desse nível de sinal, o rádio reduz a separação estéreo, o que melhora a recepção no TEF6686. |
| Frequência do canto de corte alto (High cut corner frequency) | 1500 a 7000 Hz | A partir de que frequência os agudos são reduzidos quando o limiar é atingido. |
| Definir limiar de corte alto (High cut threshold) | Desligado, 20 a 60 dBµV | Abaixo desse nível de sinal, o corte de agudos entra. |
| Desênfase FM (FM deemphasis) | Desligado, 50, 75 µs | A wiki indica 75 µs nas Américas e 50 µs no resto do mundo, mas o Brasil usa 50 µs (veja [Configuração para o Brasil](brasil.md)). |

### Configurações de exibição

| Opção | Valores | O que faz |
| --- | --- | --- |
| Idioma (Language) | lista | Idioma do menu, inclusive português. |
| Definir brilho da tela (Display brightness) | 1 a 100% | Brilho da tela. |
| Medidor de modulação (Audio level meter) | Ligado, Desligado | Desligue para reduzir a interferência da tela com sinal fraco. |
| Proteção de tela (Screensaver) | Desligado, 3, 10, 30 ou 60 s | Tempo sem uso até a proteção de tela. |
| Opções de proteção de tela (Screensaver options) | tela apagada; brilho de 1%, 25% ou 50% | Como a tela fica na proteção. |
| Opções de bateria (Battery options) | Desligado, tensão, porcentagem | Como a bateria aparece. |
| Unidade de medidor de sinal (Signalmeter unit) | dBµV, dBf, dBm | Unidade do medidor de sinal. |
| Mostrar relógio (Show clock) | Ligado, Desligado | Mostra o relógio quando há hora disponível. |
| Tema (Theme) | lista | Tema de cores. |
| Definições do ecrã (Screen settings) | submenu | Fora da wiki. Fonte da frequência, tela girada em 180°, teclado de frequência e calibração do toque. |

### Configurações RDS

| Opção | Valores | O que faz |
| --- | --- | --- |
| Mostrar erros RDS (Show RDS errors) | Desligado, Small, Large | Limite de erros aceito na decodificação do RDS. |
| Região (Region) | Europe, USA DB, USA, Canada | Ajusta o RDS à região. Nos EUA e no Canadá, mostra os indicativos das emissoras. No Brasil, use Europe. |
| Mostrar sublinhado no RDS (Show underscore in RDS) | Ligado, Desligado, só PS | Troca os espaços por sublinhado no PS e no RT. |
| Filtro RDS (RDS filter) | Ligado, Desligado | Liga um filtro com buffer na decodificação do RDS. |
| Mostrar erros PI (Show PI errors) | Ligado, Desligado | Mostra os erros no código PI quando o sinal está fraco. |
| Usar AF (Use AF) | Desligado, Ligado com REG, Ligado sem REG | Troca automática para a frequência alternativa, para manter a recepção. |
| Classificar AF automaticamente (Auto sort AF) | Ligado, Desligado | Ordena a lista de AF por frequência. |
| Buffering RT, PS rápido e Mostrar PS longo | PS rápido: Off, Initial ou Always | Fora da wiki. As duas primeiras também existem no Megatron e estão em [Menus explicados](menus.md). |

### Configurações FM

| Opção | Valores | O que faz |
| --- | --- | --- |
| Definir deslocamento do conversor (Converter offset) | 0 a 2400 MHz | Só para quem usa conversor de RF externo. |
| Definir borda da faixa baixa e alta (Low e High band edge) | 65 a 107,9 MHz; 66 a 108 MHz | Limites da faixa de FM. |
| Definir deslocamento de nível (Level offset) | −25 a +15 dB | Compensa perda ou ganho de sinal antes do rádio. |
| Definir limiar de nível baixo (Low level threshold) | −15 a +30 dBµV | Fora da wiki. |
| Silenciamento suave FM (Softmute FM) | Ligado, Desligado | Baixa o volume quando detecta chiado. |
| Supressor de ruído FM (FM Noise blanker) | Desligado, 50 a 150% | Reduz a interferência de ruído. |
| Passo padrão FM (FM default stepsize) | 50, 100 ou 200 kHz | Fora da wiki. Passo do encoder no FM. |
| FMSI melhoria do som estéreo (FMSI stereo improvement) | Ligado, Desligado | Só funciona nos TEF6687 e TEF6689; não age no DP-666. |
| Sensibilidade da varredura (Scan sensitivity) | 1 a 30 | Sensibilidade da busca automática. |

### Configurações AM

| Opção | Valores | O que faz |
| --- | --- | --- |
| Silenciamento suave AM (Softmute AM) | Ligado, Desligado | Baixa o volume quando detecta chiado. |
| Supressor de ruído AM (AM Noise blanker) | Desligado, 50 a 150% | Reduz a interferência de ruído. |
| Deslocamento de nível de RF AM (AM RF Level offset) | −50 a +15 dB | Fora da wiki. |
| Mostrar comprimento de onda SW (Show SW wavelength) | Ligado, Desligado | Fora da wiki. |
| Detector CoChannel e seu limiar (CoChannel Detector) | Desligado ou 50 a 150%; 1 a 15 | Fora da wiki. |
| AM Ganho da antena (AM Antenna gain) | Desligado, 6 a 36 dB | Ganho de uma antena ativa de SW, para evitar sobrecarga. |
| Tamanho padrão da etapa AM (MW default stepsize) | 9, 10 kHz | Passo das ondas médias. Nas Américas, 10 kHz. |
| Sensibilidade da varredura (Scan sensitivity) | 1 a 30 | Sensibilidade da busca automática. |

### Conectividade e relógio

| Opção | Valores | O que faz |
| --- | --- | --- |
| Modo USB (USB mode) | XDRGTK, RDS Spy | Modo da porta USB, já com a velocidade de cada programa. |
| Wi-Fi | Ligado, Desligado | Liga o Wi-Fi. |
| Configurar Wi-Fi (Configure Wi-Fi) | assistente | Conecta o rádio a uma rede. Só funciona com redes de 2,4 GHz. |
| IP do cliente e ID da lista de estações (Stationlist client IP e ID) | 1 a 254; 1 a 10 | Fora da wiki. Pelo código, o último número do IP do computador com o StationList e o número deste rádio. |
| Tela mudo na conexão XDRGTK (Mute screen on XDRGTK connection) | Ligado, Desligado | Fora da wiki. |
| Definir deslocamento de tempo NTP (Set NTP time offset) | fuso em relação ao GMT | Fuso aplicado à hora que vem da internet. |
| DST automático no horário NTP (Auto DST on NTP time) | Ligado, Desligado | Horário de verão automático. A wiki trata fuso e horário de verão como um item só. |
| Modo de relógio (Clock mode) | 12 h, 24 h | Fora da wiki. |
| PI bloqueado CT sync (PI locked CT sync) | Ligado, Desligado | Vincula o acerto pela hora do RDS (CT) ao código PI recebido, para mais precisão. |

### Opções FM DX, Memória automática e Sobre o software

- **Opções FM DX:** veja [Scanner de DX](#oficial--scanner-de-dx) e [Logbook](#oficial--logbook), acima.
- **Memória automática:** veja [Memórias](#oficial--memórias), acima.
- **Sobre o software:** créditos dos desenvolvedores e colaboradores.

## Montagens caseiras

Não se aplica ao DP-666, mas está na wiki para quem monta o próprio receptor:

- **Medidor analógico:** do IO27, um resistor de 1 kΩ e um trimpot de 5 kΩ em série até o medidor. A calibração é ligar o rádio segurando BAND.
- **Cristal do TEF668x:** a tensão no IO15, definida por um divisor de resistores, diz ao firmware qual cristal a placa usa: 0 V para 9,216 MHz, 1 V para 12 MHz, 2 V para 55,466 MHz e entre 2 V e 3,3 V para 4 MHz.

## Fontes

- [Wiki do TEF6686_ESP32 — página inicial](https://github.com/PE5PVB/TEF6686_ESP32/wiki)
- [Wiki — Menu options explained](https://github.com/PE5PVB/TEF6686_ESP32/wiki/Menu-options-explained)
- [Wiki — How to use the FM DX scanner](https://github.com/PE5PVB/TEF6686_ESP32/wiki/How-to-use-the-FM-DX-scanner)
- [Wiki — How to use memory channels](https://github.com/PE5PVB/TEF6686_ESP32/wiki/How-to-use-memory-channels)
- [Wiki — How to use the logbook](https://github.com/PE5PVB/TEF6686_ESP32/wiki/How-to-use-the-logbook)
- [Wiki — Using the software](https://github.com/PE5PVB/TEF6686_ESP32/wiki/Using-the-software)
- [PE5PVB — TEF6686_ESP32.ino: botões, combinações e padrão de fábrica](https://github.com/PE5PVB/TEF6686_ESP32/blob/main/TEF6686_ESP32.ino)
- [PE5PVB — gui.cpp: estrutura do menu](https://github.com/PE5PVB/TEF6686_ESP32/blob/main/src/gui.cpp)
- [PE5PVB — language.h: nomes do menu em português](https://github.com/PE5PVB/TEF6686_ESP32/blob/main/src/language.h)
- [PE5PVB — audiocues.h: sinais sonoros e Morse](https://github.com/PE5PVB/TEF6686_ESP32/blob/main/src/audiocues.h)
