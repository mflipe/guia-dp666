# Common problems

Problems acknowledged by DEEPELEC, reported by the community or anticipated in the firmware code. Pick what is happening and follow the steps, from the simplest to the most involved. Before any repair or reflash, make a [full backup](backup.md).

## Screen stuck on "Tuner: !None!"

The startup screen shows the logo and the firmware version and, in red, "Tuner: !None!". Sometimes the radio restarts on its own, in the middle of use, and stops on this screen.

<!--DIAGRAM:boot-->

- **What it means:** the processor loaded the firmware, but couldn’t talk to the TEF6686 tuner. Without it, the radio receives nothing, and the firmware stops on this screen on purpose.
- **Startup markers (base code):** the first one (yellow) shows that the tuner startup was attempted; the second (red), that it didn’t respond; the third would be Wi-Fi.
- **Likely cause:** a power drop or fluctuation while the firmware loads the chip leaves the tuner stuck. A low battery without warning, with Wi-Fi on for hours, is a typical scenario, because Wi-Fi prevents the battery reading and causes current spikes.
- **The official firmware’s fix:** since Nov 13, 2026, the official code forces the chip to restart in this case. Mod17 doesn’t have this fix.
- **Don’t do a factory reset (BW + TUNING):** the problem isn’t in the settings, and the settings would be lost.

Steps, in order:

1. Turn it off with POWER, unplug the USB cable, set the main switch to OFF and wait 1 to 2 minutes. Set the switch back to ON and turn it on without pressing anything during startup. Turning it off only with POWER may not cut the chip’s power.
2. If it happens again, charge the radio while off for about 1 hour and repeat step 1.
3. If it continues after 2 or 3 tries, the fault is probably in the hardware (soldering, power or the tuner’s crystal). Contact the seller or DEEPELEC and don’t open the radio while under warranty.

To prevent it, set Wi-Fi auto disconnect to After time sync or leave Wi-Fi off when you are not using it.

## Startup and firmware

- **The update won’t flash over USB:** enter flashing mode by holding BOOT while powering on and install the CH340 driver on Windows. There is an unconfirmed report that the USB port of early units can’t be used for updates.
- **Settings disappeared after an update:** that is expected. Updates reset the settings, require a new touch calibration and, in some versions, a new Wi-Fi setup.
- **Radio in Chinese or without the advanced options:** change the language in 显示设置 → 语言 → English. For advanced mode, with the language set to Chinese, turn on 高级模式 in 主要设置 → 系统使用模式 and switch back to English.

## Audio

- **Speaker silent after using headphones:** in some batches, the internal contact of the headphone jack (PJ-3270) that reconnects the speaker fails. DEEPELEC suggests opening the radio and cleaning contacts PIN6 and PIN2. Under warranty, prefer contacting support. If the headphones work and the speaker doesn’t, this is the likely cause.
- **No sound even with a signal:** check the squelch (Use squelch at Off to test), mute (the icon on the screen or key 0), VOLUME and Set volume at 0 dB.
- **High-pitched hiss instead of audio:** Audio output is set to MPX, which delivers the raw multiplex signal. Switch back to Stereo.

## Squelch

- **Unstable or not responding on the SQL knob:** the potentiometer may have a bad contact. Use the tuning knob: Audio settings → Use squelch at On; Operation settings → Rotary adjust squelch at On; tap SQ on the screen and turn until the hiss goes away.

## Reception

- **Sudden loss of signal and audio:** the internal antenna cable may have come loose from the SMA connector. The fix is to replace the IPEX1-SMA adapter or resolder the center wire.
- **Weak AM or only hiss on MW and LW:** the DP-666 has no internal antenna for these bands. Use an external wire or a loop on the SMA and test at night, away from electronics and chargers.
- **Whistles or noise on some FM frequencies:** interference from the screen. Use Dynamic SPI speed on Auto, still screen, screen off during searches and lower brightness. The official firmware once fixed SPI at 27 MHz to reduce this noise. On it, turning off the Audio level meter also helps with weak signals, and if you compile it yourself you can lower `SPI_FREQUENCY` if the noise shows up around 90 MHz.
- **Ghost stations near strong stations:** lower FM AGC to 87 or 84 dBµV. On AM, use AM ATT.
- **The radio jumps to another frequency on its own:** that is AF. Turn Use AF off for DX and scanning.
- **PS or RT with wrong characters:** set Fast PS to Initial or Off and RDS filter to On.

