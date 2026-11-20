/* Página do rádio virtual: o estado do rádio, a sintonia, as memórias, o som e a animação da tela.
   As emissoras são reais, de São Paulo (capital), nas frequências delas. O som vem da transmissão online de cada
   uma, achada no Radio Browser (diretório aberto de rádios na internet, https://www.radio-browser.info); o RDS da
   tela é simulado a partir do nome da emissora. Entre as emissoras, o rádio chia, como um rádio de verdade. */
(function () {
  "use strict";
  // frequência (em dezenas de kHz), nome, nome curto, PS de 8 letras, PTY e o termo de busca no diretório
  var EMISSORAS = [
    [9050, "CBN São Paulo", "CBN", "CBN SP", "News", "CBN"],
    [9250, "Kiss FM", "Kiss FM", "KISS FM", "Rock Music", "Kiss FM"],
    [9370, "Rádio USP", "Rádio USP", "USP FM", "Culture", "USP"],
    [9470, "Antena 1", "Antena 1", "ANTENA 1", "Easy Listening", "Antena 1"],
    [9610, "Band FM", "Band FM", "BAND FM", "Pop Music", "Band FM"],
    [9690, "BandNews FM", "BandNews", "BANDNEWS", "News", "BandNews"],
    [10090, "Jovem Pan FM", "Jovem Pan", "JOVEMPAN", "Pop Music", "Jovem Pan"],
    [10170, "Alpha FM", "Alpha FM", "ALPHA FM", "Easy Listening", "Alpha FM"],
    [10330, "Rádio Cultura FM", "Cultura", "CULTURA", "Serious Classical", "Cultura FM"],
    [10630, "Mix FM", "Mix FM", "MIX FM", "Pop Music", "Mix FM"]
  ].map(function (e, i) { return { freq: e[0], nome: e[1], curto: e[2], ps: e[3], pty: e[4], busca: e[5], mem: i + 1 }; });
  var SERVIDORES = ["https://de1.api.radio-browser.info", "https://nl1.api.radio-browser.info", "https://at1.api.radio-browser.info", "https://de2.api.radio-browser.info"];
  var reduz = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var estado = {
    freq: EMISSORAS[0].freq, banda: "FM", modo: "mem", memoria: 1, passo: 0, fonte: "Comic", bw: 236, bwAuto: true, ims: true, eq: true,
    estereo: false, offset: 0, squelchCorta: false, rds: false, rdsOk: false, pty: "", ps: "", rtAB: false, qualidade: 0,
    sinal: 100, unidade: "dBuV", cn: 0, mod: 40, pico: 60, modulacao: true, relogio: true, hora: "", bateria: "porcentagem",
    carga: 73, wifi: false, sublinhado: "sim"
  };
  var tema = "Essence", base = 10, rt = { texto: "", x: 0, largura: 0, espera: 0 }, tela = null, dados = null;
  var sintonizou = 0, parado = false, atual = null, buscando = 0;

  function emissoraEm(f) { for (var i = 0; i < EMISSORAS.length; i++) if (EMISSORAS[i].freq === f) return EMISSORAS[i]; return null; }
  function sorteio(n, k) { var x = Math.sin(n * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); }
  function novoRT(txt) {
    rt.texto = txt; rt.x = 0; rt.espera = 1000;
    var f16 = tela.f[16], larg = f16.largura(estado.sublinhado === "sim" ? txt.replace(/ /g, "_") : txt);
    rt.largura = larg >= 270 ? f16.largura(txt + "   ") : 0;
  }
  function relogio() {
    var d = new Date(), h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
    estado.hora = (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }
  function semAcento(s) { return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase(); }

  /* o som: a transmissão online da emissora sintonizada, ou um chiado baixo entre as emissoras */
  var som = (function () {
    var audio = new Audio(), ligado = false, ctx = null, ganho = null, cache = {}, vez = 0, pendentes = {};
    audio.preload = "none";
    try { cache = JSON.parse(localStorage.getItem("radioVirtual.streams") || "{}"); } catch (e) { cache = {}; }
    function guardar() { try { localStorage.setItem("radioVirtual.streams", JSON.stringify(cache)); } catch (e) {} }
    function avisar(t) { var el = document.getElementById("som-info"); if (el) el.textContent = t; }
    function chiado(liga) { if (ctx) ganho.gain.setTargetAtTime(liga ? 0.035 : 0, ctx.currentTime, 0.05); }
    function prepararChiado() {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC || ctx) return;
      ctx = new AC();
      var n = ctx.sampleRate * 2, buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      var fonte = ctx.createBufferSource(), filtro = ctx.createBiquadFilter();
      fonte.buffer = buf; fonte.loop = true; filtro.type = "bandpass"; filtro.frequency.value = 2500; filtro.Q.value = 0.4;
      ganho = ctx.createGain(); ganho.gain.value = 0;
      fonte.connect(filtro); filtro.connect(ganho); ganho.connect(ctx.destination); fonte.start();
    }
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
    function tocar(em, tentativa) {
      var minha = ++vez, n = tentativa || 0;
      var comeca = function (c) {
        if (minha !== vez || !ligado || atual !== em) return;
        var url = c.urls[n];
        if (!url) { avisar(em.nome + ": a transmissão online não respondeu agora."); chiado(true); return; }
        audio.onplaying = function () { if (minha === vez) { chiado(false); avisar("Tocando a transmissão online da " + em.nome + " (" + (em.freq / 100).toFixed(1) + " MHz)."); } };
        audio.onerror = function () { if (minha === vez && ligado) tocar(em, n + 1); };
        audio.src = url;
        avisar("Conectando à transmissão online da " + em.nome + "…");
        var p = audio.play();
        if (p && p.catch) p.catch(function (e) { if (minha === vez && e && e.name !== "AbortError") tocar(em, n + 1); });
      };
      var c = cache[String(em.freq)];
      if (c && Date.now() - c.t < 3 * 864e5) comeca(c);
      else {
        avisar("Procurando a transmissão da " + em.nome + "…");
        procurar(em).then(comeca, function () { if (minha === vez) { avisar("Não achei a transmissão da " + em.nome + " agora."); chiado(true); } });
      }
    }
    function sintonia() {
      vez++;
      if (!ligado) return;
      audio.pause();
      chiado(true);
      if (atual) tocar(atual);
      else avisar("Nenhuma emissora em " + (estado.freq / 100).toFixed(1).replace(".", ",") + " MHz: só chiado.");
    }
    function ligar(liga) {
      ligado = liga;
      if (liga) {
        prepararChiado();
        if (ctx && ctx.state === "suspended") ctx.resume();
        // toca um silêncio no próprio toque, que destrava o áudio no iPhone, e procura as memórias em segundo plano
        audio.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
        var p = audio.play(); if (p && p.catch) p.catch(function () {});
        sintonia();
        EMISSORAS.reduce(function (pr, em) { return pr.then(function () { return procurar(em).catch(function () {}); }); }, Promise.resolve());
      } else { vez++; audio.pause(); chiado(false); avisar("Som desligado."); }
    }
    return { ligar: ligar, sintonia: sintonia, ligado: function () { return ligado; } };
  })();

  function sintonizar(f, modo, mem) {
    estado.freq = Math.max(8750, Math.min(10800, f));
    atual = emissoraEm(estado.freq);
    // nível: forte nas emissoras, ruído entre elas
    base = atual ? 52 + Math.round(sorteio(estado.freq, 2) * 18) : 4 + Math.round(sorteio(estado.freq, 3) * 8);
    estado.sinal = base * 10;
    estado.rds = false; estado.rdsOk = false; estado.ps = ""; estado.pty = ""; estado.qualidade = 0;
    estado.estereo = false; estado.cn = 0; estado.modo = modo || "man";
    if (mem) estado.memoria = mem;
    rt.texto = ""; rt.x = 0; rt.largura = 0;
    sintonizou = performance.now();
    som.sintonia();
    pintarMemorias();
  }

  // o rádio vivo: sinal oscilando, modulação com pico, RDS chegando depois de sintonizar e o RadioText correndo
  var ult = 0, acc = 0;
  function quadro(t) {
    if (parado) return;
    var dt = ult ? Math.min(100, t - ult) : 16;
    ult = t; acc += dt;
    if (atual && t - sintonizou > 300) estado.estereo = true;
    if (t - sintonizou > 400) estado.cn = atual ? Math.max(0, Math.round(base * 0.62 - 1)) : 0;
    if (atual && !estado.rds && t - sintonizou > 900) {
      estado.rds = true; estado.rdsOk = true; estado.qualidade = base > 62 ? 4 : 3;
      estado.pty = atual.pty; estado.ps = atual.ps;
      novoRT(semAcento(atual.nome) + " " + (atual.freq / 100).toFixed(1) + " SAO PAULO - AO VIVO PELA INTERNET NO RADIO VIRTUAL DO GUIA DP-666");
    }
    if (acc >= 80) {
      acc = 0;
      if (!reduz) {
        estado.sinal = Math.round(base * 10 + (Math.random() - 0.5) * 8);
        var alvo = atual ? 70 : 15;
        estado.mod = Math.max(2, Math.min(115, estado.mod + (alvo - estado.mod) * 0.08 + (Math.random() - 0.5) * 22));
        if (estado.mod > estado.pico) estado.pico = estado.mod; else estado.pico = Math.max(estado.mod, estado.pico - 1.2);
      }
      relogio();
    }
    if (rt.largura && !reduz) {
      if (rt.espera > 0) rt.espera -= dt;
      else { rt.x -= dt / 15; if (rt.x < -rt.largura) { rt.x = 0; rt.espera = 1000; } }
    }
    tela.desenhar(estado, dados.temas[tema], { texto: rt.texto, x: Math.round(rt.x), largura: rt.largura });
    requestAnimationFrame(quadro);
  }

  // busca: anda de 0,1 em 0,1 MHz até achar uma emissora, como o AUTO do rádio
  function buscar(dir) {
    clearInterval(buscando);
    var f = estado.freq;
    atual = null; som.sintonia();
    buscando = setInterval(function () {
      f += dir * 10;
      if (f > 10800) f = 8750; else if (f < 8750) f = 10800;
      estado.freq = f; estado.modo = "auto"; estado.rds = false; estado.ps = ""; estado.pty = ""; estado.estereo = false;
      rt.texto = ""; rt.largura = 0; base = 6; estado.sinal = 60;
      if (emissoraEm(f)) { clearInterval(buscando); sintonizar(f, "auto"); }
    }, reduz ? 1 : 25);
  }

  // os ajustes e os controles da página
  function opcoes(id, lista, atualV, fn, desligados) {
    var el = document.getElementById(id);
    el.innerHTML = lista.map(function (o) {
      var v = Array.isArray(o) ? o[0] : o, r = Array.isArray(o) ? o[1] : o, off = desligados && desligados.indexOf(v) >= 0;
      return '<button type="button" data-v="' + v + '" aria-pressed="' + (v === atualV) + '"' + (off ? ' disabled title="Sem cores conhecidas"' : "") + ">" + r + "</button>";
    }).join("");
    el.addEventListener("click", function (ev) {
      var b = ev.target.closest("button");
      if (!b || b.disabled) return;
      el.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
      fn(b.getAttribute("data-v"));
    });
  }
  function pintarMemorias() {
    document.querySelectorAll("#memorias button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(estado.modo === "mem" && +b.getAttribute("data-m") === estado.memoria));
    });
  }
  function iniciar(d) {
    dados = d;
    tela = new TelaRadio(document.getElementById("tela"), d);
    var temas = Object.keys(d.temas), sem = temas.filter(function (n) { return !d.temas[n]; });
    opcoes("o-tema", temas, tema, function (v) { tema = v; }, sem);
    opcoes("o-fonte", Object.keys(d.freq), estado.fonte, function (v) { estado.fonte = v; });
    opcoes("o-sub", [["nao", "Off"], ["sim", "On"], ["ps", "PS only"]], estado.sublinhado, function (v) { estado.sublinhado = v; if (rt.texto) novoRT(rt.texto); });
    opcoes("o-relogio", [["nao", "Off"], ["sim", "On"]], "sim", function (v) { estado.relogio = v === "sim"; });
    var b = document.getElementById("o-brilho"), bv = document.getElementById("o-brilho-v");
    b.addEventListener("input", function () { bv.textContent = b.value + "%"; tela.cv.style.filter = "brightness(" + (0.12 + 0.88 * b.value / 100) + ")"; });
    var mems = document.getElementById("memorias");
    mems.innerHTML = EMISSORAS.map(function (em) {
      return '<button type="button" data-m="' + em.mem + '"><b>' + em.mem + "</b> " + (em.freq / 100).toFixed(1).replace(".", ",") + " <span>" + em.curto + "</span></button>";
    }).join("");
    mems.addEventListener("click", function (ev) {
      var bt = ev.target.closest("button");
      if (!bt) return;
      clearInterval(buscando);
      var em = EMISSORAS[+bt.getAttribute("data-m") - 1];
      sintonizar(em.freq, "mem", em.mem);
    });
    document.getElementById("menos").addEventListener("click", function () { clearInterval(buscando); sintonizar(estado.freq - 10); });
    document.getElementById("mais").addEventListener("click", function () { clearInterval(buscando); sintonizar(estado.freq + 10); });
    document.getElementById("busca-menos").addEventListener("click", function () { buscar(-1); });
    document.getElementById("busca-mais").addEventListener("click", function () { buscar(1); });
    var bs = document.getElementById("som");
    bs.addEventListener("click", function () {
      var liga = !som.ligado();
      som.ligar(liga);
      bs.setAttribute("aria-pressed", String(liga));
      bs.textContent = liga ? "Desligar o som" : "Ligar o som";
    });
    sintonizar(estado.freq, "mem", 1);
    relogio();
    requestAnimationFrame(quadro);
    window.radioVirtual = { estado: estado, rt: rt, tela: tela, dados: d, tema: function (n) { tema = n; }, novoRT: novoRT, parar: function () { parado = true; }, emissoras: EMISSORAS };
  }
  fetch("dados.json").then(function (r) { return r.json(); }).then(iniciar);
})();
