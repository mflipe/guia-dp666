# Lab

Project ideas around the DP-666, with what is already known about each one. Nothing here is finished: these are paths that have been studied, with the limits found.

## AI-controlled radio

An AI agent that runs commands on the computer, such as Claude Code, can talk to the radio through the XDR-GTK protocol: tune (`T99500` goes to 99.5 MHz), change the filter and AGC and read the signal and RDS back.

- **Straight over USB:** a script talks to the serial port. It is the simplest way, but it keeps the port to itself.
- **Through fm-dx-webserver:** it also accepts commands from other programs, as the fm-dx-console terminal client does. That way the radio stays reachable from the browser.
- **How to package it:** a local MCP server with tools such as "tune", "read RDS" and "scan band". Claude Code accepts MCP servers that run as processes on the machine, and the non-interactive mode (`claude -p`) lets you schedule routines, such as a scan in the small hours.

**Limits:** the AI reads numbers and RDS, but doesn’t hear the audio. Each action takes a few seconds, so monitoring for hours requires a script that runs on its own. And Mod17’s compatibility with the protocol needs testing.

## Monitoring radio news

AI doesn’t process audio, but you can put a transcription step in between:

1. **Capture:** a cable from the radio’s headphone output to a sound card on the computer.
2. **Transcription:** a speech-to-text model, such as Whisper, transcribes the speech.
3. **Filter:** a script picks out the passages with words such as "accident", "road closed" or "fire". This keeps the cost low.
4. **Analysis:** the AI summarizes and organizes each case (what, where, when, severity) and checks it on the web.
5. **Delivery:** an alert on the phone or a daily summary.

**Limits:** the DP-666 tunes one station at a time; for several at once, you need more radios or an SDR. Many stations also stream online, which is simpler for news. The DP-666 doesn’t receive police, fire or rescue radio, only FM, AM and shortwave stations.

## Emulating the interface on a computer

- **Official firmware:** feasible on Wokwi, an ESP32 simulator that is free for personal use, with an ESP32, an ILI9341 screen, an encoder and buttons. Without the tuner, the firmware would stop at "Tuner: !None!", but the open code lets you swap the TEF6686 for a fake one or create a virtual chip with Wokwi’s I²C chips API. Touch wouldn’t work, because Wokwi’s touchscreen is capacitive (FT6206), not resistive like the DP-666’s.
- **Megatron:** only in theory. You would need to run the binary as it is and create virtual versions of the tuner, the keypad and touch that give the expected answers. Espressif’s QEMU isn’t practical for this, because SPI devices, such as the screen, don’t work well in it.
- **Mirroring the radio’s screen on a PC:** neither firmware sends the screen image.

## Configurator on a computer and a phone

The idea: put together settings and memory channels on a computer or a phone and send them to the radio.

**What already exists:**

- **Official firmware, over USB:** `s` lists the memory channels, `S` saves one and `l` exports the station log.
- **Mod17:** the data lives in internal files (see [Hidden features of Mod17](mod17.md)), and Manage my data mode waits for commands from a PC, but the protocol isn’t public.

**Three paths:**

1. **Editing the backup:** read the flash with esptool, edit memory channels, names and settings and write it back. On Mod17, the format can be worked out by comparing two backups, before and after changing a setting. It is safe, but only works over USB, with the radio in flashing mode.
2. **A web page over USB:** Web Serial lets a page talk to the radio without installing anything, in Chrome and Edge on a computer. It doesn’t work in Safari.
3. **A settings page on the radio itself:** the official firmware already has a web server. By modifying the firmware, you could add a configuration page that any phone opens over Wi-Fi.

**On a phone:** the iPhone doesn’t talk to common USB-serial adapters, so only over Wi-Fi or Bluetooth Low Energy. On Android, you can use the cable, with the usb-serial-for-android library, which supports the CH340.

## Bluetooth as a configuration channel

- **Pros:** Bluetooth Low Energy (BLE) is the only way for an iPhone app to talk to the radio without a router, because BLE devices don’t depend on Apple’s MFi program. It also uses less battery than Wi-Fi.
- **Cons:** classic Bluetooth, in serial mode, doesn’t work with iPhone apps. From the browser, Web Bluetooth works in Chrome and Edge, but not in Safari or on iOS.
- **In the firmware:** Mod17 already includes Bluetooth, but only for the "slave host" function. The official firmware doesn’t use Bluetooth, and a v2.20 package for the DP-666 takes 3,064 of the 3,072 KB reserved for the program. To make it fit, the radio’s memory would have to be reorganized.

## Swapping the ESP32 for a newer model?

The DP-666 uses the ESP32-WROOM-32U: 4 MB of flash, no PSRAM and a connector for an external antenna. Espressif classifies this module as not recommended for new designs. The current model in the same family is the WROOM-32UE, with the same footprint. On it, the six flash pins (17 to 22) are left unconnected, but the DP-666 doesn’t use those pins.

Short answer: only the WROOM-32UE without PSRAM can replace the current one. The others need a new board, and none of them improves reception.

The figure below shows the modules to scale. Tap a pin to see what it does on the DP-666.

<!--VIEWER3D-->

