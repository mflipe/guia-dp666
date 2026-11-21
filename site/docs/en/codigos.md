# Screen messages and codes

Type what shows on the radio’s screen, such as TMC, PTYN N/A or Tuner: !None!, to see what it means.

<!--FERRAMENTA:codigos:topo-->

The tables below have everything, sorted by screen. The RDS screens come from the base code and apply to both the Mod17 and the official firmware. The messages are sorted by firmware, and the official firmware's Portuguese text comes under the original, in italics.

## Main screen

As it appears on the Mod17. The official firmware has the same base, but positions and colors may differ.

| On screen | What it means |
| --- | --- |
| Arrows and dot, top left corner | Deviation indicator. Green dot: tuning is centered on the station. Lit arrows: tuning is off center, and the lit side shows the direction. |
| Two circles | Stereo. Lit: the station comes in stereo. A single circle means mono mode (manual). |
| Speaker | Lit: the sound is cut, by the squelch or by mute. Tapping it turns mute on and off. |
| RDS | Lit: the radio is decoding RDS. Off: no RDS, or the signal is too weak. Tapping it opens the advanced RDS screen. |
| Number with kHz, at the top | Filter bandwidth. It changes color when it is automatic. |
| Wi-Fi | Lit: Wi-Fi is on. |
| Battery | Charge in bars, percentage or volts, depending on the setting. Red frame: it reached 3.3 V. With Wi-Fi on, it shows "wifi" in place of the charge, because the radio doesn't measure the battery then. |
| MAN, AUTO and MEM | Tuning mode, the lit one is current. MAN moves step by step, AUTO searches for the next station and MEM goes through the memory channels. |
| Number next to MEM | Memory position, from 1 to 99. When storing, MEM turns red, and the number is red if the position is taken and green if it is free. |
| FM, FML, OIRT, LW, MW, SW and AIR | Current band. FML (Mod17) and OIRT (official firmware) are the Eastern European low FM band, 65.8 to 74 MHz. AIR, on the Mod17, is the airband. |
| Bars above the frequency | Active tuning step. All off: default step. |
| Green frequency | You are typing the frequency on the keypad. |
| AUTO BW | Lit: automatic bandwidth. Off: fixed bandwidth. |
| iMS | Lit: FM multipath suppression is on. |
| EQ | Lit: FM channel equalization is on. |
| S | Signal meter, from S1 to S9 and above (+10, +30). |
| M | FM modulation meter, from 10 to 100. The loose tick is the recent peak. |
| dBμV, dBf and dBm | Unit of the signal level, the big number on the right. On the Mod17, it turns red from 60 dBμV up, green from 40 up and yellow below that. |
| C/N | Carrier-to-noise ratio, in dB (manual): the higher, the cleaner the signal. It shows "--" when there is no reading at the moment. |
| SQ | Squelch level; OFF means the squelch is off (manual). Tap SQ (it turns green) and turn the knob to adjust it, with Rotary adjust squelch on. |
| Bed icon | Sleep mode, which turns the screen off; turn the knob to leave it (manual). |
| PTY | Programme type sent over RDS, such as Pop Music or News. |
| PS | Station name, up to 8 characters. Some stations scroll or switch the name. |
| Bars next to the PS | RDS quality: the more bars lit, the fewer reception errors. |
| PI | Code that identifies the station over RDS, 4 characters from 0 to 9 and A to F. It isn't an error: each station has its own, and it changes when you switch stations. In Anatel's RDS specification, the first character of a Brazilian PI is B, C, D or 3, the second gives the coverage area and the last two identify the station, but some stations use another code. It sits in the clock corner when the clock is off. |
| PI with ? at the end | The PI arrived with errors and may be wrong. One ? means a few errors; two, more. It goes away when an error-free PI arrives. It shows with Show PI errors on. |
| Time, or date and time | Clock. Tapping it switches between date and time, PI and time only, as in Show clock. |
| RT | RadioText, the station's free text, up to 64 characters. It scrolls when it doesn't fit. |
| Two dots at the end of the RT | RadioText A/B flag. The station flips the flag when it sends a new text, and the lit dot changes place. |
| PS, PTY and RT in another color | RDS dropped: what shows is the last text received. |

