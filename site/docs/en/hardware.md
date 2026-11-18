# Hardware

The DP-666 pairs an NXP TEF6686 tuner, which does all the radio work, with an ESP32 module, which handles the screen, the buttons and the connections. This page shows how the parts connect, how power and sound flow, and gives the datasheet of each part. It is based on DEEPELEC’s schematics: V2.5.3, the board of the original units ([copy on device.report](https://device.report/m/c8b05dfa698c6509bcbf880e0996877211eb1dd541aa5d5131874db1b65809c9)), and V2.5.4, [published on its site](https://www.deepelec.com/files/dp-666/Schematic_DP-666_V2.5.4.pdf).

## Architecture

<!--DIAGRAM:arquitetura-->

The tuner, the keypad and the clock share the ESP32’s I²C bus, each at its own address. The screen and touch use SPI. The USB-C port charges the battery and, through the CH340N, is used to flash firmware and to talk to programs on a computer.

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

## Inside the radio

[Guido Schotmans’s teardown photos](https://wijnants.info/fmdx/august-4-2025-deepelec-dp-666-novice-hurdles-part-2/), published on the wijnants.info FMDX blog, show how the radio is built; their board is the Mini6686-V2.5.3. The links to each photo are under [Reference images](#hardware--reference-images).

- **Case:** six panels made of black circuit board, with the labels printed on them: front, back, top, bottom and the two sides. Black screws and brass standoffs hold them together.
- **Back:** this panel carries the battery and the speaker, which sits in a closed box. Both reach the board through 2-pin connectors (J1 and J5).
- **Main board:** one side holds the ESP32 module and the tuner, under a metal shield; the other holds the screen and the front buttons. The encoder and the volume control come out through the right side, held by nuts, and the knobs just push onto the shafts.
- **Antennas:** the SMA, on top, reaches the board through a short coaxial cable. The ESP32 is the WROOM-32U version, which has no antenna of its own: Wi-Fi and Bluetooth use an antenna linked to the module by another short cable.
- **Battery:** a lithium-polymer cell coded 105565 (about 10 × 55 × 65 mm), 3.7 V and 5000 mAh, with a 2-pin PH-type plug. When replacing it, check the polarity before plugging it in: batteries with the same plug can come with the wires swapped.

Don’t open the radio while it is under warranty: contact the seller or DEEPELEC. Opening it takes a 0.7 mm hex key for the screws. Unplug and plug the short cables carefully, because their connector (U.FL) is rated for about 30 matings.

## Power

<!--DIAGRAM:energia-->

The battery is always connected to three parts: the charger, the clock (when fitted) and U1, the POWER button controller. The rest of the board gets power through a transistor (Q1, SI2305), which only conducts when two conditions are met:

- **Main switch at ON:** it is not in the current path. At OFF, it turns the transistor off, and POWER has no effect.
- **POWER on:** each press toggles U1. The button doesn’t go through the ESP32, so it works the same on any firmware, even with the radio frozen.

After the transistor, three 3.3 V regulators split the load: U5 powers the processor, U32 the screen and U6 the tuner, which also separates its analog and digital parts with filters. The speaker amplifier runs straight from the battery voltage.

- **Charging:** the TP4056 (U20) charges the battery at about 0.9 A, a value set by resistor R104, 1.3 kΩ. That is why a 1 A charger is enough, and a full charge takes more than 5 hours. Since the charger sits before the transistor, the battery charges with the switch at OFF.
- **USB-C:** the port has the 5.1 kΩ resistors that USB-C chargers require, so a USB-C to USB-C cable also works. The USB-serial bridge (CH340N) is powered by the cable, not by the battery.
- **Temperature:** the TP4056’s temperature sensing isn’t used, so charging doesn’t stop if the battery heats up. Charge it away from the sun and from heat sources.
- **Charge LED:** a dual LED behind a light guide. According to schematic V2.5.3, it is red while charging and blue when done.
- **Battery reading:** two 100 kΩ resistors deliver half the voltage to GPIO 13.

## Sound path

<!--DIAGRAM:audio-->

Audio leaves the TEF6686 already in analog form, from its internal converter, and the ESP32 has no access to the sound. That is why Wi-Fi and Bluetooth don’t carry audio.

- **Volume:** VOLUME is a 10 kΩ dual potentiometer between the tuner and the amplifiers, and it applies to both headphones and speaker. Leave the firmware volume at 0 dB and adjust with it.
- **Headphones:** the MAX97220 (U4), powered at 3.3 V, delivers stereo sound to the 3.5 mm jack.
- **Speaker:** the TPA6211A1 (U2) mixes the left and right channels, so the speaker plays in mono. It is powered straight from the battery.
- **Output switching:** the headphone jack itself does it, without the firmware. With no plug, an internal contact between pins 6 and 2 of the PJ-3270 keeps the speaker on. With a plug, the contact opens: the headphone amplifier turns on and a transistor (QA3) turns the speaker amplifier off.

This explains the [speaker that stays silent after using headphones](#ajuda--audio-speaker-silent-after-using-headphones): if the contact between pins 6 and 2 doesn’t close again, the circuit acts as if a plug were still in. That is why DEEPELEC says to clean exactly those two pins.

## Antenna

The specifications only mention the external antenna on the SMA connector. There is no internal ferrite antenna, so AM depends on an external wire or loop.

On the board, the SMA’s short cable reaches a U.FL connector (J7). Right at the input, a diode (D4) protects the tuner from electrostatic discharge, and the signal splits into an FM input and an AM input. If the signal suddenly disappears, this cable may have come loose.

## Pins and addresses

Checked against schematic V2.5.3 and the official code.

| Function | Connection |
| --- | --- |
| Encoder | A on GPIO 34, B on 36 and the push on 39 |
| BAND, BW and MODE | GPIO 4, 25 and 26 (the schematic calls 4 STB) |
| Squelch potentiometer | GPIO 35 |
| Battery reading | GPIO 13 |
| I²C | SDA on GPIO 21 and SCL on 22 |
| Screen and touch SPI | MOSI on GPIO 23, MISO on 19 and clock on 18 |
| Screen: CS, DC and RST | GPIO 5, 17 and 16 |
| Screen backlight, PWM | GPIO 2 |
| Touch: CS and interrupt | GPIO 32 and 33 |
| Keypad interrupt | GPIO 14 |
| Tuner crystal | GPIO 15 |
| BOOT | GPIO 0 |
| CH340N serial | UART0 (TX0 and RX0) |
| Tuner | I²C 0x64 (0x65 on some modules) |
| Keypad (XL9555) | I²C 0x20 |
| Clock (RTC) | I²C 0x32 |

- **Battery and Wi-Fi:** GPIO 13 uses the ESP32’s ADC2 converter, which doesn’t work while Wi-Fi is on. That is why the battery reading disappears when Wi-Fi is active, on both firmwares.
- **Crystal:** the code reads the voltage on GPIO 15 to learn the tuner’s crystal. On V2.5.3, a resistor to ground holds the pin at 0 V, which means 9.216 MHz. On V2.5.4, a second resistor brings the pin to about 1.1 V, which means 12 MHz.
- **Flashing:** the CH340N can’t reset the ESP32 by itself, because its RTS# pin is left unconnected. That is why [flash mode](#backup) needs BOOT pressed by hand.
- **POWER:** it isn’t in the table because it doesn’t reach the ESP32. It acts directly on the power supply.
- **Analog S-meter:** the official code sends the signal level as PWM on GPIO 27, for a needle meter. On the DP-666, this output (METER-DRV in the schematic) goes to no connector. GPIO 12 is unconnected.

## Components and datasheets

The codes U2, U3 and so on are the schematic references, the same in V2.5.3 and V2.5.4. When the manufacturer doesn’t publish the document, the link points to a mirror and the link name says so.

<!--COMPONENTS-->

The schematic also uses generic transistors, from several manufacturers: the SI2305 (Q1, P-channel MOSFET), which powers the board; the SS8050 (Q3, NPN), which drives the screen backlight; and the WNM2030 (QA3, N-channel MOSFET), which shuts down the speaker amplifier when headphones go in.

## Board revisions

The notes for each version come from the schematics themselves: V2.5.3 carries those from v2.5.1 to v2.5.3, and V2.5.4 repeats them and adds its own.

- **Original:** DEEPELEC says the original units use board V2.5.3, printed Mini6686-V2.5.3.
- **v2.5.1:** the speaker’s input capacitors (C51 and C9) went from 0.1 to 0.33 µF. As a result, the frequency below which bass is cut drops to about a third.
- **v2.5.2:** C15, 1 µF, was added to the ESP32’s EN pin. It is the capacitor Espressif recommends to delay the reset at power-up.
- **v2.5.3:** the clock (RTC, U11) was added.
- **v2.5.4:** this is the schematic version DEEPELEC publishes; the radio’s page doesn’t say from when units ship with it. The clock became the RS4C8010BW, compatible with the RX8010SJ. R33, between the main switch and the transistor that powers the board, went from 1 kΩ to 100 kΩ, which makes that transistor switch on and off more slowly. And the tuner moved to a 12 MHz crystal, instead of the 9.216 MHz one; the new R49, 20 kΩ, tells the firmware through GPIO 15. Both the official code and the DP-666 project’s code read this pin, so they adapt to either board on their own.
- **Clones:** board V2.5 shows up in clones such as SPARKELEC’s, without an RTC. What is different about them is in [Clones](#ajuda--clones), under Common problems.
- **Internal clock:** only units shipped from April 1, 2025 have an RTC. Since schematic V2.5.3 already includes it, earlier V2.5.3 boards likely have an empty spot for it, which fits DEEPELEC’s suggestion that owners fit the chip themselves; it doesn’t offer this upgrade. Schematic V2.5.3 and the announcement call the chip RX8010SJ.

## RTC test

To find out whether your unit has an internal clock: set the time, turn the main switch off for 1 minute and turn it back on with Wi-Fi off. If the time is still right, there is an RTC.

The RTC is powered straight from the battery, before the main switch, and has no battery of its own. So it keeps the time with the switch at OFF, but loses it if the battery is disconnected or fully drained.

According to DEEPELEC, on Megatron, setting the clock’s date and time requires the Mod17 of April 5, 2025 (package TEF6686_ESP32_2.0.15mod17-20250405). On the official firmware, support came with package v2.20.8.

## Reference images

Third-party photos are copyrighted, so the guide doesn’t copy them: each item below opens the image or the page on the original site.

<!--REFS:hardware-->

## Sources

- [DEEPELEC — schematic V2.5.3 (copy on device.report)](https://device.report/m/c8b05dfa698c6509bcbf880e0996877211eb1dd541aa5d5131874db1b65809c9)
- [DEEPELEC — schematic V2.5.4](https://www.deepelec.com/files/dp-666/Schematic_DP-666_V2.5.4.pdf)
- [Guido Schotmans — the DP-666 taken apart and the encoder error (wijnants.info, August 4, 2025)](https://wijnants.info/fmdx/august-4-2025-deepelec-dp-666-novice-hurdles-part-2/)
- [DEEPELEC DP-666](https://www.deepelec.com/en/dp-666/)
- [DEEPELEC — RTC on the DP-666](https://www.deepelec.com/en/2025/04/09/dp-666-add-rtc/)
- [PE5PVB — TEF6686_ESP32.ino, with the pins used](https://github.com/PE5PVB/TEF6686_ESP32/blob/main/TEF6686_ESP32.ino)
- [PE5PVB — TEF668X.cpp, with the crystal reading on GPIO 15](https://github.com/PE5PVB/TEF6686_ESP32/blob/main/src/TEF668X.cpp)
- [TEF6686_ESP32 wiki — screen setup, with the pins](https://github.com/PE5PVB/TEF6686_ESP32/wiki/Installing-the-software)
- [Espressif — ESP32 schematic checklist (CHIP_PU delay)](https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32/schematic-checklist.html)
- [Hirose U.FL — 30 mating cycles (DigiKey)](https://www.digikey.co.nz/en/ptm/h/hirose-electric/u_fl-and-w_fl-series-connectors/tutorial?slide=8)
- [DEEPELEC — clones](https://www.deepelec.com/2025/10/10/stay_away_from_cloned_products)
- [DP-666 Megatron Mod17 manual](https://www.deepelec.com/files/dp-666/DP-666_UM_EN_Megatron_Mod17.pdf)
- [Radiomuseum — DEEPELEC DP-666](https://radiomuseum.org/r/unknownprc_deepelec_dp_666.html)
- [PE5PVB/TEF6686_ESP32](https://github.com/PE5PVB/TEF6686_ESP32)
- [flyoob/TEF6686_ESP32 (the DP-666 project)](https://github.com/flyoob/TEF6686_ESP32)
