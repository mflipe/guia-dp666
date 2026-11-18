# Using the official firmware

Buttons, power-on combinations, memory channels, the DX scanner and the logbook of PE5PVB’s official firmware. The full menu is in [Radio settings](#ajustes--oficial). It is based on the [project wiki](https://github.com/PE5PVB/TEF6686_ESP32/wiki), checked against the code of v2.20.12, from Nov 13, 2026. Where the two differ, the guide follows the code and says so. For Megatron, see [Using the radio](uso.md).

!!! note "Incomplete wiki, firmware without warranty"
    The author himself warns that the wiki is still under construction and may not cover everything. The firmware is distributed without any warranty, and whoever flashes it takes the risk.

## What the official firmware does

- **Bands:** FM from 65 to 108 MHz and AM from 144 kHz to 27 MHz.
- **Connections:** RDS Spy, XDR-GTK, fm-dx-webserver and StationList over Wi-Fi (see [Computer and connectivity](computador.md)).
- **Features:** almost all of RDS, with an advanced RDS screen; automatic and manual search; squelch; battery, S-meter and modulation meter on the screen; themes; 23 languages; automatic switching to the alternative frequency (AF); 99 memory channels; and a station log (logbook).
- **Only on the TEF6687 and TEF6689 chips:** the full RDS search (FullSearch RDS) and the FMSI stereo improvement. The DP-666 uses the TEF6686, so these two functions don’t exist on it.

## Buttons

In v2.20.12, a long press means holding for 1 second. The encoder is the TUNING knob.

| Button | Short press | Long press |
| --- | --- | --- |
| BAND | Changes the band. On the AF and statistics screens, goes back to advanced RDS; in advanced RDS, exits it. | In FM, opens advanced RDS and, from inside it, the AF screen. In AM, turns on the screensaver right away. |
| MODE | Cycles through MAN, AUTO and MEM. In the menu, exits. | Opens the menu. |
| BW | Opens the bandwidth selector. | In FM, toggles between forced mono and automatic stereo. In AM, opens the bandwidth selector. |
| Encoder | In MAN, changes the step. In MEM, enters memory-saving mode. | In FM, saves the station to the logbook. In SW, turns the search by meter bands on and off. |

- **BAND held for 2.5 s:** runs the action chosen in "5 sec. bandbutton press": nothing, power off or screen off. Despite the name, the code uses 2.5 s.
- **With the screensaver on:** pressing BAND or turning the encoder only wakes the screen.
- **iMS and EQ:** in the current version, they toggle with a tap on the screen.
- **In the menu, MODE held for 3 s:** opens the games hidden in the firmware.

!!! note "Where the wiki is out of date"
    The wiki’s home page swaps the BW presses and says that a long press on the encoder toggles iMS and EQ. In the current code, a short BW press opens the bandwidth, a long one toggles mono and stereo, and a long press on the encoder saves to the logbook, as the logbook page itself describes.

## Powering on while holding

| Buttons | Effect |
| --- | --- |
| BW | reverses the encoder direction |
| MODE | rotates the screen 180° |
| BAND | calibrates the analog meter, only on builds that have one |
| Encoder | toggles between the standard and the optical encoder |
| BW + MODE | calibrates touch |
| BW + BAND | inverts the screen colors |
| MODE + encoder | changes the panel type (ARS or standard), for when the menu becomes unreadable |
| BW + encoder | restores the factory defaults |

!!! danger "The factory reset erases the memory channels and the logbook"
    In v2.20.12, restoring with BW + encoder also empties the 99 memory channels and recreates an empty logbook. Make a [backup](backup.md) first.

- **From the menu:** v2.20.12 also has these settings in the menu, which the wiki doesn’t show yet. Device settings groups the model, encoder direction, optical encoder, colors, ARS panel, analog meter and factory reset. Screen settings groups the frequency font, rotated screen, frequency keypad and touch calibration.
- **Compiled for the DP-666:** with the `DEEPELEC_DP_66X` option, the factory defaults already come with the Portable touch model, the screen rotated, the encoder reversed and the colors not inverted. The step-by-step is in [Backup and flashing](backup.md).

## Memory channels

- **Capacity:** 99 positions, each one on any band: FM, OIRT, LW, MW or SW.
- **Save:** tune in the station, press MODE until MEM appears and press the encoder (MEM turns red). Turn to the position: a red number means the position is taken, green means free. Press the encoder again to save.
- **Skip a position:** with MEM red, pick the position and press BAND. The code saves frequency 0 there, the value the firmware uses for positions that should be skipped.
- **Auto memory:** fills the memory channels on its own, across a frequency range and a range of positions. You can save only stations with RDS, avoid repeated PIs (Off, Range or Full), adjust the sensitivity and clear the memory channels. The wiki only mentions the function; the options come from the code.

## DX scanner

It has existed since v2.10 and lives in FM DX Options. It looks for DX on empty frequencies, scanning the band or going through the memory channels.

- **Start DX scanning:** starts the scan. Outside the menu, press MODE until MEM appears, then BAND. While scanning, MEM blinks.
- **Start and Stop memory channel:** first and last memory channel of the range. Only FM and OIRT channels are included.
- **Wait time:** how long the radio stays on each frequency before moving on, starting at 0.5 s.
- **Memory channels:** with Only, it goes only through the channels of the range. With Exclude, it scans the band and skips the frequencies saved in the range. The band scanned is that of the first channel of the range: if it is OIRT, the scan is on OIRT.
- **Auto cancel scan:** Off never stops; Correct PI stops when it decodes a correct PI; Signal stops when it finds a signal, using the threshold from FM settings → Scan sensitivity.
- **Mute audio while scanning:** mutes the audio during the scan.
- **Not in the wiki:** Autologger, which automatically saves to the logbook the stations where the radio decoded a correct PI during the scan; Wait time only on signal; and Clear logbook.

## Logbook

It has existed since v2.20.

- **Log:** on FM, hold the encoder for more than 1 s. With audio feedback on, the radio beeps. If storage runs out, the screen warns you.
- **Read it on a computer:** in a browser, at the radio’s IP address or at http://tef.local, or over the USB cable, with the `L` command, which returns the logbook as CSV. The step-by-step is in [Computer and connectivity](#computador--logbook-memory-channels-and-time).
- **Erase it:** FM DX Options → Clear logbook.

## Full menu

<!-- On the site, this section becomes a pointer to Radio settings. The list stays here because it feeds the settings explorer: the name used by the wiki and the "Not in the wiki" mark come from it. -->

Each option appears with its English menu name, the same one the wiki uses. The values come from the wiki and were checked against the code of v2.20.12. "Not in the wiki" marks options the wiki doesn’t describe. The order of each list, the steps and the factory defaults are in [Radio settings](#ajustes).

### Main settings

| Option | Values | What it does |
| --- | --- | --- |
| Device settings | submenu | Not in the wiki. Model (Base, Portable or Portable touch), encoder direction, optical encoder, inverted colors, ARS panel, analog meter and factory reset. On the DP-666, use Portable touch and calibrate touch. |
| Stop screen wake on tune | On, Off | On keeps the screensaver active while you tune. |
| Auto Power off | Off, 15, 30, 60 or 90 min | Puts the tuner, the screen and the processor on standby after the idle time. |
| Use squelch | On, Off, Auto | On uses the squelch knob, which the DP-666 has (SQL). Auto controls the squelch on its own. |
| FM AGC | 84 to 92 dBµV | Threshold of the automatic gain control on FM. |
| AM AGC | 94 to 102 dBµV | The same, on AM. |
| Select FM Band | FM and OIRT, together or separately, or none | Which FM bands BAND cycles through. |
| Select AM Band | LW, MW and SW, together or separately, or none | Which AM bands BAND cycles through. |
| 5 sec. bandbutton press | power off, screen off, nothing | Action for holding BAND, which in the code triggers at 2.5 s. |
| Dynamic SPI speed | Default, 10 to 60 MHz, Auto | Speed of the link to the screen, adjustable to avoid noise caused by it. The wiki recommends Auto. |

### Audio settings

| Option | Values | What it does |
| --- | --- | --- |
| Set volume | −10 to +10 dB | Default volume. On radios with a volume knob, such as the DP-666, leave it at 0 dB. |
| Audio feedback | Off, On, On + morse | Navigation sounds designed for blind and low-vision users. With On + morse, numbers and letters also play in Morse code. It includes the band edge beep and the logbook beep, which the wiki calls Beep at band edge. |
| Audio output | Stereo, MPX | MPX sends mono audio on the left channel and the full MPX signal on the right, to analyze RDS and stereo. |
| Stereo separation threshold | Off, 30 to 60 dBµV | Below this signal level, the radio reduces stereo separation, which improves reception on the TEF6686. |
| High cut corner frequency | 1500 to 7000 Hz | Frequency above which treble is reduced when the threshold is reached. |
| High cut threshold | Off, 20 to 60 dBµV | Below this signal level, the treble cut kicks in. |
| FM deemphasis | Off, 50, 75 µs | The wiki says 75 µs in the Americas and 50 µs in the rest of the world, but Brazil uses 50 µs (see [Setup for Brazil](brasil.md)). |

### Display settings

| Option | Values | What it does |
| --- | --- | --- |
| Language | list | Menu language, among 23. |
| Display brightness | 1 to 100% | Screen brightness. |
| Audio level meter | On, Off | Turn it off to reduce screen interference with a weak signal. |
| Screensaver | Off, 3, 10, 30 or 60 s | Idle time before the screensaver. |
| Screensaver options | screen off; 1%, 25% or 50% brightness | How the screen looks in the screensaver. |
| Battery options | Off, voltage, percentage | How the battery is shown. |
| Signalmeter unit | dBµV, dBf, dBm | Unit of the signal meter. |
| Show clock | On, Off | Shows the clock when the time is available. |
| Theme | 17 themes | Color theme. The default is Essence, and Whiteout is the only light theme. DEEPELEC's v2.20.8 package has 14: Aurora, Ember and Glacier only exist in the v2.20.12 code. |
| Screen settings | submenu | Not in the wiki. Frequency font, screen rotated 180°, frequency keypad and touch calibration. |

### RDS settings

| Option | Values | What it does |
| --- | --- | --- |
| Show RDS errors | Off, Small, Large | Error limit accepted when decoding RDS. |
| Region | Europe, USA DB, USA, Canada | Adapts RDS to the region. In the US and Canada, it shows the stations’ call signs. In Brazil, use Europe. |
| Show underscore in RDS | On, Off, PS only | Replaces spaces with underscores in PS and RT. |
| RDS filter | On, Off | Turns on a buffered filter in RDS decoding. |
| Show PI errors | On, Off | Shows errors in the PI code when the signal is weak. |
| Use AF | Off, On with REG, On without REG | Automatic switching to the alternative frequency, to keep reception. |
| Auto sort AF | On, Off | Sorts the AF list by frequency. |
| RT buffering, Fast PS and Show long PS | Fast PS: Off, Initial or Always | Not in the wiki. The first two also exist on Megatron. |

### FM settings

| Option | Values | What it does |
| --- | --- | --- |
| Converter offset | 0 to 2400 MHz | Only for those using an external RF converter. |
| Low and High band edge | 65 to 107.9 MHz; 66 to 108 MHz | Limits of the FM band. |
| Level offset | −25 to +15 dB | Compensates for signal loss or gain before the radio. |
| Low level threshold | −15 to +30 dBµV | Not in the wiki. |
| Softmute FM | On, Off | Lowers the volume when it detects hiss. |
| FM Noise blanker | Off, 50 to 150% | Reduces noise interference. |
| FM default stepsize | 50, 100 or 200 kHz | Not in the wiki. Encoder step on FM. |
| FMSI stereo improvement | On, Off | Only works on the TEF6687 and TEF6689; it does nothing on the DP-666. |
| Scan sensitivity | 1 to 30 | Sensitivity of the automatic search. |

### AM settings

| Option | Values | What it does |
| --- | --- | --- |
| Softmute AM | On, Off | Lowers the volume when it detects hiss. |
| AM Noise blanker | Off, 50 to 150% | Reduces noise interference. |
| AM RF Level offset | −50 to +15 dB | Not in the wiki. |
| Show SW wavelength | On, Off | Not in the wiki. |
| CoChannel Detector and its threshold | Off or 50 to 150%; 1 to 15 | Not in the wiki. |
| AM Antenna gain | Off, 6 to 36 dB | Gain of an active SW antenna, to avoid overload. |
| MW default stepsize | 9, 10 kHz | Medium wave step. In the Americas, 10 kHz. |
| Scan sensitivity | 1 to 30 | Sensitivity of the automatic search. |

### Connectivity & clock

| Option | Values | What it does |
| --- | --- | --- |
| USB mode | XDRGTK, RDS Spy | USB port mode, already set to each program’s speed. |
| Wi-Fi | On, Off | Turns Wi-Fi on. |
| Configure Wi-Fi | wizard | Connects the radio to a network. It only works with 2.4 GHz networks. |
| Stationlist client IP and ID | 1 to 254; 1 to 10 | Not in the wiki. According to the code, the last number of the IP address of the computer with StationList and this radio’s number. |
| Mute screen on XDRGTK connection | On, Off | Not in the wiki. |
| Set NTP time offset | time zone relative to GMT | Time zone applied to the time coming from the internet. |
| Auto DST on NTP time | On, Off | Automatic daylight saving time. The wiki treats the time zone and daylight saving as a single item. |
| Clock mode | 12 h, 24 h | Not in the wiki. |
| PI locked CT sync | On, Off | Ties setting the time from RDS (CT) to the received PI code, for more accuracy. |

### FM DX Options, Auto memory and About software

- **FM DX Options:** see [DX scanner](#oficial--dx-scanner) and [Logbook](#oficial--logbook), above.
- **Auto memory:** see [Memory channels](#oficial--memory-channels), above.
- **About software:** credits for the developers and contributors.

## Homemade builds

It doesn’t apply to the DP-666, but it is in the wiki for those who build their own receiver:

- **Analog meter:** from IO27, a 1 kΩ resistor and a 5 kΩ trimpot in series to the meter. To calibrate, power on the radio holding BAND.
- **TEF668x crystal:** the voltage on IO15, set by a resistor divider, tells the firmware which crystal the board uses: 0 V for 9.216 MHz, 1 V for 12 MHz, 2 V for 55.466 MHz and between 2 V and 3.3 V for 4 MHz.

## Sources

- [TEF6686_ESP32 wiki — home page](https://github.com/PE5PVB/TEF6686_ESP32/wiki)
- [Wiki — Menu options explained](https://github.com/PE5PVB/TEF6686_ESP32/wiki/Menu-options-explained)
- [Wiki — How to use the FM DX scanner](https://github.com/PE5PVB/TEF6686_ESP32/wiki/How-to-use-the-FM-DX-scanner)
- [Wiki — How to use memory channels](https://github.com/PE5PVB/TEF6686_ESP32/wiki/How-to-use-memory-channels)
- [Wiki — How to use the logbook](https://github.com/PE5PVB/TEF6686_ESP32/wiki/How-to-use-the-logbook)
- [Wiki — Using the software](https://github.com/PE5PVB/TEF6686_ESP32/wiki/Using-the-software)
- [PE5PVB — TEF6686_ESP32.ino: buttons, combinations and factory defaults](https://github.com/PE5PVB/TEF6686_ESP32/blob/main/TEF6686_ESP32.ino)
- [PE5PVB — gui.cpp: menu structure](https://github.com/PE5PVB/TEF6686_ESP32/blob/main/src/gui.cpp)
- [PE5PVB — language.h: menu names in every language](https://github.com/PE5PVB/TEF6686_ESP32/blob/main/src/language.h)
- [PE5PVB — audiocues.h: audio feedback and Morse](https://github.com/PE5PVB/TEF6686_ESP32/blob/main/src/audiocues.h)
