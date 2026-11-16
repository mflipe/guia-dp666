# Firmware: Megatron vs. official

The DP-666 accepts two firmware lines. Switching from one to the other is not an update: menus and features change and the settings are reset.

## The two lines

- **Megatron:** third-party firmware, closed source, focused on touch. According to DEEPELEC, it supports the physical keypad, reduces screen interference, improves MW and SW and only has Chinese and English. Published versions: mod15 (Oct 22 and Nov 3, 2024), mod16 (Feb 18, 2025) and mod17 (Apr 5, 2025, with RTC support). Judging by its internal strings, it was built on PE5PVB’s code from the v2.00 era, from December 2023.
- **Official firmware (PE5PVB):** open source (GPLv3), with 23 languages, Portuguese and English among them. DEEPELEC’s packages range from v2.11.3 (August 2024) to v2.20.8 (February 2026, with RTC). On GitHub, the code is at v2.20.12, from Nov 13, 2026.

## Megatron Mod17

### Pros

- **Points highlighted by DEEPELEC:** physical keypad support, less screen interference and better MW and SW listening.
- **Features the official firmware doesn’t have:** auto search schemes, reception plans with times to turn on and off, time-based memory channels (TTM), names per frequency, notifications, automatic theme switching and still screen. See [Hidden features of Mod17](mod17.md).

### Cons

- **Closed source and no updates:** the newest published version is mod17, from Apr 5, 2025. On Oct 9, 2026, a DP-666 owner asked on GitHub where to find a newer Megatron and got no answer.
- **Languages:** only Chinese and English.
- **No recovery for a stuck tuner:** the official firmware got that fix on Nov 13, 2026 (see "Tuner: !None!" in [Common problems](problemas.md)).
- **Uncertain integrations:** fm-dx-webserver compatibility arrived in the official firmware in v2.10, after Megatron’s base. Mod17 has some of those commands, but use with XDR-GTK and fm-dx-webserver has not been confirmed.

## Official firmware (v2.20.x)

### Pros

- **Open source and active development,** with menus in 23 languages.
- **DP-666 support:** the firmware detects the keypad on its own at power-on, package v2.20.8 brought the RTC and several keypad fixes arrived in November 2026.
- **Features Megatron doesn’t have:** a station log (logbook), saving memory channels from a PC and declared support for XDR-GTK and fm-dx-webserver.
- **Recovery for a stuck tuner:** in the code since Nov 13, 2026.

### Cons

- **You lose Megatron’s exclusive features.**
- **A different interface:** screens, menus and touch areas change, and touch has to be calibrated again.
- **Nothing carries over:** settings and memory channels don’t move from one firmware to the other. If Mod17 answers the `s` command over USB, you can export the list of memory channels first.
- **Ready-made package only up to v2.20.8,** from Feb 21, 2026. Later fixes only arrive by compiling the code (Arduino IDE or PlatformIO) or with a new package.
- **Battery with Wi-Fi:** the reading disappears with Wi-Fi on in both firmwares, because it is a hardware limitation.

!!! note "Compiling for the DP-666"
    In the official code, the DP-666 defaults (Portable touch model, rotated screen, encoder direction and colors) only come if the build defines the `DEEPELEC_DP_66X` option. Without it, those items have to be set by hand after flashing. The step-by-step is in [Backup and flashing](backup.md), and everyday use in [Using the official firmware](oficial.md).

## How to test without risk

1. Charge the battery and make a [full flash backup](backup.md).
2. Export the memory channels with the `s` command over USB or take a photo of the list.
3. Flash the official firmware package from DEEPELEC’s site: main switch ON, hold BOOT, press POWER and run `flash.bat`.
4. Check that the model is set to Portable touch (Device settings), calibrate touch (power on holding BW + MODE) and set up Wi-Fi again.
5. To go back, flash the backup. The radio returns exactly as it was, with the previous firmware, settings and memory channels.

## Firmware screens

The screenshots published by DEEPELEC are copyrighted, and the license of the images on PE5PVB’s wiki isn’t explicit. So the guide doesn’t copy them: each item below opens the image on the original site. There are no published screenshots of v2.20.12.

<!--REFS:telas-->

## Sources

- [DEEPELEC DP-666 — firmware and screenshots](https://www.deepelec.com/en/dp-666/)
- [PE5PVB/TEF6686_ESP32](https://github.com/PE5PVB/TEF6686_ESP32)
- [TEF6686_ESP32 wiki](https://github.com/PE5PVB/TEF6686_ESP32/wiki)
- [PE5PVB — discussion #885](https://github.com/PE5PVB/TEF6686_ESP32/discussions/885)
- [PE5PVB — sturdier DP-666 keypad (Nov 11, 2026)](https://github.com/PE5PVB/TEF6686_ESP32/commit/9fadf460892f28f15f4c542a1d6129735b5f1d0d)
- [PE5PVB — tuner detection fix (Nov 13, 2026)](https://github.com/PE5PVB/TEF6686_ESP32/commit/6d90a22cefae3f7c9a248cad9f77dc0592b3555d)
- [PE5PVB v2.10 — fm-dx-webserver compatibility](https://newreleases.io/project/github/PE5PVB/TEF6686_ESP32/release/v2.10)
