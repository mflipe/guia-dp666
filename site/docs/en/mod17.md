# Hidden features of Mod17

A survey of what exists in the Megatron Mod17 firmware but doesn’t appear in the manual. It is based on about 500 interface strings rebuilt from the firmware (English and Chinese, matched one to one), 56 messages and the list of models, cross-checked with the English and Chinese manuals and the author’s changelog (mod11 to mod17).

The firmware doesn’t say which submenu each item lives in. The items are grouped by subject and can be found by their English name, with advanced mode on.

## Hidden options in items the manual already mentions

- **Search & save mode:** besides Overwrite and Append, there is Continuously append ✅.
- **Wi-Fi auto disconnect:** besides 1 to 1440 min, there is After time sync, which turns Wi-Fi off after setting the clock ✅.
- **RDS Show underscore:** Off, PS only and On. The English manual only mentions Off and On ✅.
- **Keep BAND key 3 sec.:** Power off, Mute screen (turns the screen off) or Disable. The English manual only mentions Power off ✅.
- **Long press Band key:** it exists; the English manual repeats "Long press Rotary key" in its place ✅.
- **Long presses (knob, BW, MODE and BAND):** besides the manual’s options, there are Frequency list and Band keypad. Name ✅, function 🟡.
- **Set first page:** a Main page + Keypad option 🟡. With Open menu, Select menu group appears, to pick the group that opens ✅.
- **Set UI round:** chooses what gets rounded corners: Menu, Button, Icon or Border ✅.
- **Region USA (DB):** depends on a database of US stations that isn’t in Mod17’s storage. It doesn’t matter in Brazil 🟡.

## Menu items missing from the manual

### Screen and appearance

- **Meter display style** (Classic or New) ✅. It is the item the manual calls "Color bar display mode", a name that doesn’t exist in the firmware.
- **Show radio name** ✅: shows the name set by the `$name` command on the startup screen and at the bottom, when there is no RadioText.
- **Clock color, Debug info color and Debug refresh interval** ✅.
- **Notifications:** Show notification, Notification mode (Auto, Message bar or Message box), Notification hold and Notification color ✅.
- **Names per frequency:** My frequency name, Show frequency name, Reset frequency name and Frequency name color ✅. They live in separate internal files for FM and AM; how to edit the names isn’t clear yet ❓.
- **Show frequency tips** 🟡: a signal strength label, from RDX (remote) and WEK (weak) to MED (medium), STR (strong) and SPR (super).
- **Startup logo:** My logo image uses an image from the internal logos folder ✅, and My logo border applies frames such as rectangle, ellipse, circle, hexagon or heart ✅. How to upload the image isn’t documented.
- **Automatic theme switching:** Auto switch Interval, Theme switch range and Theme switch method (Sequential or Random) ✅.
- **Show communication** 🟡: shows on the screen the commands received during a remote session.
- **Power saving mode:** name ✅, unknown effect ❓.
- **Developer mode** ❓: better not to touch it.

### Operation

- **Beep at operation** ✅: a beep on every operation.
- **Auto save change and handle data change** ✅: with auto save off, when you leave the menu the radio shows "Change pending" and asks Save or Discard.
- **Off screen tuning** ❓: the Chinese label means "blind operation"; it seems related to operating with the screen off.

### Search, scan and memory channels

- **Band save mode** 🟡: Mixed Save, Save by band or Save by time segment.
- **TTM** 🟡: sets of memory channels by time of day, with automatic or manual switching.
- **SW seek by range** 🟡: limits the manual SW search to the SW search start/stop range.
- **Wait on signal only** ✅: in the DX scan, it only waits on frequencies with a signal.
- **Hold time** ❓: probably the stop time in Stay mode.
- **Resets:** Reset ATS Scheme, Reset Scan Scheme, Reset Receive Plan and Reset All bands ✅.
- **Delete my settings** ✅: erases the saved "My settings".

### Power and clock

- **Power on timer** ✅: turns the radio on at a set time.
- **Sleep clock correction** ✅: corrects the clock, in seconds per 24 h, while the radio is off. Useful on units without an RTC.
- **Low battery protect and Low battery threshold** ✅: they probably turn the radio off below a voltage limit 🟡.
- **Set NTP server** ✅: changes the time server. The default is cn.pool.ntp.org.

## Undocumented pages and screens

