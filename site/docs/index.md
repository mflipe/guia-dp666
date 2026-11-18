# DP-666: o guia definitivo

<!--HOME-->

Guia independente, em português. Ele junta o que está espalhado entre os manuais do fabricante, o código dos firmwares, fóruns e testes práticos, e cobre as duas linhas de firmware: o **Megatron** (o de toque, com código fechado) e a **linha oficial do PE5PVB** (código aberto).

<dl class="facts">
<div><dt>Sintonizador</dt><dd>NXP TEF6686</dd></div>
<div><dt>Processador</dt><dd>ESP32-WROOM-32U</dd></div>
<div><dt>Tela</dt><dd>IPS 2,8" · 320×240 · toque</dd></div>
<div><dt>Faixas</dt><dd>FM 65–108 MHz · LW · MW · SW</dd></div>
<div><dt>Bateria</dt><dd>5000 mAh · cerca de 15 h</dd></div>
<div><dt>Conexões</dt><dd>USB-C · SMA · Wi-Fi</dd></div>
</dl>

!!! warning "Antes de mexer no rádio"
    Este guia não tem ligação com a DEEPELEC nem com o projeto do PE5PVB. Gravar firmware, restaurar configurações e testar comandos não documentados pode apagar memórias ou deixar o rádio sem funcionar. Faça sempre o [backup completo](backup.md) antes e siga por sua conta.

## Qual firmware está no meu rádio?

- **Na abertura:** o Megatron mostra o logo da DEEPELEC e a linha "Software Ver2.00.15-Mod17 by Megatron" (o número do mod muda conforme a versão). A linha oficial mostra a própria versão, como v2.20.
- **No menu:** Other settings → System information mostra versão, data de compilação, sintonizador e patch.
- **Pelos recursos:** se o rádio aceita toque na tela e só tem chinês e inglês, é o Megatron. Se o menu tem português, é a linha oficial.

## Versões cobertas

| Linha | Versão analisada | Data |
| --- | --- | --- |
| Megatron | 2.00.15 Mod17 | 05/04/2025 |
| Oficial, pacote da DEEPELEC | v2.20.8 | 21/02/2026 |
| Oficial, código no GitHub | v2.20.12 | 13/11/2026 |

O firmware oficial muda com frequência, então confira a data de cada página.

## Como ler este guia

Cada informação traz a origem quando ela importa:

- (manual): está no manual oficial do Mod17.
- (firmware): vem do pacote, dos textos internos ou do changelog do Mod17. Confirma que o recurso existe, mas nem sempre como funciona.
- (código-base): é o comportamento do PE5PVB v2.00, código do qual o Megatron deriva. O Megatron pode ter mudado.

Nos recursos sem documentação, o grau de certeza aparece assim: ✅, 🟡 (nome claro, funcionamento deduzido) e ❓ (só o nome, função incerta).

## Fontes

- [DEEPELEC DP-666](https://www.deepelec.com/en/dp-666/)
- [Manual DP-666 Megatron Mod17](https://www.deepelec.com/files/dp-666/DP-666_UM_EN_Megatron_Mod17.pdf)
- [PE5PVB/TEF6686_ESP32](https://github.com/PE5PVB/TEF6686_ESP32)
