/* Página do rádio virtual: a troca de emissora, o som, os ajustes de tela e a animação da tela.
   As emissoras são reais, de São Paulo (capital), nas frequências delas, guardadas nas memórias 1 a 10. O som vem
   da transmissão online de cada uma, achada no Radio Browser (diretório aberto de rádios na internet,
   https://www.radio-browser.info); o sinal e o RDS da tela são simulados a partir do nome da emissora. Os ajustes
   são os do menu Display settings do firmware, mais o sublinhado do RDS settings, com os nomes e valores do menu. */
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
  ].map(function (e, i) { return { freq: e[0], nome: e[1], ps: e[2], pty: e[3], busca: e[4], mem: i + 1 }; });
  var SERVIDORES = ["https://de1.api.radio-browser.info", "https://nl1.api.radio-browser.info", "https://at1.api.radio-browser.info", "https://de2.api.radio-browser.info"];
  var reduz = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  // o que a tela mostra: a emissora numa memória, com estéreo e RDS
  var estado = {
    freq: EMISSORAS[0].freq, banda: "FM", modo: "mem", memoria: 1, passo: 0, fonte: "Comic", bw: 236, bwAuto: true, ims: true, eq: true,
    estereo: true, offset: 0, squelchCorta: false, rds: true, rdsOk: true, pty: "", ps: "", rtAB: false, qualidade: 4,
    sinal: 600, unidade: "dBuV", cn: 36, mod: 40, pico: 60, modulacao: true, relogio: true, hora: "", bateria: "porcentagem",
    carga: 73, wifi: false, sublinhado: "sim"
  };
  // os ajustes que ficam fora do desenho: tema, idioma do PTY, brilho e protetor de tela (segundos e modo)
  var ajustes = { tema: "Essence", idioma: "English", brilho: 100, protecao: 0, protecaoModo: "1" };
  var indice = 0, base = 60, rt = { texto: "", x: 0, largura: 0, espera: 0 }, tela = null, dados = null, parado = false;

  function sorteio(n, k) { var x = Math.sin(n * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); }
  function mhz(f) { return (f / 100).toFixed(1).replace(".", ","); }
  function novoRT(txt) {
    rt.texto = txt; rt.x = 0; rt.espera = 1000;
    // como o firmware: o RadioText corre só quando não cabe nos 270 pixels, com um respiro de três espaços
    var f16 = tela.f[16], mostra = estado.sublinhado === "sim" ? txt.replace(/ /g, "_") : txt;
    rt.largura = f16.largura(mostra) >= 270 ? f16.largura(mostra + "   ") : 0;
  }
  function relogio() {
    var d = new Date(), h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
    estado.hora = (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
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
    estado.freq = em.freq; estado.memoria = em.mem; estado.ps = em.ps; estado.pty = nomePTY(em);
    base = 52 + Math.round(sorteio(em.freq, 2) * 18);
    estado.sinal = base * 10; estado.cn = Math.round(base * 0.62 - 1); estado.qualidade = base > 62 ? 4 : 3;
    novoRT(em.nome + " " + mhz(em.freq) + " MHz - ao vivo pela internet no rádio virtual do guia DP-666");
    var el = document.getElementById("emissora");
    el.querySelector("strong").textContent = em.nome;
    el.querySelector("span").textContent = mhz(em.freq) + " MHz · memória " + em.mem + " de " + n;
    som.trocar(em);
  }

  // a tela viva: sinal oscilando, modulação com pico, relógio e RadioText correndo
  var ult = 0, acc = 0;
  function quadro(t) {
    if (parado) return;
    var dt = ult ? Math.min(100, t - ult) : 16;
    ult = t; acc += dt;
    if (acc >= 80) {
      acc = 0;
      if (!reduz) {
        estado.sinal = Math.round(base * 10 + (Math.random() - 0.5) * 8);
        estado.mod = Math.max(2, Math.min(115, estado.mod + (70 - estado.mod) * 0.08 + (Math.random() - 0.5) * 22));
        if (estado.mod > estado.pico) estado.pico = estado.mod; else estado.pico = Math.max(estado.mod, estado.pico - 1.2);
      }
      relogio();
    }
    if (rt.largura && !reduz) {
      if (rt.espera > 0) rt.espera -= dt;
      else { rt.x -= dt / 15; if (rt.x < -rt.largura) { rt.x = 0; rt.espera = 1000; } }
    }
    tela.desenhar(estado, dados.temas[ajustes.tema], { texto: rt.texto, x: Math.round(rt.x), largura: rt.largura });
    requestAnimationFrame(quadro);
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
    var idioma = document.getElementById("o-idioma");
    Object.keys(d.pty).forEach(function (n) { idioma.add(new Option(n, n, n === ajustes.idioma, n === ajustes.idioma)); });
    idioma.addEventListener("change", function () { ajustes.idioma = idioma.value; estado.pty = nomePTY(EMISSORAS[indice]); });
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
    opcoes("o-sub", [["nao", "Off"], ["ps", "PS only"], ["sim", "On"]], estado.sublinhado, function (v) { estado.sublinhado = v; novoRT(rt.texto); });

    document.getElementById("anterior").addEventListener("click", function () { sintonizar(indice - 1); });
    document.getElementById("proxima").addEventListener("click", function () { sintonizar(indice + 1); });
    document.addEventListener("keydown", function (ev) {
      if (ev.altKey || ev.ctrlKey || ev.metaKey || (ev.target.closest && ev.target.closest("input, select, textarea"))) return;
      if (ev.key === "ArrowLeft" || ev.key === "ArrowRight") { ev.preventDefault(); sintonizar(indice + (ev.key === "ArrowLeft" ? -1 : 1)); }
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
      estado: estado, ajustes: ajustes, rt: rt, tela: tela, dados: d, emissoras: EMISSORAS, ir: sintonizar, novoRT: novoRT,
      tema: function (n) { ajustes.tema = n; }, parar: function () { parado = true; }
    };
  }
  fetch("dados.json").then(function (r) { return r.json(); }).then(iniciar);
})();