- **Frequency list** 🟡: a list of frequencies, probably the memory channels.
- **Band keypad** 🟡: a keypad to pick the band directly.
- **Select FM/AM bandwidth filter** 🟡: a list-style bandwidth selector.
- **Select SW meter band** ✅: SW meter band selector.
- **Setup wizard** ✅: runs after a factory reset. Steps: language, radio model, rotating the screen, whether the screen has touch, touch type, encoder direction, inverting colors, calibration and usage mode. Models listed: Unknown, Original DIY, Hong6686 V1, V2 Basic, V2 Touch, V3 Mini, TabbyCat6686 Basic and Touch, and DEEP DP-666.
- **Advanced RDS** ✅: PI, PS and Long PS, PTY, RT and eRT, RT+, AF, EON, ECC, LIC, PIN, DI flags, TP, TMC, DAB reference, ODA applications and errors per block.
- **Credits** ✅: "Main code: PE5PVB" and a list of contributors.

## Internal data files

Mod17 keeps part of its data in files in the internal storage (SPIFFS), not in the settings area:

| File | Likely contents |
| --- | --- |
| /datas/scan.sch | scan and search schemes |
| /datas/plan.dat | reception plans |
| /datas/fmname.idx and .dat | names per frequency on FM |
| /datas/amname.idx and .dat | names per frequency on AM |
| /datas/settings.dat | copy of the settings made by Save my settings |

Reflashing the firmware rewrites this whole area, so this data is lost in an update without a backup.

## Connectivity and protocols

- **Wi-Fi** ✅: stores up to 3 networks. Configure Wi-Fi accepts the on-screen keypad or a browser, through the portal at http://192.168.4.1 after joining the radio’s network. The manual describes Wi-Fi as "under development".
- **XDR-GTK over Wi-Fi** ✅: TCP port 7373, with a password of up to 8 characters. It includes commands that reached the official firmware after v2.00, such as automatic squelch, stereo/mono and starting or stopping the DX scan 🟡.
- **RDS Spy over TCP and Stationlist (UDP 9030/9031)** ✅: inherited from the base code.
- **Reading memory channels over USB** 🟡: the firmware contains the answers to the `s` command of the official memory protocol. There is no sign of the `S` save command.
- **Manage my data** ✅: a mode in which the radio waits for commands from a PC ("Waiting for manage command..."). In mod16, it was used to transfer schemes, names, plans and scan schemes. There is no public tool.
- **Bluetooth "slave host"** 🟡: Config slave host, a host list, Connect, Online control mode (Action or Result) and Pause/Recovery control. It seems to be for the radio to control another device, not for audio. The warning "Please close Wi-Fi first" indicates that Wi-Fi and Bluetooth don’t work together.

## Serial commands

- **Documented in the package:** `$time: HH:MM:SS`, `$name: NAME` and `$reboot` ✅, at 115200 baud.
- **Internal, undocumented:** `manager`, `test_rds`, `set_sn`, `clear_nvs`, `still_auto`, `unstill` and `touch_main` ✅. Judging by the names: data management, RDS test, serial number, erasing the settings memory, turning the still screen on and off, and something related to touch.

!!! danger "Don’t test the internal commands"
    Judging by its name, `clear_nvs` should erase all settings and memory channels. The other internal commands aren’t documented either. If you are going to experiment, make a [full backup](backup.md) first.

## Supporter serial number ❓

The firmware checks a serial number (the `set_sn` command), with the messages "Serial number passed — Thank you support!", "Serial number error" and "Too many attempts", and has the labels "Enhanced version" and "Customized version". It looks like a scheme for supporters, since the package includes a donation QR code. Nothing in the manual depends on it.

## Behaviors only the changelog explains

- **On-screen keypad:** a long press on FM goes to OIRT and on SW goes to AIR; AIR frequencies accept 3 digits; there is a "loose" entry mode.
- **Shortcuts page:** volume and brightness adjust by dragging your finger; a long MODE switches to the no-touch mode; turning off requires a long press.
- **Multi-page dialogs:** a long press on OK ends them early.
- **Maintenance:** the warnings "Reset system files", "Format internal storage" and "System deep sleep" exist; what triggers them isn’t documented.

## Sources

- [DP-666 Megatron Mod17 manual](https://www.deepelec.com/files/dp-666/DP-666_UM_EN_Megatron_Mod17.pdf)
- [Mod17 manual in Chinese](https://www.deepelec.com/files/dp-666/DP-666_UM_CN_Megatron_Mod17.pdf)
- [DEEPELEC — Mod16 announcement](https://www.deepelec.com/en/2025/03/09/dp-666-megatron-2-0-15mod16/)
- [PE5PVB — memory channel protocol](https://github.com/PE5PVB/TEF6686_ESP32/blob/main/docs/Memory%20channel%20protocol.pdf)
