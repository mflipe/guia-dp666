(function () {
  "use strict";
  var C = Componentes;   // os componentes de ui/componentes.js (par de componentes.py)
  var DECIMAL = /^pt/.test(document.documentElement.lang) ? "," : ".";   // separador decimal do idioma da página
  var APP = JSON.parse(document.getElementById("app-data").textContent);

  // ---------------------------------------------------------------- utilidades
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function norm(s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
  function words(q) { return norm(q).split(/\s+/).filter(Boolean); }
  function matches(text, ws) { for (var i = 0; i < ws.length; i++) if (text.indexOf(ws[i]) < 0) return false; return true; }
  var store = {
    get: function (k, d) { try { var v = window.localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { window.localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* armazenamento indisponível */ } },
  };
  function seg(box, options, value, onChange) {
    box.innerHTML = options.map(function (o) {
      return C.opcao_seletor(esc(o[1]), { valor: o[0], marcado: o[0] === value });
    }).join("");
    function set(v) { $$("button", box).forEach(function (b) { b.setAttribute("aria-checked", String(b.dataset.v === v)); }); }
    box.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      set(b.dataset.v);
      onChange(b.dataset.v);
    });
    return { set: set };
  }

  // altura do que fica fixo no alto da tela (hoje nada: o guia não tem barra no topo)
  function topoFixo() { var v = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--topbar-h"), 10); return isNaN(v) ? 0 : v; }

  // ---------------------------------------------------------------- perfil do aparelho
  var PKEY = "dp666.perfil.v1";
  var FW_NAME = { mod17: "Mod17", oficial: "Linha oficial" };
  var FW_SHORT = { mod17: "Mod17", oficial: "Oficial" };   // no celular, o botão do perfil usa o nome curto
  var FW_OPTS = [["mod17", "Megatron Mod17"], ["oficial", "Linha oficial"]];
  var profile = store.get(PKEY, { fw: "", rtc: "?" });
  var listeners = [];
  function onProfile(fn) { listeners.push(fn); }
  function curFw() { return profile.fw || "mod17"; }
  function setProfile(p) {
    profile = p;
    store.set(PKEY, p);
    paintChip();
    listeners.forEach(function (fn) { try { fn(p); } catch (e) { /* ferramenta isolada */ } });
  }
  // o botão do perfil aparece na tela de título e no rodapé do menu; os dois mostram o mesmo
  var chips = $$(".profile-chip"), dlg = $("#profile-dlg");
  function paintChip() {
    chips.forEach(function (chip) {
      chip.dataset.set = profile.fw ? "yes" : "no";
      var label = chip.querySelector("span");
      if (profile.fw) label.innerHTML = '<span class="chip-l">' + FW_NAME[profile.fw] + '</span><span class="chip-s">' + FW_SHORT[profile.fw] + "</span>";
      else label.textContent = "Seu rádio";
      chip.setAttribute("aria-label", "Seu rádio: " + (profile.fw ? FW_NAME[profile.fw] : "firmware não informado") + ". Toque para mudar.");
    });
  }
  function openProfile() {
    var f = dlg.querySelector("form");
    $$('input[name="fw"]', f).forEach(function (i) { i.checked = i.value === profile.fw; });
    $$('input[name="rtc"]', f).forEach(function (i) { i.checked = i.value === (profile.rtc || "?"); });
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
  }
  dlg.addEventListener("close", function () {
    if (dlg.returnValue !== "ok") return;
    var f = dlg.querySelector("form");
    var a = f.querySelector('input[name="fw"]:checked'), r = f.querySelector('input[name="rtc"]:checked');
    setProfile({ fw: a ? a.value : profile.fw, rtc: r ? r.value : (profile.rtc || "?") });
  });
  $("[data-close]", dlg).addEventListener("click", function () { if (dlg.close) dlg.close("cancel"); });
  chips.forEach(function (chip) { chip.addEventListener("click", openProfile); });

  function paintHome() {
    var box = $("#home-profile");
    if (!box) return;
    if (!profile.fw) {
      box.innerHTML = '<div class="hp-main"><p class="hp-title">Qual firmware está no seu rádio?</p>' +
        '<p class="hp-sub">Com isso, os botões e os menus aparecem como no seu aparelho. Na dúvida, veja ' +
        '<a href="#inicio--qual-firmware-está-no-meu-rádio">como descobrir</a>.</p></div>' +
        '<div class="hp-actions">' + C.botao("Megatron Mod17", { variante: "solido", attrs: { "data-fw": "mod17" } }) +
        C.botao("Linha oficial", { variante: "fantasma", attrs: { "data-fw": "oficial" } }) + "</div>";
      return;
    }
    var rtc = { sim: "com relógio interno", nao: "sem relógio interno", "?": "relógio interno não verificado" }[profile.rtc || "?"];
    var tip = "";
    if (profile.rtc === "nao") tip = "Sem RTC, a hora vem da internet (NTP) ou do RDS e se perde quando a chave geral vai para OFF.";
    else if (profile.rtc === "sim" && profile.fw === "mod17") tip = "Segundo a DEEPELEC, acertar o relógio interno pede o Mod17 de 05/04/2025.";
    else if (profile.rtc !== "sim") tip = 'Não sabe se o rádio tem relógio? Faça o <a href="#hardware--teste-de-rtc">teste do RTC</a>.';
    box.innerHTML = '<div class="hp-main"><p class="hp-title">Seu rádio: ' + esc(FW_NAME[profile.fw]) + ", " + rtc + "</p>" +
      (tip ? '<p class="hp-sub">' + tip + "</p>" : "") + '</div><div class="hp-actions">' +
      C.botao("Mudar", { variante: "fantasma", attrs: { "data-open-profile": true } }) + "</div>";
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("#home-profile [data-fw], #home-profile [data-open-profile]");
    if (!b) return;
    if (b.hasAttribute("data-open-profile")) openProfile();
    else setProfile({ fw: b.dataset.fw, rtc: profile.rtc || "?" });
  });

  // ---------------------------------------------------------------- tema do guia (tema.py)
  // o botão fica no rodapé do menu e na tela de título; a escolha vale na hora. O script do <head> já aplicou a
  // escolha guardada antes de a página aparecer, e é ele que troca o tema (window.dp666Tema).
  var TKEY = "dp666.tema", temaDlg = $("#tema-dlg"), temaBtns = $$(".tema-btn"), temaNomes = {};
  if (temaDlg) {
    $$('input[name="tema"]', temaDlg).forEach(function (i) { temaNomes[i.value] = $("strong", i.parentNode).textContent; });
    var temaAtual = function () { var t = store.get(TKEY, ""); return Object.prototype.hasOwnProperty.call(temaNomes, t) && t !== "auto" ? t : "auto"; };
    var pintarTema = function () {
      var nome = temaNomes[temaAtual()];
      temaBtns.forEach(function (b) { b.setAttribute("aria-label", b.dataset.rotulo + ": " + nome); $(".tema-btn-t", b).textContent = nome; });
    };
    var aplicarTema = function (t) {
      store.set(TKEY, t === "auto" ? "" : t);
      if (window.dp666Tema) window.dp666Tema(t === "auto" ? "" : t);
      pintarTema();
    };
    temaBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var t = temaAtual();
        $$('input[name="tema"]', temaDlg).forEach(function (i) { i.checked = i.value === t; });
        if (temaDlg.showModal) temaDlg.showModal(); else temaDlg.setAttribute("open", "");
      });
    });
    temaDlg.addEventListener("change", function (e) { if (e.target.name === "tema") aplicarTema(e.target.value); });
    // a escolha feita em outra aba vale nesta também
    window.addEventListener("storage", function (e) {
      if (e.key !== TKEY) return;
      if (window.dp666Tema) window.dp666Tema(temaAtual() === "auto" ? "" : temaAtual());
      pintarTema();
    });
    pintarTema();
  }

  // ---------------------------------------------------------------- rádio virtual (radio/, radio_guia.py)
  // o botão fica ao lado do tema, no alto de cada página, na tela de título e no rodapé do menu. O rádio só carrega
  // no primeiro toque (painel.css, radio.js, painel.js e dados.json) e abre por cima de qualquer página. Tocar no
  // botão com o rádio aberto minimiza; o fechar fica no próprio painel. Aberto ou minimizado, ele volta assim ao
  // trocar de idioma (a escolha fica guardada só nesta aba).
  var RKEY = "dp666.radio.painel", radioDoca = $("#radio-doca"), radioBtns = $$(".radio-btn"), radioCtrl = null, radioCarga = null;
  if (radioDoca) {
    var radioBase = radioDoca.getAttribute("data-base");
    var radioArquivo = function (src, css) {
      return new Promise(function (ok, erro) {
        var e = document.createElement(css ? "link" : "script");
        if (css) { e.rel = "stylesheet"; e.href = src; } else e.src = src;
        e.onload = ok; e.onerror = erro;
        document.head.appendChild(e);
      });
    };
    var radioMudou = function (s) {
      radioBtns.forEach(function (b) { b.setAttribute("aria-expanded", String(s === "aberto")); b.setAttribute("data-estado", s); });
      try { window.sessionStorage.setItem(RKEY, s); } catch (e) { /* armazenamento indisponível */ }
    };
    var radioCarregar = function () {
      return radioCarga || (radioCarga = Promise.all([
        radioArquivo(radioBase + "painel.css", true),
        radioArquivo(radioBase + "radio.js").then(function () { return radioArquivo(radioBase + "painel.js"); }),
      ]).then(function () {
        radioCtrl = window.RadioVirtual.montar(radioDoca, { lingua: /^en/.test(document.documentElement.lang) ? "en" : "pt", base: radioBase, modo: "painel", aoMudar: radioMudou });
        return radioCtrl.pronto;
      }));
    };
    var radioMostrar = function (s, focar) {
      return radioCarregar().then(function () { return radioCtrl.mostrar(s); }).then(function () { if (focar) radioCtrl.focar(); });
    };
    radioBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        radioMostrar(radioCtrl && radioCtrl.situacao() === "aberto" ? "minimizado" : "aberto", true);
      });
    });
    var radioAntes = null;
    try { radioAntes = window.sessionStorage.getItem(RKEY); } catch (e) { /* armazenamento indisponível */ }
    if (radioAntes === "aberto" || radioAntes === "minimizado") radioMostrar(radioAntes, false);
  }

  // ---------------------------------------------------------------- simulador de botões
  var VKEY = "dp666.botoes.vista";
  var HW_ORDER = ["volume", "sql", "chave", "fone", "falante", "usbc", "antena", "tela", "teclado", "power"];
  function Sim(root) {
    var D = APP.botoes, HW = APP.painel;
    var st = { fw: curFw(), mode: "uso", combo: {}, rot: 0, view: store.get(VKEY, "3d") === "2d" ? "2d" : "3d" };
    var shown = false, p3 = null, p3loading = false;
    root.innerHTML =
      '<div class="tool-bar">' + C.seletor("Firmware") + C.seletor("Situação") + C.seletor("Visualização") + "</div>" +
      '<div class="sim-wrap"><div class="sim-left">' +
      '<div class="sim-3d" hidden><div class="p3-stage"><div class="pl-load">Carregando o painel em 3D…</div></div>' +
      C.nota("Toque num controle; segure para o toque longo. O painel agrupa os controles por função e não segue a forma do rádio.", { classe: "sim-hint p3-hint" }) + "</div>" +
      '<div class="sim-panel" role="group" aria-label="Controles"></div>' +
      '<div class="sim-boot" hidden>' + C.botao("Ligar o rádio", { variante: "solido", attrs: { "data-power": true } }) + "</div>" +
      '<div class="sim-extra" role="group" aria-label="Outros controles"></div></div>' +
      '<div><div class="sim-onde" hidden><p class="sim-onde-t">Onde fica no rádio</p><div class="viewer3d"><div class="sim-onde-box"></div></div></div>' +
      '<div class="sim-out" aria-live="polite"></div><ul class="sim-notes"></ul><p class="sim-ref"></p></div></div>';
    var segs = $$(".seg", root), panel = $(".sim-panel", root), out = $(".sim-out", root), wrap = $(".sim-wrap", root);
    var pagina = root.closest(".page"), rotaPagina = pagina ? pagina.dataset.route : "botoes";

    // onde fica o controle tocado: o rádio montado com as fotos gira até ele e marca o lugar
    var onde3d = null, ondeCarregando = false, ondeId = null;
    function onde(id) {
      ondeId = id;
      var box = $(".sim-onde", root);
      box.hidden = false;
      if (onde3d) { onde3d.show(id); return; }
      if (st.view === "3d") carregarOnde();
      else if (!ondeCarregando && !$(".sim-onde-btn", box)) {
        $(".sim-onde-box", box).innerHTML = C.botao("Ver onde fica no rádio", { variante: "fantasma", classe: "sim-onde-btn" });
      }
    }
    function carregarOnde() {
      if (ondeCarregando) return;
      ondeCarregando = true;
      var alvo = $(".sim-onde-box", root);
      alvo.innerHTML = '<div class="pl-load">Carregando o rádio em 3D…</div>';
      import("./js/viewer3d.js").then(function (m) {
        onde3d = m.mountFotos(alvo, { compacto: true });
        if (onde3d && ondeId) onde3d.show(ondeId);
      }).catch(function () {
        ondeCarregando = false;
        alvo.innerHTML = C.nota('Não foi possível abrir o rádio em 3D. As fotos estão em <a href="#uso--onde-fica-cada-coisa">Onde fica cada coisa</a>.', { classe: "sim-hint" });
      });
    }
    root.addEventListener("click", function (e) { if (e.target.closest(".sim-onde-btn")) carregarOnde(); });
    var fwSeg = seg(segs[0], FW_OPTS, st.fw, function (v) { st.fw = v; st.combo = {}; render(); });
    seg(segs[1], [["uso", "Com o rádio ligado"], ["ligar", "Ao ligar segurando"]], st.mode, function (v) { st.mode = v; st.combo = {}; render(); });
    seg(segs[2], [["3d", "3D"], ["2d", "Simples"]], st.view, function (v) { st.view = v; store.set(VKEY, v); render(); });

    function ctrl(id) { return D[st.fw].controles.filter(function (c) { return c.id === id; })[0]; }
    function act(c, kind) { return c.acoes.filter(function (a) { return a[0] === kind; })[0]; }
    function label(id) { var c = ctrl(id); return c ? c.rotulo : id; }
    function key(c, cls) {
      return '<button type="button" class="sim-key' + (cls || "") + '" data-c="' + c.id + '"' +
        (st.mode === "ligar" ? ' aria-pressed="' + !!st.combo[c.id] + '"' : "") + ">" + esc(c.rotulo) +
        '<span class="bar" aria-hidden="true"><i></i></span></button>';
    }
    function hwText(id) {
      var e = HW[id];
      if (!e) return null;
      return { titulo: e.titulo, texto: typeof e.texto === "string" ? e.texto : (e.texto[st.fw] || e.texto.mod17 || "") };
    }
    function hwList() { return HW_ORDER.filter(function (id) { return !ctrl(id) && hwText(id) && hwText(id).texto; }); }
    function render() {
      var is3d = st.view === "3d", uso = st.mode === "uso";
      $(".sim-onde", root).hidden = true; // volta a aparecer no próximo toque, junto com a explicação
      wrap.classList.toggle("is3d", is3d);
      $(".sim-3d", root).hidden = !is3d;
      panel.hidden = is3d;
      $(".sim-extra", root).hidden = is3d;
      $(".sim-boot", root).hidden = uso;
      if (!is3d) {
        var cs = D[st.fw].controles;
        var knob = cs.filter(function (c) { return c.knob; })[0];
        var big = cs.filter(function (c) { return !c.knob && c.id !== "boot" && c.id !== "power"; });
        var small = cs.filter(function (c) { return c.id === "boot" || c.id === "power"; });
        panel.innerHTML =
          '<div class="sim-knob-row">' +
          (uso ? C.botao("↺", { classe: "sim-rot", attrs: { "data-rot": "-1", "aria-label": "Girar o " + knob.rotulo + " para a esquerda" } }) : "") +
          '<div class="sim-knob' + (st.combo[knob.id] ? " on" : "") + '" role="button" tabindex="0" data-c="' + knob.id + '" style="--rot:' + st.rot + 'deg"' +
          (uso ? "" : ' aria-pressed="' + !!st.combo[knob.id] + '"') + '><span class="mark" aria-hidden="true"></span>' + esc(knob.rotulo) + "</div>" +
          (uso ? C.botao("↻", { classe: "sim-rot", attrs: { "data-rot": "1", "aria-label": "Girar o " + knob.rotulo + " para a direita" } }) : "") +
          "</div>" +
          '<div class="sim-keys">' + big.map(function (c) { return key(c, st.combo[c.id] ? " on" : ""); }).join("") + "</div>" +
          '<div class="sim-keys">' + small.map(function (c) { return key(c, " small" + (st.combo[c.id] ? " on" : "")); }).join("") + "</div>";
        $(".sim-extra", root).innerHTML = '<span class="sim-hint">Outros controles:</span>' + hwList().map(function (id) {
          return C.botao(esc(hwText(id).titulo), { classe: "chip-btn", attrs: { "data-hw": id } });
        }).join("");
      } else if (shown) {
        ensure3d();
      }
      if (p3) { p3.setMode(st.mode); p3.setHeld(st.combo); }
      out.innerHTML = uso
        ? C.nota((is3d ? "Toque num controle do painel." : "Toque num botão para o toque curto.") +
          " Segure para o toque longo: " + (is3d ? "a barra no pé do painel" : "a barra embaixo dele") + " mostra o tempo.", { classe: "sim-hint" })
        : C.nota("Escolha os botões que ficam apertados e toque em “Ligar o rádio”.", { classe: "sim-hint" }) + comboList();
      $(".sim-notes", root).innerHTML = D[st.fw].notas.map(function (n) { return "<li>" + n + "</li>"; }).join("");
      var ref = D[st.fw].ref;
      $(".sim-ref", root).innerHTML = ref ? 'Detalhes em <a href="#' + ref + '">Uso da linha oficial</a>.' : "";
    }
    function comboList() {
      return '<ul class="sim-acts">' + D[st.fw].ligar.map(function (l) {
        return '<li class="' + (l[2] === "perigo" ? "perigo" : "") + '"><span class="k">' + l[0].map(label).join(" + ") + "</span>" + l[1] + "</li>";
      }).join("") + "</ul>";
    }
    // no celular: rola só o necessário para o "onde fica" e o começo da explicação ficarem à vista, acima do botão de sintonia
    function reveal() {
      if (window.innerWidth > 760) return;
      var box = $(".sim-onde", root), ini = box.hidden ? out : box;
      var kn = $(".sintonia"), baixo = (kn && kn.getClientRects().length ? Math.min(window.innerHeight, kn.getBoundingClientRect().top) : window.innerHeight) - 12;
      var fim = out.getBoundingClientRect().top + Math.min(out.offsetHeight, 180);
      if (fim <= baixo) return;
      var alto = topoFixo() + 12;
      var dy = Math.min(fim - baixo, ini.getBoundingClientRect().top - alto);
      if (dy > 0) window.scrollBy({ top: dy, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
    function showAction(c, kind, ms) {
      var did = { curto: "Toque curto", longo: "Toque longo", segurar: "Segurou", girar: "Girou" }[kind];
      if (ms != null) did += " · " + (ms / 1000).toFixed(1).replace(".", DECIMAL) + " s";
      out.innerHTML = "<h3>" + esc(c.rotulo) + '</h3><p class="sim-did">' + did + '</p><ul class="sim-acts">' +
        c.acoes.map(function (a) {
          return '<li class="' + (a[0] === kind ? "hit" : "") + '"><span class="k">' + esc(a[1]) + "</span>" + a[2] + "</li>";
        }).join("") + "</ul>" +
        (c.knob && st.view === "3d" ? '<div class="p3-rot">' + C.botao("↺ Girar", { variante: "fantasma", attrs: { "data-rot3": "-1" } }) +
          C.botao("Girar ↻", { variante: "fantasma", attrs: { "data-rot3": "1" } }) + "</div>" : "");
      onde(c.id);
      reveal();
    }
    function showHw(id) {
      var h = hwText(id);
      if (!h) return;
      out.innerHTML = "<h3>" + esc(h.titulo) + '</h3><ul class="sim-acts"><li>' + h.texto + "</li></ul>";
      onde(id);
      reveal();
    }
    function power() {
      var ids = Object.keys(st.combo).filter(function (k) { return st.combo[k]; }).sort();
      var hit = D[st.fw].ligar.filter(function (l) { return l[0].slice().sort().join() === ids.join(); })[0];
      var head = ids.length ? "Ligou segurando " + ids.map(label).join(" + ") : "Ligou sem segurar nada";
      var body = !ids.length ? "O rádio liga normalmente."
        : hit ? hit[1] : "Nenhuma combinação conhecida com esses botões. As documentadas estão na lista abaixo.";
      out.innerHTML = "<h3>" + esc(head) + '</h3><ul class="sim-acts"><li class="hit' + (hit && hit[2] === "perigo" ? " perigo" : "") + '">' + body + "</li></ul>" +
        C.nota("Todas as combinações:", { classe: "sim-hint", attrs: { style: "margin-top:14px" } }) + comboList();
      reveal();
    }
    function kindFor(c, ms) {
      var hold = act(c, "segurar");
      if (hold && ms >= hold[3]) return "segurar";
      if (act(c, "longo") && ms >= D[st.fw].longo_ms) return "longo";
      return act(c, "curto") ? "curto" : c.acoes[0][0];
    }
    function maxMs(c) {
      var hold = act(c, "segurar");
      return hold ? hold[3] : act(c, "longo") ? D[st.fw].longo_ms : 300;
    }
    function toggleCombo(id) {
      st.combo[id] = !st.combo[id];
      if (p3) p3.setHeld(st.combo);
      if (st.combo[id]) onde(id);
    }

    // painel 3D: o arquivo só baixa quando a ferramenta aparece
    function ensure3d() {
      if (p3 || p3loading) return;
      p3loading = true;
      import("./js/viewer3d.js").then(function (m) {
        p3 = m.mountPainel($(".p3-stage", root), {
          thresholds: function (id) {
            var c = ctrl(id);
            if (!c || st.mode !== "uso") return null;
            var hold = act(c, "segurar");
            return { long: act(c, "longo") ? D[st.fw].longo_ms : null, hold: hold ? hold[3] : null };
          },
          press: function (id, ms) {
            var c = ctrl(id);
            if (st.mode === "ligar" && c) { toggleCombo(id); out.innerHTML = C.nota("Apertados: " + (Object.keys(st.combo).filter(function (k) { return st.combo[k]; }).map(label).join(" + ") || "nenhum") + ". Toque em “Ligar o rádio”.", { classe: "sim-hint" }) + comboList(); return; }
            if (c) showAction(c, kindFor(c, ms), ms);
            else showHw(id);
          },
        });
        if (p3) { p3.setMode(st.mode); p3.setHeld(st.combo); }
      }).catch(function () {
        p3loading = false;
        $(".p3-stage", root).innerHTML = '<div class="pl-load">Não foi possível abrir o painel em 3D. Use a visualização simples.</div>';
      });
    }
    document.addEventListener("app:show", function (e) {
      if (e.detail !== rotaPagina) return;
      shown = true;
      if (st.view === "3d") ensure3d();
    });

    var press = null;
    function frame() {
      if (!press) return;
      press.el.style.setProperty("--p", Math.min(1, (performance.now() - press.t0) / press.max));
      press.raf = requestAnimationFrame(frame);
    }
    panel.addEventListener("pointerdown", function (e) {
      var t = e.target.closest("[data-c]");
      if (!t || st.mode !== "uso" || e.button > 0) return;
      e.preventDefault();
      var c = ctrl(t.dataset.c);
      press = { el: t, c: c, t0: performance.now(), max: maxMs(c) };
      try { t.setPointerCapture(e.pointerId); } catch (err) { /* sem captura */ }
      frame();
    });
    function endPress(cancel) {
      if (!press) return;
      var p = press;
      press = null;
      cancelAnimationFrame(p.raf);
      p.el.style.setProperty("--p", 0);
      if (!cancel) { var ms = performance.now() - p.t0; showAction(p.c, kindFor(p.c, ms), ms); }
    }
    panel.addEventListener("pointerup", function () { endPress(false); });
    panel.addEventListener("pointercancel", function () { endPress(true); });
    panel.addEventListener("contextmenu", function (e) { if (e.target.closest("[data-c]")) e.preventDefault(); });
    root.addEventListener("click", function (e) {
      var r3 = e.target.closest("[data-rot3]");
      if (r3) {
        var k3 = D[st.fw].controles.filter(function (c) { return c.knob; })[0];
        if (p3) p3.rotate("enc", Number(r3.dataset.rot3));
        showAction(k3, "girar");
        return;
      }
      var hw = e.target.closest("[data-hw]");
      if (hw) { showHw(hw.dataset.hw); return; }
      if (e.target.closest("[data-power]")) { power(); return; }
      var r = e.target.closest("[data-rot]");
      if (r) {
        st.rot += 30 * Number(r.dataset.rot);
        var k = $(".sim-knob", panel);
        k.style.setProperty("--rot", st.rot + "deg");
        showAction(ctrl(k.dataset.c), "girar");
        return;
      }
      var t = e.target.closest(".sim-panel [data-c]");
      if (!t) return;
      if (st.mode === "ligar") {
        toggleCombo(t.dataset.c);
        t.classList.toggle("on", st.combo[t.dataset.c]);
        t.setAttribute("aria-pressed", String(st.combo[t.dataset.c]));
      } else if (e.detail === 0) {
        showAction(ctrl(t.dataset.c), "curto"); // teclado: Enter ou espaço
      }
    });
    panel.addEventListener("keydown", function (e) {
      var t = e.target.closest(".sim-knob");
      if (t && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); t.click(); }
    });
    onProfile(function () { st.fw = curFw(); fwSeg.set(st.fw); st.combo = {}; render(); });
    render();
  }

  // ---------------------------------------------------------------- ajustes do rádio
  var CHEV = '<svg class="aj-chev" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function shortGroup(t) {
    var map = { "Conectividade e relógio": "Conectividade", "Opções FM DX": "FM DX", "Memória automática": "Memória", "Sobre o software": "Sobre", "Frequency scanning": "Scanning" };
    return map[t] || t.replace(/^Configurações (de |do )?/, "").replace(/ settings$/, "").replace(/^./, function (c) { return c.toUpperCase(); });
  }
  function highlight(text, ws) {
    if (!ws.length) return esc(text);
    var n = norm(text), marks = [];
    ws.forEach(function (w) { var i = n.indexOf(w); if (i >= 0) marks.push([i, i + w.length]); });
    if (!marks.length) return esc(text);
    marks.sort(function (a, b) { return a[0] - b[0]; });
    var out = "", pos = 0;
    marks.forEach(function (m) {
      if (m[0] < pos) return;
      out += esc(text.slice(pos, m[0])) + "<mark>" + esc(text.slice(m[0], m[1])) + "</mark>";
      pos = m[1];
    });
    return out + esc(text.slice(pos));
  }
  function Exp(root) {
    var D = APP.ajustes, CK = APP.checklist, DKEY = "dp666.brasil.v1";
    var st = { fw: curFw(), q: "", view: "todos", tag: "" };
    var TAGS = D.tags || {};
    var done = store.get(DKEY, { mod17: [], oficial: [] });
    var byId = {};
    root.innerHTML =
      '<div class="tool-bar">' + C.seletor("Firmware") + C.seletor("Lista") + "</div>" +
      '<div class="aj-todos"><div class="aj-filtro" role="radiogroup" aria-label="Mostrar"></div><div class="aj-bar">' +
      '<input class="tool-search" type="search" placeholder="Buscar: desênfase, AGC, fuso…" aria-label="Buscar ajuste">' +
      '<p class="aj-count" aria-live="polite"></p><nav class="aj-chips" aria-label="Grupos"></nav></div>' +
      '<div class="aj-cols"><nav class="aj-side" aria-label="Grupos"></nav><div class="aj-list"></div></div></div>' +
      '<div class="aj-brasil" id="ajustes--brasil" hidden></div>';
    var segs = $$(".seg", root), input = $(".tool-search", root), list = $(".aj-list", root);
    var bar = $(".aj-bar", root), chips = $(".aj-chips", root), side = $(".aj-side", root), brBox = $(".aj-brasil", root);
    var filtro = $(".aj-filtro", root);
    var fwSeg = seg(segs[0], FW_OPTS, st.fw, function (v) { st.fw = v; renderAll(); });
    var viewSeg = seg(segs[1], [["todos", "Todos os ajustes"], ["brasil", "Para o Brasil"]], st.view, function (v) { st.view = v; showView(); });

    var INTRO = {
      oficial: "Valores, ordem e padrões de fábrica conferidos no código-fonte da v2.20.12, na compilação para o DP-66X. " +
        "Nas listas, girar o encoder segue a ordem mostrada e, depois da última opção, volta à primeira.",
      mod17: "Valores do manual oficial V1.1, do changelog da DEEPELEC e das strings do firmware, que não são oficiais. " +
        "O padrão de fábrica só aparece quando o manual informa. As listas seguem a ordem do ciclo quando a fonte a mostra."
    };
    var COMO = "Abra uma opção para ver o que ela faz, por que é útil e quando vale a pena mudar. A etiqueta de cada uma " +
      "diz para quem ela importa: Vale ajustar e Para DX são as que costumam fazer diferença.";
    function introHtml() {
      var g = D.glossario || [];
      return '<div class="aj-intro"><p>' + COMO + "</p><p>" + INTRO[st.fw] + "</p>" +
        (g.length ? '<details class="aj-gloss"><summary>O que significam os termos</summary><dl>' + g.map(function (x) {
          return "<div><dt>" + esc(x[0]) + "</dt><dd>" + x[1] + "</dd></div>";
        }).join("") + "</dl></details>" : "") + "</div>";
    }
    function didHtml(it) {
      var d = it.did || {}, h = "";
      if (d.util) h += '<p class="aj-util"><strong>Por que é útil:</strong> ' + d.util + "</p>";
      if (d.quando) h += '<ul class="aj-quando">' + d.quando.map(function (q) { return "<li><strong>" + q[0] + "</strong> " + q[1] + "</li>"; }).join("") + "</ul>";
      if (d.obs) h += '<p class="aj-obs">' + d.obs + "</p>";
      return h;
    }
    function paintFiltro() {
      var all = [].concat.apply([], D[st.fw].grupos.map(function (g) { return g.itens; }));
      var n = function (t) { return all.filter(function (it) { return !t || it.tag === t; }).length; };
      filtro.innerHTML = [["", "Todas"], ["ajuste", TAGS.ajuste || "Vale ajustar"], ["dx", TAGS.dx || "Para DX"]].map(function (o) {
        return C.opcao_seletor(esc(o[1]) + "<span>" + n(o[0]) + "</span>", { valor: o[0], marcado: st.tag === o[0], chave: "t" });
      }).join("");
    }
    filtro.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-t]");
      if (!b) return;
      st.tag = b.dataset.t;
      renderAll();
    });
    function busca(it, g) {
      if (!it.busca) {
        var s = it.spec || {};
        var d = it.did || {};
        it.busca = norm([it.nome, it.en, it.sub, it.valores, s.nota, s.resumo, (it.html || "").replace(/<[^>]+>/g, " "), g.titulo, s.tl,
          it.adv ? "modo avancado" : "", TAGS[it.tag] || "", it.tag === "dx" ? "dx" : "", d.util || "",
          (d.quando || []).map(function (q) { return q.join(" "); }).join(" ").replace(/<[^>]+>/g, " ")].join(" "));
      }
      return it.busca;
    }
    function kv(k, v, cls) { return '<div class="aj-kv' + (cls ? " " + cls : "") + '"><dt>' + k + "</dt><dd>" + v + "</dd></div>"; }
    function mark(d, b) { return d || b ? "<small>" + (d && b ? "padrão e Brasil" : d ? "padrão" : "Brasil") + "</small>" : ""; }
    function opt(label, d, b, tag, sw) {
      return C.opcao((sw || "") + esc(label) + mark(d, b), { tag: tag, padrao: d, brasil: b });
    }
    // prévia dos temas e das fontes da frequência: cores tiradas do código e o número desenhado com as fontes do firmware
    // cada firmware guarda o seu tema e a sua fonte na prévia; temas sem cores conhecidas ficam sem prévia
    var PV = D.previa || { fontes: {} }, pv = {}, pvN = 0, paletas = {}, nomesCor = {};
    ["oficial", "mod17"].forEach(function (fw) {
      var e = pv[fw] = { tema: "", fonte: "", foco: "" };
      (D[fw] ? D[fw].grupos : []).forEach(function (g) {
        g.itens.forEach(function (x) {
          var sp = x.spec || {};
          if (sp.previa === "tema" && sp.paleta) {
            paletas[fw] = sp.paleta;
            nomesCor[fw] = sp.nomes;
            e.tema = sp.paleta[x.padrao] ? x.padrao : sp.opcoes.filter(function (o) { return sp.paleta[o]; })[0];
          }
          if (sp.previa === "fonte" && !e.fonte) e.fonte = PV.fontes[x.padrao] ? x.padrao : PV.fontes.Aura2 ? "Aura2" : sp.opcoes[0];
        });
      });
    });
    function digitos(nome, cor, x, y, pp) {
      var f = PV.fontes[nome];
      if (!f) return "";
      var id = "pvf" + (++pvN);
      return '<filter id="' + id + '" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB"><feFlood ' +
        (cor ? 'flood-color="' + cor + '"' : 'style="flood-color:var(--ink)"') + '/><feComposite in2="SourceAlpha" operator="in"/></filter>' +
        '<image href="' + f.png + '" x="' + x + '" y="' + y + '" width="' + f.w + '" height="' + f.h + '" filter="url(#' + id + ')"' + (pp || "") + "/>";
    }
    // papéis de cor de um tema: rótulo, onde aparece (segundo o código da linha oficial) e se está na telinha
    var PAPEIS = [
      ["fundo", "Fundo da tela", "O fundo de todas as telas. Também o texto dentro das etiquetas acesas, como MAN e AUTO BW.", 1],
      ["moldura", "Moldura", "A borda e as linhas que dividem a tela principal e as telas de RDS e de AF. Nos menus de toque, o fundo dos botões.", 1],
      ["freq", "Frequência", "O número grande da frequência e o nível do sinal.", 1],
      ["ativo", "Rótulos", "Os textos fixos: MHz, kHz, dBµV, CN, US, MP, as escalas dos medidores, a borda da bateria e os nomes e títulos dos menus.", 1],
      ["prim", "Principal", "Os valores que mudam: CN, US, MP, os valores nos menus, as bandas no seletor e a marca de pico da modulação. O alto-falante fica nessa cor quando o squelch corta o som.", 1],
      ["sec", "Secundária", "O fundo das etiquetas acesas: o modo de sintonia (MAN, AUTO ou MEM), AUTO BW, iMS e EQ.", 1],
      ["rds", "RDS", "O nome da estação (PS), o PI, o PTY, o RadioText, o relógio do RDS e o logo RDS aceso.", 1],
      ["st", "Estéreo", "O ícone de estéreo, aceso quando a estação transmite em estéreo.", 1],
      ["cinza", "Apagado", "O que está desligado: etiquetas apagadas, os ícones de estéreo e RDS sem sinal, TP, TA e AF ausentes, a parte vazia dos medidores e o alto-falante com som.", 1],
      ["bar", "Medidor de sinal, início", "O começo do medidor de sinal, que passa em degradê para a cor do fim. Também a carga da bateria e a barra da memória automática.", 1],
      ["barS", "Medidor de sinal, fim", "O fim do medidor de sinal, com sinal forte. Também a bateria vazia e o Wi-Fi sem conexão.", 1],
      ["mod", "Medidor de modulação, início", "O começo do medidor de modulação, que passa em degradê para a cor do fim.", 1],
      ["modS", "Medidor de modulação, fim", "O fim do medidor de modulação e a marca de pico quando a modulação passa de 80%.", 1],
      ["bw", "Banda automática", "O número da largura de banda quando ela está no automático. Na tela de AF, a frequência, o PS e o PI.", 1],
      ["rdsQueda", "RDS perdido", "Os mesmos textos do RDS quando o sinal do RDS cai: a tela mantém o último texto nessa cor.", 0],
      ["alerta", "Alerta", "Avisos: erro no RDS, sintonia fora do centro, o número digitado no teclado de frequência, a etiqueta MEM enquanto grava e o número de uma memória ocupada, que seria sobrescrita.", 0],
      ["ok", "Tudo certo", "Sinais de que está tudo bem: RDS sem erro, sintonia no centro, o passo de sintonia, o RadioText A/B e o número de uma memória vazia.", 0],
      ["bat", "Bateria", "A tensão ou a porcentagem da bateria, quando o rádio mostra números no lugar do ícone.", 0],
      ["wifi", "Wi-Fi fraco", "O ícone de Wi-Fi com sinal fraco.", 0],
      ["wifiS", "Wi-Fi forte", "O ícone de Wi-Fi com sinal forte.", 0]
    ];
    // atributo de papel: com uma cor em destaque, o que não é dela fica apagado na telinha
    function papel(e, lista) {
      return ' data-c="' + lista + '"' + (e.foco && (" " + lista + " ").indexOf(" " + e.foco + " ") < 0 ? ' class="pv-off"' : "");
    }
    function txt(x, y, t, cor, tam, ancora, pp) {
      return '<text x="' + x + '" y="' + y + '" fill="' + cor + '" font-size="' + tam + '"' + (ancora ? ' text-anchor="' + ancora + '"' : "") + (pp || "") + ">" + t + "</text>";
    }
    function caixa(x, y, w, h, cor, pp) {
      return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="2" fill="' + cor + '"' + pp + "/>";
    }
    // a tela principal da linha oficial, simplificada: posições de gui.cpp (BuildDisplay) e cores do tema
    function tela(fw) {
      var e = pv[fw], p = paletas[fw][e.tema], f = PV.fontes[e.fonte] || { w: 0, h: 0 }, g1 = "pvg" + (++pvN), g2 = "pvg" + (++pvN);
      var A = papel(e, "ativo"), R = papel(e, "rds"), F = papel(e, "fundo");
      var escala = function (lista, y) { return lista.map(function (a) { return txt(a[1], y, a[0], p.ativo, 11, "", A); }).join(""); };
      var etiqueta = function (x, y, w, t, lig) {
        return caixa(x, y, w, 18, lig ? p.sec : p.cinza, papel(e, lig ? "sec" : "cinza")) + txt(x + w / 2, y + 14, t, p.fundo, 11, "middle", F);
      };
      return '<svg class="aj-tela" viewBox="0 0 320 240" role="img" aria-label="' + esc("Prévia da tela no tema " + e.tema + ", com a fonte " + e.fonte) + '">' +
        '<defs><linearGradient id="' + g1 + '" gradientUnits="userSpaceOnUse" x1="58" x2="120" y1="0" y2="0"><stop offset="0" stop-color="' + p.bar +
        '"/><stop offset="1" stop-color="' + p.barS + '"/></linearGradient><linearGradient id="' + g2 + '" gradientUnits="userSpaceOnUse" x1="58" x2="120" y1="0" y2="0"><stop offset="0" stop-color="' +
        p.mod + '"/><stop offset="1" stop-color="' + p.modS + '"/></linearGradient></defs>' +
        '<rect width="320" height="240" fill="' + p.fundo + '"/>' +
        '<g fill="none" stroke="' + p.moldura + '"' + papel(e, "moldura") + '><rect x="0.5" y="0.5" width="319" height="239"/>' +
        '<path d="M0 30.5H320M0 100.5H320M0 160.5H195M0 180.5H320M0 217.5H320M30.5 0V30M66.5 0V30M105.5 0V30M162.5 0V30M248.5 0V30' +
        'M195.5 100V180M195 144.5H320M210.5 180V217M257.5 144V180"/></g>' +
        '<g fill="none" stroke="' + p.st + '" stroke-width="2"' + papel(e, "st") + '><circle cx="42" cy="16" r="7"/><circle cx="53" cy="16" r="7"/></g>' +
        txt(85.5, 21, "RDS", p.rds, 12, "middle", R) + txt(201, 25, "236", p.bw, 22, "end", papel(e, "bw")) + txt(245, 25, "kHz", p.ativo, 22, "end", A) +
        '<path d="M255 12h5l6-5v18l-6-5h-5z" fill="' + p.cinza + '"' + papel(e, "cinza") + "/>" +
        '<g' + A + '><rect x="277.5" y="6.5" width="36" height="19" rx="2" fill="none" stroke="' + p.ativo + '"/><rect x="313" y="13" width="4" height="6" rx="1" fill="' + p.ativo + '"/></g>' +
        caixa(279, 8, 24, 16, p.bar, papel(e, "bar")) +
        etiqueta(2, 36, 40, "MAN", true) + etiqueta(2, 58, 40, "AUTO", false) + etiqueta(2, 80, 40, "MEM", false) +
        etiqueta(248, 36, 69, "AUTO BW", true) + etiqueta(249, 57, 30, "iMS", true) + etiqueta(287, 57, 30, "EQ", false) +
        digitos(e.fonte, p.freq, 244 - f.w, 42, papel(e, "freq")) + txt(258, 96, "MHz", p.ativo, 20, "", A) +
        txt(7, 113, "S", p.ativo, 12, "middle", A) + '<path d="M16 114.5H189M16 143.5H189" stroke="' + p.ativo + '"' + A + "/>" +
        '<rect x="16" y="105" width="42" height="6" fill="' + p.bar + '"' + papel(e, "bar") + '/><rect x="58" y="105" width="62" height="6" fill="url(#' + g1 + ')"' + papel(e, "bar barS") +
        '/><rect x="120" y="105" width="6" height="6" fill="' + p.barS + '"' + papel(e, "barS") + '/><rect x="126" y="105" width="64" height="6" fill="' + p.cinza + '"' + papel(e, "cinza") + "/>" +
        escala([["1", 21], ["3", 41], ["5", 61], ["7", 81], ["9", 101], ["+10", 127], ["+30", 160]], 127) +
        txt(7, 140, "A", p.ativo, 12, "middle", A) +
        '<rect x="16" y="133" width="42" height="6" fill="' + p.mod + '"' + papel(e, "mod") + '/><rect x="58" y="133" width="38" height="6" fill="url(#' + g2 + ')"' + papel(e, "mod modS") +
        '/><rect x="96" y="133" width="94" height="6" fill="' + p.cinza + '"' + papel(e, "cinza") + '/><rect x="108" y="133" width="2" height="6" fill="' + p.prim + '"' + papel(e, "prim") + "/>" +
        escala([["10", 24], ["30", 54], ["50", 84], ["70", 114], ["100", 160]], 156) +
        txt(280, 141, "45", p.freq, 40, "end", papel(e, "freq")) + txt(285, 124, ".2", p.freq, 22, "", papel(e, "freq")) + txt(316, 141, "dBµV", p.ativo, 11, "end", A) +
        txt(197, 177, "CN:", p.ativo, 12, "", A) + txt(234, 177, "18", p.prim, 12, "end", papel(e, "prim")) + txt(255, 177, "dB", p.ativo, 12, "end", A) +
        txt(259, 159, "US:", p.ativo, 12, "", A) + txt(299, 159, "3", p.prim, 12, "end", papel(e, "prim")) + txt(316, 159, "%", p.ativo, 12, "end", A) +
        txt(259, 177, "MP:", p.ativo, 12, "", A) + txt(299, 177, "2", p.prim, 12, "end", papel(e, "prim")) + txt(316, 177, "%", p.ativo, 12, "end", A) +
        txt(34, 175, "Pop", p.rds, 12, "", R) + txt(36, 208, "DP-666", p.rds, 22, "", R) + txt(265, 204, "C201", p.rds, 13, "middle", R) +
        txt(36, 233, "DP-666 FM 98.10 MHz", p.rds, 12, "", R) + "</svg>";
    }
    // as cores do tema da prévia: nome no firmware, hex e onde aparecem; as que estão na telinha viram botões
    function coresLinhas(fw) {
      var e = pv[fw], nomes = nomesCor[fw] && nomesCor[fw][e.tema], p = paletas[fw][e.tema];
      if (!nomes) return "";
      return PAPEIS.filter(function (r) { return nomes[r[0]]; }).map(function (r) {
        var n = nomes[r[0]], on = e.foco === r[0];
        var cab = C.amostra(p[r[0]]) + '<span class="aj-cor-n">' + esc(r[1]) +
          '</span><span class="aj-cor-v">' + esc(n[0]) + " <code>" + esc(p[r[0]]) + "</code> <code>" + esc(n[1]) + "</code></span>";
        return '<li class="aj-cor' + (on ? " is-on" : "") + '">' + (r[3] ?
          C.botao(cab, { classe: "aj-pick aj-cor-b", attrs: { "data-pv": "cor", "data-v": r[0], "aria-pressed": String(on) } }) :
          '<div class="aj-cor-b">' + cab + "</div>") + '<p class="aj-cor-d">' + esc(r[2]) + "</p></li>";
      }).join("");
    }
    function telaBox(fw) {
      var e = pv[fw], n = PAPEIS.filter(function (r) { return nomesCor[fw] && nomesCor[fw][e.tema] && nomesCor[fw][e.tema][r[0]]; }).length;
      return '<div class="aj-prev" data-pv-box="tema">' + tela(fw) + '<p class="aj-prev-leg" aria-live="polite">' +
        esc(e.tema + ", com a fonte " + e.fonte + ".") + "</p></div>" + C.nota(fw === "oficial" ?
        "Toque num tema para ver a tela com as cores dele. As cores e os números vêm do código; o resto é aproximado." :
        "Toque num tema para ver a tela com as cores dele. As cores vêm da linha oficial, e os temas apagados ainda não têm prévia.") +
        (n ? C.recolhivel(coresLinhas(fw), { classe: "aj-cores", attrs: { "data-pv-cores": true, "aria-label": "Cores do tema " + e.tema }, mais: "Ver as " + n + " cores", n: "cores" }) +
          C.nota("O firmware guarda cada cor em 16 bits (RGB565); o hex de 24 bits é a conversão. Toque numa cor para ver onde ela aparece na tela." +
          (fw === "oficial" ? "" : " " + "Onde cada cor aparece segue o código da linha oficial.")) : "");
    }
    // amostra de uma fonte: o número sobre o fundo do tema da prévia (sem tema, na cor do texto)
    function amostraFonte(nome, fw) {
      var f = PV.fontes[nome];
      if (!f) return "";
      var p = paletas[fw] ? paletas[fw][pv[fw].tema] : null;
      return '<svg class="aj-fs-img" viewBox="0 0 ' + (f.w + 16) + " " + (f.h + 12) + '" aria-hidden="true">' +
        (p ? '<rect width="100%" height="100%" rx="4" fill="' + p.fundo + '"/>' : "") + digitos(nome, p && p.freq, 8, 6) + "</svg>";
    }
    function fontesHtml(it, fw) {
      var pick = !!paletas[fw], e = pv[fw];
      return C.recolhivel(it.spec.opcoes.map(function (o) {
        var nome = '<span class="aj-fs-n">' + esc(o) + mark(o === it.padrao, o === it.br) + "</span>" + amostraFonte(o, fw);
        return '<li class="aj-fs' + (pick && o === e.fonte ? " is-on" : "") + '">' + (pick ?
          C.botao(nome, { classe: "aj-pick", attrs: { "data-pv": "fonte", "data-v": o, "aria-pressed": String(o === e.fonte) } }) :
          '<div class="aj-fs-row">' + nome + "</div>") + "</li>";
      }).join(""), { classe: "aj-fs-list", attrs: { "aria-label": "Opções na ordem do ciclo" } }) +
        C.nota((pick ? "Toque numa fonte para vê-la na prévia do tema. " : "") + "Números desenhados com as próprias fontes do firmware.");
    }
    function pintarPrevia(tipo, v) {
      var fw = st.fw;
      if (!pv[fw]) return;
      if (tipo === "cor" && pv[fw].foco === v) v = "";   // tocar de novo na mesma cor tira o destaque
      pv[fw][tipo === "cor" ? "foco" : tipo] = v;
      $$('[data-pv="' + tipo + '"]', list).forEach(function (b) {
        var on = b.dataset.v === v;
        b.setAttribute("aria-pressed", String(on));
        b.parentNode.classList.toggle("is-on", on);
      });
      $$('[data-pv-box="tema"]', list).forEach(function (box) {
        var svg = $("svg", box), leg = $(".aj-prev-leg", box);
        if (svg) svg.outerHTML = tela(fw);
        if (leg) leg.textContent = pv[fw].tema + ", com a fonte " + pv[fw].fonte + ".";
      });
      if (tipo === "tema") $$("[data-pv-cores]", list).forEach(function (ol) {
        ol.innerHTML = coresLinhas(fw);
        ol.setAttribute("aria-label", "Cores do tema " + v);
      });
      if (tipo === "tema") $$(".aj-fs-list", list).forEach(function (ol) {
        $$(".aj-fs", ol).forEach(function (li) {
          var b = $(".aj-pick", li);
          if (!b) return;
          var velho = $(".aj-fs-img", b);
          if (velho) velho.outerHTML = amostraFonte(b.dataset.v, fw);
        });
      });
    }
    function rangeHtml(it) {
      var s = it.spec, h = "", pd = s.pd, pb = s.pb, same = pd != null && pb != null && Math.abs(pd - pb) < 0.5;
      function ml(pos, txt, cls) {
        var edge = pos < 12 ? " l" : pos > 88 ? " r" : "";
        return '<span class="aj-ml ' + cls + edge + '" style="left:' + pos + '%">' + txt + "</span>";
      }
      var marks = "";
      if (same) marks = '<i class="aj-mk mk-def mk-br" style="left:' + pd + '%"></i>' + ml(pd, "padrão e Brasil", "below");
      else {
        if (pd != null) marks += '<i class="aj-mk mk-def" style="left:' + pd + '%"></i>' + ml(pd, "padrão", "below");
        if (pb != null) marks += '<i class="aj-mk mk-br" style="left:' + pb + '%"></i>' + ml(pb, "Brasil", "above");
      }
      if (s.off) h += opt(s.offlbl, !!s.pd_off, !!s.pb_off, "span") + '<span class="aj-or">ou</span>';
      h += '<span class="aj-range"><span class="aj-rmin">' + s.minf + '</span><span class="aj-track' + (pb != null && !same ? " has-above" : "") + (pd != null ? " has-below" : "") +
        '" aria-hidden="true">' + marks + '</span><span class="aj-rmax"><span class="sr-only">a </span>' + s.maxf + (s.unidade ? " " + esc(s.unidade) : "") + "</span></span>";
      return '<div class="aj-rangewrap">' + h + "</div>" + (s.passof ? C.nota(esc(s.passof)) : "");
    }
    function specHtml(it, fw) {
      var s = it.spec || {}, h = "", v = "", inList = false;
      if (s.opcoes && s.previa === "fonte" && PV.fontes[s.opcoes[0]]) {
        inList = s.opcoes.indexOf(it.padrao) >= 0;
        v = fontesHtml(it, fw);
      } else if (s.opcoes) {
        // a lista que troca a prévia fica sempre inteira, para todos os temas estarem a um toque
        var pick = s.previa === "tema" && !!paletas[fw], many = s.opcoes.length > 12 && !pick;
        v = C.recolhivel(s.opcoes.map(function (o) {
          if (o === it.padrao) inList = true;
          var sw = s.paleta && C.paleta(s.paleta[o]);
          if (!pick) return opt(o, o === it.padrao, o === it.br, "li", sw);
          if (!s.paleta[o]) return C.opcao(esc(o) + mark(o === it.padrao, o === it.br), { desligada: true });
          return C.opcao(sw + esc(o) + mark(o === it.padrao, o === it.br), { escolha: { pv: "tema", v: o }, padrao: o === it.padrao, ativo: o === pv[fw].tema });
        }).join(""), { classe: "aj-opts", attrs: { "aria-label": "Opções na ordem do ciclo" }, mais: many ? "Ver as " + s.opcoes.length + " opções" : "" }) +
          (pick ? telaBox(fw) : "");
      } else if (s.tipo === "faixa") { v = rangeHtml(it); inList = !!s.pd_off; }
      else if (s.resumo) v = esc(s.resumo);
      if (s.nota) v += C.nota(esc(s.nota));
      if (v) h += kv(s.tl, v);
      var settable = ["lista", "liga", "faixa", "texto"].indexOf(s.tipo) >= 0;
      if (it.padrao && !inList) h += kv("Padrão", esc(it.padrao));
      else if (!it.padrao && settable && fw === "mod17") h += kv("Padrão", '<span class="aj-muted">Não documentado</span>');
      if (it.br) h += kv("No Brasil", "<strong>" + esc(it.br) + "</strong>" + (it.motivo ? ". " + it.motivo : ""), "is-br");
      if (it.fontes) h += kv("Fonte", esc(it.fontes));
      return h ? '<dl class="aj-spec">' + h + "</dl>" : "";
    }
    function row(it, ws, fw) {
      byId[it.id] = it;
      var s = it.spec || {};
      var right = it.br ? '<span class="aj-val is-br">' + esc(it.br) + "</span>" : s.rsum ? '<span class="aj-val">' + esc(s.rsum) + "</span>" : "";
      var en = it.en && it.en.toLowerCase() !== it.nome.toLowerCase() ? it.en : "";
      var second = en || it.sub ? [en, it.sub ? "em " + it.sub : ""].filter(Boolean).join(", ") : it.adv ? "Só no modo avançado" : "";
      var tag = it.tag && TAGS[it.tag] ? '<span class="aj-tag t-' + it.tag + '">' + esc(TAGS[it.tag]) + "</span>" : "";
      return '<li class="aj-item" id="' + it.id + '"><button type="button" class="aj-row" aria-expanded="false" aria-controls="' + it.id + '-d">' +
        '<span class="aj-name"><span class="aj-n">' + highlight(it.nome, ws) + "</span>" +
        (second || tag ? '<span class="aj-en">' + tag + (second ? "<span>" + esc(second) + "</span>" : "") + "</span>" : "") + "</span>" +
        right + CHEV + "</button>" +
        '<div class="aj-detail" id="' + it.id + '-d"><div class="aj-in"><div class="aj-pad">' +
        (it.html ? '<p class="aj-faz">' + it.html + "</p>" : "") + didHtml(it) + specHtml(it, fw) +
        (it.fora ? '<p class="aj-fora">A wiki da linha oficial não descreve esta opção; ela foi conferida no código.</p>' : "") +
        "</div></div></div></li>";
    }
    function renderAll() {
      fwSeg.set(st.fw);
      var ws = words(st.q), groups = D[st.fw].grupos, total = 0, nav = [];
      var html = groups.map(function (g, gi) {
        var items = g.itens.filter(function (it) { return (!st.tag || it.tag === st.tag) && (!ws.length || matches(busca(it, g), ws)); });
        total += items.length;
        if (!items.length) return "";
        nav.push([gi, g, items.length]);
        return '<section class="aj-group" id="' + g.id + '" data-g="' + gi + '"><h3 class="aj-gh">' + esc(g.titulo) + "<span>" + items.length + "</span></h3>" +
          (!ws.length && g.notas.length ? '<div class="aj-notes">' + g.notas.map(function (n) { return "<p>" + n + "</p>"; }).join("") + "</div>" : "") +
          '<ul class="aj-items">' + items.map(function (it) { return row(it, ws, st.fw); }).join("") + "</ul></section>";
      }).join("");
      list.innerHTML = html ? (ws.length || st.tag ? "" : introHtml()) + html :
        '<p class="aj-empty">Nenhum ajuste com essas palavras. Tente outra, ou troque o firmware acima.</p>';
      paintFiltro();
      var links = nav.map(function (n) { return '<a href="#' + n[1].id + '" data-g="' + n[0] + '">' + esc(shortGroup(n[1].titulo)) + "<span>" + n[2] + "</span></a>"; }).join("");
      chips.innerHTML = links;
      side.innerHTML = links;
      $(".aj-count", root).textContent = ws.length || st.tag ? (total === 1 ? "1 ajuste" : total + " ajustes") +
        (st.tag ? " em " + (TAGS[st.tag] || "") : "") : "";
      spy();
      if (st.view === "brasil") renderBrasil();
    }
    function toggle(li, open) {
      var on = open == null ? !li.classList.contains("open") : open;
      li.classList.toggle("open", on);
      $(".aj-row", li).setAttribute("aria-expanded", String(on));
    }
    list.addEventListener("click", function (e) {
      var pick = e.target.closest(".aj-pick");
      if (pick) { pintarPrevia(pick.dataset.pv, pick.dataset.v); return; }
      var more = e.target.closest(".aj-more");
      if (more) {
        var ol = more.previousElementSibling, on = !ol.classList.contains("open");
        ol.classList.toggle("open", on);
        more.setAttribute("aria-expanded", String(on));
        more.textContent = on ? "Mostrar menos" : "Ver as " + ol.children.length + (more.dataset.n === "cores" ? " cores" : " opções");
        return;
      }
      var b = e.target.closest(".aj-row");
      if (b) toggle(b.parentNode);
    });
    function navClick(e) {
      var a = e.target.closest("a[data-g]");
      if (!a) return;
      e.preventDefault();
      var sec = $('.aj-group[data-g="' + a.dataset.g + '"]', list);
      if (sec) sec.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    }
    chips.addEventListener("click", navClick);
    side.addEventListener("click", navClick);
    input.addEventListener("input", function () { st.q = input.value; renderAll(); });

    // grupo visível destacado na navegação
    var observer = null;
    function setActive(gi) {
      [chips, side].forEach(function (nav) {
        $$("a", nav).forEach(function (a) { a.classList.toggle("on", a.dataset.g === String(gi)); });
      });
      var c = $('a[data-g="' + gi + '"]', chips);
      if (c && chips.offsetParent) chips.scrollTo({ left: c.offsetLeft - 16, behavior: "smooth" });
    }
    function spy() {
      if (observer) observer.disconnect();
      if (!("IntersectionObserver" in window)) return;
      var top = topoFixo() + bar.offsetHeight + 4;
      observer = new IntersectionObserver(function (en) {
        en.forEach(function (x) { if (x.isIntersecting) setActive(x.target.dataset.g); });
      }, { rootMargin: "-" + top + "px 0px -65% 0px" });
      $$(".aj-group", list).forEach(function (s) { observer.observe(s); });
    }
    function syncBarHeight() { if (bar.offsetHeight) document.documentElement.style.setProperty("--ajbar-h", bar.offsetHeight + "px"); }
    if (window.ResizeObserver) new ResizeObserver(syncBarHeight).observe(bar);

    // lista do Brasil, com o progresso salvo neste navegador
    function renderBrasil() {
      var items = CK[st.fw], dn = done[st.fw] || [];
      brBox.innerHTML = '<div class="ck-head"><p class="ck-count"></p><div class="ck-bar" aria-hidden="true"><i></i></div>' +
        '<button type="button" class="ck-reset">Recomeçar</button></div>' +
        '<p class="ck-intro">Siga a lista com o rádio na mão e marque cada ajuste. O progresso fica salvo neste navegador. ' +
        'Os motivos estão em <a href="#brasil">Configuração para o Brasil</a>.</p><ol class="ck-list">' +
        items.map(function (i) {
          var ok = dn.indexOf(i.id) >= 0;
          return '<li class="ck-item' + (ok ? " done" : "") + '"><label><input type="checkbox" data-ck="' + i.id + '"' + (ok ? " checked" : "") + '>' +
            '<span class="ck-box" aria-hidden="true"></span><span class="ck-main"><span class="ck-name">' + esc(i.nome) + "</span>" +
            (i.onde ? '<span class="ck-where">' + esc(i.onde) + "</span>" : "") + '<span class="ck-why">' + i.porque + "</span></span>" +
            '<span class="ck-val">' + esc(i.valor) + "</span></label>" +
            (i.item ? '<a class="ck-link" href="#' + i.item + '">Ver a opção</a>' : "") + "</li>";
        }).join("") + '</ol><p class="ck-done" hidden>Pronto: o rádio está configurado para o Brasil.</p>';
      paintProgress();
    }
    function paintProgress() {
      var items = CK[st.fw], dn = done[st.fw] || [];
      var n = items.filter(function (i) { return dn.indexOf(i.id) >= 0; }).length;
      $(".ck-count", brBox).innerHTML = "<strong>" + n + " de " + items.length + "</strong> feitos";
      $(".ck-bar i", brBox).style.width = Math.round((n / items.length) * 100) + "%";
      $(".ck-reset", brBox).hidden = n === 0;
      $(".ck-done", brBox).hidden = n !== items.length;
    }
    brBox.addEventListener("change", function (e) {
      var c = e.target.closest("[data-ck]");
      if (!c) return;
      var dn = (done[st.fw] || []).filter(function (id) { return id !== c.dataset.ck; });
      if (c.checked) dn.push(c.dataset.ck);
      done[st.fw] = dn;
      store.set(DKEY, done);
      c.closest(".ck-item").classList.toggle("done", c.checked);
      paintProgress();
    });
    brBox.addEventListener("click", function (e) {
      if (!e.target.closest(".ck-reset")) return;
      done[st.fw] = [];
      store.set(DKEY, done);
      renderBrasil();
    });

    function showView() {
      viewSeg.set(st.view);
      $(".aj-todos", root).hidden = st.view !== "todos";
      brBox.hidden = st.view !== "brasil";
      if (st.view === "brasil") renderBrasil(); else { syncBarHeight(); spy(); }
    }
    document.addEventListener("app:reveal", function (e) {
      var id = String(e.detail || "");
      if (id === "ajustes--brasil") { st.view = "brasil"; showView(); return; }
      if (id.indexOf("ajustes--") !== 0) return;
      var fw = /^ajustes--oficial(-|$)/.test(id) ? "oficial" : /^ajustes--mod17(-|$)/.test(id) ? "mod17" : null;
      if (!fw) return;
      st.view = "todos"; st.fw = fw; st.q = ""; input.value = "";
      renderAll();
      showView();
      var t = document.getElementById(id);
      if (t && t.classList.contains("aj-item")) { toggle(t, true); t.classList.remove("flash"); void t.offsetWidth; t.classList.add("flash"); }
      if (t) requestAnimationFrame(function () { t.scrollIntoView({ block: "start" }); });
    });
    onProfile(function () { st.fw = curFw(); renderAll(); });
    renderAll();
    showView();
    syncBarHeight();
  }

  // ---------------------------------------------------------------- assistente de problemas
  function Help(root) {
    var cats = APP.ajuda.cats;
    var byId = {};
    cats.forEach(function (c) { byId[c.id] = { c: c }; c.itens.forEach(function (it) { byId[it.id] = { c: c, it: it }; }); });
    root.innerHTML = '<input class="tool-search" type="search" placeholder="Buscar: sem som, hora errada…" aria-label="Buscar problema"><div class="hlp-view"></div>';
    var view = $(".hlp-view", root), input = $(".tool-search", root);

    function tag(it) { return it.tag === "oficial" ? C.selo("linha oficial") : ""; }
    function back(to, text) { return C.botao("← " + esc(text), { variante: "fantasma", classe: "hlp-back", attrs: { "data-go": to } }); }
    function home() {
      input.value = "";
      view.innerHTML = '<div class="hlp-cats">' + cats.map(function (c) {
        var sub = c.passos.length ? "Passo a passo" : c.itens.length ? c.itens.length + (c.itens.length === 1 ? " situação" : " situações") : "Informação";
        return '<button type="button" class="hlp-cat' + (c.passos.length ? " hot" : "") + '" data-go="' + c.id + '"><strong>' + esc(c.titulo) + "</strong><span>" + sub + "</span></button>";
      }).join("") + "</div>";
    }
    function catView(c, openWhy) {
      var h = back("home", "Todos os problemas");
      if (c.passos.length) {
        h += '<div class="hlp-card" id="' + c.id + '"><h3>' + esc(c.titulo) + "</h3>" + (c.intro[0] || "") +
          '<details class="hlp-why"' + (openWhy ? " open" : "") + "><summary>Por que acontece</summary>" + c.intro.slice(1).join("") +
          '<ul class="hlp-items">' + c.itens.map(function (it) { return '<li id="' + it.id + '"><strong>' + esc(it.titulo) + ":</strong> " + it.html + tag(it) + "</li>"; }).join("") +
          "</ul></details></div>" + '<div class="hlp-steps"></div>';
        view.innerHTML = h;
        stepView(c, 0);
        return;
      }
      h += '<div id="' + c.id + '"><h3 style="margin:4px 0 8px">' + esc(c.titulo) + "</h3>" + c.intro.join("") +
        (c.itens.length ? '<div class="hlp-list">' + c.itens.map(function (it) {
          return '<button type="button" class="hlp-sym" data-go="' + it.id + '">' + esc(it.titulo) + "</button>";
        }).join("") + "</div>" : "") + "</div>";
      view.innerHTML = h;
    }
    function stepView(c, i) {
      var box = $(".hlp-steps", view), last = i === c.passos.length - 1;
      box.innerHTML = '<div class="hlp-card" style="margin-top:12px"><p class="hlp-step">Passo ' + (i + 1) + " de " + c.passos.length + "</p>" +
        "<p>" + c.passos[i] + "</p>" +
        (last ? (c.depois.length ? '<div class="hlp-done">' + c.depois.join(" ") + "</div>" : "") + '<div class="hlp-ask">' + back("home", "Voltar ao início") + "</div>"
          : '<div class="hlp-ask"><span>' + "Resolveu?" + "</span>" + C.botao("Sim", { variante: "solido", attrs: { "data-step-ok": true } }) +
            C.botao("Não, próximo passo", { variante: "fantasma", attrs: { "data-step-next": i + 1 } }) + "</div>") + "</div>";
      box.dataset.cat = c.id;
    }
    function itemView(c, it) {
      var others = c.itens.filter(function (o) { return o !== it; });
      var body = it.html.replace(/^((?:<[^>]+>)*)([a-zà-ú])/, function (m, a, b) { return a + b.toUpperCase(); });
      view.innerHTML = back(c.id, c.titulo) + '<div class="hlp-card" id="' + it.id + '"><h3>' + esc(it.titulo) + tag(it) + "</h3><p>" + body + "</p>" +
        '<div class="hlp-ask"><span>' + "Resolveu?" + "</span>" + C.botao("Sim", { variante: "solido", attrs: { "data-ok": true } }) +
        C.botao("Não", { variante: "fantasma", attrs: { "data-no": true } }) + "</div>" +
        '<div class="hlp-after"></div></div>';
      view.dataset.others = others.map(function (o) { return o.id; }).join(",");
    }
    function results(q) {
      var ws = words(q), hits = [];
      cats.forEach(function (c) { c.itens.forEach(function (it) { if (matches(it.busca, ws)) hits.push(it); }); });
      view.innerHTML = hits.length
        ? '<div class="hlp-list">' + hits.map(function (it) { return '<button type="button" class="hlp-sym" data-go="' + it.id + '">' + esc(it.titulo) + "</button>"; }).join("") + "</div>"
        : '<p class="exp-empty">Nada encontrado. Tente outras palavras ou escolha uma categoria.</p>' + '<div class="hlp-cats">' +
          cats.map(function (c) { return '<button type="button" class="hlp-cat" data-go="' + c.id + '"><strong>' + esc(c.titulo) + "</strong></button>"; }).join("") + "</div>";
    }
    function go(id, focus) {
      if (id === "home") { home(); return; }
      var hit = byId[id];
      if (!hit) return;
      input.value = "";
      if (hit.it && hit.c.passos.length) catView(hit.c, true);
      else if (hit.it) itemView(hit.c, hit.it);
      else catView(hit.c, false);
      if (focus) { var h = $("h3", view); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); } }
    }
    root.addEventListener("click", function (e) {
      var g = e.target.closest("[data-go]");
      if (g) { go(g.dataset.go, true); view.scrollIntoView({ block: "nearest" }); return; }
      var box = $(".hlp-steps", view);
      if (e.target.closest("[data-step-next]")) { stepView(byId[box.dataset.cat].c, Number(e.target.closest("[data-step-next]").dataset.stepNext)); return; }
      if (e.target.closest("[data-step-ok]")) {
        var c = byId[box.dataset.cat].c;
        box.innerHTML = '<div class="hlp-card" style="margin-top:12px"><div class="hlp-done">Ótimo. ' + c.depois.join(" ") + "</div>" + '<div class="hlp-ask">' + back("home", "Voltar ao início") + "</div></div>";
        return;
      }
      var after = $(".hlp-after", view);
      if (e.target.closest("[data-ok]")) {
        after.innerHTML = '<div class="hlp-done">Ótimo. Se voltar a acontecer, é só abrir o assistente de novo.</div>';
        $(".hlp-ask", view).hidden = true;
        return;
      }
      if (e.target.closest("[data-no]")) {
        var ids = (view.dataset.others || "").split(",").filter(Boolean);
        $(".hlp-ask", view).hidden = true;
        after.innerHTML = '<div class="hlp-more">' + (ids.length ? "<h4>Outras causas nesta categoria</h4>" + '<div class="hlp-list">' +
          ids.map(function (id) { return '<button type="button" class="hlp-sym" data-go="' + id + '">' + esc(byId[id].it.titulo) + "</button>"; }).join("") + "</div>" : "") +
          '<p class="exp-note">Antes de qualquer reparo ou regravação, faça o <a href="#backup">backup</a>.</p></div>';
      }
    });
    input.addEventListener("input", function () { if (words(input.value).length) results(input.value); else home(); });
    document.addEventListener("app:reveal", function (e) {
      var id = String(e.detail || "");
      if (id.indexOf("ajuda--") === 0 && byId[id]) go(id, false);
      else if (id.indexOf("problemas--") === 0) {
        var c = cats.filter(function (x) { return x.ref === id; })[0];
        if (c) go(c.id, false);
      }
    });
    home();
  }

  // ---------------------------------------------------------------- placa em 3D
  function Placa(root) {
    root.innerHTML = '<div class="pl-stage"><div class="pl-load">Carregando a placa em 3D…</div></div>' +
      '<div class="pl-buses" role="group" aria-label="Barramentos: toque para destacar"></div><div class="pl-info" aria-live="polite"></div>';
    var started = false;
    function load() {
      started = true;
      import("./js/viewer3d.js").then(function (m) {
        m.mountPlaca(root, APP.placa, { rtc: function () { return profile.rtc || "?"; }, onProfile: onProfile });
      }).catch(function () {
        started = false;
        $(".pl-stage", root).innerHTML = '<div class="pl-load"><p>Não foi possível abrir a visão 3D aqui.<br>A lista de componentes está em <a href="#hardware">Hardware</a>.</p></div>';
      });
    }
    var pagina = root.closest(".page"), rotaPagina = pagina ? pagina.dataset.route : "placa";
    document.addEventListener("app:show", function (e) { if (e.detail === rotaPagina && !started) load(); });
  }

  // visões 3D do ESP32 (Laboratório) e das fotos (Uso do rádio, Início): só baixam quando a pessoa pede
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-viewer3d-open]");
    // no Início, tocar na imagem do rádio também abre o 3D
    if (!b && e.target.closest && e.target.closest(".f3-home .f3-capa")) b = $(".f3-girar", e.target.closest(".f3-home"));
    if (!b) return;
    var root = b.closest(".viewer3d");
    b.disabled = true;
    b.textContent = "Carregando a visão 3D…";
    var qual = b.getAttribute("data-viewer3d-open") || "";
    import("./js/viewer3d.js").then(function (m) {
      if (qual === "fotos-home") { var f = m.mountFotos($(".f3-stage", root), { compacto: true, dica: true }); if (f) f.apresentar(); }
      else if (qual === "fotos") m.mountFotos(root);
      else m.mountEsp32(root);
    }).catch(function () {
      b.disabled = false;
      b.textContent = "Não carregou. Tentar de novo";
    });
  });

  // sem barra no topo: as barras fixas das ferramentas grudam no alto da tela
  document.documentElement.style.setProperty("--topbar-h", "0px");

  paintChip();
  paintHome();
  onProfile(paintHome);
  var tools = { botoes: Sim, ajustes: Exp, ajuda: Help, placa: Placa };
  Object.keys(tools).forEach(function (k) {
    var root = document.getElementById("tool-" + k);
    if (!root) return;
    try { tools[k](root); } catch (err) { if (window.console) console.error("ferramenta " + k, err); }
  });
})();
