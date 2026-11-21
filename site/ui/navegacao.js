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
    if (secs.length < 2 || visivel(mapa)) return;
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
    if (!pagina || secs.length < 2 || current === "inicio") { mapa.hidden = true; return; }
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
    if (!q) { box.hidden = true; box.innerHTML = ""; menu.classList.remove("buscando"); input.setAttribute("aria-expanded", "false"); input.removeAttribute("aria-activedescendant"); hits = []; return; }
    hits = find(q); sel = hits.length ? 0 : -1;
    if (!hits.length) {
      // dentro da lista (listbox), o aviso também é uma opção, desativada
      box.innerHTML = '<p class="no-res" role="option" aria-disabled="true" aria-selected="false">Nada encontrado. Tente outra palavra, como "squelch", "datasheet" ou "fuso".</p>';
    } else {
      box.innerHTML = hits.map(function (d, i) {
        var path = esc(d.p) + (d.h && d.h !== d.p ? " › " + esc(d.h) : "");
        return '<a class="result" role="option" id="r-' + i + '" href="#' + d.r + '" data-i="' + i + '" aria-selected="' + (i === sel) + '"><span class="r-path">' + path + '</span><span class="r-snip">' + snippet(d) + "</span></a>";
      }).join("");
    }
    box.hidden = false; menu.classList.add("buscando"); input.setAttribute("aria-expanded", "true");
    // o leitor de tela anuncia a opção marcada, que as setas mudam, sem tirar o foco do campo
    if (sel >= 0) input.setAttribute("aria-activedescendant", "r-" + sel); else input.removeAttribute("aria-activedescendant");
  }
  function mark() {
    Array.prototype.forEach.call(box.querySelectorAll(".result"), function (a, i) {
      a.setAttribute("aria-selected", i === sel ? "true" : "false");
      if (i === sel) a.scrollIntoView({ block: "nearest" });
    });
    if (sel >= 0) input.setAttribute("aria-activedescendant", "r-" + sel);
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
