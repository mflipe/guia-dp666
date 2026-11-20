/* Rádio virtual: as telas do DP-666 com o Megatron Mod17 (a principal, a do RDS avançado e a lista de AF e EON),
   desenhadas pixel a pixel num canvas de 320x240, do jeito que o firmware desenha. As posições vêm do código da
   linha oficial no commit ee2e338, que o Mod17 segue; o que o Mod17 muda (o relógio no lugar do PI, as etiquetas
   apagadas com contorno, as cores do medidor, os alinhamentos do RDS avançado) foi conferido em fotos da tela.
   As letras são as fontes do próprio firmware (dados.json), com a mesma suavização do TFT_eSPI. O logo do RDS é
   marca registrada: no lugar dele vai a palavra RDS. */
(function (raiz) {
  "use strict";
  var W = 320, H = 240;

  function rgb(h) { var n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function mistura(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function b64(s) { var t = atob(s), u = new Uint8Array(t.length); for (var i = 0; i < t.length; i++) u[i] = t.charCodeAt(i); return u; }
  function hsv(h, s, v) {
    var f = function (n) { var k = (n + h / 60) % 6; return v * (1 - s * Math.max(0, Math.min(k, 4 - k, 1))); };
    return [f(5) * 255, f(3) * 255, f(1) * 255];
  }
  function paraHsv(c) {
    var r = c[0] / 255, g = c[1] / 255, b = c[2] / 255, M = Math.max(r, g, b), m = Math.min(r, g, b), d = M - m, h = 0;
    if (d) h = M === r ? ((g - b) / d + 6) % 6 : M === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [h * 60, M ? d / M : 0, M];
  }

  // uma smooth font do TFT_eSPI: métricas do VLW e o alfa de cada glifo
  function Fonte(d) {
    this.sub = d.subida; this.esp = d.espaco; this.g = {};
    for (var c in d.glifos) { var x = d.glifos[c]; this.g[c] = { w: x[0], h: x[1], adv: x[2], dy: x[3], dx: x[4], a: b64(x[5]) }; }
  }
  // largura do texto como o textWidth do TFT_eSPI: o último glifo conta até a borda dele, não o avanço
  Fonte.prototype.largura = function (s) {
    var w = 0;
    for (var k = 0; k < s.length; k++) {
      var c = s[k], g = this.g[c];
      if (c === " ") { w += this.esp; continue; }
      if (!g) { w += this.esp + 1; continue; }
      if (w === 0 && g.dx < 0) w -= g.dx;
      w += k < s.length - 1 ? g.adv : g.dx + g.w;
    }
    return w;
  };

  function Tela(canvas, dados) {
    canvas.width = W; canvas.height = H;
    this.cv = canvas; this.ctx = canvas.getContext("2d");
    this.img = this.ctx.createImageData(W, H); this.p = this.img.data;
    this.f = { 16: new Fonte(dados.texto["16"]), 28: new Fonte(dados.texto["28"]), 48: new Fonte(dados.texto["48"]) };
    this.ff = {};
    for (var n in dados.freq) this.ff[n] = new Fonte(dados.freq[n]);
    this.clip = null;
  }
  var T = Tela.prototype;
  T.ponto = function (x, y, c) {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    var k = this.clip;
    if (k && (x < k[0] || y < k[1] || x >= k[2] || y >= k[3])) return;
    var i = (y * W + x) * 4, p = this.p;
    p[i] = c[0]; p[i + 1] = c[1]; p[i + 2] = c[2]; p[i + 3] = 255;
  };
  T.ret = function (x, y, w, h, c) { for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) this.ponto(x + i, y + j, c); };
  // linha de Bresenham com as duas pontas, como o drawLine do TFT_eSPI
  T.linha = function (x0, y0, x1, y1, c) {
    var dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1, e = dx + dy;
    for (;;) {
      this.ponto(x0, y0, c);
      if (x0 === x1 && y0 === y1) break;
      var e2 = 2 * e;
      if (e2 >= dy) { e += dy; x0 += sx; }
      if (e2 <= dx) { e += dx; y0 += sy; }
    }
  };
  T.contorno = function (x, y, w, h, c) {
    this.linha(x, y, x + w - 1, y, c); this.linha(x, y + h - 1, x + w - 1, y + h - 1, c);
    this.linha(x, y, x, y + h - 1, c); this.linha(x + w - 1, y, x + w - 1, y + h - 1, c);
  };
  // fillRoundRect e drawRoundRect com raio 2: no TFT_eSPI, o raio 2 tira só o pixel de cada canto
  T.retR = function (x, y, w, h, c) {
    for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) {
      if ((i === 0 || i === w - 1) && (j === 0 || j === h - 1)) continue;
      this.ponto(x + i, y + j, c);
    }
  };
  T.contornoR = function (x, y, w, h, c) {
    this.linha(x + 1, y, x + w - 2, y, c); this.linha(x + 1, y + h - 1, x + w - 2, y + h - 1, c);
    this.linha(x, y + 1, x, y + h - 2, c); this.linha(x + w - 1, y + 1, x + w - 1, y + h - 2, c);
  };
  // círculos pelo algoritmo do ponto médio, o mesmo da Adafruit GFX que o TFT_eSPI herdou
  T.circulo = function (x0, y0, r, c) {
    var f = 1 - r, dfx = 1, dfy = -2 * r, x = 0, y = r;
    this.ponto(x0, y0 + r, c); this.ponto(x0, y0 - r, c); this.ponto(x0 + r, y0, c); this.ponto(x0 - r, y0, c);
    while (x < y) {
      if (f >= 0) { y--; dfy += 2; f += dfy; }
      x++; dfx += 2; f += dfx;
      this.ponto(x0 + x, y0 + y, c); this.ponto(x0 - x, y0 + y, c); this.ponto(x0 + x, y0 - y, c); this.ponto(x0 - x, y0 - y, c);
      this.ponto(x0 + y, y0 + x, c); this.ponto(x0 - y, y0 + x, c); this.ponto(x0 + y, y0 - x, c); this.ponto(x0 - y, y0 - x, c);
    }
  };
  T.disco = function (x0, y0, r, c) {
    for (var y = -r; y <= r; y++) for (var x = -r; x <= r; x++) if (x * x + y * y <= r * r + r) this.ponto(x0 + x, y0 + y, c);
  };
  T.triangulo = function (ax, ay, bx, by, cx, cy, c) {
    var x0 = Math.min(ax, bx, cx), x1 = Math.max(ax, bx, cx), y0 = Math.min(ay, by, cy), y1 = Math.max(ay, by, cy);
    var lado = function (px, py, qx, qy, rx, ry) { return (qx - px) * (ry - py) - (qy - py) * (rx - px); };
    var area = lado(ax, ay, bx, by, cx, cy);
    for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) {
      var w0 = lado(bx, by, cx, cy, x, y), w1 = lado(cx, cy, ax, ay, x, y), w2 = lado(ax, ay, bx, by, x, y);
      if (area < 0 ? w0 <= 0 && w1 <= 0 && w2 <= 0 : w0 >= 0 && w1 >= 0 && w2 >= 0) this.ponto(x, y, c);
    }
  };
  /* texto como o tftPrint do firmware: al -1, 0 ou 1 (esquerda, centro, direita, com o y no alto do texto); o alfa
     dos glifos mistura a cor com a cor de suavização (sv), e o alfa zero não pinta. spr: sprite onde o texto é
     desenhado (x, y, largura, altura), que corta o que passar dele */
  T.texto = function (f, s, x, y, al, cor, sv, spr) {
    if (typeof f !== "object") f = this.f[f];
    if (al === 0) x -= Math.floor(f.largura(s) / 2); else if (al === 1) x -= f.largura(s);
    var ox = spr ? spr[0] : 0, oy = spr ? spr[1] : 0, guarda = this.clip, cx = x;
    if (spr) this.clip = [spr[0], spr[1], spr[0] + spr[2], spr[1] + spr[3]];
    for (var k = 0; k < s.length; k++) {
      var c = s[k], g = f.g[c];
      if (c === " ") { cx += f.esp; continue; }
      if (!g) { cx += f.esp + 1; continue; }
      if (cx === 0) cx -= g.dx;
      var gx = ox + cx + g.dx, gy = oy + y + f.sub - g.dy, a = g.a;
      for (var j = 0; j < g.h; j++) for (var i = 0; i < g.w; i++) {
        var v = a[j * g.w + i];
        if (v) this.ponto(gx + i, gy + j, v === 255 ? cor : mistura(sv, cor, v / 255));
      }
      cx += g.adv;
    }
    this.clip = guarda;
  };
  // texto ampliado: o Mod17 escreve a carga da bateria numa letra maior que a FONT16 (cerca de 1,25 vez)
  T.textoAmpliado = function (f, s, x, y, al, cor, sv, k) {
    if (typeof f !== "object") f = this.f[f];
    var w = Math.round(f.largura(s) * k), cx = 0;
    if (al === 0) x -= Math.floor(w / 2); else if (al === 1) x -= w;
    for (var n = 0; n < s.length; n++) {
      var c = s[n], g = f.g[c];
      if (c === " ") { cx += f.esp; continue; }
      if (!g) { cx += f.esp + 1; continue; }
      var gx = x + Math.round((cx + g.dx) * k), gy = y + Math.round((f.sub - g.dy) * k), gw = Math.round(g.w * k), gh = Math.round(g.h * k);
      for (var j = 0; j < gh; j++) for (var i = 0; i < gw; i++) {
        var sx = Math.min(g.w - 1, (i + 0.5) / k - 0.5), sy = Math.min(g.h - 1, (j + 0.5) / k - 0.5);
        sx = Math.max(0, sx); sy = Math.max(0, sy);
        var x0 = sx | 0, y0 = sy | 0, x1 = Math.min(g.w - 1, x0 + 1), y1 = Math.min(g.h - 1, y0 + 1), fx = sx - x0, fy = sy - y0, a = g.a;
        var v = (a[y0 * g.w + x0] * (1 - fx) + a[y0 * g.w + x1] * fx) * (1 - fy) + (a[y1 * g.w + x0] * (1 - fx) + a[y1 * g.w + x1] * fx) * fy;
        if (v >= 8) this.ponto(gx + i, gy + j, v >= 250 ? cor : mistura(sv, cor, v / 255));
      }
      cx += g.adv;
    }
  };
  T.mostrar = function () { this.ctx.putImageData(this.img, 0, 0); };

  // as cores do tema, e as de suavização que o firmware usa (a cor apagada quase até o fundo)
  function cores(t) {
    var c = {};
    for (var k in t) if (typeof t[k] === "string") c[k] = rgb(t[k]);
    c.suave = function (x) { return mistura(c.fundo, x, 0.14); };
    c.etiqueta = mistura(c.ativo, c.apagado, 0.5);
    c.barra = function (i, total, ini, fim) {
      // Mod17: a cor corre pelo círculo das cores, do início ao fim, ao longo de 87% do medidor
      var a = paraHsv(ini), b = paraHsv(fim), k = Math.min(1, i / (total * 0.87)), dh = ((b[0] - a[0] + 540) % 360) - 180;
      if (a[1] < 0.05) a[0] = b[0];
      if (b[1] < 0.05) { b[0] = a[0]; dh = 0; }
      return hsv((a[0] + dh * k + 360) % 360, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k);
    };
    return c;
  }

  // o texto do RDS com o sublinhado no lugar dos espaços, como o ajuste Show underscore in RDS
  function sublinha(s, onde, campo) {
    return onde === "sim" || (onde === "ps" && campo === "ps") ? s.replace(/ /g, "_") : s;
  }
  function doisDigitos(n) { return (n < 10 ? "0" : "") + n; }
  function mhz(f) { return Math.floor(f / 100) + "." + doisDigitos(f % 100); }
  // o nível na unidade escolhida, em décimos (dBf soma 10,875 dB; dBm tira 10·log10(75) + 90)
  function nivel(e) {
    return e.unidade === "dBf" ? Math.floor(e.sinal + 108.75) : e.unidade === "dBm" ? Math.round(e.sinal - 10 * (10 * Math.log10(75) + 90)) : Math.round(e.sinal);
  }
  function unidade(e) { return { dBf: "dBf", dBm: "dBm" }[e.unidade] || "dBμV"; }

  /* letreiro, como o RT no firmware e os letreiros dos canais de notícia: quando o texto não cabe na caixa, ele corre
     para a esquerda e volta pelo outro lado, com seis espaços entre o fim e o começo. r = { texto, x, largura }
     (largura 0: o texto cabe e fica parado); a caixa (x, y, largura, altura) corta o que passa dela */
  function letreiro(t, tam, r, caixa, y, cor, sv) {
    var x = Math.round(r.x);
    t.texto(tam, r.texto, x, y, -1, cor, sv, caixa);
    if (r.largura) t.texto(tam, r.texto, x + r.largura, y, -1, cor, sv, caixa);
  }

  function fundo(t, c, linhas) {
    t.ret(0, 0, W, H, c.fundo);
    t.contorno(0, 0, 320, 240, c.moldura);
    linhas.concat([[53, 30, 53, 0], [89, 30, 89, 0], [120, 30, 120, 0], [158, 30, 158, 0], [248, 30, 248, 0], [0, 30, 320, 30]])
      .forEach(function (l) { t.linha(l[0], l[1], l[2], l[3], c.moldura); });
  }

  // a barra de cima, igual nas três telas: sintonia no centro, estéreo, alto-falante, RDS, banda, Wi-Fi e bateria
  function barraDeCima(t, c, e) {
    var sv = c.suave, centro = e.offset === 0, setaE = e.offset < 0 ? c.alerta : c.apagado, setaD = e.offset > 0 ? c.alerta : c.apagado;
    t.triangulo(2, 7, 11, 15, 2, 23, setaE); t.triangulo(12, 7, 21, 15, 12, 23, setaE);
    t.triangulo(40, 7, 31, 15, 40, 23, setaD); t.triangulo(50, 7, 41, 15, 50, 23, setaD);
    t.disco(26, 15, 3, centro ? c.ok : c.apagado);
    var cst = e.estereo ? c.st : c.apagado;
    // o Mod17 desenha os anéis mais grossos que a linha oficial (que usa só os raios 10 e 9)
    [10, 9, 8].forEach(function (r) { t.circulo(66, 15, r, cst); t.circulo(76, 15, r, cst); });
    var cal = e.squelchCorta ? c.prim : c.apagado;
    t.ret(92, 9, 13, 12, cal); t.triangulo(99, 9, 104, 4, 104, 9, cal); t.ret(99, 9, 6, 12, cal); t.triangulo(99, 20, 104, 25, 104, 20, cal);
    for (var d = 0; d < 9; d++) { t.ret(108 + d, 10 + d, 2, 2, cal); t.ret(116 - d, 10 + d, 2, 2, cal); }
    var crd = e.rds && e.rdsOk ? c.rds : c.apagado;
    t.texto(16, "RDS", 140, 7, 0, crd, sv(crd));
    var cbw = e.bwAuto ? c.bw : c.prim;
    t.texto(28, String(e.bw), 201, 4, 1, cbw, sv(cbw));
    t.texto(28, "kHz", 203, 4, -1, c.ativo, sv(c.ativo));
    // Wi-Fi: três arcos e o ponto, cada arco com o seu centro, como o ícone do firmware
    var cwf = e.wifi ? c.prim : c.apagado;
    [[18, 11.6, 14.2, 10.6], [22.5, 7.6, 10.2, 16.6], [24.5, 3, 5.8, 21.6]].forEach(function (a) {
      for (var y = 4; y < 29; y++) for (var x = 250; x < 275; x++) {
        var dx = x + 0.5 - 262.5, dy = y + 0.5 - a[0], r = Math.sqrt(dx * dx + dy * dy);
        if (r > a[1] && r < a[2] && y + 0.5 <= a[3]) t.ponto(x, y, cwf);
      }
    });
    t.ret(261, 24, 3, 3, cwf); t.ponto(262, 27, cwf);
    if (e.bateria === "porcentagem") t.textoAmpliado(16, e.carga + "%", 318, 8, 1, c.bat, sv(c.bat), 1.18);
    else if (e.bateria === "volts") t.textoAmpliado(16, (3.3 + 0.9 * e.carga / 100).toFixed(2) + "V", 318, 8, 1, c.bat, sv(c.bat), 1.18);
    else t.retR(279, 8, Math.round(e.carga / 100 * 4) * 8, 16, c.bar);
    t.contornoR(277, 6, 37, 20, c.ativo); t.retR(313, 13, 4, 6, c.ativo);
  }
  // as quatro barrinhas da qualidade do RDS, ao lado do PS (base: a altura da mais baixa)
  function qualidade(t, c, e, base) {
    for (var i = 0; i < 4; i++) t.ret(187 + 6 * i, base - 6 * i, 4, 9 + 6 * i, i < e.qualidade ? c.ok : c.apagado);
  }

  /* a tela do rádio, a partir do estado (e) e dos letreiros do PTY, do PS e do RT (rol). e.tela escolhe a tela:
     "principal", "rds" (a do RDS avançado) ou "af" e "eon" (as duas páginas da lista de AF e EON) */
  T.desenhar = function (e, tema, rol) {
    var c = cores(tema);
    if (e.tela === "rds") telaRDS(this, c, e, rol);
    else if (e.tela === "af" || e.tela === "eon") telaAF(this, c, e);
    else telaPrincipal(this, c, e, rol);
    this.mostrar();
  };

  function telaPrincipal(t, c, e, rol) {
    var sv = c.suave, i;
    fundo(t, c, [[0, 100, 320, 100], [210, 100, 210, 217], [0, 160, 210, 160], [0, 180, 320, 180], [0, 217, 320, 217]]);
    // os medidores: linhas, marcas e escalas
    t.linha(16, 114, 202, 114, c.ativo);
    t.linha(16, 143, 202, 143, e.modulacao ? c.ativo : c.apagado);
    for (var s = 0; s < 94; s++) {
      if (s > 54) {
        if ((s - 53) % 10 === 0) { t.ret(16 + 2 * s, 112, 2, 2, c.barS); t.ret(16 + 2 * s, 141, 2, 2, e.modulacao ? c.barS : c.apagado); }
      } else if ((s + 1) % 6 === 0) { t.ret(16 + 2 * s, 112, 2, 2, c.bar); t.ret(16 + 2 * s, 141, 2, 2, e.modulacao ? c.bar : c.apagado); }
    }
    t.texto(16, "S", 7, 101, 0, c.ativo, sv(c.ativo));
    [["1", 24], ["3", 48], ["5", 72], ["7", 96], ["9", 120], ["+10", 134], ["+30", 174]].forEach(function (a) { t.texto(16, a[0], a[1], 115, -1, c.ativo, sv(c.ativo)); });
    var cm = e.modulacao ? c.ativo : c.apagado;
    t.texto(16, "M", 7, 128, 0, cm, sv(cm));
    [["10", 27], ["30", 57], ["50", 87], ["70", 117], ["100", 164]].forEach(function (a) { t.texto(16, a[0], a[1], 144, -1, cm, sv(cm)); });
    barraDeCima(t, c, e);

    // modo de sintonia, memória, banda, passo e frequência
    [["MAN", 36, 38, "man"], ["AUTO", 58, 60, "auto"], ["MEM", 80, 82, "mem"]].forEach(function (m) {
      etiqueta(t, c, 2, m[1], 40, m[0], 22, e.modo === m[3]);
    });
    // o Mod17 põe a memória 4 pixels mais à esquerda e a banda 3 mais à direita que a linha oficial (50 e 70)
    if (e.modo === "mem") t.texto(16, String(e.memoria), 46, 32, -1, c.prim, sv(c.prim));
    t.texto(16, e.banda, 73, 32, -1, c.prim, sv(c.prim));
    [[113, 4], [144, 3], [191, 2], [222, 1]].forEach(function (p) { t.ret(p[0], 38, 15, 4, e.passo === p[1] ? c.ok : c.apagado); });
    t.texto(t.ff[e.fonte] || t.ff.Comic, mhz(e.freq) + " ", 218, -6, 1, c.freq, sv(c.freq), [46, 46, 200, 50]);
    etiqueta(t, c, 248, 36, 69, "AUTO BW", 282, e.bwAuto);
    etiqueta(t, c, 249, 57, 30, "iMS", 265, e.ims);
    etiqueta(t, c, 287, 57, 30, "EQ", 301, e.eq);
    t.texto(28, "MHz", 258, 76, -1, c.ativo, sv(c.ativo));

    // nível do sinal: no Mod17, vermelho a partir de 60 dBμV, verde a partir de 40 e amarelo abaixo disso
    var dbuv = e.sinal / 10, mostra = nivel(e);
    var csin = dbuv >= 60 ? c.alerta : dbuv >= 40 ? c.ok : c.freq, inteiro = (mostra < 0 && mostra > -10 ? "-" : "") + (mostra / 10 | 0);
    t.texto(48, inteiro, 288, 105, 1, csin, sv(csin));
    t.texto(28, "." + Math.abs(mostra % 10), 310, 105, 1, csin, sv(csin));
    t.texto(16, unidade(e), 282, 145, -1, c.ativo, sv(c.ativo));
    var seg = Math.max(0, Math.min(93, Math.round(dbuv * 100 / 70)));
    for (i = 0; i < seg; i++) t.ret(16 + 2 * i, 105, 2, 6, c.barra(i, 93, c.bar, c.barS));
    t.ret(16 + 2 * seg, 105, 2 * (93 - seg), 6, c.apagado);
    if (e.modulacao) {
      var ms = Math.max(0, Math.min(93, Math.round(e.mod * 93 / 120)));
      for (i = 0; i < ms; i++) t.ret(16 + 2 * i, 133, 2, 6, c.barra(i, 93, c.mod, c.modS));
      t.ret(16 + 2 * ms, 133, 2 * (93 - ms), 6, c.apagado);
      // o pico segurado: some quando volta para a ponta da barra; a cor segue a modulação atual, como no firmware
      var pk = Math.min(93, Math.round(e.pico * 93 / 120));
      if (pk > ms) t.ret(16 + 2 * pk, 133, 2, 6, e.mod > 80 ? c.modS : c.prim);
    } else t.ret(16, 133, 186, 6, c.apagado);
    // dormir, C/N
    t.ret(213, 165, 2, 13, c.apagado); t.disco(218, 169, 2, c.apagado); t.retR(222, 167, 16, 5, c.apagado);
    t.ret(215, 173, 24, 2, c.apagado); t.ret(237, 175, 2, 3, c.apagado);
    t.texto(16, "C/N:", 275, 163, 1, c.ativo, sv(c.ativo));
    t.texto(16, e.cn ? String(e.cn) : "--", 297, 163, 1, c.prim, sv(c.prim));
    t.texto(16, "dB", 300, 163, -1, c.ativo, sv(c.ativo));

    // RDS: PTY, PS, sinal do RDS, relógio (ou PI) e RadioText
    var crds = e.rdsOk ? c.rds : c.rdsQueda, rotulo = e.rds ? c.ativo : c.apagado;
    t.texto(16, "PTY:", 3, 163, -1, rotulo, sv(rotulo));
    t.texto(16, "PS:", 3, 193, -1, rotulo, sv(rotulo));
    t.texto(16, "RT:", 3, 221, -1, rotulo, sv(rotulo));
    if (e.rds) {
      letreiro(t, 16, rol.pty, [36, 161, 174, 19], 2, crds, sv(crds));
      letreiro(t, 28, rol.ps, [36, 185, 150, 32], 2, crds, sv(crds));
      letreiro(t, 16, rol.rt, [36, 220, 275, 19], 2, crds, sv(crds));
    }
    qualidade(t, c, e, 204);
    // o canto do relógio: tocando nele, o Mod17 troca entre a hora, a data com a hora e o PI
    var modo = e.relogio ? e.relogioModo : "pi";
    if (modo === "pi") {
      t.texto(16, "PI:", 212, 193, -1, c.ativo, sv(c.ativo));
      if (e.rds && e.pi) t.texto(28, e.pi, 267, 187, 0, crds, sv(crds));
    } else if (modo === "completo") {
      if (e.data) t.texto(16, e.data, 263, 184, 0, c.relogio, sv(c.relogio));
      if (e.hora) t.texto(16, e.hora, 264, 200, 0, c.relogio, sv(c.relogio));
    } else if (e.hora) t.texto(28, e.hora, 261, 187, 0, c.relogio, sv(c.relogio));
    t.disco(314, 223, 2, e.rds && !e.rtAB ? c.ok : c.apagado);
    t.disco(314, 234, 2, e.rds && e.rtAB ? c.ok : c.apagado);
  }

  /* a tela do RDS avançado (BuildAdvancedRDS na linha oficial): no Mod17, a frequência fica alinhada em 280, o
     nível em 278, as unidades em 314 e o rótulo do PI em 214, como na foto */
  function telaRDS(t, c, e, rol) {
    var sv = c.suave, at = c.ativo, rd = e.rdsOk ? c.rds : c.rdsQueda, cin = c.apagado, av = e.avisos;
    fundo(t, c, [[0, 68, 320, 68], [0, 104, 320, 104], [0, 126, 320, 126], [210, 30, 210, 240], [0, 140, 210, 140],
      [0, 166, 210, 166], [0, 193, 210, 193], [210, 191, 320, 191], [0, 217, 210, 217]]);
    barraDeCima(t, c, e);
    [["ERRORS", 3, 34], ["A:", 66, 34], ["B:", 104, 34], ["C:", 142, 34], ["D:", 180, 34], ["PS", 3, 81], ["PI", 214, 81], ["PTY", 3, 109],
      ["RT+", 3, 147], ["EON", 3, 174], ["AF", 3, 199], ["RT", 3, 222], ["ECC", 214, 193], ["LIC", 214, 208], ["PIN", 214, 223]].forEach(function (a) {
      t.texto(16, a[0], a[1], a[2], -1, at, sv(at));
    });
    t.texto(16, "MHz", 314, 35, 1, at, sv(at));
    t.texto(16, unidade(e), 314, 51, 1, at, sv(at));
    [["Dynamic PTY", 130], ["Artif. head", 145], ["Compressed", 160], ["Has stereo", 175]].forEach(function (a) { t.texto(16, a[0], 300, a[1], 1, at, sv(at)); });
    // erros dos blocos A a D (verde: sem erro) e as marcas do RDS: só a de fala (S) ou música (M) acesa
    [86, 124, 162, 200].forEach(function (x) { t.disco(x, 41, 5, c.ok); });
    var fm = e.fala ? "S" : "M";
    [["TP", 2], ["TA", 24], ["AF", 50], ["-B", 68], ["TMC", 88], ["RT+", 123], ["EON", 153], ["S", 185], ["M", 196]].forEach(function (a) {
      if (a[0] === fm) t.texto(16, a[0], a[1], 51, -1, rd, sv(rd)); else t.texto(16, a[0], a[1], 51, -1, cin, c.fundo);
    });
    // memória, frequência e nível
    t.texto(16, String(e.memoria), 214, 36, -1, c.sec, sv(c.sec));
    t.texto(16, mhz(e.freq), 280, 35, 1, c.prim, sv(c.prim));
    var n = nivel(e);
    t.texto(16, (n < 0 && n > -10 ? "-" : "") + (n / 10 | 0) + "." + Math.abs(n % 10), 278, 51, 1, c.prim, sv(c.prim));
    // PS, qualidade, PI, PTY e PTYN
    letreiro(t, 28, rol.ps, [36, 72, 150, 32], 2, rd, sv(rd));
    qualidade(t, c, e, 92);
    if (e.pi) t.texto(28, e.pi, 270, 75, 0, rd, sv(rd));
    letreiro(t, 16, rol.pty, [36, 105, 174, 21], 4, rd, sv(rd));
    t.texto(16, "PTYN N/A", 216, 109, -1, rd, sv(rd));
    // os blocos recebidos (como na foto: o primeiro em verde e um com erro)
    for (var i = 0; i < 33; i++) t.disco(6 * i + 10, 133, 2, i === 0 ? c.ok : i === 4 ? c.alerta : cin);
    // RT+, EON, AF e RT
    t.texto(16, av.semRTmais, 0, 2, -1, rd, sv(rd), [35, 146, 165, 19]);
    t.texto(16, av.semEON, 0, 2, -1, rd, sv(rd), [35, 172, 165, 19]);
    t.texto(16, av.semAF, 0, 2, -1, rd, sv(rd), [35, 197, 165, 19]);
    letreiro(t, 16, rol.rt, [36, 220, 165, 19], 2, rd, sv(rd));
    t.disco(203, 223, 2, e.rtAB ? cin : c.ok); t.disco(203, 234, 2, e.rtAB ? c.ok : cin);
    // PTY dinâmico, cabeça artificial, comprimido (não) e estéreo; ECC, LIC e PIN
    [137, 153, 168].forEach(function (y) { t.disco(310, y, 5, c.alerta); });
    t.disco(310, 183, 5, e.estereo ? c.ok : c.alerta);
    [193, 208, 223].forEach(function (y) { t.texto(16, "N/A", 242, y, -1, rd, sv(rd)); });
  }

  // a lista de AF (página 1) e de EON (página 2), com o PS e a frequência embaixo (BuildAFScreen e ShowAFEON)
  function telaAF(t, c, e) {
    var sv = c.suave, av = e.avisos, pag = e.tela === "af" ? 1 : 2;
    fundo(t, c, [[0, 199, 320, 199], [0, 218, 320, 218]]);
    barraDeCima(t, c, e);
    t.texto(16, pag === 1 ? av.semAF : av.semEON, 6, 48, -1, c.prim, sv(c.prim));
    t.texto(16, sublinha(e.ps, e.sublinhado, "ps"), 160, 201, 0, c.bw, sv(c.bw));
    t.texto(16, mhz(e.freq), 290, 201, 1, c.bw, sv(c.bw));
    t.texto(16, pag + "/2", 315, 201, 1, c.ativo, sv(c.ativo));
    t.texto(16, av.fechar, 160, 222, 0, c.ativo, sv(c.ativo));
  }

  // etiqueta acesa (fundo na cor secundária, texto na cor do fundo) ou apagada (o Mod17 só contorna)
  function etiqueta(t, c, x, y, w, txt, cx, acesa) {
    var ty = y + 2;
    if (acesa) { t.retR(x, y, w, 18, c.sec); t.texto(16, txt, cx, ty, 0, c.fundo, c.sec); }
    else { t.retR(x, y, w, 18, c.cinza); t.contornoR(x, y, w, 18, c.etiqueta); t.texto(16, txt, cx, ty, 0, c.etiqueta, c.cinza); }
  }

  raiz.TelaRadio = Tela;
})(window);
