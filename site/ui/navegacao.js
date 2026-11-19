(function () {
  "use strict";
  var C = Componentes;   // os componentes de ui/componentes.js (par de componentes.py)
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var comMouse = window.matchMedia && window.matchMedia("(hover: hover)").matches;
  var pages = Array.prototype.slice.call(document.querySelectorAll(".page"));
  var routes = {};
  pages.forEach(function (p) { routes[p.dataset.route] = p; });
  var app = document.getElementById("app");
  var knob = document.getElementById("sintonia");
  var knobRot = knob.querySelector(".sin-rot");
  var menu = document.getElementById("menu");
  var menuLista = menu.querySelector(".pausa-menu");
  var lendo = menu.querySelector(".mi-lendo");
  var lendoDesc = document.getElementById("lendo-desc");
  var secBox = document.getElementById("pausa-secoes");
  var secLista = document.getElementById("sec-lista");
  var secMais = document.getElementById("sec-mais");
  var cartao = document.getElementById("cartao");
  var mapa = document.getElementById("mapa");
  var ttMenu = document.querySelector(".tt-menu");
  var ttFoco = document.getElementById("tt-foco");
  var contLi = ttMenu ? ttMenu.querySelector(".mi-continuar") : null;
  var LKEY = "dp666.leitura.v1." + (/^pt/.test(document.documentElement.lang) ? "pt" : "en");
  var current = null, pendingScroll = null, pagina = null;
  var secs = [], secAtual = -2, progresso = 0, verTodas = false, menuAberto = false, ultimoFoco = null;
  var tCartao = null, tFecha = null, tGrava = null, raf = 0;
  var rotAbrir = knob.getAttribute("data-abrir"), rotCurto = knob.getAttribute("data-rotulo"), rotFechar = knob.getAttribute("data-fechar");

  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function visivel(el) { return !!(el && (el.offsetWidth || el.offsetHeight || el.getClientRects().length)); }
  function focar(el) { if (!el) return; try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } }
  // troca de página é troca de tela: vai ao topo na hora, sem a rolagem suave do resto do guia
  function irAoTopo() {
    var h = document.documentElement, antes = h.style.scrollBehavior;
    h.style.scrollBehavior = "auto";
    void getComputedStyle(h).scrollBehavior;
    try { window.scrollTo({ top: 0, left: 0, behavior: "instant" }); } catch (e) { window.scrollTo(0, 0); }
    h.style.scrollBehavior = antes;
  }
  function lerPos() { try { return JSON.parse(window.localStorage.getItem(LKEY) || "null"); } catch (e) { return null; } }
  function gravarPos(v) { try { window.localStorage.setItem(LKEY, JSON.stringify(v)); } catch (e) { /* armazenamento indisponível */ } }
  function tituloDe(r) { var n = menu.querySelector('.mi-item[data-route="' + r + '"] .mi-nome'); return n ? n.textContent : ""; }
  function tocDe(r) { try { return JSON.parse(routes[r].dataset.toc || "[]"); } catch (e) { return []; } }
  function textoPos(r, nomeSec, pct) {
    return tituloDe(r) + (nomeSec ? ", na seção " + nomeSec : "") + ". Você leu " + pct + "% da página.";
  }

  function scrollToId(id) {
    try { document.dispatchEvent(new CustomEvent("app:reveal", { detail: id })); } catch (e) {}
    var el = document.getElementById(id);
    if (!el) return;
    if (telas && telas.page.contains(el)) { irAoElemento(el); return; }
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    ancorar(el);
  }
  // Enquanto a página termina de montar ferramentas e figuras, o alvo pode descer; por alguns segundos,
  // ele volta ao topo a cada mudança de altura. Para assim que a pessoa rola ou toca na tela.
  var soltarAncora = null;
  function ancorar(el) {
    if (soltarAncora) soltarAncora();
    var page = el.closest(".page") || document.body, fim = Date.now() + 4000, ro = null;
    var gestos = ["wheel", "touchstart", "keydown", "mousedown"];
    function soltar() {
      if (ro) ro.disconnect();
      gestos.forEach(function (t) { window.removeEventListener(t, soltar, true); });
      soltarAncora = null;
    }
    function corrigir() {
      if (soltarAncora !== soltar) return;
      if (!el.offsetParent) { soltar(); return; }
      var top = el.getBoundingClientRect().top;
      if (top > window.innerHeight * 0.5 || top < -40) el.scrollIntoView({ block: "start" });
      if (Date.now() > fim) soltar();
    }
    gestos.forEach(function (t) { window.addEventListener(t, soltar, true); });
    var altura = page.offsetHeight;
    if ("ResizeObserver" in window) {
      ro = new ResizeObserver(function () {
        if (page.offsetHeight === altura) return;
        altura = page.offsetHeight; setTimeout(corrigir, 50);
      });
      ro.observe(page);
    }
    [700, 1600, 3000, 4100].forEach(function (ms) { setTimeout(corrigir, ms); });
    soltarAncora = soltar;
  }

  /* seções da página atual, progresso de leitura e onde a pessoa parou */
  function coletar(page) {
    var toc = [];
    try { toc = JSON.parse(page.dataset.toc || "[]"); } catch (e) { toc = []; }
    secs = toc.map(function (it) { return { id: it[0], t: it[1], el: document.getElementById(it[0]) }; })
      .filter(function (s) { return s.el && page.contains(s.el); });
  }
  function agendar() { if (!raf) raf = requestAnimationFrame(atualizar); }
  function atualizar() {
    raf = 0;
    if (!pagina || menuAberto) return;
    if (telas) { pintarTelas(); return; }
    var y = window.scrollY || window.pageYOffset || 0, vh = window.innerHeight;
    var r = pagina.getBoundingClientRect(), ini = r.top + y, alt = Math.max(1, r.height);
    var fim = ini + alt - vh;
    progresso = fim > ini ? Math.min(1, Math.max(0, (y - ini) / (fim - ini))) : 1;
    knob.style.setProperty("--p", progresso.toFixed(3));
    knob.classList.toggle("compacto", y > 48);
    var at = -1;
    for (var i = 0; i < secs.length; i++) { if (secs[i].el.getBoundingClientRect().top <= 150) at = i; else break; }
    if (at !== secAtual) { var antes = secAtual; secAtual = at; if (at >= 0 && antes !== -2) mostrarCartao(at); }
    pintarMapa((y + 150 - ini) / alt);
    lembrar();
  }
  function lembrar() {
    if (!current || current === "inicio") return;
    clearTimeout(tGrava);
    tGrava = setTimeout(function () {
      var s = secAtual >= 0 ? secs[secAtual] : null;
      gravarPos({ r: current, s: s ? s.id : "", sn: s ? s.t : "", p: Math.round(progresso * 100) });
    }, 400);
  }
  function mostrarCartao(i) {
    if (secs.length < 2 || visivel(mapa) || telas) return;
    cartao.querySelector(".cartao-t").textContent = secs[i].t;
    cartao.querySelector(".cartao-n").textContent = (i + 1) + " de " + secs.length;
    cartao.classList.add("on");
    clearTimeout(tCartao);
    tCartao = setTimeout(function () { cartao.classList.remove("on"); }, 1700);
  }

  /* mapa da página: uma marca por seção, na altura em que ela fica, e a agulha onde está a leitura */
  var agulha = null, olho = null, rotulo = null;
  function parte(cls) { var x = document.createElement("span"); x.className = cls; x.setAttribute("aria-hidden", "true"); return x; }
  function montarMapa() {
    mapa.innerHTML = "";
    agulha = olho = rotulo = null;
    if (!pagina || secs.length < 2 || current === "inicio" || telas) { mapa.hidden = true; return; }
    mapa.hidden = false;
    var y = window.scrollY || window.pageYOffset || 0;
    var r = pagina.getBoundingClientRect(), ini = r.top + y, alt = Math.max(1, r.height);
    mapa.appendChild(parte("mapa-escala"));
    secs.forEach(function (s, i) {
      var pos = Math.min(100, Math.max(0, (s.el.getBoundingClientRect().top + y - ini) / alt * 100));
      var b = document.createElement("button");
      b.type = "button"; b.className = "mapa-marca"; b.style.top = pos.toFixed(2) + "%";
      b.setAttribute("aria-label", (i + 1) + ". " + s.t);
      b.innerHTML = '<span class="mapa-dica" aria-hidden="true">' + esc(s.t) + "</span>";
      b.addEventListener("click", function () { scrollToId(s.id); });
      mapa.appendChild(b);
    });
    agulha = parte("mapa-agulha"); olho = parte("mapa-olho"); rotulo = parte("mapa-rot");
    rotulo.innerHTML = "<b></b><span></span>";
    mapa.appendChild(agulha); mapa.appendChild(olho); mapa.appendChild(rotulo);
  }
  function pintarMapa(f) {
    if (!agulha) return;
    var pos = (Math.min(1, Math.max(0, f)) * 100).toFixed(2) + "%";
    agulha.style.top = olho.style.top = rotulo.style.top = pos;
    var i = Math.max(0, secAtual);
    rotulo.firstChild.textContent = secs[i] ? secs[i].t : "";
    rotulo.lastChild.textContent = (i + 1) + " de " + secs.length;
  }

  /* modo telas (protótipo): nas páginas com data-telas, a página não rola. O texto corre em colunas do tamanho da
     tela, lado a lado, e a pessoa vira as telas: arrastando para o lado (ou para cima), com as setas, Page Down,
     espaço, a roda do mouse ou os botões da barra. A página é o contêiner que rola na horizontal, sempre de tela em
     tela. Uma âncora (o primeiro caractere da tela, ou o alvo de um link) segura a leitura no lugar quando a tela
     muda de tamanho ou uma ferramenta termina de montar. O estilo está em ui/css/layout/telas.css. */
  var telas = null, barra = null, barraPos = null, barraAnt = null, barraProx = null;
  var animTelas = 0, tAjuste = 0, tReajuste = 0, obsTelas = null, toque = null, roda = { acc: 0, ult: 0, seguido: false };
  function montarBarra() {
    if (barra) return;
    var seta = function (d) { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '"></path></svg>'; };
    barra = document.createElement("nav");
    barra.className = "telas-nav";
    barra.setAttribute("aria-label", "Telas da página");
    barra.hidden = true;
    barra.innerHTML = C.botao(seta("M14.5 5.5 8 12l6.5 6.5"), { classe: "telas-btn", attrs: { "data-dir": "-1", "aria-label": "Tela anterior" } })
      + '<p class="telas-pos" aria-live="polite"><b></b><span></span></p>'
      + C.botao(seta("M9.5 5.5 16 12l-6.5 6.5"), { classe: "telas-btn", attrs: { "data-dir": "1", "aria-label": "Próxima tela" } });
    document.getElementById("main").insertAdjacentElement("afterend", barra);
    barraPos = barra.querySelector(".telas-pos");
    barraAnt = barra.querySelector('[data-dir="-1"]');
    barraProx = barra.querySelector('[data-dir="1"]');
    barra.addEventListener("click", function (e) {
      var b = e.target.closest("[data-dir]");
      if (b && telas && b.getAttribute("aria-disabled") !== "true") virar(+b.getAttribute("data-dir"));
    });
  }
  function ligarTelas(page, mesma) {
    if (telas && telas.page !== page) desligarTelas();
    if (!page.hasAttribute("data-telas")) return;
    montarBarra();
    if (!telas) {
      telas = { page: page, i: 0, n: 1, passo: 1, pad: 0, ancora: null, secTela: [] };
      document.documentElement.classList.add("em-telas");
      document.body.classList.add("em-telas");
      barra.hidden = false;
      ouvir(true);
      page.addEventListener("scroll", aoRolarTelas, { passive: true });
      if ("ResizeObserver" in window) {
        obsTelas = new ResizeObserver(function () { clearTimeout(tReajuste); tReajuste = setTimeout(reajustarTelas, 80); });
        $$(":scope > *, .prose > *", page).forEach(function (el) { obsTelas.observe(el); });
      }
      mesma = false;
    }
    if (!mesma) { telas.i = 0; telas.ancora = null; }
    medirTelas();
    irParaTela(mesma ? telas.i : 0, true);
  }
  function desligarTelas() {
    if (!telas) return;
    pararTelas();
    ouvir(false);
    telas.page.removeEventListener("scroll", aoRolarTelas);
    if (obsTelas) { obsTelas.disconnect(); obsTelas = null; }
    telas.page.scrollLeft = 0;
    telas.page.style.removeProperty("--tela-h");
    telas = null;
    toque = null;
    document.documentElement.classList.remove("em-telas");
    document.body.classList.remove("em-telas");
    if (barra) barra.hidden = true;
  }
  // largura de uma tela (coluna + espaço entre colunas), quantas telas há e em que tela começa cada seção
  function medirTelas() {
    var p = telas.page, cs = getComputedStyle(p);
    var padL = parseFloat(cs.paddingLeft) || 0, padR = parseFloat(cs.paddingRight) || 0, gap = parseFloat(cs.columnGap) || 0;
    p.style.setProperty("--tela-h", p.clientHeight + "px");
    telas.pad = padL;
    telas.passo = Math.max(1, p.clientWidth - padL - padR + gap);
    telas.n = 1e6;
    organizarTelas(p.clientHeight);
    var n = Math.round((p.scrollWidth - padL - padR + gap) / telas.passo);
    var ult = p.lastElementChild;
    if (ult) { var rs = ult.getClientRects(); if (rs.length) n = Math.max(n, telaDoRetangulo(rs[rs.length - 1]) + 1); }
    telas.n = Math.max(1, n);
    telas.secTela = secs.map(function (s) { return telaDe(s.el); });
  }
  // Ajustes de diagramação, refeitos a cada medida. A ferramenta que vem depois do título da seção cabe no resto
  // da tela dele e rola por dentro. Uma seção que abriria deixando a tela de antes quase vazia (menos de 40%)
  // começa ali mesmo, se o título e o começo do texto couberem juntos; o fim da página também.
  function vizinho(el, lado) {
    for (; el && el !== telas.page; el = el.parentElement) {
      var v = lado < 0 ? el.previousElementSibling : el.nextElementSibling;
      if (v) return v;
    }
    return null;
  }
  function fimDe(el) { var rs = el.getClientRects(); return rs.length ? rs[rs.length - 1] : null; }
  function margem(el, lado) { return parseFloat(getComputedStyle(el)["margin" + lado]) || 0; }
  // a margem de baixo que chega até o próximo bloco: a do elemento e a dos últimos filhos, que se juntam a ela
  function margemDeBaixo(el) {
    var m = 0;
    for (; el; el = el.lastElementChild) {
      m = Math.max(m, margem(el, "Bottom"));
      var cs = getComputedStyle(el);
      if (parseFloat(cs.paddingBottom) || parseFloat(cs.borderBottomWidth) || cs.display !== "block" || cs.overflow !== "visible") break;
    }
    return m;
  }
  function organizarTelas(H) {
    var p = telas.page, topo = p.getBoundingClientRect().top + (parseFloat(getComputedStyle(p).paddingTop) || 0);
    var ferramentas = $$(".tool-embed", p), aberturas = $$(".prose h2, .proximo", p);
    aberturas.forEach(function (h) { h.classList.remove("tela-segue"); });
    function caber() {
      ferramentas.forEach(function (t) {
        t.style.maxHeight = "";
        var ant = vizinho(t, -1), r = ant && fimDe(ant);
        if (!r) return;
        var resto = H - (r.bottom - topo) - Math.max(margemDeBaixo(ant), margem(t, "Top")) - 1;
        if (resto >= H * 0.5 && resto < H) t.style.maxHeight = Math.floor(resto) + "px";
      });
    }
    caber();
    aberturas.forEach(function (h) {
      var ant = vizinho(h, -1), r = ant && fimDe(ant);
      if (!r || r.bottom - topo > H * 0.4) return;
      var tela = telaDoRetangulo(r);
      if (telaDe(h) !== tela + 1) return;
      h.classList.add("tela-segue");
      var texto = h.classList.contains("proximo") ? h : vizinho(h, 1);
      if (texto && texto.classList.contains("tool-lead")) texto = vizinho(texto, 1);
      if (telaDe(h) !== tela || !texto || telaDe(texto) !== tela) h.classList.remove("tela-segue");
    });
    caber();
  }
  function telaDoRetangulo(r) {
    var p = telas.page, x = r.left - (p.getBoundingClientRect().left + telas.pad - p.scrollLeft);
    return Math.max(0, Math.min(telas.n - 1, Math.floor((x + 4) / telas.passo)));
  }
  // em que tela está um elemento ou um trecho de texto (o começo dele)
  function telaDe(alvo) {
    var rs = alvo.getClientRects(), r = rs.length ? rs[0] : alvo.getBoundingClientRect();
    return telaDoRetangulo(r);
  }
  // o primeiro caractere visível no alto da tela: segura a leitura no lugar quando a largura muda
  function ancoraNoTopo() {
    var p = telas.page, r = p.getBoundingClientRect(), x = r.left + telas.pad + 14;
    for (var y = r.top + 10; y < r.bottom - 10; y += 16) {
      var rg = null;
      try {
        if (document.caretRangeFromPoint) rg = document.caretRangeFromPoint(x, y);
        else if (document.caretPositionFromPoint) {
          var cp = document.caretPositionFromPoint(x, y);
          if (cp) { rg = document.createRange(); rg.setStart(cp.offsetNode, cp.offset); }
        }
      } catch (e) { rg = null; }
      if (rg && p.contains(rg.startContainer) && rg.startContainer.nodeType === 3) {
        var t = rg.startContainer;
        if (rg.startOffset < t.length) rg.setEnd(t, rg.startOffset + 1);
        return rg;
      }
      var el = document.elementFromPoint(x, y);
      if (el && el !== p && p.contains(el) && !el.classList.contains("prose")) return el;
    }
    return null;
  }
  function ancoraValida(a) {
    if (!a || !telas) return false;
    var no = a.startContainer || a;
    return document.contains(no) && telas.page.contains(no);
  }
  function reajustarTelas() {
    if (!telas || toque) return;
    medirTelas();
    irParaTela(ancoraValida(telas.ancora) ? telaDe(telas.ancora) : telas.i, true);
  }
  function irAoElemento(el) {
    medirTelas();
    telas.ancora = el;
    irParaTela(telaDe(el), true);
  }
  function virar(d) {
    if (!telas) return;
    var i = Math.max(0, Math.min(telas.n - 1, telas.i + d));
    if (i === telas.i) { rolarTelas(i * telas.passo, false); return; }
    irParaTela(i, false);
  }
  function irParaTela(i, ja) {
    if (!telas) return;
    i = Math.max(0, Math.min(telas.n - 1, i));
    var longe = Math.abs(i - telas.i) > 1;
    telas.i = i;
    rolarTelas(i * telas.passo, ja || longe || reduce);
    pintarTelas();
  }
  // vira a tela com uma animação curta; a âncora vem do que ficou no alto da tela
  function rolarTelas(x, ja) {
    var p = telas.page;
    pararTelas();
    var x0 = p.scrollLeft, d = x - x0;
    if (ja || Math.abs(d) < 1) { p.scrollLeft = x; if (!ja) telas.ancora = ancoraNoTopo(); return; }
    var t0 = performance.now(), dur = Math.min(380, 200 + Math.abs(d) / 5);
    function quadro(t) {
      if (!telas) { animTelas = 0; return; }
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      p.scrollLeft = x0 + d * e;
      if (k < 1) animTelas = requestAnimationFrame(quadro);
      else { animTelas = 0; p.scrollLeft = x; telas.ancora = ancoraNoTopo(); }
    }
    animTelas = requestAnimationFrame(quadro);
  }
  function pararTelas() { if (animTelas) { cancelAnimationFrame(animTelas); animTelas = 0; } }
  // a barra, o anel do botão de sintonia e a seção atual acompanham a tela
  function pintarTelas() {
    if (!telas || !barraPos) return;
    var i = telas.i, n = telas.n, at = -1;
    for (var k = 0; k < telas.secTela.length; k++) { if (telas.secTela[k] <= i) at = k; else break; }
    secAtual = at;
    progresso = n > 1 ? i / (n - 1) : 1;
    knob.style.setProperty("--p", progresso.toFixed(3));
    knob.classList.toggle("compacto", i > 0);
    var h1 = telas.page.querySelector("h1");
    barraPos.firstChild.textContent = at >= 0 ? secs[at].t : (h1 ? h1.textContent : "");
    barraPos.lastChild.textContent = (i + 1) + " de " + n;
    barraAnt.setAttribute("aria-disabled", i === 0 ? "true" : "false");
    barraProx.setAttribute("aria-disabled", i >= n - 1 ? "true" : "false");
    lembrar();
  }
  // rolagem que não veio daqui (foco, busca do navegador): volta a alinhar numa tela inteira
  function aoRolarTelas() {
    if (!telas || animTelas || toque) return;
    clearTimeout(tAjuste);
    tAjuste = setTimeout(function () {
      if (!telas || animTelas || toque) return;
      var x = telas.page.scrollLeft, i = Math.round(x / telas.passo);
      if (i === telas.i && Math.abs(x - i * telas.passo) < 2) return;
      irParaTela(i, true);
      telas.ancora = ancoraNoTopo();
    }, 140);
  }
  function janelaAberta() { return !!document.querySelector("dialog[open]"); }
  // quem já usa o gesto: campos, o 3D, e caixas que rolam por dentro na mesma direção
  function donoDoGesto(el, eixo, sentido) {
    for (; el && el !== document.body; el = el.parentElement) {
      if (telas && el === telas.page) return false;
      if (el.matches && el.matches("input, select, textarea, canvas, [contenteditable], .viewer3d, [data-gesto]")) return true;
      var cs = getComputedStyle(el), ov = eixo === "x" ? cs.overflowX : cs.overflowY;
      if (ov !== "auto" && ov !== "scroll") continue;
      var max = eixo === "x" ? el.scrollWidth - el.clientWidth : el.scrollHeight - el.clientHeight;
      if (max <= 1) continue;
      if (!sentido) return true;
      var pos = eixo === "x" ? el.scrollLeft : el.scrollTop;
      if ((sentido > 0 && pos < max - 1) || (sentido < 0 && pos > 0)) return true;
    }
    return false;
  }
  function aoTocar(e) {
    toque = null;
    if (!telas || menuAberto || janelaAberta() || e.touches.length !== 1 || !app.contains(e.target)) return;
    var t = e.touches[0];
    toque = { x0: t.clientX, y0: t.clientY, t0: Date.now(), alvo: e.target, eixo: "", s0: 0, dx: 0, dy: 0 };
  }
  function aoMover(e) {
    if (!toque || !telas) return;
    if (e.touches.length !== 1) { var s = toque.eixo === "x"; toque = null; if (s) irParaTela(telas.i, false); return; }
    var t = e.touches[0];
    toque.dx = t.clientX - toque.x0; toque.dy = t.clientY - toque.y0;
    if (!toque.eixo) {
      if (Math.abs(toque.dx) < 8 && Math.abs(toque.dy) < 8) return;
      toque.eixo = Math.abs(toque.dx) > Math.abs(toque.dy) ? "x" : "y";
      if (donoDoGesto(toque.alvo, toque.eixo)) { toque = null; return; }
      pararTelas();
      toque.s0 = telas.page.scrollLeft;
    }
    if (e.cancelable) e.preventDefault();
    if (toque.eixo === "x") {
      var max = (telas.n - 1) * telas.passo;
      telas.page.scrollLeft = Math.max(0, Math.min(max, toque.s0 - toque.dx));
    }
  }
  function soltarToque(e) {
    var tq = toque;
    toque = null;
    if (!tq || !tq.eixo || !telas) return;
    var d = tq.eixo === "x" ? tq.dx : tq.dy, dt = Math.max(1, Date.now() - tq.t0);
    var rapido = Math.abs(d) > 24 && Math.abs(d) / dt > 0.35;
    var longe = tq.eixo === "x" ? Math.abs(d) > telas.passo * 0.22 : Math.abs(d) > 56;
    var dir = e.type === "touchend" && (rapido || longe) ? (d < 0 ? 1 : -1) : 0;
    virar(dir);
  }
  function aoRodar(e) {
    if (!telas || menuAberto || e.ctrlKey || janelaAberta() || !app.contains(e.target)) return;
    var eixo = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? "x" : "y", d = eixo === "x" ? e.deltaX : e.deltaY;
    if (!d || donoDoGesto(e.target, eixo, d)) return;
    e.preventDefault();
    // um gesto, uma tela: depois de virar, só vira de novo quando a roda (ou a inércia do touchpad) para um instante
    var agora = Date.now();
    if (agora - roda.ult > 160) { roda.acc = 0; roda.seguido = false; }
    roda.ult = agora;
    if (roda.seguido) return;
    roda.acc += e.deltaMode === 1 ? d * 33 : d;
    if (Math.abs(roda.acc) < 40) return;
    virar(roda.acc > 0 ? 1 : -1);
    roda.acc = 0;
    roda.seguido = true;
  }
  function aoTeclar(e) {
    if (!telas || menuAberto || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || janelaAberta()) return;
    var el = e.target, k = e.key, dir = 0;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable) return;
    if (el.closest && el.closest('[role="slider"], [role="tablist"], [role="listbox"], [role="radiogroup"], [role="menu"], [role="grid"], .viewer3d')) return;
    if (k === " " && el.closest && el.closest("button, a, summary, [role='button']")) return;
    if (k === "ArrowRight" || k === "PageDown" || (k === " " && !e.shiftKey)) dir = 1;
    else if (k === "ArrowLeft" || k === "PageUp" || (k === " " && e.shiftKey)) dir = -1;
    else if ((k === "ArrowDown" || k === "ArrowUp") && !donoDoGesto(el, "y")) dir = k === "ArrowDown" ? 1 : -1;
    else if (k === "Home" || k === "End") { e.preventDefault(); irParaTela(k === "Home" ? 0 : telas.n - 1, true); telas.ancora = ancoraNoTopo(); return; }
    if (!dir) return;
    e.preventDefault();
    virar(dir);
  }
  // Tab leva o foco a outra tela: a tela vai junto
  function aoFocar(e) {
    if (!telas || toque || !telas.page.contains(e.target)) return;
    var i = telaDe(e.target);
    if (i !== telas.i) { irParaTela(i, true); telas.ancora = e.target; }
  }
  // os ouvintes ficam ligados só enquanto há uma página em telas: fora dela, a rolagem não espera por eles
  var OUVINTES = [["touchstart", aoTocar, { passive: true }], ["touchmove", aoMover, { passive: false }], ["touchend", soltarToque],
    ["touchcancel", soltarToque], ["wheel", aoRodar, { passive: false }], ["keydown", aoTeclar], ["focusin", aoFocar]];
  function ouvir(liga) {
    OUVINTES.forEach(function (o) {
      if (liga) document.addEventListener(o[0], o[1], o[2] || false);
      else document.removeEventListener(o[0], o[1], o[2] || false);
    });
  }
  window.addEventListener("resize", function () { if (telas) { clearTimeout(tReajuste); tReajuste = setTimeout(reajustarTelas, 60); } });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (telas) reajustarTelas(); });

  /* o menu sobre a página: abre pelo botão de sintonia, pela busca ou pela tecla /, fecha pelo Esc */
  function prepararMenu() {
    $$(".mi-item[data-route]", menuLista).forEach(function (li) {
      var on = li.dataset.route === current, a = li.querySelector(".mi");
      li.classList.toggle("aqui", on);
      li.classList.remove("foco");
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    var noTitulo = current === "inicio";
    lendo.hidden = noTitulo;
    lendo.classList.toggle("foco", !noTitulo);
    if (noTitulo) {
      var ini = menuLista.querySelector('.mi-item[data-route="inicio"]');
      if (ini) ini.classList.add("foco");
    } else {
      var s = secAtual >= 0 ? secs[secAtual] : null;
      lendoDesc.textContent = textoPos(current, s ? s.t : "", Math.round(progresso * 100));
    }
    montarSecoes();
  }
  function montarSecoes() {
    var n = secs.length;
    secBox.hidden = n < 2;
    secLista.innerHTML = "";
    secMais.hidden = true;
    if (n < 2) return;
    var compacto = window.innerWidth < 760 && n > 4, idx = [], i;
    if (compacto && !verTodas) { var a = Math.max(0, Math.min(n - 3, secAtual - 1)); idx = [a, a + 1, a + 2]; }
    else for (i = 0; i < n; i++) idx.push(i);
    secLista.innerHTML = idx.map(function (k) {
      var s = secs[k], at = k === secAtual;
      return C.item_menu("#" + s.id, esc(s.t), { classe: at ? "atual" : "", a: { "aria-current": at ? "location" : null },
        antes: '<span class="sec-n">' + (k + 1) + "</span>" });
    }).join("");
    secMais.hidden = !compacto;
    secMais.textContent = verTodas ? "Mostrar menos" : "Ver as " + n + " seções";
  }
  secMais.addEventListener("click", function () { verTodas = !verTodas; montarSecoes(); });
  function abrirMenu(buscar) {
    if (menuAberto) { if (buscar) focar(input); return; }
    menuAberto = true;
    ultimoFoco = document.activeElement;
    verTodas = false;
    prepararMenu();
    clearTimeout(tFecha);
    menu.hidden = false;
    app.style.transformOrigin = "50% " + Math.round((window.scrollY || 0) + window.innerHeight / 2) + "px";
    void menu.offsetWidth;
    menu.classList.add("aberta");
    document.body.classList.add("pausado");
    document.documentElement.classList.add("sem-rolagem");
    if ("inert" in app) { app.inert = true; mapa.inert = true; } else app.setAttribute("aria-hidden", "true");
    knob.setAttribute("aria-expanded", "true");
    knob.setAttribute("aria-label", rotFechar);
    knobRot.textContent = rotFechar;
    cartao.classList.remove("on");
    if (buscar) focar(input);
    else focar(lendo.hidden ? menuLista.querySelector(".mi-item.foco .mi") || menuLista.querySelector(".mi") : lendo.querySelector(".mi"));
  }
  function fecharMenu(semVoltarFoco) {
    if (!menuAberto) return;
    menuAberto = false;
    menu.classList.remove("aberta");
    document.body.classList.remove("pausado");
    document.documentElement.classList.remove("sem-rolagem");
    if ("inert" in app) { app.inert = false; mapa.inert = false; } else app.removeAttribute("aria-hidden");
    knob.setAttribute("aria-expanded", "false");
    knob.setAttribute("aria-label", rotAbrir);
    knobRot.textContent = rotCurto;
    input.value = "";
    renderResults();
    clearTimeout(tFecha);
    tFecha = setTimeout(function () { if (!menuAberto) menu.hidden = true; }, reduce ? 0 : 380);
    if (!semVoltarFoco && ultimoFoco && document.contains(ultimoFoco)) focar(ultimoFoco);
    agendar();
  }
  knob.addEventListener("click", function () { if (menuAberto) fecharMenu(); else abrirMenu(false); });
  menu.addEventListener("click", function (e) {
    if (e.target.closest("[data-fechar]")) { fecharMenu(); return; }
    var a = e.target.closest('a[href^="#"]');
    if (!a || e.target.closest(".lang")) return;
    var id = a.getAttribute("href").slice(1), alvo = document.getElementById(id);
    // seção da própria página: fecha e rola até ela, sem recarregar a página
    if (alvo && pagina && pagina.contains(alvo) && !routes[id]) {
      e.preventDefault();
      fecharMenu(true);
      try { history.replaceState(null, "", "#" + id); } catch (er) {}
      setTimeout(function () { scrollToId(id); }, reduce ? 0 : 60);
      return;
    }
    fecharMenu(true);
  });
  // Tab fica dentro do menu enquanto ele está aberto
  menu.addEventListener("keydown", function (e) {
    if (e.key !== "Tab") return;
    var f = $$('a[href], button:not([disabled]), input', menu).filter(visivel);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); focar(f[f.length - 1]); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); focar(f[0]); }
  });

  /* o cursor do menu acompanha o mouse e as setas do teclado */
  function moverFoco(li, box) {
    if (!li || !box) return;
    $$(".mi-item.foco", box).forEach(function (x) { if (x !== li) x.classList.remove("foco"); });
    li.classList.add("foco");
    if (box === ttMenu) pintarPainel(li);
  }
  function setas(e) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    if (e.target.tagName === "INPUT") return;
    var itens = $$(".mi", e.currentTarget).filter(visivel), i = itens.indexOf(document.activeElement);
    if (i < 0) return;
    e.preventDefault();
    focar(itens[e.key === "ArrowDown" ? Math.min(itens.length - 1, i + 1) : Math.max(0, i - 1)]);
  }
  [ttMenu, menuLista].forEach(function (box) {
    if (!box) return;
    box.addEventListener("keydown", setas);
    // no toque, o foco não mexe no cursor: a descrição abriria e empurraria o item tocado para longe do dedo
    box.addEventListener("focusin", function (e) {
      var a = e.target.closest(".mi");
      var teclado = true;
      try { teclado = e.target.matches(":focus-visible"); } catch (er) {}
      if (a && teclado) moverFoco(a.closest(".mi-item"), box);
    });
    if (comMouse) box.addEventListener("mouseover", function (e) { var a = e.target.closest(".mi"); if (a) moverFoco(a.closest(".mi-item"), box); });
  });

  /* tela de título: Continuar volta para onde a pessoa parou, e o cursor lembra de onde ela veio */
  function pintarTitulo(veioDe) {
    if (!ttMenu) return;
    var pos = lerPos(), ok = !!(pos && pos.r && routes[pos.r] && pos.r !== "inicio");
    if (contLi) {
      contLi.hidden = !ok;
      if (ok) {
        contLi.querySelector(".mi").setAttribute("href", "#" + (pos.s || pos.r));
        contLi.querySelector(".mi-desc").textContent = textoPos(pos.r, pos.sn, pos.p || 0);
        contLi.querySelector(".mi-sub").textContent = tituloDe(pos.r) + ", " + (pos.p || 0) + "%";
        contLi.dataset.alvo = pos.r;
      }
    }
    var li = null;
    if (veioDe && veioDe !== "inicio") li = ttMenu.querySelector('.mi-item[data-route="' + veioDe + '"]');
    if (!li && ok) li = contLi;
    if (!li) li = ttMenu.querySelector(".mi-item[data-route]");
    moverFoco(li, ttMenu);
  }
  function pintarPainel(li) {
    if (!ttFoco || !li) return;
    var cont = li.classList.contains("mi-continuar"), r = cont ? li.dataset.alvo : li.dataset.route;
    var pos = cont ? lerPos() : null, toc = r ? tocDe(r) : [];
    ttFoco.querySelector(".tf-titulo").textContent = li.querySelector(".mi-nome").textContent;
    ttFoco.querySelector(".tf-desc").textContent = li.querySelector(".mi-desc").textContent;
    ttFoco.querySelector(".tf-secoes").innerHTML = toc.length > 1 ? toc.map(function (it, i) {
      return '<li><a href="#' + esc(it[0]) + '"' + (pos && pos.s === it[0] ? ' class="atual"' : "") + "><span>" + (i + 1) + "</span>" + esc(it[1]) + "</a></li>";
    }).join("") : "";
  }
  // o botão de sintonia some enquanto o menu da tela de título está à vista
  if (ttMenu && "IntersectionObserver" in window) {
    new IntersectionObserver(function (en) { document.body.classList.toggle("titulo-visivel", en[0].isIntersecting); }).observe(ttMenu);
  }

  // Links antigos. Ferramentas que viraram parte de uma página e páginas que foram juntadas a outra:
  var ANTIGAS = { placa: "hardware", botoes: "uso", ajuda: "problemas", menus: "ajustes", "menu-oficial": "ajustes", conectividade: "computador" };
  // as seções delas, que ganharam outro prefixo, e as que saíram porque repetiam uma ferramenta
  var PREFIXO = { menus: "ajustes--mod17-", conectividade: "computador--" };
  var SECOES = { "menu-oficial": "ajustes--oficial", "uso--botões": "botoes", "uso--ao-ligar-segurando": "botoes",
    "uso--buttons": "botoes", "uso--powering-on-while-holding": "botoes" };
  function show(route) {
    try { route = decodeURIComponent(route); } catch (e) {}
    if (SECOES[route]) route = SECOES[route];
    if (!routes[route]) {
      var base = route.split("--")[0], resto = route.slice(base.length + 2);
      if (PREFIXO[base] && resto) { route = PREFIXO[base] + resto; base = route.split("--")[0]; }
      // página de verdade, rota antiga, ou uma âncora que mora dentro de uma página
      var alvo = routes[base] ? base : ANTIGAS[base] || null;
      if (!alvo) { var dono = document.getElementById(base); dono = dono && dono.closest(".page"); if (dono) alvo = dono.dataset.route; }
      if (alvo) {
        if (document.getElementById(route)) pendingScroll = route;
        else if (route.indexOf("--") > 0) { try { document.dispatchEvent(new CustomEvent("app:reveal", { detail: route })); } catch (e) {} }
        route = alvo;
      }
    }
    if (!routes[route]) route = "inicio";
    if (menuAberto) fecharMenu(true);
    var page = routes[route], veioDe = current, mesma = veioDe === route;
    pages.forEach(function (p) { p.hidden = p !== page; });
    pagina = page;
    coletar(page);
    ligarTelas(page, mesma);
    secAtual = -2;
    current = route;
    document.body.classList.toggle("no-titulo", route === "inicio");
    try { document.dispatchEvent(new CustomEvent("app:show", { detail: route })); } catch (e) {}
    if (route === "inicio") pintarTitulo(veioDe);
    if (pendingScroll) { var id = pendingScroll; pendingScroll = null; if (!mesma) irAoTopo(); setTimeout(function () { scrollToId(id); }, 20); }
    else if (veioDe !== null && !mesma) {
      irAoTopo();
      var h = page.querySelector("h1");
      if (h) focar(h);
    }
    montarMapa();
    atualizar();
    syncLang(route);
  }
  // O link do outro idioma leva à mesma página. Só os itens de ajuste têm o mesmo id nos dois idiomas.
  function syncLang(route) {
    var h = location.hash.slice(1);
    try { h = decodeURIComponent(h); } catch (e) {}
    var keep = h.indexOf("ajustes--") === 0 ? h : route;
    $$(".lang-link").forEach(function (a) { a.href = a.getAttribute("data-base") + (keep && keep !== "inicio" ? "#" + keep : ""); });
  }
  window.addEventListener("hashchange", function () { show(location.hash.slice(1)); });
  window.addEventListener("scroll", agendar, { passive: true });
  window.addEventListener("resize", function () { montarMapa(); agendar(); if (menuAberto) montarSecoes(); });
  if ("ResizeObserver" in window) {
    var altMain = 0, tMain = null, mainEl = document.getElementById("main");
    new ResizeObserver(function () {
      if (mainEl.offsetHeight === altMain) return;
      altMain = mainEl.offsetHeight;
      clearTimeout(tMain);
      tMain = setTimeout(function () { montarMapa(); agendar(); }, 150);
    }).observe(mainEl);
  }

  Array.prototype.forEach.call(document.querySelectorAll(".prose pre"), function (pre) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "copy-btn"; b.textContent = "Copiar";
    b.addEventListener("click", function () {
      var code = pre.querySelector("code");
      var text = (code ? code.textContent : pre.textContent).replace(/\n$/, "");
      var done = function (msg) { b.textContent = msg; setTimeout(function () { b.textContent = "Copiar"; }, 1600); };
      try { navigator.clipboard.writeText(text).then(function () { done("Copiado"); }, function () { done("Selecione e copie"); }); }
      catch (e) { done("Selecione e copie"); }
    });
    pre.appendChild(b);
  });

  /* busca: mora no menu; os resultados ficam no lugar da lista enquanto há texto no campo */
  var DATA = [];
  try { DATA = JSON.parse(document.getElementById("search-data").textContent); } catch (e) { DATA = []; }
  function norm(s) { return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
  DATA.forEach(function (d) { d.nt = norm(d.t); d.nh = norm(d.h); d.np = norm(d.p); });
  var input = document.getElementById("q");
  var box = document.getElementById("results");
  var hits = [], sel = -1, terms = [];
  function find(q) {
    terms = norm(q).split(/\s+/).filter(function (t) { return t.length > 1; });
    if (!terms.length) return [];
    var res = [];
    DATA.forEach(function (d) {
      var score = 0;
      for (var i = 0; i < terms.length; i++) {
        var t = terms[i], inT = d.nt.indexOf(t) !== -1, inH = d.nh.indexOf(t) !== -1, inP = d.np.indexOf(t) !== -1;
        if (!inT && !inH && !inP) return;
        score += (inH ? 6 : 0) + (inP ? 3 : 0) + (inT ? 1 : 0);
      }
      res.push({ d: d, s: score });
    });
    res.sort(function (a, b) { return b.s - a.s; });
    return res.slice(0, 12).map(function (r) { return r.d; });
  }
  function highlight(orig, normed) {
    var ranges = [];
    terms.forEach(function (t) {
      var i = normed.indexOf(t);
      while (i !== -1) { ranges.push([i, i + t.length]); i = normed.indexOf(t, i + t.length); }
    });
    ranges.sort(function (a, b) { return a[0] - b[0]; });
    var out = "", pos = 0;
    ranges.forEach(function (r) {
      if (r[0] < pos) return;
      out += esc(orig.slice(pos, r[0])) + "<mark>" + esc(orig.slice(r[0], r[1])) + "</mark>";
      pos = r[1];
    });
    return out + esc(orig.slice(pos));
  }
  function snippet(d) {
    var first = -1;
    terms.forEach(function (t) { var i = d.nt.indexOf(t); if (i !== -1 && (first === -1 || i < first)) first = i; });
    if (first === -1) first = 0;
    var start = Math.max(0, first - 60), end = Math.min(d.t.length, start + 190);
    return (start > 0 ? "…" : "") + highlight(d.t.slice(start, end), d.nt.slice(start, end)) + (end < d.t.length ? "…" : "");
  }
  function renderResults() {
    var q = input.value.trim();
    if (!q) { box.hidden = true; box.innerHTML = ""; menu.classList.remove("buscando"); input.setAttribute("aria-expanded", "false"); hits = []; return; }
    hits = find(q); sel = hits.length ? 0 : -1;
    if (!hits.length) {
      box.innerHTML = '<p class="no-res">Nada encontrado. Tente outra palavra, como "squelch", "datasheet" ou "fuso".</p>';
    } else {
      box.innerHTML = hits.map(function (d, i) {
        var path = esc(d.p) + (d.h && d.h !== d.p ? " › " + esc(d.h) : "");
        return '<a class="result" role="option" href="#' + d.r + '" data-i="' + i + '" aria-selected="' + (i === sel) + '"><span class="r-path">' + path + '</span><span class="r-snip">' + snippet(d) + "</span></a>";
      }).join("");
    }
    box.hidden = false; menu.classList.add("buscando"); input.setAttribute("aria-expanded", "true");
  }
  function mark() {
    Array.prototype.forEach.call(box.querySelectorAll(".result"), function (a, i) {
      a.setAttribute("aria-selected", i === sel ? "true" : "false");
      if (i === sel) a.scrollIntoView({ block: "nearest" });
    });
  }
  function go(d) {
    fecharMenu(true);
    if (location.hash.slice(1) !== d.r) { pendingScroll = d.id || null; location.hash = d.r; }
    else if (d.id) { scrollToId(d.id); }
  }
  var timer = null;
  input.addEventListener("input", function () { clearTimeout(timer); timer = setTimeout(renderResults, 110); });
  input.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown" && hits.length) { e.preventDefault(); sel = (sel + 1) % hits.length; mark(); }
    else if (e.key === "ArrowUp" && hits.length) { e.preventDefault(); sel = (sel - 1 + hits.length) % hits.length; mark(); }
    else if (e.key === "Enter" && sel >= 0 && hits[sel]) { e.preventDefault(); go(hits[sel]); }
    else if (e.key === "Escape" && input.value) { e.preventDefault(); e.stopPropagation(); input.value = ""; renderResults(); }
  });
  box.addEventListener("click", function (e) {
    var a = e.target.closest(".result");
    if (!a) return;
    e.preventDefault();
    go(hits[+a.dataset.i]);
  });
  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest("[data-buscar]")) abrirMenu(true);
  });
  document.addEventListener("keydown", function (e) {
    var tag = (document.activeElement && document.activeElement.tagName) || "";
    if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA" && !e.target.isContentEditable) { e.preventDefault(); abrirMenu(true); }
    // o Esc fecha só a camada de cima: com a janela do perfil aberta por cima do menu, fecha só ela
    else if (e.key === "Escape" && menuAberto && !document.querySelector("dialog[open]")) { e.preventDefault(); fecharMenu(); }
  });

  show(location.hash.slice(1) || "inicio");
})();