## Advanced RDS screen

Opens by tapping RDS or holding BAND (manual). BAND closes it.

| On screen | What it means |
| --- | --- |
| ERRORS<br>A:, B:, C: and D: | One dot for each of the four blocks of every RDS group. Green: the block arrived without errors. Red: it arrived with errors. With a good signal, they stay green almost all the time. |
| TP | Traffic Programme: the station carries traffic information. |
| TA | Traffic Announcement: a traffic bulletin is on air right now. |
| AF | The station sends a list of alternative frequencies where the same programme also plays. |
| -B | The AF list uses method B, in frequency pairs, common in large networks or ones with regional versions. |
| TMC | Traffic Message Channel: the station sends traffic data for navigation devices. |
| RT+ | RadioText Plus: the RT comes with tags, such as artist and song title. |
| EON | Enhanced Other Networks: the station sends data about other stations in the same network. |
| S and M | Speech (S) or music (M), as the station declares. Only one is lit. |
| PTYN<br>PTYN N/A | Free-text programme type name, up to 8 characters. PTYN N/A: the station doesn't send it. |
| Row of small dots in the middle | The RDS group types, from 0A to 15B, left to right. The green one is the last group received; the red ones arrived before. |
| Dynamic PTY | Green dot: the programme type may change during the broadcast. Red: it doesn't. |
| Artif. head | Green dot: artificial head recording, made for headphones. Red: no. |
| Compressed | Green dot: the audio is compressed. Red: no. |
| Has stereo | Green dot: the programme is stereo. Red: mono. |
| ECC | The station's country, from the extended country code together with the first digit of the PI. |
| LIC | Language of the programme. |
| PIN | Programme Item Number: day of the month and start time of the programme, such as 21 18:00. |
| N/A | Not available: the station doesn't send this data. |
| Unknown | The station sends a code the firmware doesn't know. On the official firmware in Portuguese, it shows Desconhecido. |

## AF and EON lists

They open from the advanced RDS screen: tapping the bottom half switches pages.

| On screen | What it means |
| --- | --- |
| Green frequency in the list | Checked alternative frequency: the radio checked it and it is the same station, with the same PI. |
| Red frequency in the list | Checked, but it is another station, with a different PI. |
| Frequency in the normal color | Not checked yet. |
| S, M and R | Letters before the frequency, only in method B. S: same programme. R: regional version, which may carry local programming. M: the list marked the frequency both ways 🟡. |
| PI, TA, TP and PTY | Columns of the EON list: each row is a station of the network, with its PI, its name, whether it has TA and TP, and its PTY. |

## Messages on both firmwares

