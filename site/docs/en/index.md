# DEEPELEC DP-666 Guide

<!--HOME-->

An independent guide to the DP-666 radio with the NXP TEF6686 chip. It brings together what is scattered across the manufacturer’s manuals, the firmware code, forums and hands-on tests, and covers both firmware lines: **Megatron** (the touch one, closed source) and **PE5PVB’s official firmware** (open source).

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

## Full guide

<div class="tiles">
<a href="brasil.md"><strong>Setup for Brazil</strong><span>Deemphasis, extended FM, AM step, time zone and advanced mode.</span></a>
<a href="uso.md"><strong>Using the radio</strong><span>Buttons, keypad, touch, memory channels, auto search and DX scan on Megatron.</span></a>
<a href="oficial.md"><strong>Using the official firmware</strong><span>Buttons, the full menu, the DX scanner and the logbook of PE5PVB’s firmware.</span></a>
<a href="hardware.md"><strong>Hardware</strong><span>Board architecture and the datasheet of each component.</span></a>
<a href="firmwares.md"><strong>Megatron vs. official</strong><span>Differences, pros and cons and how to test without risk.</span></a>
<a href="computador.md"><strong>Using it with a computer</strong><span>Control with XDR-GTK, RDS in RDS Spy, the radio in a browser and the logbook, step by step.</span></a>
<a href="mod17.md"><strong>Hidden features of Mod17</strong><span>Options, pages and commands the manual doesn’t show.</span></a>
<a href="problemas.md"><strong>Common problems</strong><span>"Tuner: !None!", a clock running fast, a silent speaker and more.</span></a>
</div>

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
