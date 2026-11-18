# Firmwares: Megatron × oficial

O DP-666 aceita duas linhas de firmware. Trocar de uma para a outra não é uma atualização: muda menus e recursos e zera as configurações.

## As duas linhas

- **Megatron:** firmware de terceiros, com código fechado, focado no toque. Segundo a DEEPELEC, suporta o teclado físico, reduz a interferência da tela, melhora MW e SW e só tem chinês e inglês. Versões publicadas: mod15 (22/10 e 03/11/2024), mod16 (18/02/2025) e mod17 (05/04/2025, com suporte a RTC). Pelos textos internos, foi construído sobre o código do PE5PVB da época da v2.00, de dezembro de 2023.
- **Linha oficial (PE5PVB):** código aberto (GPLv3), com 23 idiomas, entre eles o português. Os pacotes da DEEPELEC vão da v2.11.3 (agosto de 2024) até a v2.20.8 (fevereiro de 2026, com RTC). No GitHub, o código está na v2.20.12, de 13/11/2026.

## Megatron Mod17

### Prós

- **Pontos destacados pela DEEPELEC:** suporte ao teclado físico, menos interferência da tela e melhor escuta em MW e SW.
- **Recursos que a linha oficial não tem:** esquemas de busca automática, planos de recepção com hora para ligar e desligar, memórias por horário (TTM), nomes por frequência, notificações, troca automática de tema e tela estática. Veja [Recursos ocultos do Mod17](mod17.md).

### Contras

- **Código fechado e sem atualizações:** a versão mais nova publicada é a mod17, de 05/04/2025. Em 09/10/2026, um dono de DP-666 perguntou no GitHub onde achar um Megatron mais novo e ficou sem resposta.
- **Idiomas:** só chinês e inglês.
- **Sem recuperação do sintonizador travado:** a linha oficial ganhou essa correção em 13/11/2026 (veja "Tuner: !None!" em [Problemas comuns](problemas.md)).
- **Integrações incertas:** a compatibilidade com o fm-dx-webserver entrou na linha oficial na v2.10, depois da base do Megatron. O Mod17 tem parte desses comandos, mas o uso com XDR-GTK e fm-dx-webserver não foi confirmado.

## Linha oficial (v2.20.x)

### Prós

- **Código aberto e desenvolvimento ativo,** com menu em português.
- **Suporte ao DP-666:** o firmware detecta o teclado sozinho ao ligar, o pacote v2.20.8 trouxe o RTC e em novembro de 2026 entraram várias correções para o teclado.
- **Recursos que o Megatron não tem:** registro de estações (logbook), gravação das memórias pelo PC e suporte declarado a XDR-GTK e fm-dx-webserver.
- **Recuperação do sintonizador travado:** está no código desde 13/11/2026.

### Contras

- **Perde os recursos exclusivos do Megatron.**
- **Outra interface:** telas, menus e áreas de toque mudam, e o toque precisa ser calibrado de novo.
- **Nada migra:** configurações e memórias não passam de um firmware para o outro. Se o Mod17 responder ao comando `s` pelo USB, dá para exportar a lista de memórias antes.
- **Pacote pronto só até a v2.20.8,** de 21/02/2026. As correções posteriores só chegam compilando o código (Arduino IDE ou PlatformIO) ou com um novo pacote.

!!! note "Compilando para o DP-666"
    No código oficial, os padrões do DP-666 (modelo Portable touch, tela girada, sentido do encoder e cores) só vêm se a compilação definir a opção `DEEPELEC_DP_66X`. Sem ela, esses itens precisam ser ajustados à mão depois da gravação. O passo a passo está em [Backup e gravação](backup.md), e o uso no dia a dia em [Uso da linha oficial](oficial.md).

## Como testar sem risco

1. Carregue a bateria e faça o [backup completo do flash](backup.md).
2. Exporte as memórias com o comando `s` pelo USB ou fotografe a lista.
3. Grave o pacote da linha oficial do site da DEEPELEC: chave geral em ON, segure BOOT, aperte POWER e rode o `flash.bat`.
4. Confira se o modelo está em Portable touch (Definições do aparelho), calibre o toque (ligue segurando BW + MODE) e reconfigure o Wi-Fi.
5. Para voltar, grave o backup. O rádio volta exatamente como estava, com o firmware, os ajustes e as memórias de antes.

## Telas dos firmwares

As capturas publicadas pela DEEPELEC têm direitos reservados, e a licença das imagens da wiki do PE5PVB não é explícita. Por isso o guia não as copia: cada item abaixo abre a imagem no site de origem. Não há capturas publicadas da v2.20.12.

<!--REFS:telas-->

## Fontes

- [DEEPELEC DP-666 — firmwares e capturas](https://www.deepelec.com/en/dp-666/)
- [PE5PVB/TEF6686_ESP32](https://github.com/PE5PVB/TEF6686_ESP32)
- [Wiki do TEF6686_ESP32](https://github.com/PE5PVB/TEF6686_ESP32/wiki)
- [PE5PVB — discussão #885](https://github.com/PE5PVB/TEF6686_ESP32/discussions/885)
- [PE5PVB — teclado do DP-666 mais robusto (11/11/2026)](https://github.com/PE5PVB/TEF6686_ESP32/commit/9fadf460892f28f15f4c542a1d6129735b5f1d0d)
- [PE5PVB — correção de detecção do sintonizador (13/11/2026)](https://github.com/PE5PVB/TEF6686_ESP32/commit/6d90a22cefae3f7c9a248cad9f77dc0592b3555d)
- [PE5PVB v2.10 — compatibilidade com o fm-dx-webserver](https://newreleases.io/project/github/PE5PVB/TEF6686_ESP32/release/v2.10)
