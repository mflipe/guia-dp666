# Using the radio

Controls, tuning, memory channels and searches on Megatron Mod17. When a behavior comes from the code of PE5PVB v2.00, Megatron’s base, it is marked (base code). For the official firmware, see [Using the official firmware](oficial.md).

## Where everything is

<!--FOTOS3D-->

<div class="fotos">
<figure class="foto foto-larga"><img src="img/dp666-frente.webp" width="1200" height="928" loading="lazy" alt="Front of the radio: speaker on the left and screen on the right; below the screen, BW, MODE and BAND, the numeric keypad with DX and Enter, and the red POWER button. The antenna comes out of the top, near the left side."><figcaption>Front</figcaption></figure>
<figure class="foto foto-larga"><img src="img/dp666-verso.webp" width="1200" height="916" loading="lazy" alt="Back of the radio with the label: FM 65 to 108 MHz, LW 144 to 513 kHz, MW 520 to 1720 kHz (522 to 1791 kHz), SW 1700 to 27000 kHz, 3.7 V 5000 mAh battery and 5 V USB power, up to 1.5 A."><figcaption>Back</figcaption></figure>
<figure class="foto foto-lado"><img src="img/dp666-esquerda.webp" width="327" height="1000" loading="lazy" alt="Left side, top to bottom: BOOT button, marked ESP32 BOOT, headphone jack, LED and USB-C port, marked DC-IN 5V."><figcaption>Left side</figcaption></figure>
<figure class="foto foto-lado"><img src="img/dp666-direita.webp" width="329" height="813" loading="lazy" alt="Right side, top to bottom: TUNING knob, SQL wheel with + at the top and − at the bottom, and VOLUME knob."><figcaption>Right side</figcaption></figure>
<figure class="foto foto-faixa"><img src="img/dp666-topo.webp" width="1200" height="272" loading="lazy" alt="Top of the radio: the SMA antenna connector, marked ANT, near the left side, and a grid of twelve holes next to it."><figcaption>Top, seen from above with the front facing down</figcaption></figure>
<figure class="foto foto-faixa"><img src="img/dp666-fundo.webp" width="1200" height="254" loading="lazy" alt="Bottom of the radio: the main switch, marked Main switch, with ON on the left and OFF on the right, and a grid of twelve holes near the left side."><figcaption>Bottom, seen with the front facing up</figcaption></figure>
</div>

<p class="fotos-credito">Photos: mflipe, under the CC BY 4.0 license.</p>

| Side | What is there |
| --- | --- |
| Front | touchscreen, numeric keypad (0 to 9, DX and Enter), BW, MODE, BAND, POWER and speaker |
| Right side | top to bottom: TUNING, the SQL wheel (+ at the top, − at the bottom) and VOLUME |
| Left side | top to bottom: BOOT (marked ESP32 BOOT), 3.5 mm headphone jack, charging LED and USB-C (marked DC-IN 5V) |
| Top | SMA antenna connector, marked ANT, near the left side, and a grid of twelve holes next to it |
| Back | label with the bands, the battery and the power input |
| Bottom | main switch, marked Main switch: ON toward the left side, OFF toward the right; and a grid of holes below the speaker |

## Physical keypad (firmware)

- **0 to 9:** enter the frequency. The band and the frequency turn green while you type.
- **Enter:** confirms. Outside of entry, it acts like the knob button.
- **DX while typing:** deletes the last digit; a long press clears everything.
- **DX:** switches between entering a frequency and saving a memory channel.
- **Long DX:** starts the DX scan, only on the main screen. Any key cancels.
- **Short 0, outside of entry:** toggles mute.

## Screen and touch

- **Touch areas:** the left half of the signal area opens the shortcuts and the right half opens the menu. The volume adjusts by tapping the halves of the volume area.
- **These open the on-screen keypad:** the frequency, the step bar and the band label.
- **Tappable icons:** MAN/AUTO/MEM, stereo, mute, RDS (opens the advanced view), bandwidth (includes AUTO BW), iMS, EQ, deviation indicator, battery and sleep.
- **Squelch by touch:** tap SQ (it turns green) and turn the knob. Requires Rotary adjust squelch on.
- **Extra gestures (firmware):** tapping the top left corner turns on the still screen; a long press on the clock syncs the time; tapping AUTO on SW turns on the meter bands; on the advanced RDS and AF pages, tapping the bottom half switches between them.
- **Colors (firmware):** a signal from 60 up turns red, from 40 up green and below that yellow. The battery gets a red frame at 3.3 V. With Wi-Fi, the icon shows "wifi" in place of the battery.

