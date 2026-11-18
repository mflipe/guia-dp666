# Hardware

The DP-666 pairs an NXP TEF6686 tuner, which does all the radio work, with an ESP32 module, which handles the screen, the buttons and the connections. This page shows how the parts connect and gives the datasheet of each one. The reference is schematic V2.5.4, published by DEEPELEC.

## Architecture

<!--DIAGRAM:arquitetura-->

The tuner, the keypad and the clock share the ESP32’s I²C bus, each at its own address. The screen and touch use SPI. The USB-C port charges the battery and, through the CH340N, is used to flash firmware and to talk to programs on a computer.

## Components and datasheets

The codes U2, U3 and so on are the references of schematic V2.5.4. When the manufacturer doesn’t publish the document, the link points to a mirror and the link name says so.

<!--COMPONENTS-->

The schematic also shows general-purpose transistors, such as the SI2305 (P-channel MOSFET) and the SS8050 (NPN), which switch the power. They are generic parts, from several manufacturers.

## Performance and bands

| Parameter | Value |
| --- | --- |
| FM sensitivity | ≤0.5 µV (S/N 30 dB) |
| SW, MW and LW sensitivity | ≤10 µV (S/N 20 dB) |
| Selectivity | ≥60 dB |
| FM | 65 to 108 MHz, configurable edges |
| OIRT | 30 kHz step |
| SW | 1700 to 27000 kHz, 5 kHz step |
| MW | 522 to 1791 kHz (9 kHz) or 520 to 1720 kHz (10 kHz) |
| LW | 144 to 513 kHz, 9 kHz step |
| AIR | only with an external converter |
| Battery | 3.7 V, 5000 mAh (18.5 Wh), about 350 mA and 15 h of use |
| Dimensions | 142×30×80 mm, 300 g |

## Pins and addresses in the official code

| Function | Connection |
| --- | --- |
| Encoder | GPIO 34, 36 and 39 |
| BAND, BW and MODE | GPIO 4, 25 and 26 |
| Squelch potentiometer | GPIO 35 |
| Battery reading | GPIO 13 |
| Screen (SPI): CS, DC and RST | GPIO 5, 17 and 16 |
| Touch (SPI): CS | GPIO 32 |
| Touch interrupt | GPIO 33 |
| Keypad interrupt | GPIO 14 |
| Tuner | I²C 0x64 (0x65 on some modules) |
| Keypad (XL9555) | I²C 0x20 |
| Clock (RTC) | I²C 0x32 |

GPIO 13 uses the ESP32’s ADC2 converter, which doesn’t work while Wi-Fi is on. That is why the battery reading disappears when Wi-Fi is active, on both firmwares.

## Board revisions

- **Original:** DEEPELEC says the original units use board V2.5.3. The schematic published on its site is V2.5.4.
- **Clones:** board V2.5 shows up in clones such as SPARKELEC’s, without an RTC. What is different about them is in [Clones](#ajuda--clones), under Common problems.
- **Internal clock:** only units shipped from April 1, 2025 have an RTC. DEEPELEC doesn’t offer the upgrade for earlier units and says that anyone who wants to can try fitting the chip themselves. Its announcement calls the chip RX8010SJ; schematic V2.5.4 marks RS4C8010BW, with a note that it is compatible with the RX8010SJ.

## Antenna

The specifications only mention the external antenna on the SMA connector, linked to the board by an IPEX cable. There is no internal ferrite antenna, so AM depends on an external wire or loop.

## RTC test

To find out whether your unit has an internal clock: set the time, turn the main switch off for 1 minute and turn it back on with Wi-Fi off. If the time is still right, there is an RTC.

According to DEEPELEC, setting the clock’s date and time requires the Megatron Mod17 of April 5, 2025 (package TEF6686_ESP32_2.0.15mod17-20250405).

## Reference images

Third-party photos are copyrighted, so the guide doesn’t copy them: each item below opens the image or the page on the original site.

<!--REFS:hardware-->

## Sources

- [DEEPELEC — schematic V2.5.4](https://www.deepelec.com/files/dp-666/Schematic_DP-666_V2.5.4.pdf)
- [DEEPELEC DP-666](https://www.deepelec.com/en/dp-666/)
- [DEEPELEC — RTC on the DP-666](https://www.deepelec.com/en/2025/04/09/dp-666-add-rtc/)
- [TEF6686_ESP32 wiki — screen setup, with the pins](https://github.com/PE5PVB/TEF6686_ESP32/wiki/Installing-the-software)
- [DEEPELEC — clones](https://www.deepelec.com/2025/10/10/stay_away_from_cloned_products)
- [DP-666 Megatron Mod17 manual](https://www.deepelec.com/files/dp-666/DP-666_UM_EN_Megatron_Mod17.pdf)
- [Radiomuseum — DEEPELEC DP-666](https://radiomuseum.org/r/unknownprc_deepelec_dp_666.html)
- [PE5PVB/TEF6686_ESP32](https://github.com/PE5PVB/TEF6686_ESP32)
- [flyoob/TEF6686_ESP32 (the DP-666 project)](https://github.com/flyoob/TEF6686_ESP32)
