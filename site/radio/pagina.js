/* Página do rádio virtual: a troca de emissora, o som, os ajustes de tela, os toques na tela e a animação.
   As emissoras são reais, de São Paulo (capital), nas frequências delas, guardadas nas memórias 1 a 10. O som vem
   da transmissão online de cada uma, achada no Radio Browser (diretório aberto de rádios na internet,
   https://www.radio-browser.info). O sinal, a modulação e o RDS (PS, PTY, RT e PI) são simulados, só para
   ilustrar: a transmissão pela internet não traz essas informações. Os ajustes são os do menu Display settings
   do firmware, mais o sublinhado do RDS settings, com os nomes e valores do menu. */
(function () {
  "use strict";
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
  // o que a tela mostra: a emissora numa memória, com estéreo e RDS; tela é "principal", "rds", "af" ou "eon"
  var estado = {
    tela: "principal", freq: EMISSORAS[0].freq, banda: "FM", modo: "mem", memoria: 1, passo: 0, fonte: "Comic", bw: 236, bwAuto: true,
    ims: true, eq: true, estereo: true, offset: 0, squelchCorta: false, rds: true, rdsOk: true, pty: "", ps: "", pi: "", fala: false,
    rtAB: false, qualidade: 4, sinal: 600, unidade: "dBuV", cn: 36, mod: 40, pico: 60, modulacao: true, relogio: true,
    relogioModo: "hora", hora: "", data: "", bateria: "porcentagem", carga: 73, wifi: false, sublinhado: "sim", avisos: null
  };
  // os ajustes que ficam fora do desenho: tema, idioma, brilho, protetor de tela (segundos e modo) e a animação
  var ajustes = { tema: "Essence", idioma: "English", brilho: 100, protecao: 0, protecaoModo: "1", animar: true };
  var indice = 0, base = 60, rtTexto = "", tela = null, dados = null, parado = false;

  function sorteio(n, k) { var x = Math.sin(n * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); }
  function mhz(f) { return (f / 100).toFixed(1).replace(".", ","); }
  function dois(n) { return (n < 10 ? "0" : "") + n; }
  function relogio() {
    var d = new Date();
    estado.hora = dois(d.getHours()) + ":" + dois(d.getMinutes()) + ":" + dois(d.getSeconds());
    estado.data = d.getFullYear() + "-" + dois(d.getMonth() + 1) + "-" + dois(d.getDate()) + "  " + DIAS[d.getDay()];
  }
  function nomePTY(em) { return (dados.pty[ajustes.idioma] || dados.pty.English)[em.pty]; }

  /* o som: a transmissão online da emissora sintonizada */
  var som = (function () {
    var audio = new Audio(), ligado = false, cache = {}, vez = 0, pendentes = {};
    audio.preload = "none";
    try { cache = JSON.parse(localStorage.getItem("radioVirtual.streams") || "{}"); } catch (e) { cache = {}; }
    function guardar() { try { localStorage.setItem("radioVirtual.streams", JSON.stringify(cache)); } catch (e) {} }
    function avisar(t) { var el = document.getElementById("som-info"); if (el) el.textContent = t; }
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
      var q = "/json/stations/search?countrycode=BR&hidebroken=true&order=clickcount&reverse=true&limit=60&name=" + encodeURIComponent(em.busca);
      var tenta = function (i) {
        if (i >= SERVIDORES.length) return Promise.reject(new Error("diretório fora do ar"));
        var ac = window.AbortController ? new AbortController() : null, timer = setTimeout(function () { if (ac) ac.abort(); }, 7000);
        return fetch(SERVIDORES[i] + q, ac ? { signal: ac.signal } : {})
          .then(function (r) { clearTimeout(timer); if (!r.ok) throw new Error(r.status); return r.json(); })
          .catch(function () { clearTimeout(timer); return tenta(i + 1); });
      };
      return (pendentes[k] = tenta(0).then(function (lista) {
        var ok = lista.filter(function (s) { return /^https:\/\//.test(s.url_resolved || ""); })
          .map(function (s) { return { s: s, n: nota(s, em) }; }).sort(function (a, b) { return b.n - a.n; }).slice(0, 3);
        if (!ok.length) throw new Error("sem transmissão https");
        cache[k] = { t: Date.now(), urls: ok.map(function (o) { return o.s.url_resolved; }), nome: ok[0].s.name };
        guardar();
        return cache[k];
      }).finally(function () { delete pendentes[k]; }));
    }
    // toca a transmissão; se ela falha, tenta a próxima da mesma emissora
    function tocar(em, tentativa) {
      var minha = ++vez, n = tentativa || 0;
      var comeca = function (c) {
        if (minha !== vez || !ligado) return;
        var url = c.urls[n];
        if (!url) { avisar("A transmissão da " + em.nome + " não respondeu agora."); return; }
        audio.onplaying = function () { if (minha === vez) avisar("Tocando a " + em.nome + " pela internet."); };
        audio.onerror = function () { if (minha === vez && ligado) tocar(em, n + 1); };
        audio.src = url;
        avisar("Conectando à " + em.nome + "…");
        var p = audio.play();
        if (p && p.catch) p.catch(function (e) { if (minha === vez && e && e.name !== "AbortError") tocar(em, n + 1); });
      };
      var c = cache[String(em.freq)];
      if (c && Date.now() - c.t < 3 * 864e5) comeca(c);
      else {
        avisar("Procurando a transmissão da " + em.nome + "…");
        procurar(em).then(comeca, function () { if (minha === vez) avisar("Não achei a transmissão da " + em.nome + " agora."); });
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
        avisar("Som desligado.");
      }
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
    rtTexto = em.nome + " " + mhz(em.freq) + " MHz - ao vivo pela internet no rádio virtual do guia DP-666";
    var el = document.getElementById("emissora");
    el.querySelector("strong").textContent = em.nome;
    el.querySelector("span").textContent = mhz(em.freq) + " MHz · memória " + em.mem + " de " + n;
    som.trocar(em);
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

  var ult = 0, acc = 0, ultRelogio = 0;
  function quadro(t) {
    if (parado) return;
    var dt = ult ? Math.min(100, t - ult) : 16;
    ult = t;
    if (ajustes.animar) {
      acc += dt;
      while (acc >= 60) { acc -= 60; medidores(); }
      correr(dt);
    }
    if (t - ultRelogio >= 250) { ultRelogio = t; relogio(); }
    tela.desenhar(estado, dados.temas[ajustes.tema], { pty: letreiro("pty"), ps: letreiro("ps"), rt: letreiro("rt") });
    requestAnimationFrame(quadro);
  }

  /* os toques na tela, como no Mod17: no RDS da barra de cima, abre a tela do RDS avançado; nela e nas listas de AF
     e EON, cada toque vai para a próxima, e depois da EON volta à principal; no canto do relógio, troca entre a
     hora, a data com a hora e o PI */
  var NOMES = { principal: "principal", rds: "do RDS avançado", af: "da lista de AF", eon: "da lista de EON" };
  function mudarTela(nova) {
    estado.tela = nova;
    tela.cv.setAttribute("aria-label", "Tela " + NOMES[nova] + " do rádio");
  }
  function tocar(qual) {
    if (qual === "rds") mudarTela(estado.tela === "principal" ? "rds" : { rds: "af", af: "eon", eon: "principal" }[estado.tela]);
    else if (qual === "relogio") {
      if (estado.tela !== "principal") mudarTela("principal");
      estado.relogioModo = { hora: "completo", completo: "pi", pi: "hora" }[estado.relogioModo];
    }
  }
  function alvo(ev) {
    var r = tela.cv.getBoundingClientRect(), x = (ev.clientX - r.left) * 320 / r.width, y = (ev.clientY - r.top) * 240 / r.height;
    if (estado.tela !== "principal") return "rds";
    if (x >= 112 && x <= 166 && y <= 34) return "rds";
    if (x >= 210 && y >= 180 && y <= 217 && estado.relogio) return "relogio";
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
    if (ajustes.protecao) timerProtecao = setTimeout(function () { protegida = true; aplicarBrilho(); }, ajustes.protecao * 1000);
  }

  // no celular, com a tela presa no alto, o navegador rola até um campo (pelo teclado, por exemplo) sem escondê-lo
  function folga() {
    var fixo = document.querySelector(".fixo");
    document.documentElement.style.scrollPaddingTop = getComputedStyle(fixo).position === "sticky" ? fixo.offsetHeight + 8 + "px" : "";
  }

  // os ajustes: cada grupo de botões funciona como as opções de um item do menu
  function opcoes(id, lista, atual, fn, desligados) {
    var el = document.getElementById(id);
    el.innerHTML = lista.map(function (o) {
      var v = Array.isArray(o) ? o[0] : o, r = Array.isArray(o) ? o[1] : o, off = desligados && desligados.indexOf(v) >= 0;
      return '<button type="button" data-v="' + v + '" aria-pressed="' + (v === atual) + '"' + (off ? ' disabled title="Sem cores conhecidas"' : "") + ">" + r + "</button>";
    }).join("");
    el.addEventListener("click", function (ev) {
      var b = ev.target.closest("button");
      if (!b || b.disabled) return;
      el.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
      fn(b.getAttribute("data-v"));
    });
  }
  function iniciar(d) {
    dados = d;
    tela = new TelaRadio(document.getElementById("tela"), d);
    estado.avisos = d.avisos[ajustes.idioma];
    var idioma = document.getElementById("o-idioma");
    Object.keys(d.pty).forEach(function (n) { idioma.add(new Option(n, n, n === ajustes.idioma, n === ajustes.idioma)); });
    idioma.addEventListener("change", function () {
      ajustes.idioma = idioma.value; estado.pty = nomePTY(EMISSORAS[indice]); estado.avisos = d.avisos[idioma.value];
    });
    var b = document.getElementById("o-brilho"), bv = document.getElementById("o-brilho-v");
    b.addEventListener("input", function () { ajustes.brilho = +b.value; bv.textContent = b.value + "%"; aplicarBrilho(); });
    opcoes("o-mod", [["0", "Off"], ["1", "On"]], "1", function (v) { estado.modulacao = v === "1"; });
    opcoes("o-protecao", [["0", "Off"], ["3", "3 Sec"], ["10", "10 Sec"], ["30", "30 Sec"], ["60", "60 Sec"]], "0", function (v) { ajustes.protecao = +v; acordar(); });
    opcoes("o-protecao-modo", [["0", "Screen off"], ["1", "1% brightness"], ["2", "25% brightness"], ["3", "50% brightness"]], ajustes.protecaoModo, function (v) { ajustes.protecaoModo = v; });
    opcoes("o-bateria", [["nenhum", "Off"], ["volts", "Show voltage"], ["porcentagem", "Show percentage"]], estado.bateria, function (v) { estado.bateria = v; });
    opcoes("o-unidade", [["dBuV", "dBμV"], ["dBf", "dBf"], ["dBm", "dBm"]], estado.unidade, function (v) { estado.unidade = v; });
    opcoes("o-relogio", [["0", "Off"], ["1", "On"]], "1", function (v) { estado.relogio = v === "1"; });
    var temas = Object.keys(d.temas), sem = temas.filter(function (n) { return !d.temas[n]; });
    opcoes("o-tema", temas, ajustes.tema, function (v) { ajustes.tema = v; }, sem);
    opcoes("o-fonte", Object.keys(d.freq), estado.fonte, function (v) { estado.fonte = v; });
    opcoes("o-sub", [["nao", "Off"], ["ps", "PS only"], ["sim", "On"]], estado.sublinhado, function (v) { estado.sublinhado = v; });

    document.getElementById("anterior").addEventListener("click", function () { sintonizar(indice - 1); });
    document.getElementById("proxima").addEventListener("click", function () { sintonizar(indice + 1); });
    document.addEventListener("keydown", function (ev) {
      if (ev.altKey || ev.ctrlKey || ev.metaKey || (ev.target.closest && ev.target.closest("input, select, textarea"))) return;
      if (ev.key === "ArrowLeft" || ev.key === "ArrowRight") { ev.preventDefault(); sintonizar(indice + (ev.key === "ArrowLeft" ? -1 : 1)); }
      else if (ev.key === "Escape" && estado.tela !== "principal") mudarTela("principal");
    });
    var cv = tela.cv;
    cv.addEventListener("click", function (ev) { var q = alvo(ev); if (q) tocar(q); });
    cv.addEventListener("mousemove", function (ev) { cv.style.cursor = alvo(ev) ? "pointer" : ""; });
    document.getElementById("toque-rds").addEventListener("click", function () { tocar("rds"); });
    document.getElementById("toque-relogio").addEventListener("click", function () { tocar("relogio"); });
    var anima = document.getElementById("animacao");
    anima.addEventListener("click", function () {
      ajustes.animar = !ajustes.animar;
      anima.textContent = ajustes.animar ? "Pausar animação" : "Retomar animação";
    });
    var bs = document.getElementById("som");
    bs.addEventListener("click", function () {
      var liga = !som.ligado();
      som.ligar(liga, EMISSORAS[indice]);
      bs.setAttribute("aria-pressed", String(liga));
      bs.textContent = liga ? "Desligar o som" : "Ligar o som";
    });
    document.addEventListener("pointerdown", acordar, true);
    document.addEventListener("keydown", acordar, true);
    window.addEventListener("resize", folga);
    folga();

    sintonizar(0);
    relogio();
    aplicarBrilho();
    requestAnimationFrame(quadro);
    window.radioVirtual = {
      estado: estado, ajustes: ajustes, tela: tela, dados: d, emissoras: EMISSORAS, ir: sintonizar, tocar: tocar, letreiro: letreiro,
      tema: function (n) { ajustes.tema = n; }, parar: function () { parado = true; }
    };
  }
  fetch("dados.json").then(function (r) { return r.json(); }).then(iniciar);
})();