| Module | Dimensions | Memory | Does it fit the DP-666? |
| --- | --- | --- | --- |
| WROOM-32U (the current one) | 18 × 19.2 × 3.2 mm | 4 MB of flash | It is the original |
| WROOM-32UE, versions N4, N8 and N16 | 18 × 19.2 × 3.2 mm | 4, 8 or 16 MB of flash | **Yes:** the pins the DP-666 uses are in the same places |
| WROOM-32UE with PSRAM (N4R2, N8R2 and N16R2) | 18 × 19.2 × 3.2 mm | Up to 16 MB of flash and 2 MB of PSRAM | **No:** GPIO 16, the screen reset, is tied to the PSRAM |
| WROVER-IE | 18 × 31.4 × 3.3 mm | Up to 16 MB of flash and 8 MB of PSRAM | **No:** it is 12 mm longer, and GPIO 16 and 17 (screen reset and DC) go to the PSRAM |
| S3-WROOM-1U | 18 × 19.2 × 3.2 mm | Up to 16 MB of flash and PSRAM | **No:** 41 pins in a different order |
| C5-WROOM-1U | 18 × 21.2 × 3.3 mm | Up to 32 MB of flash and 8 MB of PSRAM | **No:** a different pinout and up to 22 GPIOs |

### What you could gain

- **More flash (WROOM-32UE N8 or N16):** the program already fills almost all of its reserved area. The v2.20 package used 3,064 of the 3,072 KB, and v2.20.12 grew that area to 3,776 KB, leaving 192 KB for files, where the station log lives. With 8 or 16 MB, a bigger log and two copies of the program would fit, which allows updating over Wi-Fi. To use the space, you have to compile with another partition table, and the official firmware has no over-the-air update.
- **PSRAM:** it would give memory to build the whole screen before showing it, without flicker. Today the code draws in small pieces (the largest, the frequency, is 200 × 50 pixels), because the whole 320 × 240 screen at 16 bits takes 150 KB and would compete with Wi-Fi for internal RAM.
- **Native USB (S3):** the radio would show up on the computer as a serial port without the CH340. It could even work as a sound card, if the new board routed the audio to the ESP32.
- **More analog inputs (S3):** the S3’s ADC1 has 10 channels, so the battery could sit on a channel that works with Wi-Fi on. On the DP-666, it is on GPIO 13, on ADC2, which is why the reading disappears with Wi-Fi.
- **Wi-Fi 6 at 5 GHz (C5):** it only helps with the connection to the router. The C5 has a single core and Bluetooth LE only.

### What doesn’t change

- **Reception and sound:** the TEF6686 does the tuning and signal processing. The ESP32 handles the screen, the buttons and communication, so a faster processor doesn’t change sensitivity, selectivity or audio.
- **Screen speed:** the official firmware’s wiki says to run the screen’s SPI at 7.5 MHz, and even lower if noise shows up around 90 MHz. The limit is interference with the radio, not the processor.
- **Free pins:** the official code uses 25 of the module’s 26 GPIOs. GPIO 12 is left, and it can’t be high at boot. A new function would need a pin expander.

### In practice

- **If the module burns out:** use the WROOM-32UE without PSRAM (N4, N8 or N16). It has the same chip in a newer revision (ESP32-D0WD-V3) and the same antenna connector. The swap needs a hot air station, because of the ground pad under the module.
- **To get PSRAM, native USB or 5 GHz:** that is a new board design, with the firmware adapted. The official firmware is made for the classic ESP32.

## Sources

- [Espressif — ESP32-WROOM-32D and WROOM-32U datasheet](https://documentation.espressif.com/esp32-wroom-32d_esp32-wroom-32u_datasheet_en.pdf)
- [Espressif — ESP32-WROOM-32E and WROOM-32UE datasheet](https://documentation.espressif.com/esp32-wroom-32e_esp32-wroom-32ue_datasheet_en.html)
- [Espressif — ESP32-WROVER-E and WROVER-IE datasheet](https://documentation.espressif.com/esp32-wrover-e_esp32-wrover-ie_datasheet_en.pdf)
- [Espressif — ESP32-S3-WROOM-1 and WROOM-1U datasheet](https://documentation.espressif.com/esp32-s3-wroom-1_wroom-1u_datasheet_en.html)
- [Espressif — ESP32-C5-WROOM-1 and WROOM-1U datasheet](https://documentation.espressif.com/esp32-c5-wroom-1_wroom-1u_datasheet_en.html)
- [PE5PVB — TEF6686_ESP32.ino, with the pins used](https://github.com/PE5PVB/TEF6686_ESP32/blob/main/TEF6686_ESP32.ino)
- [PE5PVB wiki — Installing the software (screen SPI)](https://github.com/PE5PVB/TEF6686_ESP32/wiki/Installing-the-software)
- [three.js, the library used in the 3D view (MIT license)](https://threejs.org/)
- [Claude Code — MCP](https://code.claude.com/docs/en/mcp)
- [Claude Code — non-interactive mode](https://code.claude.com/docs/en/headless)
- [fm-dx-console](https://github.com/bkram/fm-dx-console)
- [Wokwi — ESP32 simulation](https://docs.wokwi.com/guides/esp32)
- [Wokwi — custom chips](https://docs.wokwi.com/chips-api/getting-started)
- [ESP32 forum — devices in QEMU](https://esp32.com/viewtopic.php?p=151786)
- [Web Serial — compatibility](https://www.testmuai.com/web-technologies/web-serial/)
- [Apple forum — USB-serial on the iPhone](https://origin-devforums.apple.com/forums/thread/834899)
- [usb-serial-for-android](https://github.com/mik3y/usb-serial-for-android)
- [Apple forum — BLE and MFi](https://developer.apple.com/forums/thread/765687)
- [Web Bluetooth — compatibility](https://web-platform-dx.github.io/web-features-explorer/features/web-bluetooth)
