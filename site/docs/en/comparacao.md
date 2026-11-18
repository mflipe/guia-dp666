# Comparison with other TEF radios

The DP-666 is not the best at everything. For FM and RDS, it is among the best portables with the TEF6686 and has the best firmware support: the official firmware supports the DP-666 keys, and there is Megatron, a keypad, touch, Wi-Fi and an RTC. Its weak spot is AM. With no internal antenna for LW and MW, it does well with an external wire, but falls well behind with the telescopic antenna.

## Alternatives

| Radio | Strength | Watch out for |
| --- | --- | --- |
| Qodosen DX-286 | the reference for portable AM and MW, with an internal ferrite antenna, LNA switch, attenuator and antenna switch | no SSB; very sensitive to indoor interference |
| ATS125 | TEF6686 with ESP32 in an aluminum case, keypad and two-way Bluetooth (phone speaker and sending audio to headphones) | 2500 mAh battery |
| HamGeek NXP-NANO | TEF6686 with ESP32 in a pocket format, with an IPS touchscreen | little independent information available |
| TEF6686 in a metal case (several sellers) | sturdy | users report that the "with LNA" version isn’t worth the extra cost |
| Headless TEF Lite (FMDX.org) | STM32 with a TEF6687 on a 55×25 mm board, for FM DX from a computer or with fm-dx-webserver; the TEF6687 has FMSI and a better RDS decoder | not portable, needs a computer |

## Summary by use

- **FM and RDS day to day and for DX:** DP-666.
- **Portable AM without an external antenna:** DX-286.
- **Bluetooth audio:** ATS125.
- **Fixed FM-DX, from a computer or over the internet:** Headless TEF Lite with fm-dx-webserver.
- **SSB (amateur and utility):** no TEF radio does it. Only radios of another type, such as the Tecsun PL-330.
- **Avoid clones** such as the "Sparkelec DP-666" (see [Clones](#ajuda--clones), under Common problems).

## Sources

- [Blog or Die — DX-286 vs. DP-666](https://www.blogordie.com/?p=7848)
- [Blog or Die — comparison of two TEF6686 radios](https://www.blogordie.com/?p=7748)
- [Qodosen DX-286](https://thewearify.com/?p=166272)
- [ATS125](https://www.fruugo.ie/upgrade-ats125-esp32-65-108mhz-portable-radio-receiver-fmswmwlw-with-nxp-tef6686-chip-dual-mode/p-417769892-881101664)
- [HamGeek NXP-NANO](https://www.passion-radio.com/emergency-radio/97430-3115.html)
- [MediaSpy — The TEF Gang](https://forums.mediaspy.org/t/the-tef-gang/24674?page=13)
- [FMDX.org — Headless TEF Lite](https://fmdx.org/articles/headless-tef-lite-release.php)
- [FMDX — TEF6687](https://pl.fmdx.org/?p=13425)
- [SWLing Post — The Deepelec DP-666](https://swling.com/blog/2026/03/the-deepelec-dp-666-a-very-interesting-radio/)
