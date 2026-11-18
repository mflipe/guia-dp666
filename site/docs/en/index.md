# DEEPELEC DP-666 Guide

<!--HOME-->

An independent guide that brings together what is scattered across the manufacturer’s manuals, the firmware code, forums and hands-on tests, and covers both firmware lines: **Megatron** (the touch one, closed source) and **PE5PVB’s official firmware** (open source).

<dl class="facts">
<div><dt>Tuner</dt><dd>NXP TEF6686</dd></div>
<div><dt>Processor</dt><dd>ESP32-WROOM-32U</dd></div>
<div><dt>Screen</dt><dd>2.8" IPS · 320×240 · touch</dd></div>
<div><dt>Bands</dt><dd>FM 65–108 MHz · LW · MW · SW</dd></div>
<div><dt>Battery</dt><dd>5000 mAh · about 15 h</dd></div>
<div><dt>Connections</dt><dd>USB-C · SMA · Wi-Fi</dd></div>
</dl>

!!! warning "Before you tinker with the radio"
    This guide is not affiliated with DEEPELEC or with PE5PVB’s project. Flashing firmware, restoring settings and testing undocumented commands can erase memory channels or leave the radio not working. Always make a [full backup](backup.md) first and proceed at your own risk.

## Which firmware is on my radio?

- **On the startup screen:** Megatron shows the DEEPELEC logo and the line "Software Ver2.00.15-Mod17 by Megatron" (the mod number changes with the version). The official firmware shows its own version, such as v2.20.
- **In the menu:** Other settings → System information shows the version, build date, tuner and patch.
- **By its features:** if the radio accepts touch on the screen and only has Chinese and English, it is Megatron. If the menu offers 23 languages, Portuguese among them, it is the official firmware.

## Versions covered

| Line | Version analyzed | Date |
| --- | --- | --- |
| Megatron | 2.00.15 Mod17 | Apr 5, 2025 |
| Official, DEEPELEC package | v2.20.8 | Feb 21, 2026 |
| Official, code on GitHub | v2.20.12 | Nov 13, 2026 |

The official firmware changes often, so check the date of each page.

## How to read this guide

Each piece of information shows where it comes from when that matters:

- (manual): it is in the official Mod17 manual.
- (firmware): it comes from the package, the internal strings or the Mod17 changelog. It confirms that the feature exists, but not always how it works.
- (base code): it is the behavior of PE5PVB v2.00, the code Megatron derives from. Megatron may have changed it.

For undocumented features, the degree of certainty shows up like this: ✅, 🟡 (clear name, inferred behavior) and ❓ (name only, uncertain function).

## Sources

- [DEEPELEC DP-666](https://www.deepelec.com/en/dp-666/)
- [DP-666 Megatron Mod17 manual](https://www.deepelec.com/files/dp-666/DP-666_UM_EN_Megatron_Mod17.pdf)
- [PE5PVB/TEF6686_ESP32](https://github.com/PE5PVB/TEF6686_ESP32)
