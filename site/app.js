(function () {
  "use strict";
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
      return '<button type="button" role="radio" aria-checked="' + (o[0] === value) + '" data-v="' + o[0] + '">' + esc(o[1]) + "</button>";
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
        '<div class="hp-actions"><button type="button" class="btn-solid" data-fw="mod17">Megatron Mod17</button>' +
        '<button type="button" class="btn-ghost" data-fw="oficial">Linha oficial</button></div>';
      return;
    }
    var rtc = { sim: "com relógio interno", nao: "sem relógio interno", "?": "relógio interno não verificado" }[profile.rtc || "?"];
    var tip = "";
    if (profile.rtc === "nao") tip = "Sem RTC, a hora vem da internet (NTP) ou do RDS e se perde quando a chave geral vai para OFF.";
    else if (profile.rtc === "sim" && profile.fw === "mod17") tip = "Segundo a DEEPELEC, acertar o relógio interno pede o Mod17 de 05/04/2025.";
    else if (profile.rtc !== "sim") tip = 'Não sabe se o rádio tem relógio? Faça o <a href="#hardware--teste-de-rtc">teste do RTC</a>.';
    box.innerHTML = '<div class="hp-main"><p class="hp-title">Seu rádio: ' + esc(FW_NAME[profile.fw]) + ", " + rtc + "</p>" +
      (tip ? '<p class="hp-sub">' + tip + "</p>" : "") + '</div><div class="hp-actions">' +
      '<button type="button" class="btn-ghost" data-open-profile>Mudar</button></div>';
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("#home-profile [data-fw], #home-profile [data-open-profile]");
    if (!b) return;
    if (b.hasAttribute("data-open-profile")) openProfile();
    else setProfile({ fw: b.dataset.fw, rtc: profile.rtc || "?" });
  });

  // ---------------------------------------------------------------- simulador de botões
  var VKEY = "dp666.botoes.vista";
  var HW_ORDER = ["volume", "sql", "chave", "fone", "falante", "usbc", "antena", "tela", "teclado", "power"];
  function Sim(root) {
    var D = APP.botoes, HW = APP.painel;
    var st = { fw: curFw(), mode: "uso", combo: {}, rot: 0, view: store.get(VKEY, "3d") === "2d" ? "2d" : "3d" };
    var shown = false, p3 = null, p3loading = false;
    root.innerHTML =
      '<div class="tool-bar"><div class="seg" role="radiogroup" aria-label="Firmware"></div>' +
      '<div class="seg" role="radiogroup" aria-label="Situação"></div><div class="seg" role="radiogroup" aria-label="Visualização"></div></div>' +
      '<div class="sim-wrap"><div class="sim-left">' +
      '<div class="sim-3d" hidden><div class="p3-stage"><div class="pl-load">Carregando o painel em 3D…</div></div>' +
      '<p class="sim-hint p3-hint">Toque num controle; segure para o toque longo. O painel agrupa os controles por função e não segue a forma do rádio.</p></div>' +
      '<div class="sim-panel" role="group" aria-label="Controles"></div>' +
      '<div class="sim-boot" hidden><button type="button" class="btn-solid" data-power>Ligar o rádio</button></div>' +
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
        $(".sim-onde-box", box).innerHTML = '<button type="button" class="btn-ghost sim-onde-btn">Ver onde fica no rádio</button>';
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
        alvo.innerHTML = '<p class="sim-hint">Não foi possível abrir o rádio em 3D. As fotos estão em <a href="#uso--onde-fica-cada-coisa">Onde fica cada coisa</a>.</p>';
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
          (uso ? '<button type="button" class="sim-rot" data-rot="-1" aria-label="Girar o ' + esc(knob.rotulo) + ' para a esquerda">↺</button>' : "") +
          '<div class="sim-knob' + (st.combo[knob.id] ? " on" : "") + '" role="button" tabindex="0" data-c="' + knob.id + '" style="--rot:' + st.rot + 'deg"' +
          (uso ? "" : ' aria-pressed="' + !!st.combo[knob.id] + '"') + '><span class="mark" aria-hidden="true"></span>' + esc(knob.rotulo) + "</div>" +
          (uso ? '<button type="button" class="sim-rot" data-rot="1" aria-label="Girar o ' + esc(knob.rotulo) + ' para a direita">↻</button>' : "") +
          "</div>" +
          '<div class="sim-keys">' + big.map(function (c) { return key(c, st.combo[c.id] ? " on" : ""); }).join("") + "</div>" +
          '<div class="sim-keys">' + small.map(function (c) { return key(c, " small" + (st.combo[c.id] ? " on" : "")); }).join("") + "</div>";
        $(".sim-extra", root).innerHTML = '<span class="sim-hint">Outros controles:</span>' + hwList().map(function (id) {
          return '<button type="button" class="chip-btn" data-hw="' + id + '">' + esc(hwText(id).titulo) + "</button>";
        }).join("");
      } else if (shown) {
        ensure3d();
      }
      if (p3) { p3.setMode(st.mode); p3.setHeld(st.combo); }
      out.innerHTML = uso
        ? '<p class="sim-hint">' + (is3d ? "Toque num controle do painel." : "Toque num botão para o toque curto.") +
          " Segure para o toque longo: " + (is3d ? "a barra no pé do painel" : "a barra embaixo dele") + " mostra o tempo.</p>"
        : '<p class="sim-hint">Escolha os botões que ficam apertados e toque em “Ligar o rádio”.</p>' + comboList();
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
        (c.knob && st.view === "3d" ? '<div class="p3-rot"><button type="button" class="btn-ghost" data-rot3="-1">↺ Girar</button><button type="button" class="btn-ghost" data-rot3="1">Girar ↻</button></div>' : "");
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
        '<p class="sim-hint" style="margin-top:14px">Todas as combinações:</p>' + comboList();
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
            if (st.mode === "ligar" && c) { toggleCombo(id); out.innerHTML = '<p class="sim-hint">Apertados: ' + (Object.keys(st.combo).filter(function (k) { return st.combo[k]; }).map(label).join(" + ") || "nenhum") + ". Toque em “Ligar o rádio”.</p>" + comboList(); return; }
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
      '<div class="tool-bar"><div class="seg" role="radiogroup" aria-label="Firmware"></div>' +
      '<div class="seg" role="radiogroup" aria-label="Lista"></div></div>' +
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
        return '<button type="button" role="radio" aria-checked="' + (st.tag === o[0]) + '" data-t="' + o[0] + '">' + esc(o[1]) +
          "<span>" + n(o[0]) + "</span></button>";
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
      return "<" + tag + ' class="aj-opt' + (d ? " is-def" : "") + (b ? " is-br" : "") + '">' + (sw || "") + esc(label) + mark(d, b) + "</" + tag + ">";
    }
    // amostra de um tema de cores: fundo e moldura do tema, com a cor da frequência e a secundária
    function amostra(c) {
      if (!c) return "";
      return '<span class="aj-sw" aria-hidden="true" style="background:' + c[0] + ";border-color:" + c[3] + '">' +
        '<i style="background:' + c[1] + '"></i><i style="background:' + c[2] + '"></i></span>';
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
      return '<div class="aj-rangewrap">' + h + "</div>" + (s.passof ? '<p class="aj-note">' + esc(s.passof) + "</p>" : "");
    }
    function specHtml(it, fw) {
      var s = it.spec || {}, h = "", v = "", inList = false;
      if (s.opcoes) {
        var many = s.opcoes.length > 12;
        v = '<ol class="aj-opts' + (many ? " is-many" : "") + '" aria-label="Opções na ordem do ciclo">' + s.opcoes.map(function (o) {
          if (o === it.padrao) inList = true;
          return opt(o, o === it.padrao, o === it.br, "li", s.cores && amostra(s.cores[o]));
        }).join("") + "</ol>" + (many ? '<button type="button" class="aj-more" aria-expanded="false">Ver as ' + s.opcoes.length + " opções</button>" : "");
      } else if (s.tipo === "faixa") { v = rangeHtml(it); inList = !!s.pd_off; }
      else if (s.resumo) v = esc(s.resumo);
      if (s.nota) v += '<p class="aj-note">' + esc(s.nota) + "</p>";
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
      var more = e.target.closest(".aj-more");
      if (more) {
        var ol = more.previousElementSibling, on = !ol.classList.contains("open");
        ol.classList.toggle("open", on);
        more.setAttribute("aria-expanded", String(on));
        more.textContent = on ? "Mostrar menos" : "Ver as " + ol.children.length + " opções";
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

    function tag(it) { return it.tag === "oficial" ? '<span class="tag">linha oficial</span>' : ""; }
    function back(to, text) { return '<button type="button" class="btn-ghost hlp-back" data-go="' + to + '">← ' + esc(text) + "</button>"; }
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
          : '<div class="hlp-ask"><span>Resolveu?</span><button type="button" class="btn-solid" data-step-ok>Sim</button>' +
            '<button type="button" class="btn-ghost" data-step-next="' + (i + 1) + '">Não, próximo passo</button></div>') + "</div>";
      box.dataset.cat = c.id;
    }
    function itemView(c, it) {
      var others = c.itens.filter(function (o) { return o !== it; });
      var body = it.html.replace(/^((?:<[^>]+>)*)([a-zà-ú])/, function (m, a, b) { return a + b.toUpperCase(); });
      view.innerHTML = back(c.id, c.titulo) + '<div class="hlp-card" id="' + it.id + '"><h3>' + esc(it.titulo) + tag(it) + "</h3><p>" + body + "</p>" +
        '<div class="hlp-ask"><span>Resolveu?</span><button type="button" class="btn-solid" data-ok>Sim</button><button type="button" class="btn-ghost" data-no>Não</button></div>' +
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
