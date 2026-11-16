"""Menus em inglês, montados a partir do menuspec.py no build.

Linha oficial: o nome exibido é o rótulo em inglês do próprio firmware (campo en). Opções, padrões e títulos
de grupo usam a tabela de idiomas do firmware PE5PVB (i18n/firmware_labels_en.json). As explicações do guia
vêm de i18n/menuspec_en.json. Os ids continuam os do português (campo idnome), iguais nos dois idiomas.
"""
import re
import types

import i18n
import menuspec as PT

BANDS = re.compile(r"^(LW|AM|SW|FM|OIRT|AIR)(, (LW|AM|SW|FM|OIRT|AIR))*$")


def spec():
    prose, labels = i18n.catalog("menuspec_en"), i18n.catalog("firmware_labels_en")

    def dec(s):
        return re.sub(r"(?<=\d),(?=\d)", ".", s)

    def lab(s, am_is_mw=False):
        if not s:
            return s
        if am_is_mw and BANDS.match(s):
            return re.sub(r"\bAM\b", "MW", s)
        return dec(labels.get(s) or prose.get(s) or s)

    def txt(s):
        return prose.get(s, s) if s else s

    def item(it, oficial):
        new = dict(it)
        new["idnome"] = it["nome"]
        am = oficial and it["en"] == "Select AM Band"
        if oficial:
            new["nome"], new["en"] = it["en"] or lab(it["nome"]), ""
        new["padrao"], new["br"], new["sub"] = lab(it["padrao"], am), lab(it["br"], am), lab(it["sub"])
        new["desc"] = txt(it["desc"])
        sp = dict(it["spec"])
        if "opcoes" in sp:
            sp["opcoes"] = [lab(o, am) for o in sp["opcoes"]]
        for k in ("nota", "resumo"):
            if sp.get(k):
                sp[k] = txt(sp[k])
        new["spec"] = sp
        return new

    def groups(spec_pt, oficial):
        out = []
        for titulo, notas, itens in spec_pt:
            out.append((lab(titulo), [txt(n) for n in notas], [item(it, oficial) for it in itens], titulo))
        return out

    return types.SimpleNamespace(OFICIAL=groups(PT.OFICIAL, True), MOD17=groups(PT.MOD17, False),
                                 FONTES={k: txt(v) for k, v in PT.FONTES.items()})
