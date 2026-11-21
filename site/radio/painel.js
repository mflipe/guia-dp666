/* Rádio virtual: o painel que o guia abre por cima de qualquer página (e que pode ser minimizado) e a página
   inteira de radio/index.html. RadioVirtual.montar(caixa, opcoes) monta tudo dentro de caixa; o desenho da tela
   fica em radio.js (TelaRadio) e as fontes, os textos do firmware e as cores dos temas, em dados.json.

   As emissoras são reais, de São Paulo (capital), nas frequências delas, guardadas nas memórias 1 a 10. O som vem
   da transmissão online de cada uma, achada no Radio Browser (diretório aberto de rádios na internet,
   https://www.radio-browser.info). O sinal, a modulação e o RDS (PS, PTY, RT e PI) são simulados, só para
   ilustrar: a transmissão pela internet não traz essas informações. Os ajustes são os do menu Display settings
   do firmware, mais o sublinhado do RDS settings, com os nomes e valores do menu (em inglês, como no rádio).

   Os textos do painel estão em TEXTOS, em português e em inglês; o idioma vem de quem monta. Os ajustes e a
   emissora ficam guardados no navegador (dp666.radio), e os endereços das transmissões, por três dias
   (dp666.radio.streams). */
(function (raiz) {
  "use strict";

  var TEXTOS = {
    pt: {
      titulo: "Rádio virtual",
      lead: "A tela do DP-666 com o Megatron Mod17 e dez emissoras de São Paulo pela internet. Troque de emissora e mude os ajustes de tela: o efeito aparece na hora, sem abrir menu.",
      minimizar: "Minimizar o rádio", fechar: "Fechar o rádio", abrir: "Abrir o rádio virtual",
      anterior: "Emissora anterior", proxima: "Próxima emissora",
      memoria: "{f} MHz · memória {m} de {n}",
      somLigar: "Ligar o som", somDesligar: "Desligar o som", somDesligado: "Som desligado.",
      procurando: "Procurando a transmissão da {nome}…", conectando: "Conectando à {nome}…",
      tocando: "Tocando a {nome} pela internet.", semResposta: "A transmissão da {nome} não respondeu agora.",
      naoAchei: "Não achei a transmissão da {nome} agora.",
      dicaToque: "Toque na tela, como no rádio: no {rds}, abre as telas de RDS; no {relogio}, troca entre a hora, a data e o PI.",
      rds: "RDS", relogio: "relógio",
      codigos: "O que cada marca e mensagem da tela quer dizer: {link}.", codigosLink: "Mensagens e códigos da tela",
      codigosAncora: "uso--mensagens-e-códigos-da-tela",
      aviso: "O sinal (S), a modulação (M) e o RDS são simulados, só para ilustrar: a transmissão pela internet não traz essas informações.",
      pausar: "Pausar animação", retomar: "Retomar animação",
      ajustesIntro: "Os ajustes de tela do rádio, na ordem e com os nomes do menu.",
      dicaIdioma: "Muda o nome do tipo de programa (PTY) e os avisos das telas de RDS.",
      dicaProtecao: "Conta o tempo sem tocar na página. Um toque acorda a tela.",
      dicaRelogio: "Off mostra o PI no lugar do relógio. Tocar no relógio da tela também troca.",
      semCores: "Sem cores conhecidas",
      telas: { principal: "Tela principal do rádio", rds: "Tela do RDS avançado do rádio", af: "Lista de AF do rádio", eon: "Lista de EON do rádio" },
      rt: "{nome} {f} MHz - ao vivo pela internet no rádio virtual do guia DP-666",
      notas: [
        "Posições, fontes e textos vêm do código do firmware (PE5PVB/TEF6686_ESP32, GPL-3.0); as cores do Essence e as telas do Mod17 foram conferidas em fotos. Os outros temas usam as cores do código e podem diferir do rádio; Chinese Red e Retro ficam de fora até termos uma foto deles. Simplified Chinese não está entre os idiomas: com ele, o firmware troca a fonte da tela inteira.",
        "As emissoras são de São Paulo, nas frequências delas. O som é a transmissão online de cada uma, achada no diretório aberto {radiobrowser}; quando uma transmissão não responde, o rádio tenta outra da mesma emissora. O PS, o PTY, o RT e o PI saem do nome e da frequência de cada emissora; o que não cabe na tela corre para o lado, como o RT no rádio.",
        "No lugar do logo do RDS, que é marca registrada, aparece a palavra RDS."
      ]
    },
    en: {
      titulo: "Virtual radio",
      lead: "The DP-666 screen with Megatron Mod17 and ten São Paulo stations over the internet. Switch stations and change the display settings: the effect shows right away, without opening a menu.",
      minimizar: "Minimize the radio", fechar: "Close the radio", abrir: "Open the virtual radio",
      anterior: "Previous station", proxima: "Next station",
      memoria: "{f} MHz · memory {m} of {n}",
      somLigar: "Turn sound on", somDesligar: "Turn sound off", somDesligado: "Sound off.",
      procurando: "Looking for the {nome} stream…", conectando: "Connecting to {nome}…",
      tocando: "Playing {nome} over the internet.", semResposta: "The {nome} stream isn’t responding right now.",
      naoAchei: "Couldn’t find the {nome} stream right now.",
      dicaToque: "Tap the screen, as on the radio: {rds} opens the RDS screens; the {relogio} switches between time, date and PI.",
      rds: "RDS", relogio: "clock",
      codigos: "What each mark and message on the screen means: {link}.", codigosLink: "Screen messages and codes",
      codigosAncora: "uso--screen-messages-and-codes",
      aviso: "Signal (S), modulation (M) and RDS are simulated, for illustration only: the internet stream doesn’t carry this information.",
      pausar: "Pause animation", retomar: "Resume animation",
      ajustesIntro: "The radio’s display settings, in menu order and with the menu’s names.",
      dicaIdioma: "Changes the program type (PTY) name and the messages on the RDS screens.",
      dicaProtecao: "Counts the time without touching the page. A tap wakes the screen.",
      dicaRelogio: "Off shows the PI instead of the clock. Tapping the clock on the screen also switches it.",
      semCores: "Colors not known yet",
      telas: { principal: "Radio main screen", rds: "Radio advanced RDS screen", af: "Radio AF list", eon: "Radio EON list" },
      rt: "{nome} {f} MHz - live over the internet on the DP-666 guide’s virtual radio",
      notas: [
        "Positions, fonts and texts come from the firmware code (PE5PVB/TEF6686_ESP32, GPL-3.0); the Essence colors and the Mod17 screens were checked against photos. The other themes use the colors from the code and may differ from the radio; Chinese Red and Retro are left out until we have a photo of them. Simplified Chinese isn’t among the languages: with it, the firmware swaps the font of the whole screen.",
        "The stations are from São Paulo, on their own frequencies. The sound is each station’s online stream, found in the open {radiobrowser} directory; when a stream doesn’t respond, the radio tries another one for the same station. PS, PTY, RT and PI come from each station’s name and frequency; text that doesn’t fit scrolls sideways, like the RT on the radio.",
        "Instead of the RDS logo, a registered trademark, the word RDS appears."
      ]
    }
  };

  // frequência (em dezenas de kHz), nome, PS de 8 letras, código do tipo de programa (PTY) e o termo de busca
  var EMISSORAS = [
    [9050, "CBN São Paulo", "CBN SP", 1, "CBN"],
    [9250, "Kiss FM", "KISS FM", 11, "Kiss FM"],
    [9370, "Rádio USP", "USP FM", 7, "USP"],
    [9470, "Antena 1", "ANTENA 1", 12, "Antena 1"],
    [9610, "Band FM", "BAND FM", 10, "Band FM"],
    [9690, "BandNews FM", "BANDNEWS", 1, "BandNews"],
    [10090, "Jovem Pan FM", "JOVEMPAN", 10, "Jovem Pan"],
    [10170, "Alpha FM", "ALPHA FM", 12, "Alpha FM"],
    [10330, "Rádio Cultura FM", "CULTURA", 14, "Cultura FM"],
    [10630, "Mix FM", "MIX FM", 10, "Mix FM"]
  ].map(function (e, i) {
    // o PI também é simulado: sai da frequência, em hexadecimal
    return { freq: e[0], nome: e[1], ps: e[2], pty: e[3], busca: e[4], mem: i + 1, pi: ("000" + (e[0] / 10).toString(16).toUpperCase()).slice(-4) };
  });
  var SERVIDORES = ["https://de1.api.radio-browser.info", "https://nl1.api.radio-browser.info", "https://at1.api.radio-browser.info", "https://de2.api.radio-browser.info"];
  var DIAS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var GUARDA = "dp666.radio", STREAMS = "dp666.radio.streams";

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function preencher(t, v) { return t.replace(/\{(\w+)\}/g, function (m, k) { return Object.prototype.hasOwnProperty.call(v, k) ? v[k] : m; }); }
  function ler(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function gravar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* armazenamento indisponível */ } }
  function sorteio(n, k) { var x = Math.sin(n * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); }
  function dois(n) { return (n < 10 ? "0" : "") + n; }
  var SETA_E = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var SETA_D = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ICONES = {
    min: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 13h12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    fechar: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    som: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" fill="currentColor"/><path class="rv-onda" d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path class="rv-mudo" d="M15.5 9.5l5 5M20.5 9.5l-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
  };

  /* monta o rádio dentro de caixa. op: lingua ("pt" ou "en"), base (pasta de dados.json), modo ("painel", com
     minimizar e fechar, ou "pagina") e aoMudar(estado), chamada quando o painel abre, minimiza ou fecha */
  function montar(caixa, op) {
    op = op || {};
    var T = TEXTOS[op.lingua] || TEXTOS.pt, ehPainel = op.modo !== "pagina", sep = op.lingua === "en" ? "." : ",";
    function mhz(f) { return (f / 100).toFixed(1).replace(".", sep); }

    // o que a tela mostra: a emissora numa memória, com estéreo e RDS; tela é "principal", "rds", "af" ou "eon"
    var estado = {
      tela: "principal", freq: EMISSORAS[0].freq, banda: "FM", modo: "mem", memoria: 1, passo: 0, fonte: "Comic", bw: 236, bwAuto: true,
      ims: true, eq: true, estereo: true, offset: 0, squelchCorta: false, rds: true, rdsOk: true, pty: "", ps: "", pi: "", fala: false,
      rtAB: false, qualidade: 4, sinal: 600, unidade: "dBuV", cn: 36, mod: 40, pico: 60, modulacao: true, relogioModo: "hora",
      hora: "", data: "", bateria: "porcentagem", carga: 73, wifi: false, sublinhado: "sim", avisos: null
    };
    // os ajustes que ficam fora do desenho: tema, idioma, brilho, protetor de tela (segundos e modo) e a animação
    var ajustes = { tema: "Essence", idioma: "English", brilho: 100, protecao: 0, protecaoModo: "1", animar: true };
    var guardado = ler(GUARDA, {}) || {};
    ["tema", "idioma", "brilho", "protecao", "protecaoModo", "animar"].forEach(function (k) { if (guardado[k] !== undefined) ajustes[k] = guardado[k]; });
    ["fonte", "unidade", "modulacao", "relogioModo", "bateria", "sublinhado"].forEach(function (k) { if (guardado[k] !== undefined) estado[k] = guardado[k]; });
    var indice = Math.max(0, Math.min(EMISSORAS.length - 1, guardado.indice | 0));
    var base = 60, rtTexto = "", tela = null, dados = null, situacao = ehPainel ? "fechado" : "aberto", laco = 0, parado = false, el = {};
    function guardar() {
      gravar(GUARDA, {
        indice: indice, tema: ajustes.tema, idioma: ajustes.idioma, brilho: ajustes.brilho, protecao: ajustes.protecao, protecaoModo: ajustes.protecaoModo,
        animar: ajustes.animar, fonte: estado.fonte, unidade: estado.unidade, modulacao: estado.modulacao, relogioModo: estado.relogioModo,
        bateria: estado.bateria, sublinhado: estado.sublinhado
      });
    }

    // ---------------------------------------------------------------- o HTML
    function grupo(titulo, id, dica) {
      return '<fieldset class="rv-campo"><legend>' + titulo + '</legend><div class="rv-opcoes" data-ajuste="' + id + '"></div>' +
        (dica ? '<p class="rv-dica">' + esc(dica) + "</p>" : "") + "</fieldset>";
    }
    // no guia, a seção está na mesma página; na página do rádio, no guia do idioma, uma pasta acima
    var hrefCodigos = (ehPainel ? "" : op.lingua === "en" ? "../en/" : "../") + "#" + T.codigosAncora;
    var dicaCodigos = preencher(esc(T.codigos), { link: '<a href="' + esc(hrefCodigos) + '" data-acao="codigos">' + esc(T.codigosLink) + "</a>" });
    var dicaToque = preencher(esc(T.dicaToque), {
      rds: '<button type="button" class="rv-link" data-toque="rds">' + esc(T.rds) + "</button>",
      relogio: '<button type="button" class="rv-link" data-toque="relogio">' + esc(T.relogio) + "</button>"
    });
    caixa.innerHTML =
      '<div class="rv" data-modo="' + (ehPainel ? "painel" : "pagina") + '">' +
      (ehPainel ? '<div class="rv-topo"><h2 class="rv-titulo" tabindex="-1">' + esc(T.titulo) + "</h2>" +
        '<button type="button" class="rv-ico" data-acao="minimizar" aria-label="' + esc(T.minimizar) + '">' + ICONES.min + "</button>" +
        '<button type="button" class="rv-ico" data-acao="fechar" aria-label="' + esc(T.fechar) + '">' + ICONES.fechar + "</button></div>" : "") +
      '<div class="rv-fixo"><div class="rv-visor"><canvas class="rv-tela" width="320" height="240" role="img" aria-label="' + esc(T.telas.principal) + '"></canvas></div>' +
      '<div class="rv-troca"><button type="button" class="rv-seta" data-acao="anterior" aria-label="' + esc(T.anterior) + '">' + SETA_E + "</button>" +
      '<p class="rv-emissora" aria-live="polite"><strong></strong><span></span></p>' +
      '<button type="button" class="rv-seta" data-acao="proxima" aria-label="' + esc(T.proxima) + '">' + SETA_D + "</button></div></div>" +
      '<div class="rv-corpo">' +
      '<div class="rv-som"><button type="button" class="rv-botao" data-acao="som" aria-pressed="false">' + esc(T.somLigar) + '</button><p class="rv-som-info" aria-live="polite">' + esc(T.somDesligado) + "</p></div>" +
      '<p class="rv-nota">' + dicaToque + "</p>" +
      '<p class="rv-nota">' + dicaCodigos + "</p>" +
      '<p class="rv-nota">' + esc(T.aviso) + ' <button type="button" class="rv-link" data-acao="animacao">' + esc(ajustes.animar ? T.pausar : T.retomar) + "</button></p>" +
      '<section class="rv-ajustes"><h3>Display settings</h3><p class="rv-intro">' + esc(T.ajustesIntro) + "</p>" +
      '<div class="rv-campo"><label for="rv-idioma">Language</label><select id="rv-idioma"></select><p class="rv-dica">' + esc(T.dicaIdioma) + "</p></div>" +
      '<fieldset class="rv-campo"><legend>Display brightness <span class="rv-brilho-v"></span></legend><input type="range" class="rv-brilho" min="1" max="100" aria-label="Display brightness"></fieldset>' +
      grupo("Modulation meter", "mod") + grupo("Screensaver", "protecao", T.dicaProtecao) + grupo("Screensaver options", "protecaoModo") +
      grupo("Battery options", "bateria") + grupo("Signalmeter unit", "unidade") + grupo("Show clock", "relogio", T.dicaRelogio) +
      grupo("Theme", "tema") + grupo("Frequency font", "fonte") +
      "<h3>RDS settings</h3>" + grupo("Show underscore in RDS", "sub") + "</section>" +
      '<div class="rv-notas">' + T.notas.map(function (n) {
        return "<p>" + preencher(esc(n), { radiobrowser: '<a href="https://www.radio-browser.info">Radio Browser</a>' }) + "</p>";
      }).join("") + "</div></div>" +
      (ehPainel ? '<div class="rv-mini" hidden><button type="button" class="rv-mini-abrir" data-acao="abrir" aria-label="' + esc(T.abrir) + '"><span class="rv-mini-tela"></span>' +
        '<span class="rv-mini-t"><strong></strong><span></span></span></button>' +
        '<button type="button" class="rv-ico rv-mini-som" data-acao="som" aria-pressed="false" aria-label="' + esc(T.somLigar) + '">' + ICONES.som + "</button>" +
        '<button type="button" class="rv-ico" data-acao="proxima" aria-label="' + esc(T.proxima) + '">' + SETA_D + "</button>" +
        '<button type="button" class="rv-ico" data-acao="fechar" aria-label="' + esc(T.fechar) + '">' + ICONES.fechar + "</button></div>" : "") +
      "</div>";
    var rv = caixa.querySelector(".rv");
    function q(s) { return rv.querySelector(s); }
    function qq(s) { return Array.prototype.slice.call(rv.querySelectorAll(s)); }
    el = { visor: q(".rv-visor"), mini: q(".rv-mini"), miniTela: q(".rv-mini-tela"), info: q(".rv-som-info"), titulo: q(".rv-titulo") };

    function relogio() {
      var d = new Date();
      estado.hora = dois(d.getHours()) + ":" + dois(d.getMinutes()) + ":" + dois(d.getSeconds());
      estado.data = d.getFullYear() + "-" + dois(d.getMonth() + 1) + "-" + dois(d.getDate()) + "  " + DIAS[d.getDay()];
    }
    function nomePTY(em) { return (dados.pty[ajustes.idioma] || dados.pty.English)[em.pty]; }

    // ---------------------------------------------------------------- o som: a transmissão online da emissora
    var som = (function () {
      var audio = new Audio(), ligado = false, cache = ler(STREAMS, {}) || {}, vez = 0, pendentes = {};
      audio.preload = "none";
      function avisar(t) { el.info.textContent = t; }
      // nota de cada resultado do diretório: vale mais o que cita a frequência ou São Paulo, vale menos outra cidade
      function nota(s, em) {
        var txt = (s.name + " " + s.state + " " + s.tags).toLowerCase(), f = (em.freq / 100).toFixed(1), p = 0;
        if (txt.indexOf(f) >= 0 || txt.indexOf(f.replace(".", ",")) >= 0) p += 6;
        if (/s[ãa]o paulo|\bsp\b|sampa/.test(txt)) p += 4;
        if (s.name.toLowerCase().indexOf(em.busca.toLowerCase()) === 0) p += 2;
        if (/news/.test(s.name.toLowerCase()) && !/news/.test(em.busca.toLowerCase())) p -= 8;
        if (/rio de janeiro|curitiba|bras[íi]lia|porto alegre|recife|salvador|fortaleza|belo horizonte|goi[âa]nia|campinas|santos|ribeir[ãa]o|vit[óo]ria|florian/.test(txt)) p -= 5;
        return p + Math.log(1 + (s.clickcount || 0)) / 3;
      }
      // as três transmissões https mais prováveis da emissora, guardadas por três dias
      function procurar(em) {
        var k = String(em.freq);
        if (cache[k] && Date.now() - cache[k].t < 3 * 864e5) return Promise.resolve(cache[k]);
        if (pendentes[k]) return pendentes[k];  // uma busca por emissora de cada vez
        var qs = "/json/stations/search?countrycode=BR&hidebroken=true&order=clickcount&reverse=true&limit=60&name=" + encodeURIComponent(em.busca);
        var tenta = function (i) {
          if (i >= SERVIDORES.length) return Promise.reject(new Error("diretório fora do ar"));
          var ac = window.AbortController ? new AbortController() : null, timer = setTimeout(function () { if (ac) ac.abort(); }, 7000);
          return fetch(SERVIDORES[i] + qs, ac ? { signal: ac.signal } : {})
            .then(function (r) { clearTimeout(timer); if (!r.ok) throw new Error(r.status); return r.json(); })
            .catch(function () { clearTimeout(timer); return tenta(i + 1); });
        };
        return (pendentes[k] = tenta(0).then(function (lista) {
          var ok = lista.filter(function (s) { return /^https:\/\//.test(s.url_resolved || ""); })
            .map(function (s) { return { s: s, n: nota(s, em) }; }).sort(function (a, b) { return b.n - a.n; }).slice(0, 3);
          if (!ok.length) throw new Error("sem transmissão https");
          cache[k] = { t: Date.now(), urls: ok.map(function (o) { return o.s.url_resolved; }), nome: ok[0].s.name };
          gravar(STREAMS, cache);
          return cache[k];
        }).finally(function () { delete pendentes[k]; }));
      }
      // toca a transmissão; se ela falha, tenta a próxima da mesma emissora
      function tocar(em, tentativa) {
        var minha = ++vez, n = tentativa || 0;
        var comeca = function (c) {
          if (minha !== vez || !ligado) return;
          var url = c.urls[n];
          if (!url) { avisar(preencher(T.semResposta, { nome: em.nome })); return; }
          audio.onplaying = function () { if (minha === vez) avisar(preencher(T.tocando, { nome: em.nome })); };
          audio.onerror = function () { if (minha === vez && ligado) tocar(em, n + 1); };
          audio.src = url;
          avisar(preencher(T.conectando, { nome: em.nome }));
          var p = audio.play();
          if (p && p.catch) p.catch(function (e) { if (minha === vez && e && e.name !== "AbortError") tocar(em, n + 1); });
        };
        var c = cache[String(em.freq)];
        if (c && Date.now() - c.t < 3 * 864e5) comeca(c);
        else {
          avisar(preencher(T.procurando, { nome: em.nome }));
          procurar(em).then(comeca, function () { if (minha === vez) avisar(preencher(T.naoAchei, { nome: em.nome })); });
        }
      }
      function trocar(em) { if (ligado) { audio.pause(); tocar(em); } }
      function ligar(liga, em) {
        ligado = liga;
        if (liga) {
          // toca um silêncio no próprio toque, que destrava o áudio no iPhone, e procura as outras emissoras em segundo plano
          audio.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
          var p = audio.play(); if (p && p.catch) p.catch(function () {});
          tocar(em);
          EMISSORAS.reduce(function (pr, x) { return pr.then(function () { return procurar(x).catch(function () {}); }); }, Promise.resolve());
        } else {
          vez++; audio.pause(); audio.removeAttribute("src"); audio.load();  // para também o download da transmissão
          avisar(T.somDesligado);
        }
        qq('[data-acao="som"]').forEach(function (b) {
          b.setAttribute("aria-pressed", String(liga));
          if (b.classList.contains("rv-ico")) b.setAttribute("aria-label", liga ? T.somDesligar : T.somLigar); else b.textContent = liga ? T.somDesligar : T.somLigar;
        });
      }
      return { ligar: ligar, trocar: trocar, ligado: function () { return ligado; } };
    })();

    // troca de emissora em círculo: depois da última vem a primeira
    function sintonizar(i) {
      var n = EMISSORAS.length;
      indice = (i % n + n) % n;
      var em = EMISSORAS[indice];
      estado.freq = em.freq; estado.memoria = em.mem; estado.ps = em.ps; estado.pty = nomePTY(em); estado.pi = em.pi;
      estado.fala = em.pty === 1;  // notícias: a marca de fala (S) acesa; o resto, a de música (M)
      base = 52 + Math.round(sorteio(em.freq, 2) * 18);
      estado.sinal = base * 10; estado.cn = Math.round(base * 0.62 - 1); estado.qualidade = base > 62 ? 4 : 3; desvio = 0;
      rtTexto = preencher(T.rt, { nome: em.nome, f: mhz(em.freq) });
      var linha = preencher(T.memoria, { f: mhz(em.freq), m: em.mem, n: n });
      qq(".rv-emissora strong, .rv-mini-t strong").forEach(function (s) { s.textContent = em.nome; });
      qq(".rv-emissora span, .rv-mini-t span").forEach(function (s) { s.textContent = linha; });
      som.trocar(em);
      guardar();
    }

    /* PTY, PS e RT que não cabem correm para a esquerda, como o RT no firmware: 1 pixel a cada 15 ms, parando 1 s no
       começo de cada volta. As larguras são as do firmware, na tela principal e na do RDS avançado */
    var VELOCIDADE = 1 / 15, LARGURA = { principal: { pty: 174, ps: 150, rt: 270 }, rds: { pty: 174, ps: 150, rt: 165 } };
    var letreiros = {};
    function letreiro(campo) {
      var tl = estado.tela === "rds" ? "rds" : "principal", txt = campo === "pty" ? estado.pty : campo === "ps" ? estado.ps : rtTexto;
      // o sublinhado troca os espaços do PS e do RT (que vêm do RDS), não os do nome do PTY (que vem do idioma)
      if (campo !== "pty" && (estado.sublinhado === "sim" || (estado.sublinhado === "ps" && campo === "ps"))) txt = txt.replace(/ /g, "_");
      var chave = [tl, txt].join("|"), L = letreiros[campo];
      if (!L || L.chave !== chave) {
        // texto novo: começa do início, parado por 1 s
        var f = tela.f[campo === "ps" ? 28 : 16], cabe = f.largura(txt) < LARGURA[tl][campo], volta = txt + "      ";
        L = letreiros[campo] = { chave: chave, texto: cabe ? txt : volta, x: 0, largura: cabe ? 0 : f.largura(volta), espera: 1000 };
      }
      return L;
    }
    function correr(dt) {
      ["pty", "ps", "rt"].forEach(function (k) {
        var L = letreiro(k);
        if (!L.largura) return;
        if (L.espera > 0) { L.espera -= dt; return; }
        L.x -= dt * VELOCIDADE;
        if (L.x <= -L.largura) { L.x = 0; L.espera = 1000; }
      });
    }

    /* os medidores, só para ilustrar: S varia pouco (cerca de 1,5 dB em volta do nível da emissora) e M varia
       bastante, como o áudio, subindo rápido nos picos e descendo mais devagar. O pico fica parado 1 s e depois desce
       3 segmentos a cada 20 ms, como no firmware (aqui, 9 segmentos, ou 11,6%, a cada passo de 60 ms) */
    var desvio = 0, segura = 0;
    function medidores() {
      desvio += (Math.random() - 0.5) * 0.6 - desvio * 0.1;
      var dbuv = base + desvio;
      estado.sinal = Math.round(dbuv * 10);
      estado.cn = Math.max(0, Math.round(dbuv * 0.62 - 1));
      var alvo = Math.random() < 0.3 ? 5 + Math.random() * 25 : 50 + Math.random() * 55;  // pausas curtas entre os trechos fortes
      estado.mod += (alvo - estado.mod) * (alvo > estado.mod ? 0.8 : 0.55);
      if (estado.mod >= estado.pico) { estado.pico = estado.mod; segura = 1000; }
      else if (segura > 0) segura -= 60;
      else estado.pico = Math.max(estado.mod, estado.pico - 11.6);
    }

    // o laço da tela: só roda com o rádio à vista (aberto ou minimizado)
    var ult = 0, acc = 0, ultRelogio = 0;
    function quadro(t) {
      laco = 0;
      if (situacao === "fechado" || parado) return;
      var dt = ult ? Math.min(100, t - ult) : 16;
      ult = t;
      if (ajustes.animar) {
        acc += dt;
        while (acc >= 60) { acc -= 60; medidores(); }
        correr(dt);
      }
      if (t - ultRelogio >= 250) { ultRelogio = t; relogio(); }
      tela.desenhar(estado, dados.temas[ajustes.tema], { pty: letreiro("pty"), ps: letreiro("ps"), rt: letreiro("rt") });
      laco = requestAnimationFrame(quadro);
    }
    function rodar() { if (!laco && tela) { ult = 0; laco = requestAnimationFrame(quadro); } }

    /* os toques na tela, como no Mod17: no RDS da barra de cima, abre a tela do RDS avançado; nela e nas listas de AF
       e EON, cada toque vai para a próxima, e depois da EON volta à principal; no canto do relógio, troca entre a
       hora, a data com a hora e o PI */
    var CICLO_RELOGIO = { hora: "completo", completo: "pi", pi: "hora" };
    function mudarTela(nova) {
      estado.tela = nova;
      tela.cv.setAttribute("aria-label", T.telas[nova]);
    }
    function mudarRelogio(modo) {
      estado.relogioModo = modo;
      marcar("relogio", modo);
      guardar();
    }
    function tocar(qual) {
      if (qual === "rds") mudarTela(estado.tela === "principal" ? "rds" : { rds: "af", af: "eon", eon: "principal" }[estado.tela]);
      else if (qual === "relogio") {
        if (estado.tela !== "principal") mudarTela("principal");
        mudarRelogio(CICLO_RELOGIO[estado.relogioModo]);
      }
    }
    function alvo(ev) {
      if (situacao === "minimizado") return null;
      var r = tela.cv.getBoundingClientRect(), x = (ev.clientX - r.left) * 320 / r.width, y = (ev.clientY - r.top) * 240 / r.height;
      if (estado.tela !== "principal") return "rds";
      if (x >= 112 && x <= 166 && y <= 34) return "rds";
      if (x >= 210 && y >= 180 && y <= 217) return "relogio";
      return null;
    }

    /* brilho como o firmware: o backlight vai de 15 a 255 (de 255) conforme o ajuste de 1 a 100%. O protetor de tela
       apaga a tela ou baixa o brilho para 1%, 25% ou 50% do ajuste depois de alguns segundos sem mexer nos controles;
       aqui conta o tempo sem tocar na página, e qualquer toque acorda a tela */
    var protegida = false, timerProtecao = 0;
    function aplicarBrilho() {
      var v = ajustes.brilho, f;
      if (protegida && ajustes.protecaoModo === "0") f = 0;
      else {
        if (protegida) v = Math.floor(v / { "1": 100, "2": 4, "3": 2 }[ajustes.protecaoModo]);
        f = (15 + 2.4 * v) / 255;
      }
      tela.cv.style.filter = f > 0.999 ? "" : "brightness(" + f.toFixed(3) + ")";
    }
    function acordar() {
      clearTimeout(timerProtecao);
      if (protegida) { protegida = false; aplicarBrilho(); }
      if (ajustes.protecao && situacao !== "fechado") timerProtecao = setTimeout(function () { protegida = true; aplicarBrilho(); }, ajustes.protecao * 1000);
    }

    // ---------------------------------------------------------------- aberto, minimizado e fechado (só no painel)
    function mostrar(nova) {
      if (!ehPainel || nova === situacao) return;
      var antes = situacao;
      situacao = nova;
      caixa.hidden = nova === "fechado";
      caixa.setAttribute("data-estado", nova);
      rv.setAttribute("data-estado", nova);
      if (el.mini) el.mini.hidden = nova !== "minimizado";
      // a mesma tela vai para a barra minimizada e volta
      if (tela) (nova === "minimizado" ? el.miniTela : el.visor).appendChild(tela.cv);
      if (nova === "fechado") {
        if (som.ligado()) som.ligar(false, EMISSORAS[indice]);
        clearTimeout(timerProtecao);
        if (estado.tela !== "principal") mudarTela("principal");
      } else { rodar(); acordar(); }
      if (op.aoMudar) op.aoMudar(nova, antes);
    }

    // ---------------------------------------------------------------- os ajustes
    function marcar(id, v) {
      qq('[data-ajuste="' + id + '"] button').forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-v") === String(v))); });
    }
    function opcoes(id, lista, atual, fn, desligados) {
      var box = q('[data-ajuste="' + id + '"]');
      box.innerHTML = lista.map(function (o) {
        var v = Array.isArray(o) ? o[0] : o, r = Array.isArray(o) ? o[1] : o, off = desligados && desligados.indexOf(v) >= 0;
        return '<button type="button" data-v="' + esc(v) + '" aria-pressed="' + (String(v) === String(atual)) + '"' + (off ? ' disabled title="' + esc(T.semCores) + '"' : "") + ">" + esc(r) + "</button>";
      }).join("");
      box.addEventListener("click", function (ev) {
        var b = ev.target.closest("button");
        if (!b || b.disabled) return;
        marcar(id, b.getAttribute("data-v"));
        fn(b.getAttribute("data-v"));
        guardar();
      });
    }

    function iniciar(d) {
      dados = d;
      var cv = q(".rv-tela");
      tela = new raiz.TelaRadio(cv, d);
      if (!d.temas[ajustes.tema]) ajustes.tema = "Essence";
      if (!d.pty[ajustes.idioma]) ajustes.idioma = "English";
      if (!d.freq[estado.fonte]) estado.fonte = "Comic";
      estado.avisos = d.avisos[ajustes.idioma];
      var idioma = q("#rv-idioma");
      Object.keys(d.pty).forEach(function (n) { idioma.add(new Option(n, n, n === ajustes.idioma, n === ajustes.idioma)); });
      idioma.addEventListener("change", function () {
        ajustes.idioma = idioma.value; estado.pty = nomePTY(EMISSORAS[indice]); estado.avisos = d.avisos[idioma.value]; guardar();
      });
      var b = q(".rv-brilho"), bv = q(".rv-brilho-v");
      b.value = ajustes.brilho; bv.textContent = ajustes.brilho + "%";
      b.addEventListener("input", function () { ajustes.brilho = +b.value; bv.textContent = b.value + "%"; aplicarBrilho(); });
      b.addEventListener("change", guardar);
      opcoes("mod", [["0", "Off"], ["1", "On"]], estado.modulacao ? "1" : "0", function (v) { estado.modulacao = v === "1"; });
      opcoes("protecao", [["0", "Off"], ["3", "3 Sec"], ["10", "10 Sec"], ["30", "30 Sec"], ["60", "60 Sec"]], String(ajustes.protecao), function (v) { ajustes.protecao = +v; acordar(); });
      opcoes("protecaoModo", [["0", "Screen off"], ["1", "1% brightness"], ["2", "25% brightness"], ["3", "50% brightness"]], ajustes.protecaoModo, function (v) { ajustes.protecaoModo = v; });
      opcoes("bateria", [["nenhum", "Off"], ["volts", "Show voltage"], ["porcentagem", "Show percentage"]], estado.bateria, function (v) { estado.bateria = v; });
      opcoes("unidade", [["dBuV", "dBμV"], ["dBf", "dBf"], ["dBm", "dBm"]], estado.unidade, function (v) { estado.unidade = v; });
      opcoes("relogio", [["pi", "Off"], ["hora", "Time only"], ["completo", "Date + Time"]], estado.relogioModo, function (v) { mudarRelogio(v); });
      var temas = Object.keys(d.temas), sem = temas.filter(function (n) { return !d.temas[n]; });
      opcoes("tema", temas, ajustes.tema, function (v) { ajustes.tema = v; }, sem);
      opcoes("fonte", Object.keys(d.freq), estado.fonte, function (v) { estado.fonte = v; });
      opcoes("sub", [["nao", "Off"], ["ps", "PS only"], ["sim", "On"]], estado.sublinhado, function (v) { estado.sublinhado = v; });

      rv.addEventListener("click", function (ev) {
        var a = ev.target.closest("[data-acao], [data-toque]");
        if (!a || !rv.contains(a)) return;
        var acao = a.getAttribute("data-acao");
        if (a.hasAttribute("data-toque")) tocar(a.getAttribute("data-toque"));
        else if (acao === "anterior") sintonizar(indice - 1);
        else if (acao === "proxima") sintonizar(indice + 1);
        else if (acao === "som") som.ligar(!som.ligado(), EMISSORAS[indice]);
        else if (acao === "animacao") { ajustes.animar = !ajustes.animar; a.textContent = ajustes.animar ? T.pausar : T.retomar; guardar(); }
        else if (acao === "minimizar") { mostrar("minimizado"); q(".rv-mini-abrir").focus(); }
        else if (acao === "abrir") { mostrar("aberto"); el.titulo.focus(); }
        else if (acao === "fechar") mostrar("fechado");
        // o link segue para a tabela; no celular e em telas médias, o painel cobriria o texto, então ele minimiza
        else if (acao === "codigos" && ehPainel && !window.matchMedia("(min-width: 1280px)").matches) mostrar("minimizado");
      });
      cv.addEventListener("click", function (ev) { var k = alvo(ev); if (k) { ev.stopPropagation(); tocar(k); } });
      cv.addEventListener("mousemove", function (ev) { cv.style.cursor = alvo(ev) ? "pointer" : ""; });
      // as setas trocam de emissora e o Esc volta à tela principal (no painel, minimiza): na página, de qualquer
      // lugar; no guia, só com o foco no rádio
      document.addEventListener("keydown", function (ev) {
        if (situacao === "fechado" || ev.altKey || ev.ctrlKey || ev.metaKey) return;
        var dentro = rv.contains(document.activeElement);
        if (ehPainel && !dentro) return;
        if (ev.target.closest && ev.target.closest("input, select, textarea")) return;
        if (ev.key === "ArrowLeft" || ev.key === "ArrowRight") { ev.preventDefault(); sintonizar(indice + (ev.key === "ArrowLeft" ? -1 : 1)); }
        else if (ev.key === "Escape") {
          if (estado.tela !== "principal") mudarTela("principal");
          else if (ehPainel && situacao === "aberto") { mostrar("minimizado"); q(".rv-mini-abrir").focus(); }
        }
      });
      document.addEventListener("pointerdown", acordar, true);
      document.addEventListener("keydown", acordar, true);

      sintonizar(indice);
      relogio();
      aplicarBrilho();
      if (situacao !== "fechado") rodar();
      raiz.radioVirtual = {
        estado: estado, ajustes: ajustes, tela: tela, dados: d, emissoras: EMISSORAS, ir: sintonizar, tocar: tocar, letreiro: letreiro,
        mostrar: mostrar, situacao: function () { return situacao; }, tema: function (n) { ajustes.tema = n; },
        parar: function () { parado = true; }
      };
    }

    var pronto = fetch((op.base || "") + "dados.json").then(function (r) { return r.json(); }).then(iniciar);
    return {
      pronto: pronto,
      mostrar: function (s) { return pronto.then(function () { mostrar(s); }); },
      situacao: function () { return situacao; },
      focar: function () { if (situacao === "minimizado") q(".rv-mini-abrir").focus(); else if (el.titulo) el.titulo.focus(); }
    };
  }

  raiz.RadioVirtual = { montar: montar, textos: TEXTOS };
})(window);
