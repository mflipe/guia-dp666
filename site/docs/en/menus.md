# Menus explained

What each group of options does on Megatron Mod17, focusing on what the manual doesn’t explain. The manual marks advanced mode items in red; to see them all, turn on advanced mode (see [Setup for Brazil](brasil.md)). The official firmware’s menu is in [Using the official firmware](oficial.md). Every possible value of each option is in [Radio settings](#ajustes).

## Main settings

- **Model selector:** Base, Portable or Portable touch. On the DP-666, use Portable touch. Some features only work in this mode, and the firmware warns you.
- **Set AM band:** lets you take the AIR band out of the BAND rotation.
- **Screensaver:** Off, 3, 10, 30 or 60 s, with the screen off or at 1%, 25% or 50% brightness.
- **Set first page:** main screen, menu, keypad, shortcuts, advanced RDS or AF. The firmware also has Main page + Keypad.
- **Power Off timer:** automatic shutdown from 1 to 480 min.
- **Dynamic SPI speed:** from 5 to 70 MHz or Auto. Use Auto if you hear whistles caused by the screen.
- **Auto still screen and Still screen timer:** automatic still screen after 0 to 120 s.

## Audio settings

- **Set volume:** internal gain of the TEF, from −60 to +24 dB, default 0. Keep it at 0 to avoid distortion.
- **Stereo threshold:** Off or from 30 to 60 dBµV. Below the threshold, the radio forces mono.
- **High cut:** cuts treble between 1500 and 7000 Hz below a threshold of 20 to 60 dBµV.
- **Beep at operation (firmware):** a beep on every operation, besides Beep at band edge.

## Display settings

- 15 themes and 6 frequency fonts.
- **Meter interval:** from 30 to 1000 ms. Slower means less screen noise.
- **Firmware extras:** meter style; frequency name, data and tips, with colors; clock color; notifications; startup logo with a frame; Power saving mode.

## RDS settings

- **Region:** Europe for Brazil; USA uses the American PTY table (RBDS).
- **RDS filter On:** uses blocks already filtered by the TEF. Off delivers raw data, with more errors (base code).
- **Fast PS:** shows the station name faster, at the risk of garbage on the screen.
- **RT buffering:** shows the full RadioText, instead of letter by letter.
- **Use AF:** switches to the alternative frequency of the same program when the signal drops. Turn it off for DX and scanning.
- **Show RDS clock:** only displays the time. RDS time sync is a separate option.
- **Advanced RDS view (base code):** shows PI, ECC, LIC, PIN, DI flags, AF, EON, RT+, ODA applications and errors per block.

## FM settings

- **Band:** from 76 to 108 MHz, it also covers extended FM.
- **Set level offset:** −25 to +15 dB. **Set low level threshold:** −15 to 30 dBµV. In the base code, below it the radio grays out RDS and the modulation meter.
- **FM AGC:** 92, 90, 87 or 84 dBµV. At 92 it is the most sensitive.
- **FMSI:** only works on the TEF6687 and TEF6689 chips.
- **Set FML band:** 65 to 74 MHz (OIRT) or 76 to 87 MHz. It doesn’t matter while Set FM band is set to FM.

## AM settings

- **AM RF Level offset:** −50 to +15 dB.
- **CoChannel:** 100% and 3 are the base code’s defaults.
- **AM ATT:** Off or from 6 to 36 dB. **AM AGC:** 94 to 102 dBµV.
- **MW default stepsize:** 10 kHz in the Americas.
- **AIR:** requires an external converter.

## Connectivity

- USB mode XDRGTK or RDS Spy; Wi-Fi active; Configure Wi-Fi; Stationlist IP and ID (1 to 10); screen off on XDRGTK; automatic Wi-Fi disconnect (1 to 1440 min); Bluetooth.
- **Firmware extras:** Wi-Fi by keypad or browser; up to 3 networks; XDRGTK password of up to 8 characters; Set NTP server; After time sync in Wi-Fi auto disconnect; Config slave host, over Bluetooth, undocumented.

## Operation settings

- **Touch:** type Int33, Int27, Off or Polling; calibration; 300 ms interval.
- **Knob:** Classic or New mode, squelch adjustment with the knob, turning with the screen off, reversing the direction and acceleration (Off, Medium or Fast).
- **Long press on knob, BW, MODE or BAND:** original action, menu, keypad, shortcuts, advanced RDS, AF or lock. The firmware also has Frequency list and Band keypad.

## Other settings

- Date, time, time zone, NTP time sync and RDS time sync.
- **Delete RDS dictionary:** "Deleted" and "Not deleted" are just states. They don’t indicate that anything was erased.
- **System information:** version, build date, memory, file space, tuner, NTP server, IP and MAC.
- **Firmware extras:** Power on timer, clock correction in seconds per 24 h, low battery protection, Developer mode, Manage my data and resets for schemes, plans and bands.

## My settings

- Search (ATS) and scan schemes.
- Up to 4 favorite themes with automatic switching, sequential or random.
- **Receive plan:** turns the radio on and off on a schedule, on a set band and frequency.
- **My Shortcut icon:** 7 configurable shortcuts, among them stereo, auto BW, iMS, EQ, RDS, AF, screen, squelch on the knob, clock, sync time, theme, plan and still screen.
- **Save my settings:** a personal "factory default". It lives in the file storage and is lost when the firmware is reflashed.

## Sources

- [DP-666 Megatron Mod17 manual](https://www.deepelec.com/files/dp-666/DP-666_UM_EN_Megatron_Mod17.pdf)
- [Mod17 manual in Chinese](https://www.deepelec.com/files/dp-666/DP-666_UM_CN_Megatron_Mod17.pdf)
- [PE5PVB/TEF6686_ESP32](https://github.com/PE5PVB/TEF6686_ESP32)