| Message | What it means |
| --- | --- |
| Tuner: !None!<br>*Sintonizador: !Nenhum!* | The ESP32 didn't find the tuner chip at power-on. See [Screen stuck on "Tuner: !None!"](#ajuda--screen-stuck-on-tuner-none). |
| Tuner not detected<br>*Sintonizador não detectado* | The tuner chip didn't identify itself as expected at power-on, and the radio stops on this screen. Follow the steps in [Screen stuck on "Tuner: !None!"](#ajuda--screen-stuck-on-tuner-none). |
| Function only available on TEF6687/6689!<br>*Função disponível apenas no TEF6687/6689!* | The chosen feature needs another chip. The DP-666 uses the TEF6686, so it doesn't work here. |
| No AF available<br>*AF não disponível* | The station doesn't send an alternative frequency list. It isn't a fault. |
| No EON available<br>*EON não disponível* | The station doesn't send data about other stations in the network. |
| No RT+ available<br>*RT+ não disponível* | The RadioText comes without RT+ tags. |
| PRESS BAND TO CLOSE<br>*PRESSIONE BAND PARA FECHAR* | Press BAND to close the screen and go back. |
| PRESS MODE TO EXIT AND STORE<br>*PRESSIONE MODE PARA SAIR E SALVAR* | In the menu: MODE exits and saves the changes. |
| PRESS MODE TO RETURN<br>*PRESSIONE MODO PARA VOLTAR* | In a submenu: MODE goes back one level. |
| Alarm!!!<br>EMERGENCY!<br>*Alarme – Alarme !* | Programme type 31: the station signals an alert. EMERGENCY! is the same type in the American standard (RBDS), where Emergency Test is type 30, for tests. |
| Rotary direction changed<br>*Direção rotativa alterada* | You powered on holding BW, and the knob direction flipped. Repeat to undo it. See [Powering on while holding](#oficial--powering-on-while-holding). |
| Screen flipped<br>*Tela invertida* | You powered on holding MODE, and the screen turned 180°. Repeat to undo it. |
| Calibrate analog meter<br>Release button when ready<br>*Calibrar o medidor analógico* | You powered on holding BAND: it is the analog meter calibration, and the DP-666 has no such meter. Release the button. |
| Encoder set to optical<br>Encoder set to standard<br>*Codificador definido como óptico*<br>*Codificador definido como padrão* | You powered on holding the knob, and the encoder type changed. If the knob starts skipping or failing, repeat to go back. |
| Please release button<br>*Solte o botão, por favor* | It shows with the notices above: release the button you held at power-on. |

## Messages only on the Mod17

| Message | What it means |
| --- | --- |
| Touch corners as indicated<br>Touch calibration completed! | Touch calibration, in Operation settings → Touch calibration: tap the corners shown until completed appears. |
| Low battery, please charge it | Low battery: plug in the charger. |
| Wi-Fi not configured | No network has been set up. Set up Wi-Fi with the on-screen keyboard or the browser; see [Connectivity and protocols](#mod17--connectivity-and-protocols). |
| Wi-Fi connect failed! | It didn't connect to the saved network. Check the password and whether the network is in range; the radio only uses 2.4 GHz networks. |
| Connecting to Wi-Fi<br>Wi-Fi connected!<br>Wi-Fi disconnected!<br>Wi-Fi closed! | Wi-Fi notices: connecting, connected, lost the connection or turned off. |
| Please close Wi-Fi first | Turn Wi-Fi off first: the requested feature, such as Bluetooth, doesn't work with it on. |
| Time has been synchronized<br>Time synchronized | The time was set, over the internet (NTP) or from RDS. |
| NTP time sync retry... | Setting the time over the internet failed, and the radio will try again. Check the Wi-Fi. |
| Slave host not configured<br>Slave host connect failed<br>Slave host connect success<br>Slave host connected<br>Slave host disconnected | Notices from the Bluetooth "slave host" feature, in which the radio controls another device. See [Connectivity and protocols](#mod17--connectivity-and-protocols). |
| Bluetooth is turned on<br>Bluetooth is turned off<br>Bluetooth connected<br>Bluetooth disconnected | Bluetooth notices: on, off, connected or disconnected. |
| Input cannot be empty | The on-screen keyboard field was left empty. Type something before confirming. |
| Abort! No storage space available! | Cancelled for lack of space to store. Going by the text, the memory channels or the internal storage are full ❓. |
| Abort! No stations that can be scanned. | Cancelled because there are no stations to scan, such as empty memory channels ❓. |
| Load failed! | A saved file or setting couldn't be loaded ❓. |
| Failed, My settings have not been saved! | Save my settings couldn't write the copy of the settings. Try again. |
| Serial number error<br>Too many attempts, please restart and try again! | Supporter serial number refused. After several attempts, restart the radio. See [Supporter serial number](#mod17--supporter-serial-number). |
| Settings has been saved<br>Station has been saved<br>Station has been deleted | Confirmations: the settings were saved, or the station was stored in or deleted from memory. |
| Data change has been saved<br>Data change has been discarded<br>Change pending<br>No changes | When leaving a menu: the changes were saved, were discarded, are pending or there were none 🟡. |
| Setting completed<br>Done, Restarting | The setup wizard finished, and the radio will restart. |
| Enter rotary to adjust squelch mode<br>Exit rotary to adjust squelch mode | The knob now adjusts the squelch, or went back to tuning. |
| Enter still screen mode<br>Exit still screen mode | Still screen on or off, by tapping the top left corner. It helps against the noise the screen causes in the radio. |
| Enable sleep mode<br>Disable sleep mode | Sleep mode on or off 🟡. |
| Enter power save mode<br>Exit power save mode | Power save mode on or off 🟡. |
| Locked<br>Unlocked | Locked or unlocked, by the Lock&Unlock action, which goes on a long press. |
| Switch FM bandwidth<br>Switch AM bandwidth | The bandwidth changed. |
| Waiting for manage command... | Manage my data mode: the radio waits for commands from the computer. |
| Reset system files<br>Format internal storage<br>System restart<br>System deep sleep | Maintenance notices. What triggers each one isn't documented ❓. |
| Easter egg has been opened<br>Easter egg has been closed | A hidden feature was turned on or off ❓. |

## Messages only on the official firmware

| Message | What it means |
| --- | --- |
| Defaults loaded<br>*Padrões carregados* | You powered on holding BW and the knob, and the settings went back to factory defaults. |
| Press highlighted corner<br>To calibrate touchscreen<br>*Pressione o canto inscrito* | Touch calibration, which opens when you power on holding BW + MODE: tap each highlighted corner. |
| Error! No RDS signal<br>*Erro! Sem sinal RDS* | In PI locked CT sync, the radio needs a station with RDS tuned in to store its PI. Tune one in and try again. |
| Hold BW button to stop DX scanner<br>*Segure BW para parar* | The DX scanner is running. Hold BW to stop it. |
| Abort! The start channel is marked as skipped.<br>*Abortar! O canal inicial é ignorado.* | The DX scanner over memory channels doesn't start on a channel marked to skip. Pick another one to start. |
| Abort! Out of memorychannels<br>*Abortar! Sem canais de memória disponíveis* | Auto memory stopped because it ran out of free positions. |
| Abort! User pressed button<br>*Abortar! Usuário pressionou o botão* | Auto memory stopped because a button was pressed. |
| Scan finished without errors<br>*Verificação concluída sem erros* | Auto memory finished without problems. |
| Logbook is empty<br>*O livro de registro está vazio* | The [logbook](#oficial--logbook) has no stations yet. |
| Error adding entry to the logbook<br>*Falha na atualização!* | The station couldn't be added to the logbook. |
| Can't add entry! Logbook is full!<br>*Não é possível adicionar! O livro está cheio!* | The logbook is full. Download the CSV in the browser and clear the logbook. |
| Clear failed<br>*Falha ao limpar* | The logbook couldn't be cleared. |
| The logbook contains over 130 entries<br>*O diário de bordo contém mais de 130 entradas* | The logbook page in the browser doesn't show more than 130 entries. Download the CSV file. |

## Sources

- [PE5PVB — rds.cpp: advanced RDS screen and AF and EON lists](https://github.com/PE5PVB/TEF6686_ESP32/blob/main/src/rds.cpp)
- [PE5PVB — language.h: firmware texts in each language](https://github.com/PE5PVB/TEF6686_ESP32/blob/main/src/language.h)
- [Wikipedia — Radio Data System](https://en.wikipedia.org/wiki/Radio_Data_System)
- [RDS Forum — RDS glossary](https://rds.org.uk/2010/Glossary-Of-Terms.htm)
- [PE5PVB — TEF668X.cpp: RDS, PI and AF decoding](https://github.com/PE5PVB/TEF6686_ESP32/blob/main/src/TEF668X.cpp)
- [DP-666 Megatron Mod17 manual](https://www.deepelec.com/files/dp-666/DP-666_UM_EN_Megatron_Mod17.pdf)
- [SBrT 2017 — Radio Data System em Rádio Definido por Software, with Anatel's RDS specification (in Portuguese)](https://biblioteca.sbrt.org.br/articlefile/573.pdf)