## Screen and touch

- **Touch misaligned or failing:** redo the calibration in Operation settings → Touch calibration, which is required after installing the touch firmware. If it continues, try another Touch Type (Int33, Int27 or Polling).
- **Screen upside down or with inverted colors:** powering on while holding MODE rotates the screen; Invert screen color inverts the colors.
- **On the official firmware:** calibrate touch by powering on the radio with BW + MODE or in Screen settings. Powering on with BW + BAND inverts the colors, and MODE + encoder changes the panel type when the menu becomes unreadable (see [Using the official firmware](oficial.md)).

## Clock, Wi-Fi and battery

- **Time 8 hours ahead:** it is the default Chinese time zone. Change Set local time zone to your time zone (Brasília: GMT−03:00) and, with NTP working, leave RDS time sync at Off.
- **The battery indicator disappears:** a limitation of the ESP32 with Wi-Fi on. Set Wi-Fi auto disconnect to After time sync.
- **The time is lost with the main switch off:** it means the unit has no RTC. Sleep clock correction partly makes up for it.
- **Charging:** a 5 V charger of 1 A or more, 5 W at most, without fast charging, preferably with the radio off. Red LED while charging, green when charged.

## Settings and memory channels

- **Settings don’t stay saved:** leave the menu with MODE ("PRESS MODE TO EXIT AND STORE") and, if Save/Discard appears, choose Save.
- **Memory channels erased all at once:** Delete stations empties the whole band and Auto search in Overwrite overwrites it. Only restoring a backup gets them back.
- **Factory reset on the official firmware:** powering on the radio with BW + encoder restores the settings and also empties the 99 memory channels and the logbook.
- **The radio turns off on its own:** check Power Off timer, Low battery protect, an active receive plan or BAND held for 3 s with the Power off action.
- **The radio turns on on its own:** check Power on timer and Using receive plan. mod14 fixed an automatic power-on that happened with no plan set up.

## Connecting to a computer

- **The computer doesn’t see the radio:** it is almost always the cable, which only charges. Swap it for a cable that carries data, try another USB port and check the CH340 driver in Device Manager. The step-by-step is in [Computer and connectivity](computador.md).
- **The program connects, but nothing arrives:** the USB port mode doesn’t match the program (XDRGTK for XDR-GTK and FM-DX Webserver; RDS Spy for RDS Spy), another program is already using the port, or the radio’s menu is open.
- **Over Wi-Fi, XDR-GTK won’t connect:** check that the network is 2.4 GHz, that the computer is on the same network, the radio’s IP address, port 7373 and the XDR-GTK password. The Windows firewall may block the connection.
- **No sound in FM-DX Webserver:** check that the chosen sound input is the cable’s and that the radio’s volume isn’t at minimum. Mono-only sound usually comes from the sound card.

## Clones

According to DEEPELEC, clones such as SPARKELEC’s use an older board (V2.5, versus V2.5.3 on the original), have touch that doesn’t work, have neither a Wi-Fi antenna nor an RTC, and get no updates or support. DEEPELEC also says SPARKELEC uses screenshots copied from the original DP-666. The logo on the startup screen doesn’t prove originality, because it is drawn by the firmware.

The V2.0 manual distributed by Raddy is the same as the one in SPARKELEC’s GitHub repository, so treat that material as belonging to a clone.

## Sources

- [DEEPELEC — speaker with no sound](https://www.deepelec.com/dp-666-speaker-cannot-produce-any-sound)
- [DEEPELEC — adjusting SQ](https://www.deepelec.com/how-to-adjust-the-sq-value)
- [DEEPELEC — antenna connector repair](https://www.deepelec.com/how-to-repair-the-antenna-connector/)
- [DEEPELEC — clones](https://www.deepelec.com/2025/10/10/stay_away_from_cloned_products)
- [DEEPELEC DP-666](https://www.deepelec.com/en/dp-666/)
- [DP-666 Megatron Mod17 manual](https://www.deepelec.com/files/dp-666/DP-666_UM_EN_Megatron_Mod17.pdf)
- [PE5PVB — tuner detection fix](https://github.com/PE5PVB/TEF6686_ESP32/commit/6d90a22cefae3f7c9a248cad9f77dc0592b3555d)
- [PE5PVB — discussion #885](https://github.com/PE5PVB/TEF6686_ESP32/discussions/885)
- [Blog or Die — DX-286 vs. DP-666](https://www.blogordie.com/?p=7848)
