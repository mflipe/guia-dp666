/* Página do rádio virtual: o estado do rádio, a sintonia simulada, os ajustes visuais e a animação da tela.
   As emissoras são fictícias: cada frequência ganha um sinal e um RDS sorteados pela própria frequência. */
(function () {
  "use strict";
  var PS = ["RADIO FM", "FM HITS", "NOTICIAS", "CLASSICA", "ROCK FM", "POP 24H", "JAZZ FM", "ESPORTES"];
  var PTY = ["Pop Music", "News", "Varied", "Rock Music", "Information", "Classics", "Jazz Music", "Sport"];
  var reduz = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var estado = {
    freq: 9810, banda: "FM", modo: "mem", memoria: 23, passo: 0, fonte: "Comic", bw: 236, bwAuto: true, ims: true, eq: true,
    estereo: true, offset: 0, squelchCorta: false, rds: true, rdsOk: true, pty: "", ps: "", rtAB: false, qualidade: 4,
    sinal: 640, unidade: "dBuV", cn: 39, mod: 60, pico: 80, modulacao: true, relogio: true, hora: "", bateria: "porcentagem",
    carga: 73, wifi: false, sublinhado: "sim"
  };
  var tema = "Essence", brilho = 100, base = 64, rt = { texto: "", x: 0, largura: 0, espera: 0 }, tela = null, dados = null;
  var sintonizou = 0, parado = false;

  function sorteio(n, k) { var x = Math.sin(n * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); }
  // a emissora de cada frequência: algumas têm sinal forte, outras fraco, e algumas não existem
  function emissora(f) {
    var existe = sorteio(f, 1) > 0.35, nivel = existe ? 18 + Math.round(sorteio(f, 2) * 58) : 4 + Math.round(sorteio(f, 3) * 9);
    var i = Math.floor(sorteio(f, 4) * PS.length);
    return { nivel: nivel, rds: existe && nivel > 30, ps: PS[i], pty: PTY[Math.floor(sorteio(f, 5) * PTY.length)],
      rt: "VOCE ESTA OUVINDO A " + PS[i] + " EM " + (f / 100).toFixed(1) + " MHZ - EMISSORA FICTICIA DO RADIO VIRTUAL DO GUIA DP-666" };
  }
  function sintonizar(f) {
    estado.freq = Math.max(6400, Math.min(10800, f));
    var em = emissora(estado.freq);
    base = em.nivel; estado.sinal = base * 10;
    estado.rds = false; estado.rdsOk = false; estado.ps = ""; estado.pty = ""; estado.qualidade = 0;
    estado.estereo = false; estado.cn = 0; estado.modo = "man";
    rt.texto = ""; rt.x = 0; rt.largura = 0;
    sintonizou = performance.now();
    estado._em = em;
  }
  function novoRT(txt) {
    rt.texto = txt; rt.x = 0; rt.espera = 1000;
    var f16 = tela.f[16], larg = f16.largura(txt.replace(/ /g, estado.sublinhado === "sim" ? "_" : " "));
    rt.largura = larg >= 270 ? f16.largura(txt + "   ") : 0;
  }
  function relogio() {
    var d = new Date(), h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
    estado.hora = (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }
  // o rádio vivo: sinal oscilando, modulação com pico, RDS chegando depois de sintonizar e o RadioText correndo
  var ult = 0, acc = 0;
  function quadro(t) {
    if (parado) return;
    var dt = ult ? Math.min(100, t - ult) : 16;
    ult = t; acc += dt;
    if (estado._em && t - sintonizou > 300) estado.estereo = estado._em.nivel > 26;
    if (estado._em && t - sintonizou > 400) estado.cn = Math.max(0, Math.round(estado._em.nivel * 0.62 - 1));
    if (estado._em && estado._em.rds && !estado.rds && t - sintonizou > 900) {
      estado.rds = true; estado.rdsOk = true; estado.qualidade = estado._em.nivel > 55 ? 4 : estado._em.nivel > 45 ? 3 : 2;
      estado.pty = estado._em.pty; estado.ps = estado._em.ps; novoRT(estado._em.rt);
    }
    if (acc >= 80) {
      acc = 0;
      if (!reduz) {
        estado.sinal = Math.round(base * 10 + (Math.random() - 0.5) * 8);
        estado.mod = Math.max(5, Math.min(115, estado.mod + (Math.random() - 0.48) * 18));
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

  // os ajustes da página
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
    var temas = Object.keys(d.temas), sem = temas.filter(function (n) { return !d.temas[n]; });
    opcoes("o-tema", temas, tema, function (v) { tema = v; }, sem);
    opcoes("o-fonte", Object.keys(d.freq), estado.fonte, function (v) { estado.fonte = v; });
    opcoes("o-sub", [["nao", "Off"], ["sim", "On"], ["ps", "PS only"]], estado.sublinhado, function (v) { estado.sublinhado = v; if (rt.texto) novoRT(rt.texto); });
    opcoes("o-relogio", [["nao", "Off"], ["sim", "On"]], "sim", function (v) { estado.relogio = v === "sim"; });
    var b = document.getElementById("o-brilho"), bv = document.getElementById("o-brilho-v");
    b.addEventListener("input", function () { brilho = +b.value; bv.textContent = brilho + "%"; tela.cv.style.filter = "brightness(" + (0.12 + 0.88 * brilho / 100) + ")"; });
    document.getElementById("menos").addEventListener("click", function () { sintonizar(estado.freq - 10); });
    document.getElementById("mais").addEventListener("click", function () { sintonizar(estado.freq + 10); });
    sintonizar(estado.freq);
    estado.modo = "mem";
    relogio();
    requestAnimationFrame(quadro);
    window.radioVirtual = { estado: estado, rt: rt, tela: tela, dados: d, tema: function (n) { tema = n; }, novoRT: novoRT, parar: function () { parado = true; } };
  }
  fetch("dados.json").then(function (r) { return r.json(); }).then(iniciar);
})();
