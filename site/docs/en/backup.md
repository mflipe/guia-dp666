# Backup, flashing and restoring

A full flash backup saves everything: firmware, settings, memory channels and internal files. With it, any experiment can be undone.

## Flash map (4 MB)

<!--DIAGRAM:flash-->

| Partition | Address | Size | Contents |
| --- | --- | --- | --- |
| nvs | 0x9000 | 20 KB | settings and memory channels |
| otadata | 0xE000 | 8 KB | boot control |
| app0 | 0x10000 | 3072 KB | the firmware |
| spiffs | 0x310000 | 896 KB | logos, schemes, plans, names and My settings |
| coredump | 0x3F0000 | 64 KB | crash log |

The analyzed Mod17 and v2.20 packages use the same map.

## Flashing mode

With the main switch ON, hold BOOT and press POWER. On Windows, first install the [CH340 driver DEEPELEC provides](https://www.deepelec.com/files/dp-666/CH341SER.zip). The radio shows up as a COM port on Windows, /dev/ttyUSB0 on Linux or /dev/cu.wchusbserial… on macOS.

esptool is Espressif’s command-line tool. Install it with `pip install esptool`.

## Making the full backup

```
esptool --chip esp32 --port COM3 --baud 921600 read_flash 0 0x400000 dp666_backup.bin
```

Replace COM3 with your port. If you get an error, repeat with `--baud 460800`. Keep the 4 MB file in more than one place.

## Restoring the backup

```
esptool --chip esp32 --port COM3 --baud 921600 write_flash 0 dp666_backup.bin
```

The radio returns exactly to the state of the backup, with firmware, settings and memory channels.

## How flash.bat writes Mod17

The package’s script runs esptool at 921600 baud, DIO mode, 80 MHz and 4 MB. It writes the bootloader at 0x1000, the partition table at 0x8000, boot_app0 at 0xE000, the firmware at 0x10000 and the file area at 0x310000.

!!! warning "Flashing firmware erases data"
    flash.bat rewrites the whole file area (896 KB), where schemes, plans, names and My settings live. The Megatron changelog also warns that updates reset the settings. Make the backup first.

## Installing the official firmware

### Ready-made package

PE5PVB’s GitHub has a Releases page, with the most stable versions, which aren’t always the newest. Packages with ARS in the name are for AmateurRadioShop’s kits. For the DP-666, prefer DEEPELEC’s package, already prepared for it.

1. Put the radio in flashing mode (see above). The wiki describes the generic way: hold BOOT while plugging in the USB cable, with the radio on and the screen dark.
2. Unzip the package and run `flash.bat`.
3. Enter the COM port. If the script doesn’t list the ports, open Device Manager (Win+R and `devmgmt.msc`) and look under Ports.
4. Wait for the message "Leaving... Hard resetting via RTS pin...". Turn the radio off, unplug the cable and turn it on again.

### Compiling the code

This is the way to get the fixes released after the last package, such as the keypad and tuner fixes of November 2026.

1. Download the code with `git clone https://github.com/PE5PVB/TEF6686_ESP32` or as the repository ZIP.
2. In the Arduino IDE, under Preferences, add the boards URL `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`. Then install Espressif’s esp32 package, version 3.x, from the Boards Manager and choose the ESP32 Dev Module board.
3. Install the TFT_eSPI, ESP32Time and Hash libraries in Sketch → Include Library → Add .ZIP Library, without unzipping the ZIPs. The links are at the top of the TEF6686_ESP32.ino file.
4. Under Partition scheme, choose Custom.

In the TFT_eSPI library’s `User_Setup.h` file (in Documents/Arduino/libraries/TFT_eSPI), keep only the lines below active and comment out everything else. The first line turns on the DP-666 defaults.

```
#define DEEPELEC_DP_66X
#define ILI9341_DRIVER
#define TFT_DMA_SUPPORT
#define TFT_CS   5
#define TFT_DC   17
#define TFT_RST  16
#define TOUCH_CS 32
#define SPI_FREQUENCY        7500000
#define SPI_READ_FREQUENCY  20000000
#define SPI_TOUCH_FREQUENCY  2500000
#define SMOOTH_FONT
```

If noise shows up around 90 MHz, lower `SPI_FREQUENCY`. To flash, click Verify, choose the port in Tools → Port, put the radio in flashing mode and click Upload. At the end, "Done uploading" appears.

!!! warning "The current code uses a different partition map"
    Since Feb 16, 2026, the repository’s `partitions.csv` gives more room to the firmware and less to files. In v2.20.12, it is 16 KB of nvs, 3,776 KB of firmware, 64 KB of coredump and a 192 KB file area, without OTA. The map of the packages analyzed above has 3,072 KB of firmware and an 896 KB file area. When the map changes, the file area is recreated and the logbook starts empty; settings may also return to defaults. Make the full backup first and, to go back, restore the whole backup.

## After flashing

- Calibrate touch and set up Wi-Fi again.
- Check the time zone, the NTP server and the settings in [Setup for Brazil](brasil.md).
- Only download firmware from DEEPELEC’s site, which warns that clones exist. Packages from clone repositories may be for another board.

## Sources

- [DEEPELEC DP-666 — downloads](https://www.deepelec.com/en/dp-666/)
- [esptool — documentation](https://docs.espressif.com/projects/esptool/en/latest/esp32/)
- [DEEPELEC — CH341SER driver for Windows (zip)](https://www.deepelec.com/files/dp-666/CH341SER.zip)
- [SparkFun — how to install the CH340 driver, with the WCH links](https://learn.sparkfun.com/tutorials/how-to-install-ch340-drivers)
- [TEF6686_ESP32 wiki — Installing the software](https://github.com/PE5PVB/TEF6686_ESP32/wiki/Installing-the-software)
- [PE5PVB — Releases](https://github.com/PE5PVB/TEF6686_ESP32/releases/)
- [PE5PVB — current partitions.csv](https://github.com/PE5PVB/TEF6686_ESP32/blob/main/partitions.csv)
- [PE5PVB — partitions.csv history](https://github.com/PE5PVB/TEF6686_ESP32/commits/main/partitions.csv)
- [Random Nerd Tutorials — ESP32 in the Arduino IDE](https://randomnerdtutorials.com/installing-the-esp32-board-in-arduino-ide-windows-instructions/)
- [Video recommended by the wiki: installing and updating the firmware](https://www.youtube.com/watch?v=cXZ5rHwfRz4)