## Tuning

- **Steps:** FM accepts 50, 100 or 200 kHz. The bar above the frequency shows the active step; fully off means the default step. In the base code, the knob cycles through the default step, 10 kHz, 100 kHz, 1 MHz and 10 MHz.
- **AUTO:** in the base code, the search stops on a signal with little noise and little multipath, an offset of up to ±8 kHz and above the squelch. Higher sensitivity makes the search more permissive.
- **Bandwidth on FM:** AUTO, 56, 64, 72, 84, 97, 114, 133, 151, 168, 184, 200, 217, 236, 254, 287 and 311 kHz. On AM: 3, 4, 6 and 8 kHz.
- **iMS and EQ:** FM multipath suppression and channel equalization.
- **Squelch (Use squelch):** On, Off or Auto. On On (base code), the minimum is OFF and the maximum becomes "ST", which only opens with a stereo signal. Auto is Megatron’s own algorithm. For weak signals, use Off.
- **MPX output:** Audio output set to MPX delivers the raw multiplex signal, for external decoders. It is not for listening.

## Memory channels

- **Capacity:** 99 positions. Each one stores band, frequency, bandwidth and stereo/mono (base code). There are also names per frequency (My frequency name).
- **Save:** tune in, press MODE until MEM appears, press the knob (MEM turns red), pick the position and press again. A red number means the position is taken; green, free.
- **Recall:** in MEM, turn the knob.
- **Delete one:** on the on-screen keypad, use MEM/Delete in MEM mode, pick the position and confirm (firmware). Try it first on an unimportant position.
- **Arrange stations:** "brokens" are gaps in the list. Only defrag closes the gaps; Defrag and sort also sorts and removes duplicates.

!!! danger "Delete stations erases the whole band"
    Delete stations doesn’t erase a single memory channel. It asks for the band and empties all of its channels. Auto search in Overwrite also overwrites everything. Only a backup gets them back.

- **Band save mode (firmware):** stores the memory channels together (Mixed Save), per band (Save by band) or per time slot (Save by time segment).

## Auto search

- **Options:** save mode, band, samples and hold time, multipath limit, sensitivity (FM from 1 to 15, AM from 1 to 20), Quality or Quantity priority, saved bandwidth, mute and screen off during the search, start channel and SW limits.
- **Save modes:** Overwrite, Append and Continuously append. The third one only shows up in the firmware.
- **"99 Free":** "Free" shows the available positions. In Overwrite, all 99 count as free because they will be overwritten.

### To find stations with less hiss

1. Make a [backup](backup.md) first.
2. Use Append, with the start channel after the last memory channel.
3. Use Quality priority and FM sensitivity between 3 and 5. In the base code, a lower number is more demanding.
4. Use 5 to 10 samples and a hold time of 100 to 200 ms.
5. Keep the screen off and AF off during the search.

## DX scan (Frequency scanning)

- **Options:** band, start and end channel, wait time, Exclude/Only, cancel on Signal, Off or Correct PI, Stay/Break, mute and screen off. The firmware adds Wait on signal only and Hold time.
- **Only (base code):** goes only through the occupied memory channels between the start and the end channel.
- **Exclude (base code):** scans the band step by step, without using the memory channels.
- **Correct PI** stops when it decodes the PI. **Signal** stops when it finds a clean signal.
- The scan doesn’t save anything. Any key or tap cancels it.

## Sources

- [DP-666 Megatron Mod17 manual](https://www.deepelec.com/files/dp-666/DP-666_UM_EN_Megatron_Mod17.pdf)
- [PE5PVB/TEF6686_ESP32](https://github.com/PE5PVB/TEF6686_ESP32)
