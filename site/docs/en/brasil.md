# Setup for Brazil

Settings that make a difference when you use the DP-666 in Brazil, with the rules behind each one. Option names are in English, as they appear on Megatron Mod17. On the official firmware the names differ a little: see the summary near the end of the page. Every possible value of each option is in [Radio settings](#ajustes).

!!! tip "Unlock advanced mode first"
    Many options on this page only appear in advanced mode. To turn it on, DEEPELEC recommends switching the language to Chinese, turning the mode on and switching back to English: Display settings → Language → 简体中文; then 主要设置 → 系统使用模式 → 高级模式; and finally 显示设置 → 语言 → English.

## FM audio

- **FM deemphasis at 50 µs.** In the Americas the standard is usually 75 µs, but Brazil is an exception. Anatel Act No. 8,104/2022, the FM rule in force, says 50 µs should be used "preferably", and the ITU lists Brazil with 50 µs. See [Standards and rules](#brasil--standards-and-rules).
- **Use squelch at Off** to hunt for weak stations. On Auto, the radio may hide distant signals.
- **Stereo threshold:** with a weak signal, a threshold around 40 dBµV forces mono and reduces hiss.

## FM band and extended FM

- **Set low band edge at 76.1 MHz** and **Set high band edge at 108.0 MHz.** This way the band covers extended FM (eFM), from 76.1 to 87.3 MHz, which has had stations on the air since May 7, 2021.
- **Channel grid:** Brazilian stations sit on 200 kHz channels with an odd decimal, from 76.1 to 87.3 MHz and from 88.1 to 107.9 MHz. Between the two ranges, from 87.4 to 88 MHz, are the community radio stations.
- **FM default stepsize at 200 kHz.** On the official firmware, the code adds the step starting from the band edge: with the edge at 76.1 MHz, tuning stops only on odd decimals. On Megatron, check it on your radio. For DX, use 100 kHz to also stop on even decimals.
- **FM AGC at 92 dBµV** is the most sensitive. If ghost stations show up near strong stations, try 87 or 84.

<!--DIAL-->


## AM and medium wave

- **MW default stepsize at 10 kHz**, the medium wave grid of Brazil and the Americas.
- **AIR band Conversion:** the option exists, but the air band only works with an external converter sold separately.

## RDS

- **Region at Europe.** Brazilian RDS follows the European model, with the PI code assigned by Anatel. The USA option uses the American table (RBDS).
- **Use AF at Off** for DX and scanning, so the radio doesn’t jump to another frequency on its own. Day to day, only leave it on if the stations in your region broadcast alternative frequencies.
- **RDS time sync at Off** once NTP is working, because some stations send the wrong time.

## Clock and time zone

- **Set local time zone:** pick your state’s time zone. For Brasília time, GMT−03:00.
- **Why the clock runs 8 hours fast:** NTP delivers the time in UTC and the radio applies the time zone. Megatron is Chinese, ships with GMT+8 and has only one built-in NTP server, cn.pool.ntp.org.
- **Set NTP server (Mod17):** a Brazilian server, such as a.st1.ntp.br, from NTP.br, answers faster. System information shows the server in use.
- **Wi-Fi auto disconnect at After time sync:** Wi-Fi turns off after setting the clock. This saves battery and keeps the battery voltage reading, which disappears while Wi-Fi is on (see [Common problems](problemas.md)).

## On the official firmware

The same settings, with the official firmware’s English menu names (see [Using the official firmware](oficial.md)):

- **Audio settings → FM deemphasis:** 50 µs.
- **FM settings → Low band edge and High band edge:** 76.1 and 108.0 MHz, to include extended FM. The low edge goes up 0.1 MHz and down 1 MHz per click: from 87.5, go down 12 times, to 75.5, and up 6.
- **FM settings → FM default stepsize:** 200 kHz.
- **AM settings → MW default stepsize:** 10 kHz. The factory default is 9 kHz, the European one.
- **RDS settings → Region:** Europe. Leave **Use AF** off for DX and scanning.
- **Connectivity & clock → Set NTP time offset:** GMT −3 for Brasília time. The factory default is GMT +1.
- **Auto DST on NTP time:** off, because Brazil has had no daylight saving time since Decree No. 9,772 of 2019. The factory default is on.

## Standards and rules

The Brazilian rules that affect how you use the radio, with the official document for each one. This is a summary for radio users, not legal advice.

### FM: band, channels and pre-emphasis

- **Band.** Anatel Resolution No. 721/2020, in force since November 3, 2020, allocates 76 to 108 MHz to FM and keeps 87.4 to 88 MHz for community broadcasting (RadCom).
- **Channels.** Anatel Act No. 8,104/2022 numbers the 200 kHz channels: 76.1 MHz is channel 141, 87.3 MHz is 197 and 107.9 MHz is 300. That is why frequencies end in an odd decimal.
- **50 µs pre-emphasis.** The same Act, in force since August 1, 2022, says 50 µs pre-emphasis should be used "preferably". The text of the Act writes "ms", a typo inherited from earlier versions. The rule comes from Resolution No. 67/1998, now repealed. "Preferably" leaves room for a station at 75 µs, which would sound a bit brighter on the radio.
- **The ITU confirms it.** Recommendation ITU-R BS.450-3 lists Brazil with 200 kHz channels, 50 µs pre-emphasis and a maximum deviation of ±75 kHz. The 75 µs that appears in other Anatel rules applies to analog TV audio, not to FM.
- **Stereo and subcarriers.** Act No. 8,104/2022 accepts modulation peaks of up to 110% (82.5 kHz deviation) and places subcarriers between 20 and 99 kHz, or between 53 and 99 kHz when the program is stereo. The pre-emphasis of the stereo signal must match that of the main signal.
- **AM migration.** Decree No. 8,139/2013, amended in 2018, 2020 and 2021, governs the move of local AM stations to FM, with simulcasting for up to five years. Extended FM was opened to take in those stations.

### RDS

- Act No. 8,104/2022 includes the RDS specification in Portuguese: the PI code has 16 bits and is assigned to each station by Anatel, or by an accredited entity; PTY identifies up to 31 program types.
- It is European RDS, not American RBDS, hence the Europe region on the radio. The Act’s program type table (Table A3) has not been checked item by item.

### Medium wave, tropical and shortwave

- Resolution No. 721/2020 keeps medium wave from 525 to 1705 kHz and the 120 m tropical band from 2300 to 2495 kHz.
- Act No. 8,104/2022 uses 10 kHz spacing on medium wave, and Act No. 3,116/2020 defines classes A, B and C of MW stations.
- With the migration, many local AM stations went off the air. There is no official count of how many still broadcast.

### Listening

- **Broadcasting is free to receive.** Article 57 of the Brazilian Telecommunications Code (Law No. 4,117/1962) excludes from the prohibitions radio communications intended to be freely received, amateur radio, ships and aircraft in distress and public emergencies.
- **Air band and other communications.** Routine conversation between aircraft and the tower is not on that list. Article 56 of the same Code and Article 151, § 1, II, of the Penal Code punish anyone who discloses, passes on to others or uses the content of communications addressed to third parties. In practice: listen, but don’t record to publish or retransmit.
- **Transmitting is another story.** Article 183 of the General Telecommunications Law (Law No. 9,472/1997) punishes unlicensed telecommunications activity. The DP-666 only receives.

### Digital radio

- MC Ordinance No. 290/2010 created the Brazilian Digital Radio System without choosing a standard. In 2024, the Ministry of Communications answered an information request saying there are no plans to digitize radio in the country (the answer was published by the Rádio Livre site, not by the government).
- The DP-666 tuner doesn’t decode HD Radio or DRM.

### Time

- Decree No. 9,772/2019 ended daylight saving time across the country.
- Law No. 12,876/2013 places the Federal District and states such as São Paulo in the Greenwich minus three hours time zone.
- NTP.br uses the atomic clocks of Brazil’s National Observatory and runs servers such as a.st1.ntp.br.

### Type approval

- Anatel Resolution No. 680/2017 requires certification of restricted radiation equipment, such as the Wi-Fi and Bluetooth of the DP-666’s ESP32. The technical requirements are in Act No. 14,448/2017, with later amendments.
- No Anatel type approval was found for the DP-666.

## Sources

- [Anatel — Act No. 8,104/2022, FM technical requirements](https://informacoes.anatel.gov.br/legislacao/atos-de-requisitos-tecnicos-de-gestao-do-espectro/2022/1687-ato-8104)
- [Anatel Resolution No. 721/2020 — AASP news on its entry into force](https://www.aasp.org.br/?p=35231)
- [Anatel — Act No. 3,116/2020, medium wave](https://informacoes.anatel.gov.br/legislacao/atos-de-requisitos-tecnicos-de-gestao-do-espectro/2020/1492-ato-3116)
- [Anatel — Resolution No. 67/1998, repealed](http://arctel-cplp.org/wp-content/uploads/2022/09/Resolucao-n.o-67-de-12-de-novembro-de-1998.pdf)
- [ITU — Recommendation BS.450-3](https://itu.int/dms_pubrec/itu-r/rec/bs/R-REC-BS.450-3-200111-S!!PDF-E.pdf)
- [Decree No. 8,139/2013 — AM to FM migration](https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/decreto/d8139.htm)
- [Law No. 4,117/1962 — Brazilian Telecommunications Code](https://www.planalto.gov.br/ccivil_03/LEIS/L4117.htm)
- [Penal Code — Decree-Law No. 2,848/1940](https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848compilado.htm)
- [Law No. 9,472/1997 — General Telecommunications Law](https://www.planalto.gov.br/ccivil_03/leis/l9472.htm)
- [MC Ordinance No. 290/2010 — Brazilian Digital Radio System](https://repositorio.mctic.gov.br/bitstream/mctic/1931/1/2010_port_290_03_30.pdf)
- [Ministry of Communications answer on digital radio, 2024](http://orelha2.radiolivre.org/radio_digital/Resposta_MC_Radio_Digital_March_2024.pdf)
- [Decree No. 9,772/2019 — end of daylight saving time](https://planalto.gov.br/ccivil_03/_ato2019-2022/2019/decreto/d9772.htm)
- [Law No. 12,876/2013 — time zones](https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/lei/l12876.htm)
- [NTP.br](https://ntp.br/)
- [Anatel — Resolution No. 680/2017, restricted radiation](https://www.anatel.gov.br/legislacao/resolucoes/2017/936-resolucao-680)
- [Anatel — Act No. 14,448/2017, restricted radiation requirements](https://informacoes.anatel.gov.br/legislacao/atos-de-certificacao-de-produtos/2017/1139-ato-14448)
- [FM extended band in Brazil (Wikipedia)](https://en.wikipedia.org/wiki/FM_extended_band_in_Brazil)
- [DEEPELEC DP-666](https://www.deepelec.com/en/dp-666/)
