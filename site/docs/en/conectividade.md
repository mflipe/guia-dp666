# Connectivity and remote control

What you can do with the DP-666 over Wi-Fi, USB and Bluetooth.

## Wi-Fi

- **Setup:** with the on-screen keypad or with a browser. In a browser, connect to the radio’s `ESP_…` network and open http://192.168.4.1. Mod17 stores up to 3 networks. Only 2.4 GHz networks work.
- **What it is for:** setting the time over the internet (NTP) and the connections described below. Wi-Fi doesn’t carry audio.
- **Mind the battery:** with Wi-Fi on, the radio doesn’t measure the battery, and the indicator and the low battery protection stop working. Set Wi-Fi auto disconnect to After time sync.

## What you can control remotely

On Mod17, remote control uses the XDR-GTK protocol, over Wi-Fi (TCP port 7373, with a password) or over USB (no password, with USB mode set to XDRGTK).

| You can control | You can’t |
| --- | --- |
| frequency on FM, MW, LW and SW; seek up and down; switching between FM and AM | menus and settings (Wi-Fi, time zone, themes, memory channels) |
| bandwidth, AGC, deemphasis, stereo/mono, iMS/EQ and softmute | turning the radio on remotely (only with a timer or schedule set on it) |
| volume, mute and squelch, including the automatic one | receiving the audio over the network |
| spectrum scan and starting or stopping the DX scan | using it with the menu open (commands are ignored) |
| turning the screen off during the session (Screen off on XDRGTK) | more than one program at the same time |

The radio also sends the signal, stereo, multipath, C/N and all the RDS in real time.

## Compatible programs

What each program does, what you need and the step-by-step of each connection are in [Using it with a computer](computador.md).

- **XDR-GTK (Windows and Linux):** full control and signal and spectrum graphs.
- **fm-dx-webserver:** open source server, created by Marek Farkaš (Noobish) and the FMDX community, that puts the radio in the browser of any device, with audio, an admin panel and chat. It runs on Windows and Linux with Node.js. The audio comes from the computer’s sound input, through a cable from the radio’s headphone output. It declares support for TEF668x receivers with PE5PVB’s firmware; with Mod17, compatibility is likely but not confirmed.
- **RDS Spy (Windows):** detailed RDS analysis, over USB (19200 baud) or Wi-Fi, and FM tuning.
- **StationList (PC):** the radio sends PI, PS, AF and other data over UDP (ports 9030 and 9031), and the program can change the frequency.
- **TEF Logger App:** Android only, and only with the official firmware v2.20 or newer.

## iPhone

There is no iPhone app that talks to the radio directly, and the iPhone can’t use the DP-666’s USB-serial adapter (CH340). The way to go is fm-dx-webserver on a computer connected to the radio, opened in the iPhone’s browser.

## Commands over USB

- **Megatron:** `$time: HH:MM:SS`, `$name: NAME` and `$reboot`, at 115200 baud. The package comes with .bat files for Windows. See also the internal commands in [Hidden features of Mod17](mod17.md).
- **Official firmware:** `s` lists all memory channels; `S` saves a memory channel (position, frequency, filter, mono/stereo, PI and PS) and answers with an error code; `l` or `L` exports the station log as CSV. These commands only work over USB.
- **Official firmware over Wi-Fi:** the radio serves a page with the station log at http://tef.local or at its IP address. How to log stations is in [Using the official firmware](oficial.md).

## Bluetooth

- **Audio:** it doesn’t work. The firmware has no audio profiles, so Bluetooth headphones and speakers don’t connect. If you want Bluetooth audio, you need another radio (see [Comparison](comparacao.md)).
- **Mod17:** uses Bluetooth only for the "slave host" function, in which the radio connects to another device and controls it. The firmware asks you to turn Wi-Fi off first.
- **Official firmware:** doesn’t use Bluetooth.

## Sources

- [FMDX.org — FM-DX Webserver](https://fmdx.org/projects/webserver.php)
- [FM-DX Webserver on GitHub](https://github.com/NoobishSVK/fm-dx-webserver)
- [TEF Logger App — documentation](https://highpoint.fmdx.org/manuals/TEF-Logger-App-Documentation.html)
- [PE5PVB — communication code](https://github.com/PE5PVB/TEF6686_ESP32/blob/main/src/comms.cpp)
- [PE5PVB — memory channel protocol](https://github.com/PE5PVB/TEF6686_ESP32/blob/main/docs/Memory%20channel%20protocol.pdf)
- [Apple forum — USB-serial on the iPhone](https://origin-devforums.apple.com/forums/thread/834899)
