# Comparação com outros rádios TEF

O DP-666 não é o melhor em tudo. Para FM e RDS, está entre os melhores portáteis com TEF6686 e tem o melhor suporte de firmware: a linha oficial suporta as teclas do DP-666, e há o Megatron, teclado, toque, Wi-Fi e RTC. O ponto fraco é o AM. Sem antena interna para LW e MW, ele vai bem com fio externo, mas fica bem atrás com a antena telescópica.

## Alternativas

| Rádio | Ponto forte | Atenção |
| --- | --- | --- |
| Qodosen DX-286 | referência para AM e MW portátil, com antena de ferrite interna, chave de LNA, atenuador e chave de antena | sem SSB; muito sensível a interferência dentro de casa |
| ATS125 | TEF6686 com ESP32 em caixa de alumínio, teclado e Bluetooth nos dois sentidos (caixa do celular e envio do áudio para fones) | bateria de 2500 mAh |
| HamGeek NXP-NANO | TEF6686 com ESP32 em formato de bolso, com tela de toque IPS | pouca informação independente disponível |
| TEF6686 em caixa metálica (vários vendedores) | robusto | usuários relatam que a versão "com LNA" não compensa o preço extra |
| Headless TEF Lite (FMDX.org) | STM32 com TEF6687 numa placa de 55×25 mm, para DX de FM pelo computador ou pelo fm-dx-webserver; o TEF6687 tem FMSI e decodificador de RDS melhor | não é portátil, precisa de computador |

## Resumo por uso

- **FM e RDS no dia a dia e em DX:** DP-666.
- **AM portátil sem antena externa:** DX-286.
- **Bluetooth de áudio:** ATS125.
- **FM-DX fixo, pelo computador ou pela internet:** Headless TEF Lite com fm-dx-webserver.
- **SSB (radioamador e utilitárias):** nenhum rádio TEF faz. Só rádios de outro tipo, como o Tecsun PL-330.
- **Evite clones** como o "Sparkelec DP-666" (veja [Problemas comuns](problemas.md)).

## Fontes

- [Blog or Die — DX-286 × DP-666](https://www.blogordie.com/?p=7848)
- [Blog or Die — comparação de dois rádios com TEF6686](https://www.blogordie.com/?p=7748)
- [Qodosen DX-286](https://thewearify.com/?p=166272)
- [ATS125](https://www.fruugo.ie/upgrade-ats125-esp32-65-108mhz-portable-radio-receiver-fmswmwlw-with-nxp-tef6686-chip-dual-mode/p-417769892-881101664)
- [HamGeek NXP-NANO](https://www.passion-radio.com/emergency-radio/97430-3115.html)
- [MediaSpy — The TEF Gang](https://forums.mediaspy.org/t/the-tef-gang/24674?page=13)
- [FMDX.org — Headless TEF Lite](https://fmdx.org/articles/headless-tef-lite-release.php)
- [FMDX — TEF6687](https://pl.fmdx.org/?p=13425)
- [SWLing Post — The Deepelec DP-666](https://swling.com/blog/2026/03/the-deepelec-dp-666-a-very-interesting-radio/)
