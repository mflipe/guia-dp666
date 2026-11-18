# Configuração para o Brasil

Ajustes que fazem diferença para quem usa o DP-666 no Brasil, com as normas que justificam cada um. Os nomes das opções estão em inglês, como aparecem no Megatron Mod17. Na linha oficial, os nomes mudam um pouco: veja o resumo no fim da página. Todos os valores possíveis de cada opção estão em [Ajustes do rádio](#ajustes).

!!! tip "Libere o modo avançado primeiro"
    Muitas opções desta página só aparecem no modo avançado. Para ativá-lo, a DEEPELEC orienta trocar o idioma para chinês, ligar o modo e voltar para o inglês: Display settings → Language → 简体中文; depois 主要设置 → 系统使用模式 → 高级模式; e por fim 显示设置 → 语言 → English.

## Áudio de FM

- **FM deemphasis em 50 µs.** Nas Américas o padrão costuma ser 75 µs, mas o Brasil é exceção. O Ato Anatel nº 8.104/2022, a norma de FM em vigor, manda usar 50 µs "preferencialmente", e a UIT lista o Brasil com 50 µs. Veja [Normas e padrões](#brasil--normas-e-padrões).
- **Use squelch em Off** para caçar emissoras fracas. Em Auto, o rádio pode esconder sinais distantes.
- **Stereo threshold:** com sinal fraco, um limiar perto de 40 dBµV força o mono e reduz o chiado.

## Faixa de FM e FM estendido

- **Set low band edge em 76,1 MHz** e **Set high band edge em 108,0 MHz.** Assim a faixa cobre o FM estendido (eFM), de 76,1 a 87,3 MHz, que tem emissoras no ar desde 7 de maio de 2021.
- **Grade de canais:** as emissoras brasileiras ficam em canais de 200 kHz com decimal ímpar, de 76,1 a 87,3 MHz e de 88,1 a 107,9 MHz. Entre as duas faixas, de 87,4 a 88 MHz, ficam as rádios comunitárias.
- **FM default stepsize em 200 kHz.** Na linha oficial, o código soma o passo a partir da borda da faixa: com a borda em 76,1 MHz, a sintonia para só nos decimais ímpares. No Megatron, confira no seu aparelho. Em DX, use 100 kHz para parar também nos decimais pares.
- **FM AGC em 92 dBµV** é o mais sensível. Se aparecerem estações fantasmas perto de emissoras fortes, teste 87 ou 84.

<!--DIAL-->


## AM e ondas médias

- **MW default stepsize em 10 kHz**, a grade de ondas médias do Brasil e das Américas.
- **AIR band Conversion:** a opção existe, mas a faixa aérea só funciona com um conversor externo vendido à parte.

## RDS

- **Region em Europe.** O RDS brasileiro segue o modelo europeu, com o código PI distribuído pela Anatel. A opção USA usa a tabela americana (RBDS).
- **Use AF em Off** em DX e buscas, para o rádio não pular sozinho para outra frequência. No dia a dia, deixe ligado só se as emissoras da sua região transmitirem frequências alternativas.
- **RDS time sync em Off** quando o NTP estiver funcionando, porque algumas emissoras mandam a hora errada.

## Relógio e fuso

- **Set local time zone:** escolha o fuso do seu estado. Para o horário de Brasília, GMT−03:00.
- **Por que o relógio adianta 8 horas:** o NTP entrega a hora em UTC e o rádio aplica o fuso. O Megatron é chinês, vem com GMT+8 e tem só um servidor NTP embutido, o cn.pool.ntp.org.
- **Set NTP server (Mod17):** um servidor brasileiro, como a.st1.ntp.br, do NTP.br, responde mais rápido. O System information mostra o servidor em uso.
- **Wi-Fi auto disconnect em After time sync:** o Wi-Fi desliga depois de acertar a hora. Isso economiza bateria e mantém a leitura da tensão da bateria, que some com o Wi-Fi ligado (veja [Problemas comuns](problemas.md)).

## Na linha oficial

Os mesmos ajustes, com os nomes do menu em português da linha oficial (veja [Uso da linha oficial](oficial.md)):

- **Configurações de áudio → Desênfase FM:** 50 µs.
- **Configurações FM → Definir borda da faixa baixa e alta:** 76,1 e 108,0 MHz, para incluir o FM estendido. A borda baixa sobe 0,1 MHz e desce 1 MHz por clique: de 87,5, desça 12 vezes, até 75,5, e suba 6.
- **Configurações FM → Passo padrão FM:** 200 kHz.
- **Configurações AM → Tamanho padrão da etapa AM:** 10 kHz. O padrão de fábrica é 9 kHz, o da Europa.
- **Configurações RDS → Região:** Europa. Deixe **Usar AF** desligado em DX e buscas.
- **Conectividade e relógio → Definir deslocamento de tempo NTP:** GMT −3 para o horário de Brasília. O padrão de fábrica é GMT +1.
- **DST automático no horário NTP:** desligado, porque o Brasil não tem horário de verão desde o Decreto nº 9.772, de 2019. O padrão de fábrica é ligado.

## Normas e padrões

As regras brasileiras que mexem com o uso do rádio, com o documento oficial de cada uma. Isto é um resumo para quem usa o rádio, não um parecer jurídico.

### FM: faixa, canais e pré-ênfase

- **Faixa.** A Resolução Anatel nº 721/2020, em vigor desde 3 de novembro de 2020, destina 76 a 108 MHz ao FM e mantém 87,4 a 88 MHz para a radiodifusão comunitária (RadCom).
- **Canais.** O Ato Anatel nº 8.104/2022 numera os canais de 200 kHz: 76,1 MHz é o canal 141, 87,3 MHz é o 197 e 107,9 MHz é o 300. Por isso as frequências terminam em decimal ímpar.
- **Pré-ênfase de 50 µs.** O mesmo Ato, em vigor desde 1º de agosto de 2022, diz que a pré-ênfase de 50 µs deve ser usada "preferencialmente". O texto do Ato escreve "ms", um erro de digitação herdado das versões anteriores. A regra vem da Resolução nº 67/1998, já revogada. "Preferencialmente" deixa margem para alguma emissora em 75 µs, que soaria um pouco mais aguda no rádio.
- **A UIT confirma.** A Recomendação UIT-R BS.450-3 lista o Brasil com canais de 200 kHz, pré-ênfase de 50 µs e desvio máximo de ±75 kHz. Os 75 µs que aparecem em outras normas da Anatel valem para o áudio da TV analógica, não para o FM.
- **Estéreo e subportadoras.** O Ato nº 8.104/2022 aceita picos de modulação de até 110% (desvio de 82,5 kHz) e põe as subportadoras entre 20 e 99 kHz, ou entre 53 e 99 kHz quando o programa é estéreo. A pré-ênfase do sinal estéreo tem de ser igual à do sinal principal.
- **Migração do AM.** O Decreto nº 8.139/2013, alterado em 2018, 2020 e 2021, regula a passagem das rádios AM locais para o FM, com transmissão simultânea por até cinco anos. O FM estendido foi aberto para receber essas emissoras.

### RDS

- O Ato nº 8.104/2022 traz a especificação do RDS em português: o código PI tem 16 bits e é distribuído pela Anatel, ou por entidade credenciada, para cada emissora; o PTY identifica até 31 tipos de programação.
- É o RDS europeu, e não o RBDS americano, por isso a região Europe no rádio. A tabela de tipos de programação do Ato (Tabela A3) não foi conferida item por item.

### Ondas médias, tropicais e curtas

- A Resolução nº 721/2020 mantém as ondas médias de 525 a 1705 kHz e a onda tropical de 120 m de 2300 a 2495 kHz.
- O Ato nº 8.104/2022 usa espaçamento de 10 kHz nas ondas médias, e o Ato nº 3.116/2020 define as classes A, B e C das emissoras de OM.
- Com a migração, muitas rádios AM locais saíram do ar. Não há número oficial de quantas ainda transmitem.

### Escuta

- **Radiodifusão é livre.** O art. 57 do Código Brasileiro de Telecomunicações (Lei nº 4.117/1962) exclui das proibições as radiocomunicações destinadas a ser livremente recebidas, as de radioamadores, as de navios e aeronaves em perigo e as de calamidade pública.
- **Banda aérea e outras comunicações.** A conversa de rotina entre aviões e torre não está nessa lista. O art. 56 do mesmo Código e o art. 151, § 1º, II, do Código Penal punem quem divulga, transmite a outros ou usa o conteúdo de comunicação dirigida a terceiros. Na prática: ouça, mas não grave para publicar nem retransmita.
- **Transmitir é outra história.** O art. 183 da Lei Geral de Telecomunicações (Lei nº 9.472/1997) pune a atividade clandestina de telecomunicação. O DP-666 só recebe rádio.

### Rádio digital

- A Portaria MC nº 290/2010 criou o Sistema Brasileiro de Rádio Digital sem escolher um padrão. Em 2024, o Ministério das Comunicações respondeu a um pedido de informação que não há planejamento para digitalizar o rádio no país (a resposta foi publicada pelo site Rádio Livre, não pelo governo).
- O sintonizador do DP-666 não decodifica HD Radio nem DRM.

### Hora

- O Decreto nº 9.772/2019 encerrou o horário de verão em todo o país.
- A Lei nº 12.876/2013 põe o Distrito Federal e estados como São Paulo no fuso de Greenwich menos três horas.
- O NTP.br usa os relógios atômicos do Observatório Nacional e mantém servidores como a.st1.ntp.br.

### Homologação

- A Resolução Anatel nº 680/2017 exige certificação dos equipamentos de radiação restrita, como o Wi-Fi e o Bluetooth do ESP32 do DP-666. Os requisitos técnicos estão no Ato nº 14.448/2017, com alterações posteriores.
- Não foi encontrada homologação da Anatel para o DP-666.

## Fontes

- [Anatel — Ato nº 8.104/2022, requisitos técnicos do FM](https://informacoes.anatel.gov.br/legislacao/atos-de-requisitos-tecnicos-de-gestao-do-espectro/2022/1687-ato-8104)
- [Resolução Anatel nº 721/2020 — notícia da AASP sobre a entrada em vigor](https://www.aasp.org.br/?p=35231)
- [Anatel — Ato nº 3.116/2020, ondas médias](https://informacoes.anatel.gov.br/legislacao/atos-de-requisitos-tecnicos-de-gestao-do-espectro/2020/1492-ato-3116)
- [Anatel — Resolução nº 67/1998, revogada](http://arctel-cplp.org/wp-content/uploads/2022/09/Resolucao-n.o-67-de-12-de-novembro-de-1998.pdf)
- [UIT — Recomendação BS.450-3](https://itu.int/dms_pubrec/itu-r/rec/bs/R-REC-BS.450-3-200111-S!!PDF-E.pdf)
- [Decreto nº 8.139/2013 — migração do AM para o FM](https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/decreto/d8139.htm)
- [Lei nº 4.117/1962 — Código Brasileiro de Telecomunicações](https://www.planalto.gov.br/ccivil_03/LEIS/L4117.htm)
- [Código Penal — Decreto-Lei nº 2.848/1940](https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848compilado.htm)
- [Lei nº 9.472/1997 — Lei Geral de Telecomunicações](https://www.planalto.gov.br/ccivil_03/leis/l9472.htm)
- [Portaria MC nº 290/2010 — Sistema Brasileiro de Rádio Digital](https://repositorio.mctic.gov.br/bitstream/mctic/1931/1/2010_port_290_03_30.pdf)
- [Resposta do Ministério das Comunicações sobre rádio digital, 2024](http://orelha2.radiolivre.org/radio_digital/Resposta_MC_Radio_Digital_March_2024.pdf)
- [Decreto nº 9.772/2019 — fim do horário de verão](https://planalto.gov.br/ccivil_03/_ato2019-2022/2019/decreto/d9772.htm)
- [Lei nº 12.876/2013 — fusos horários](https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/lei/l12876.htm)
- [NTP.br](https://ntp.br/)
- [Anatel — Resolução nº 680/2017, radiação restrita](https://www.anatel.gov.br/legislacao/resolucoes/2017/936-resolucao-680)
- [Anatel — Ato nº 14.448/2017, requisitos de radiação restrita](https://informacoes.anatel.gov.br/legislacao/atos-de-certificacao-de-produtos/2017/1139-ato-14448)
- [FM extended band in Brazil (Wikipedia)](https://en.wikipedia.org/wiki/FM_extended_band_in_Brazil)
- [DEEPELEC DP-666](https://www.deepelec.com/en/dp-666/)
