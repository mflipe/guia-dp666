// Componentes da interface, com os mesmos nomes e a mesma saída em Python e em JavaScript.
// O par deste arquivo é site/componentes.py: o build usa aquele, o app.js e o navegacao.js usam este (como
// Componentes). Os dois precisam dar exatamente o mesmo HTML; o build confere com os exemplos de lá.
// Mude os dois arquivos juntos. Convenção: o primeiro argumento é o conteúdo, já em HTML; o último, um objeto de
// opções; valores de atributo entram crus e são escapados aqui (true vira atributo sem valor; false e null somem).
var Componentes = (function () {
  "use strict";
  var VARIANTES = { solido: "btn-solid", fantasma: "btn-ghost" };

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function atributos(a) {
    var out = "";
    if (a) Object.keys(a).forEach(function (k) {
      var v = a[k];
      if (v === true) out += " " + k;
      else if (v !== false && v !== null && v !== undefined) out += " " + k + '="' + esc(v) + '"';
    });
    return out;
  }
  function classes() { return Array.prototype.filter.call(arguments, Boolean).join(" "); }

  function botao(html, op) {
    op = op || {};
    var c = classes(VARIANTES[op.variante] || "", op.classe);
    return '<button type="button"' + (c ? ' class="' + c + '"' : "") + atributos(op.attrs) + ">" + html + "</button>";
  }
  function nota(html, op) {
    op = op || {};
    return '<p class="' + (op.classe || "aj-note") + '"' + atributos(op.attrs) + ">" + html + "</p>";
  }
  function selo(html, op) {
    var tom = (op || {}).tom;
    return '<span class="tag' + (tom ? " tag-" + tom : "") + '">' + html + "</span>";
  }
  function seletor(rotulo, op) {
    return '<div class="seg" role="radiogroup" aria-label="' + esc(rotulo) + '">' + ((op || {}).opcoes || "") + "</div>";
  }
  function opcaoSeletor(html, op) {
    op = op || {};
    var a = { role: "radio", "aria-checked": op.marcado ? "true" : "false" };
    a["data-" + (op.chave || "v")] = op.valor;
    return botao(html, { attrs: a });
  }
  function opcao(html, op) {
    op = op || {};
    var escolha = op.escolha, desligada = op.desligada, dentro;
    var c = classes("aj-opt", (escolha != null || desligada) && "is-pick", op.padrao && "is-def",
      op.brasil && "is-br", op.ativo && "is-on", desligada && "is-off");
    if (desligada) dentro = botao(html, { classe: "aj-pick", attrs: { disabled: true } });
    else if (escolha != null) dentro = botao(html, { classe: "aj-pick", attrs: { "data-pv": escolha.pv, "data-v": escolha.v, "aria-pressed": op.ativo ? "true" : "false" } });
    else dentro = html;
    var tag = op.tag || "li";
    return "<" + tag + ' class="' + c + '">' + dentro + "</" + tag + ">";
  }
  function amostra(cor) { return '<span class="aj-cor-sw" style="background:' + esc(cor) + '"></span>'; }
  function paleta(c) {
    if (!c) return "";
    return '<span class="aj-sw" aria-hidden="true" style="background:' + esc(c.fundo) + ";border-color:" + esc(c.moldura) + '">' +
      '<i style="background:' + esc(c.freq) + '"></i><i style="background:' + esc(c.sec) + '"></i></span>';
  }
  function recolhivel(itens, op) {
    op = op || {};
    var mais = op.mais;
    var h = '<ol class="' + classes(op.classe, mais && "is-many") + '"' + atributos(op.attrs) + ">" + itens + "</ol>";
    if (mais) h += botao(mais, { classe: "aj-more", attrs: { "data-n": op.n, "aria-expanded": "false" } });
    return h;
  }
  function itemMenu(href, nome, op) {
    op = op || {};
    var h = '<li class="' + classes("mi-item", op.classe) + '"' + atributos(op.li) +
      '><a class="mi" href="' + esc(href) + '"' + atributos(op.a) + ">" + (op.antes || "") +
      '<span class="mi-nome">' + nome + "</span>" + (op.depois || "") + "</a>";
    if (op.desc != null) h += '<p class="mi-desc">' + op.desc + "</p>";
    return h + "</li>";
  }

  // os nomes de fora são os mesmos do Python, inclusive os de duas palavras (opcao_seletor, item_menu)
  return {
    esc: esc, atributos: atributos, botao: botao, nota: nota, selo: selo, seletor: seletor,
    opcao_seletor: opcaoSeletor, opcao: opcao, amostra: amostra, paleta: paleta, recolhivel: recolhivel, item_menu: itemMenu,
  };
})();
