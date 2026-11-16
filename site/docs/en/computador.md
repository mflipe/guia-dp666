# Using it with a computer

Connected to a computer, the DP-666 gets a big screen. You can tune with the mouse, see which frequencies have a signal, read RDS in detail, keep logs, listen to the radio from a browser anywhere and update the firmware. Commands and data travel over the USB-C cable or over Wi-Fi. Sound travels over neither: to listen on the computer, you need an audio cable.

If the program names, or terms such as RDS, COM port and baud, are new to you, start with [What each thing is](#computador--what-each-thing-is).

<!--DIAGRAM:remoto-->

## What it is for

| What you want | Program | Connection |
| --- | --- | --- |
| Control the radio from the computer, with the band graph and RDS on the screen | [XDR-GTK](#computador--xdr-gtk) | USB or Wi-Fi |
| See everything the station sends over RDS and keep logs | [RDS Spy](#computador--rds-spy) | USB, Wi-Fi or through XDR-GTK |
| Listen to and control the radio from a browser, at home or away, even on an iPhone | [FM-DX Webserver](#computador--fm-dx-webserver) | USB and an audio cable |
| Send each station’s data to a list on the computer | [StationList](#computador--stationlist) | Wi-Fi |
| Read the logbook and the memory channels, set the time or name the radio | [browser or terminal](#computador--logbook-memory-channels-and-time) | Wi-Fi or USB |
| Update the firmware and make a backup | [esptool or flash.bat](backup.md) | USB |

## What each thing is

Each name is explained here once. The rest of the page uses the same names.

### The programs

- **XDR-GTK:** a free program that turns into the radio’s control panel on the computer, for Windows and Linux. The name tells the story: it was born for the Sony XDR-F1HD, a hi-fi tuner that radio fans modified to control from a computer. GTK is the library used to draw the program’s windows. Today it also accepts radios with the TEF6686 chip, such as the DP-666. It was created by Konrad Kosmatka and Mateusz Walkowiak.
- **RDS Spy:** a free Windows program that decodes and analyzes RDS, the digital data stations send along with the sound (see below). The name fits what it does: it shows everything the station transmits, including what a regular radio doesn’t display. It comes from PIRA.cz, which makes RDS encoders for stations.
- **FMDX and FM-DX Webserver:** FMDX is the community of people who do FM DX (see below), gathered at fmdx.org. FM-DX Webserver is that community’s free program that puts the radio on a web page: from the browser of any device, you hear the sound and control the radio. It was created by Marek Farkaš.
- **xdrd:** a helper program, with no window, that puts a radio on the network for XDR-GTK and FM-DX Webserver. With the DP-666, you don’t need it: over Wi-Fi, the radio itself plays that role, and over the cable the programs talk to it directly.
- **StationList:** a computer program that receives the tuned station’s data over Wi-Fi and builds a list of stations.
- **TEF Logger App:** an Android app to follow and log receptions from radios with the TEF chip that run the official firmware.
- **PuTTY:** a free Windows program that opens a terminal (see below) on a serial port or a network connection.
- **esptool:** a tool from Espressif, the maker of the radio’s processor, to copy and flash the firmware. See [Backup and flashing](backup.md).

### Radio terms

- **DX:** a telegraph-era abbreviation for "distance". Doing DX is the hobby of picking up and identifying distant or weak stations. On FM, many arrive from far away only under special atmospheric conditions. People who do it are DXers.
- **RDS (Radio Data System):** digital data an FM station sends along with the sound, in a part of the signal you can’t hear. RDS is what puts the station name and the song playing on the display. The parts that appear on this page:
    - **PI:** a 4-character code that identifies the station, like an ID card. Since it goes in every RDS packet, it is usually the first data to show up with a weak signal, and it is what DXers use to find out which station they are hearing.
    - **PS:** the station name on the display, up to 8 characters.
    - **RadioText (RT):** free text of up to 64 characters, such as the song name or a message.
    - **RT+:** marks, inside the RadioText, which part is the song title and which is the artist.
    - **PTY:** the program type, such as news, sports or rock.
    - **AF:** a list of alternative frequencies of the same station, so the radio can switch on its own when the signal gets worse.
    - **CT:** the correct time, sent by the station.
    - **EON:** data about other stations of the same network.
    - **Group:** each RDS data packet. Each group type carries one type of information.
- **Spectrum and scan:** the spectrum is a graph of the whole band, with the signal strength at each frequency; each peak is a station. The scan is the radio going frequency by frequency to draw that graph.
- **Multipath:** the signal arrives by two paths at the same time, direct and reflected off buildings or hills, and gets scrambled. It causes hiss and distortion.
- **Filter (bandwidth):** how wide the radio opens around the tuned frequency. A narrow filter separates neighboring stations; a wide one gives better sound.
- **Antenna pattern:** the map of how much a directional antenna picks up in each direction.
- **Logbook:** the log of the stations received, with date, time, frequency and RDS.
- **Firmware:** the program that runs inside the radio. The DP-666 has two lines, Megatron Mod17 and the official one; see [Megatron vs. official](firmwares.md).

The other reception settings XDR-GTK controls, such as AGC, deemphasis and softmute, are explained in [Radio settings](#ajustes).

### Computer terms

- **Driver:** a program that teaches the computer to talk to a chip. Here, the CH340, which sits inside the radio and turns USB into a serial port.
- **Serial port or COM port:** the conversation channel the computer creates when you connect the radio with the cable. On Windows, each port gets a number (COM3, COM5…); on Mac and Linux, a name such as /dev/ttyUSB0. Programs ask for that number to know which device to talk to.
- **Baud:** the speed of the conversation over the serial port, in bits per second. The program and the radio must use the same one; otherwise garbled letters or nothing arrives.
- **IP:** the address of each device on the network, such as 192.168.0.31. The router gives the radio an IP address when it joins the Wi-Fi.
- **Network port:** a number that says which program, inside the device, receives the connection. If the IP is the building’s address, the port is the apartment. The radio answers XDR-GTK and RDS Spy on port 7373.
- **TCP and UDP:** two ways of sending data over the network. TCP confirms each delivery and keeps the conversation open, as with XDR-GTK. UDP just sends, without waiting for an answer, as with StationList.
- **Firewall:** the computer’s doorman, which blocks unknown connections. Sometimes you need to allow a program or a port.
- **Terminal:** a window where you type commands instead of clicking. On Windows, Command Prompt and PowerShell are terminals; PuTTY is a terminal for serial ports.
- **Node.js and npm:** Node.js is the engine that runs programs written in JavaScript outside the browser, such as FM-DX Webserver. npm comes with it and downloads the pieces the program needs: that is what the `npm install` command does.
- **Server and localhost:** a server is a program that waits for other devices to connect so it can answer them. localhost is the name the computer uses for itself: http://localhost:8080 opens the page the computer itself serves, on port 8080.
- **Public IP, tunnel and VPN:** the public IP is your home’s address on the internet, given by your provider. Opening a port on the router, or using a tunnel, lets anyone on the internet reach the server. A VPN does the opposite: it puts your phone, from far away, inside your home network, without exposing the server.
- **tef.local:** the name the official firmware radio announces on the network, so you don’t need to know its IP address. If it doesn’t open, use the IP address.
- **CSV:** a text file with the data separated by commas, which any spreadsheet opens.

## Before you start

- **Cable:** use a USB-C cable that carries data. Many cables only charge: if the computer doesn’t react when you connect the radio, swap the cable before touching anything else.
- **Driver on Windows:** inside the radio, a CH340 chip bridges USB and the processor. Windows Update usually installs the driver on its own. If it doesn’t, use [DEEPELEC’s CH340 driver](https://www.deepelec.com/files/dp-666/CH341SER.zip). The radio shows up in Device Manager, under Ports (COM & LPT), as "USB-SERIAL CH340" followed by the port number, such as COM5. Write that number down.
- **Driver on Mac and Linux:** Linux already includes the driver, and the port shows up as /dev/ttyUSB0. The Mac also recognizes the chip on its own, with the port /dev/cu.usbserial followed by a number. If the connection fails on the Mac, install the [WCH driver](https://github.com/WCHSoftGroup/ch34xser_macos) and allow it in System Settings → Privacy & Security. With it, the port becomes /dev/cu.wchusbserial followed by a number.
- **Sound:** connect a 3.5 mm to 3.5 mm cable from the radio’s headphone output to the computer’s line input, or to a USB sound card. Prefer a stereo input: many cheap USB cards only have a mono microphone input, and the sound arrives in mono.
- **Wi-Fi:** the radio and the computer need to be on the same 2.4 GHz network. The radio’s IP address shows up on Mod17 in Other settings → System information and, on the official firmware, next to Wi-Fi, in the Connectivity & clock group.
- **One program at a time:** the radio serves one program at a time. To use XDR-GTK and RDS Spy together, connect RDS Spy through XDR-GTK, as explained below.
- **Menu closed:** with the menu open, the radio ignores commands from the computer.

## Preparing the radio

| Setting | Megatron Mod17 | Official firmware |
| --- | --- | --- |
| USB port mode | Connectivity → USB mode | Connectivity & clock → USB mode |
| For XDR-GTK and FM-DX Webserver | XDRGTK | XDRGTK (the port switches to 115200 baud) |
| For RDS Spy over the cable | RDS Spy | RDS Spy (the port switches to 19200 baud) |
| Password for Wi-Fi connections | Connectivity → Set XDRGTK password, up to 8 characters | On the page that opens in Configure Wi-Fi, the XDRGTK password field, up to 8 characters. It comes set to "password" |
| Turn the screen off during the session | Connectivity → Screen off on XDRGTK | Connectivity & clock → Mute screen on XDRGTK connection |

Turning the screen off during the session is worth it: you already see everything on the computer, and a dark screen saves battery and stops creating noise in the radio. On the official firmware, it comes back when the connection ends.

## XDR-GTK

**What it is for:** it is the radio’s control panel on the computer, made for DXers. You tune with the mouse and the keyboard, change the reception settings (filter, AGC, deemphasis, stereo and softmute) and follow the signal strength, multipath and RDS on a graph. The spectrum scan draws the whole band and shows the occupied frequencies at a glance. It also measures the pattern of a directional antenna. It runs on Windows and Linux and is free.

**Works with:** both firmwares. What you can and can’t control is in [Connectivity and remote control](conectividade.md).

**Over the USB cable:**

1. On the radio, set the USB port mode to XDRGTK and close the menu.
2. Download XDR-GTK from the [project’s releases page](https://github.com/kkonradpl/xdr-gtk/releases) and install it.
3. Connect the radio to the computer with the cable and open XDR-GTK.
4. In the connection window, choose the radio’s serial port (the COM you wrote down) and connect. Over the cable, there is no password.
5. XDR-GTK starts showing the signal and RDS. On the official firmware, the radio switches to FM when it connects.

**Over Wi-Fi:**

1. Connect the radio to your network and set the XDR-GTK password (see the table above).
2. In XDR-GTK’s connection window, choose TCP/IP, enter the radio’s IP address, port 7373 and the password.

!!! tip "XDR-GTK and RDS Spy at the same time"
    XDR-GTK passes RDS on to RDS Spy. Turn on the RDS Spy button in XDR-GTK. In RDS Spy, choose Configure → Select RDS Source → ASCII G Protocol, with the TCP/IP connection on port 7376. RDS Spy only receives the groups that arrived without errors.

## RDS Spy

**What it is for:** it decodes everything the station sends over RDS, group by group: the PI code, the name (PS), the RadioText, the program type, the alternative frequencies, the time, data about other stations of the network (EON), RT+ and the extra applications, plus the error count. It also records logs. It is the classic tool to identify a weak station by its code and to check whether a station’s RDS is right. It is free and only runs on Windows.

**Works with:** both firmwares. From RDS Spy, you can also change the FM frequency.

**Over the USB cable:**

1. On the radio, set the USB port mode to RDS Spy and close the menu.
2. Install [RDS Spy](https://rdsspy.com/).
3. In RDS Spy, open Configure → Select RDS Source and choose ASCII G Protocol.
4. Choose the serial port connection, with the radio’s COM and 19200 baud.

**Over Wi-Fi:** in the same source (ASCII G Protocol), choose the TCP/IP connection, with the radio’s IP address and port 7373. The USB port mode doesn’t matter in this case.

## FM-DX Webserver

**What it is for:** it turns a computer connected to the radio into a server. Any device in the house, including phones and the iPhone, opens the radio in the browser, hears the sound and changes the frequency, the filter and the rest. With internet access, you can listen to your radio from far away, for example by leaving it at home with a good antenna. The server can also join the FMDX community’s [public map](https://servers.fmdx.org/), so other people can listen, and it has an admin panel, chat and plugins.

**Works with:** the official firmware, which the project declares compatible. On Mod17, compatibility is likely but not confirmed.

**What you need:** a computer with Windows or Linux, the systems the project lists, that stays on while the server is up (a mini PC will do), the USB cable and the audio cable.

1. On the radio, set the USB port mode to XDRGTK and close the menu.
2. Plug in the USB cable and the audio cable, from the radio’s headphone output to the computer’s sound input. Start with the radio’s volume at half.
3. Install [Node.js](https://nodejs.org/).
4. Download [FM-DX Webserver](https://github.com/NoobishSVK/fm-dx-webserver) and unzip it.
5. Open a terminal in the program’s folder and run `npm install` and then `npm run webserver`. Leave that window open: closing it shuts the server down.
6. In the browser, open http://localhost:8080/setup. Choose the direct connection through the radio’s serial port, without the xdrd helper program. Choose the sound input the cable is plugged into and set an admin password.
7. Open http://localhost:8080 to listen. On the other devices in the house, use the computer’s IP address with port 8080, such as http://192.168.0.20:8080.

!!! warning "Before opening the server to the internet"
    For access from outside the house, you need a public IP with the port forwarded on the router, or a tunnel. An open server lets anyone listen to stations through your radio, and relaying the programming over the internet may run into the rights of the stations and the authors (in Brazil, Law No. 9,610/1998; elsewhere, your local copyright law). To join the map, follow the FMDX community’s rules. To listen from afar just for yourself, prefer a VPN into your network instead of opening the port.

## StationList

**What it is for:** over Wi-Fi, the radio sends the StationList program, on a computer on the same network, the data of each tuned station: frequency, signal strength, filter, PI code, name, program type, RadioText and alternative frequencies. The program builds the station list and can ask the radio to change frequency.

**Works with:** both firmwares.

1. Turn on the radio’s Wi-Fi.
2. On the official firmware, in Stationlist client IP, enter the last number of the computer’s IP address. If the computer is 192.168.0.25, use 25. On Mod17, the setting is Connectivity → Stationlist client IP.
3. If there is more than one radio, give each one a number in Stationlist ID.
4. In the computer’s firewall, allow incoming traffic on UDP port 9030. The radio receives the program’s requests on port 9031.

We didn’t find an official StationList page. The data above comes from the firmware code.

## Logbook, memory channels and time

**Official firmware over Wi-Fi:** with the radio on the network, open the radio’s IP address in a browser, such as http://192.168.0.31, or http://tef.local. The page shows the logbook, with the stations you logged by holding the encoder, and has a download button that saves everything to a CSV file you can open in any spreadsheet.

**Over the cable, in a terminal:** the terminal is a program that sends and receives text through the radio’s port. On Windows, use PuTTY: choose Serial, the radio’s COM port and the speed of the USB mode (115200 in XDRGTK, 19200 in RDS Spy). On Mac and Linux, the command `screen /dev/ttyUSB0 115200` does the same; replace it with your port’s name. Then type the command:

- **Official firmware:** `L` returns the logbook as CSV. `s` lists the 99 memory channels, and `S` saves a memory channel, in the format of [PE5PVB’s memory protocol](https://github.com/PE5PVB/TEF6686_ESP32/blob/main/docs/Memory%20channel%20protocol.pdf).
- **Megatron, with the USB mode set to XDRGTK:** `$time: 14:30:00` sets the clock without Wi-Fi; `$name: MY RADIO` gives the radio a name, which appears on the startup screen and at the bottom when there is no RadioText; `$reboot` restarts it. The simplest way is to use the .bat files that come in the firmware package, on Windows.

!!! danger "Don’t test undocumented commands"
    Mod17 has internal commands that can erase settings and memory channels. Only use the commands above and make a [backup](backup.md) before trying anything else.

## From a phone, without a computer

- **Android:** the [TEF Logger App](https://highpoint.fmdx.org/manuals/TEF-Logger-App-Documentation.html) receives the radio’s data over Wi-Fi, with the official firmware v2.20 or newer, to follow and log receptions.
- **iPhone:** there is no app that talks to the radio directly. The way to go is FM-DX Webserver on a computer, opened in the iPhone’s browser.

## Common problems

- **The computer doesn’t see the radio:** swap the cable for one that carries data, try another USB port and check the CH340 driver in Device Manager.
- **The port opens, but nothing arrives:** the USB port mode doesn’t match the program (XDRGTK for XDR-GTK and FM-DX Webserver; RDS Spy for RDS Spy), another program is already using the port, or the radio’s menu is open.
- **It won’t connect over Wi-Fi:** check that the network is 2.4 GHz, that the computer is on the same network, the radio’s IP address, port 7373 and the password. The Windows firewall may block the connection.
- **No sound in FM-DX Webserver:** check that the chosen sound input is the cable’s and that the radio’s volume isn’t at minimum. Mono-only sound usually comes from the sound card.
- **The battery indicator disappears:** it is a limitation of the ESP32 with Wi-Fi on. Over the cable, with Wi-Fi off, it doesn’t happen.

## Sources

- [PE5PVB — communication code (ports, speeds and protocols)](https://github.com/PE5PVB/TEF6686_ESP32/blob/main/src/comms.cpp)
- [PE5PVB — memory channel protocol](https://github.com/PE5PVB/TEF6686_ESP32/blob/main/docs/Memory%20channel%20protocol.pdf)
- [PE5PVB wiki — how to use the logbook](https://github.com/PE5PVB/TEF6686_ESP32/wiki/How-to-use-the-logbook)
- [FMDX.org — XDR-GTK](https://fmdx.org/projects/xdr-gtk.php)
- [FMDX.pl — XDR-I2C, the Sony XDR-F1HD modification](https://pl.fmdx.org/?p=93)
- [FMDX.org — xdrd](https://fmdx.org/projects/xdrd.php)
- [PIRA.cz — RDS Spy and other programs](https://pira.cz/)
- [Wikipedia — DXing](https://en.wikipedia.org/wiki/DXing)
- [Wikipedia — Radio Data System](https://en.wikipedia.org/wiki/Radio_Data_System)
- [RDS Forum — RDS glossary](https://rds.org.uk/2010/Glossary-Of-Terms.htm)
- [XDR-GTK — downloads](https://github.com/kkonradpl/xdr-gtk/releases)
- [FMDX.pl — XDR-GTK and RDS Spy Link](https://pl.fmdx.org/?p=100)
- [FMDX.org — FM-DX Webserver](https://fmdx.org/projects/webserver.php)
- [FM-DX Webserver on GitHub](https://github.com/NoobishSVK/fm-dx-webserver)
- [Kanto Aalto — direct COM port connection in FM-DX Webserver](https://kantoaalto.blogspot.com/2024/03/new-control-system-for-fm-receivers-fm.html)
- [TEF Logger App — documentation](https://highpoint.fmdx.org/manuals/TEF-Logger-App-Documentation.html)
- [DEEPELEC — CH340 driver for Windows](https://www.deepelec.com/files/dp-666/CH341SER.zip)
- [WCH — CH34x driver for macOS](https://github.com/WCHSoftGroup/ch34xser_macos)
- [Soldered — CH340 ports on Mac and Linux](https://docs.soldered.com/ch340-drivers/)
- [Planalto — Law No. 9,610/1998, copyright](https://www.planalto.gov.br/ccivil_03/leis/l9610.htm)
