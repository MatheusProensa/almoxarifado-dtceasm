const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "dados.json");

const DADOS_INICIAIS = {
  materiais: [
    { id: 1001, sku: "EXP01", name: "Caneta esferográfica azul",              cat: "exp", loc: "A-01-1", qty: 10, unit: "un",  min: 8  },
    { id: 1002, sku: "EXP02", name: "Caneta esferográfica preta",             cat: "exp", loc: "A-01-2", qty: 5,  unit: "un",  min: 8  },
    { id: 1003, sku: "EXP03", name: "Caneta esferográfica vermelha",          cat: "exp", loc: "A-01-3", qty: 5,  unit: "un",  min: 6  },
    { id: 1004, sku: "EXP04", name: "Caneta marca-texto amarela",             cat: "exp", loc: "A-01-4", qty: 3,  unit: "un",  min: 6  },
    { id: 1005, sku: "EXP05", name: "Lápis preto nº 2 HB",                   cat: "exp", loc: "A-02-1", qty: 5,  unit: "un",  min: 10 },
    { id: 1006, sku: "EXP06", name: "Borracha branca macia",                  cat: "exp", loc: "A-02-2", qty: 5,  unit: "un",  min: 6  },
    { id: 1007, sku: "EXP07", name: "Régua de alumínio 30 cm",               cat: "exp", loc: "A-02-3", qty: 3,  unit: "un",  min: 4  },
    { id: 1008, sku: "EXP08", name: "Lapiseira 0,7 mm",                      cat: "exp", loc: "A-02-4", qty: 2,  unit: "un",  min: 4  },
    { id: 1009, sku: "EXP09", name: "Clips para papel 2/0 (cx 100)",         cat: "exp", loc: "A-03-1", qty: 2,  unit: "cx",  min: 6  },
    { id: 1010, sku: "EXP10", name: "Grampeador médio 26/6",                 cat: "exp", loc: "A-03-2", qty: 0,  unit: "un",  min: 4  },
    { id: 1011, sku: "EXP11", name: "Grampo para grampeador 26/6 (cx 5000)", cat: "exp", loc: "A-03-3", qty: 0,  unit: "cx",  min: 5  },
    { id: 1012, sku: "EXP12", name: "Cola branca 90 g",                      cat: "exp", loc: "A-04-1", qty: 5,  unit: "un",  min: 6  },
    { id: 1013, sku: "EXP13", name: "Cola instantânea incolor",              cat: "exp", loc: "A-04-2", qty: 2,  unit: "un",  min: 4  },
    { id: 1014, sku: "EXP14", name: "Fita adesiva transparente (rolo 33m x 12mm)", cat: "exp", loc: "A-04-3", qty: 5, unit: "rl", min: 8 },
    { id: 1015, sku: "EXP15", name: "Fita adesiva dupla face 19mm x 30m",   cat: "exp", loc: "A-04-4", qty: 1,  unit: "rl",  min: 3  },
    { id: 1016, sku: "EXP16", name: "Bloco adesivo amarelo 76 x 102 mm",    cat: "exp", loc: "A-05-1", qty: 5,  unit: "un",  min: 6  },
    { id: 1017, sku: "EXP17", name: "Papel sulfite A4 75g (resma)",          cat: "exp", loc: "A-05-2", qty: 10, unit: "rm",  min: 12 },
    { id: 1018, sku: "EXP18", name: "Envelope pardo 229 x 324 mm",           cat: "exp", loc: "A-05-3", qty: 1,  unit: "pct", min: 4  },
    { id: 1019, sku: "EXP19", name: "Caixa arquivo papelão 37 x 24,5 x 13,6 cm", cat: "exp", loc: "A-06-1", qty: 5, unit: "un", min: 8 },
    { id: 1020, sku: "EXP20", name: "Pasta plástica com elástico ofício",    cat: "exp", loc: "A-06-2", qty: 5,  unit: "un",  min: 8  },
    { id: 1021, sku: "EXP21", name: "Pasta suspensa para arquivo",           cat: "exp", loc: "A-06-3", qty: 0,  unit: "un",  min: 10 },
    { id: 1022, sku: "EXP22", name: "Livro ata 100 fls pautado",             cat: "exp", loc: "A-07-1", qty: 2,  unit: "un",  min: 4  },
    { id: 1023, sku: "EXP23", name: "Livro protocolo de correspondência 100 fls", cat: "exp", loc: "A-07-2", qty: 1, unit: "un", min: 4 },
    { id: 1024, sku: "EXP24", name: "Marcador para quadro branco azul",      cat: "exp", loc: "A-07-3", qty: 5,  unit: "un",  min: 6  },
    { id: 1025, sku: "EXP25", name: "Estilete grande com lâmina 18mm",      cat: "exp", loc: "A-08-1", qty: 5,  unit: "un",  min: 6  },
    { id: 1026, sku: "EXP26", name: "Prancheta acrílico fumê ofício",        cat: "exp", loc: "A-08-2", qty: 4,  unit: "un",  min: 4  },
    { id: 1027, sku: "LMP01", name: "Álcool etílico hidratado 70° (garrafa 1L)", cat: "lmp", loc: "B-01-1", qty: 2, unit: "un", min: 12 },
    { id: 1028, sku: "LMP02", name: "Álcool gel 70° glicerinado (galão 5L)", cat: "lmp", loc: "B-01-2", qty: 0,  unit: "un",  min: 6  },
    { id: 1029, sku: "LMP03", name: "Detergente lava-louças neutro 500 ml", cat: "lmp", loc: "B-02-1", qty: 0,  unit: "un",  min: 10 },
    { id: 1030, sku: "LMP04", name: "Desinfetante quaternário (frasco 1L)",  cat: "lmp", loc: "B-02-2", qty: 4,  unit: "un",  min: 8  },
    { id: 1031, sku: "LMP05", name: "Sabão em pó (pct 1 kg)",               cat: "lmp", loc: "B-02-3", qty: 3,  unit: "pct", min: 6  },
    { id: 1032, sku: "LMP06", name: "Esponja dupla face 100 x 70 x 20 mm", cat: "lmp", loc: "B-03-1", qty: 6,  unit: "un",  min: 6  },
    { id: 1033, sku: "LMP07", name: "Pano de chão alvejado multiuso",       cat: "lmp", loc: "B-03-2", qty: 8,  unit: "un",  min: 10 },
    { id: 1034, sku: "LMP08", name: "Flanela de algodão 30 x 40 cm",        cat: "lmp", loc: "B-03-3", qty: 7,  unit: "un",  min: 5  },
    { id: 1035, sku: "LMP09", name: "Vassoura cerdas de nylon",             cat: "lmp", loc: "B-04-1", qty: 4,  unit: "un",  min: 4  },
    { id: 1036, sku: "LMP10", name: "Rodo de alumínio 40 cm com cabo",      cat: "lmp", loc: "B-04-2", qty: 2,  unit: "un",  min: 4  },
    { id: 1037, sku: "LMP11", name: "Borrifador plástico 500 ml",           cat: "lmp", loc: "B-04-3", qty: 4,  unit: "un",  min: 3  },
    { id: 1038, sku: "LMP12", name: "Cera líquida incolor (emb 5L)",        cat: "lmp", loc: "B-05-1", qty: 2,  unit: "un",  min: 4  },
    { id: 1039, sku: "LMP13", name: "Inseticida aerossol base água 300 ml", cat: "lmp", loc: "B-05-2", qty: 7,  unit: "un",  min: 3  },
    { id: 1040, sku: "HIG01", name: "Papel higiênico folha dupla (rolo 30m)", cat: "hig", loc: "C-01-1", qty: 0, unit: "rl", min: 12 },
    { id: 1041, sku: "HIG02", name: "Papel toalha interfolhado (pct 1000 fls)", cat: "hig", loc: "C-01-2", qty: 1, unit: "pct", min: 8 },
    { id: 1042, sku: "HIG03", name: "Sabonete líquido (frasco 500 ml)",     cat: "hig", loc: "C-02-1", qty: 0,  unit: "un",  min: 6  },
    { id: 1043, sku: "COP01", name: "Filtro de café descartável nº 103",    cat: "copa", loc: "D-01-1", qty: 5, unit: "cx",  min: 10 },
    { id: 1044, sku: "COP02", name: "Copo plástico descartável 180 ml",     cat: "copa", loc: "D-01-2", qty: 2, unit: "pct", min: 6  },
    { id: 1045, sku: "COP03", name: "Copo plástico descartável 300 ml",     cat: "copa", loc: "D-01-3", qty: 10,unit: "pct", min: 6  },
    { id: 1046, sku: "COP04", name: "Guardanapo de papel 20 x 22 cm (pct 50)", cat: "copa", loc: "D-02-1", qty: 10, unit: "pct", min: 8 },
    { id: 1047, sku: "COP05", name: "Garfo plástico descartável (pct 50)",  cat: "copa", loc: "D-02-2", qty: 10, unit: "pct", min: 8  },
    { id: 1048, sku: "DES01", name: "Saco coletor de lixo preto 15L (pct 100)",  cat: "desc", loc: "E-01-1", qty: 0, unit: "pct", min: 8 },
    { id: 1049, sku: "DES02", name: "Saco coletor de lixo preto 40L (pct 100)",  cat: "desc", loc: "E-01-2", qty: 0, unit: "pct", min: 10 },
    { id: 1050, sku: "DES03", name: "Saco coletor de lixo preto 100L (pct 100)", cat: "desc", loc: "E-01-3", qty: 0, unit: "pct", min: 8 },
    { id: 1051, sku: "DES04", name: "Saco coletor de lixo preto 200L (pct 100)", cat: "desc", loc: "E-01-4", qty: 0, unit: "pct", min: 6 },
    { id: 1052, sku: "DES05", name: "Cesto de lixo 20L com tampa e pedal", cat: "desc", loc: "E-02-1", qty: 3,  unit: "un",  min: 4  },
    { id: 1053, sku: "DES06", name: "Cesto de lixo 30L com tampa e pedal", cat: "desc", loc: "E-02-2", qty: 3,  unit: "un",  min: 4  },
    { id: 1054, sku: "INF01", name: "Cartucho toner HP 122A preto (Q3960A)", cat: "inf", loc: "F-01-1", qty: 0, unit: "un", min: 4 },
    { id: 1055, sku: "INF02", name: "Cartucho toner HP 122A ciano (Q3961A)", cat: "inf", loc: "F-01-2", qty: 0, unit: "un", min: 2 },
    { id: 1056, sku: "INF03", name: "Mouse óptico USB",                      cat: "inf", loc: "F-02-1", qty: 0,  unit: "un",  min: 4  },
    { id: 1057, sku: "INF04", name: "Organizador de cabos velcro (rolo 2x300cm)", cat: "inf", loc: "F-02-2", qty: 10, unit: "un", min: 6 },
    { id: 1058, sku: "FER01", name: "Alicate universal",                     cat: "fer", loc: "G-01-1", qty: 3,  unit: "un",  min: 2  },
    { id: 1059, sku: "FER02", name: "Chave de fenda 1/8 x 3\" (3 x 80 mm)", cat: "fer", loc: "G-01-2", qty: 2,  unit: "un",  min: 3  },
    { id: 1060, sku: "FER03", name: "Estopa (kg)",                           cat: "fer", loc: "G-02-1", qty: 9,  unit: "kg",  min: 5  },
    { id: 1061, sku: "FER04", name: "Óleo lubrificante WD-40",              cat: "fer", loc: "G-02-2", qty: 2,  unit: "un",  min: 3  },
  ],
  movimentacoes: [
    { id: 1, tipo: "out", sku: "EXP17", item: "Papel sulfite A4 75g (resma)",              qty: 12, unit: "rm",  antes: 22, depois: 10, resp: "2S Geraldo",   doc: "RM-2026-0481", dest: "APP",  at: "31/05/2026 14:38" },
    { id: 2, tipo: "in",  sku: "LMP01", item: "Álcool etílico hidratado 70° (garrafa 1L)", qty: 10, unit: "un",  antes: 2,  depois: 12, resp: "2S Geraldo",   doc: "GFM nº 2210", dest: "",     at: "31/05/2026 11:02" },
    { id: 3, tipo: "adj", sku: "EXP09", item: "Clips para papel 2/0 (cx 100)",             qty: 1,  unit: "cx",  antes: 1,  depois: 2,  resp: "2S Friedrich", doc: "Inventário",  dest: "",     at: "31/05/2026 09:20" },
    { id: 4, tipo: "out", sku: "LMP02", item: "Álcool gel 70° glicerinado (galão 5L)",     qty: 6,  unit: "un",  antes: 6,  depois: 0,  resp: "Cb Zimmerman", doc: "RM-2026-0479", dest: "SMSO", at: "30/05/2026 16:44" },
    { id: 5, tipo: "in",  sku: "COP04", item: "Guardanapo de papel 20 x 22 cm (pct 50)",  qty: 6,  unit: "pct", antes: 4,  depois: 10, resp: "2S Friedrich", doc: "GFM nº 2204", dest: "",     at: "30/05/2026 13:20" },
    { id: 6, tipo: "out", sku: "DES03", item: "Saco coletor de lixo preto 100L (pct 100)",qty: 5,  unit: "pct", antes: 5,  depois: 0,  resp: "Cb Zimmerman", doc: "RM-2026-0478", dest: "SMST", at: "30/05/2026 10:05" },
    { id: 7, tipo: "in",  sku: "HIG02", item: "Papel toalha interfolhado (pct 1000 fls)", qty: 1,  unit: "pct", antes: 0,  depois: 1,  resp: "2S Geraldo",   doc: "GFM nº 2198", dest: "",     at: "27/05/2026 15:51" },
    { id: 8, tipo: "out", sku: "COP01", item: "Filtro de café descartável nº 103",        qty: 3,  unit: "cx",  antes: 8,  depois: 5,  resp: "Cb Zimmerman", doc: "RM-2026-0475", dest: "TWR",  at: "27/05/2026 08:32" },
    { id: 9, tipo: "adj", sku: "FER03", item: "Estopa (kg)",                               qty: 2,  unit: "kg",  antes: 7,  depois: 9,  resp: "Cb Zimmerman", doc: "Correção",    dest: "",     at: "26/05/2026 17:10" },
    { id: 10, tipo: "in", sku: "EXP18", item: "Envelope pardo 229 x 324 mm",              qty: 1,  unit: "pct", antes: 0,  depois: 1,  resp: "2S Friedrich", doc: "GFM nº 2185", dest: "",     at: "26/05/2026 09:48" },
  ],
  proximoId: 2000,
  config: {
    perfil: { name: "2S Geraldo", role: "Encarregado do almoxarifado · Seção de Suprimento", unit: "DTCEA-SM" },
    categorias: {
      exp:  { label: "Expediente",  color: "var(--brand-600)", icon: "PenLine"   },
      lmp:  { label: "Limpeza",     color: "var(--ok-500)",    icon: "SprayCan"  },
      hig:  { label: "Higiene",     color: "#1B9FB0",          icon: "Droplets"  },
      copa: { label: "Copa",        color: "#B5701A",          icon: "Coffee"    },
      desc: { label: "Descarte",    color: "#6B7A90",          icon: "Trash2"    },
      inf:  { label: "Informática", color: "#6E5BE0",          icon: "Printer"   },
      fer:  { label: "Ferramentas", color: "#5C6F8A",          icon: "Wrench"    }
    },
    unidades: ["un", "cx", "pct", "rm", "rl", "tubo", "par", "kg", "L", "fd"],
    locais: [
      { id: "A", code: "A", desc: "Corredor A — Expediente" },
      { id: "B", code: "B", desc: "Corredor B — Limpeza" },
      { id: "C", code: "C", desc: "Corredor C — Higiene" },
      { id: "D", code: "D", desc: "Corredor D — Copa" },
      { id: "E", code: "E", desc: "Corredor E — Descarte" },
      { id: "F", code: "F", desc: "Corredor F — Informática" },
      { id: "G", code: "G", desc: "Corredor G — Ferramentas" },
      { id: "H", code: "H", desc: "Corredor H — EPI" }
    ],
    responsaveis: [
      { name: "2S Geraldo",   color: "var(--brand-600)" },
      { name: "2S Friedrich", color: "#6E5BE0"          },
      { name: "Cb Zimmerman", color: "var(--warn-500)"  }
    ],
    setores: ["APP", "TWR", "AIS/CMM", "SMST", "SMSO", "SEC", "CASCÃO", "EMS"]
  }
};

function carregar() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(DADOS_INICIAIS, null, 2), "utf8");
    console.log("Banco de dados criado com dados iniciais.");
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function salvar(dados) {
  fs.writeFileSync(DB_PATH, JSON.stringify(dados, null, 2), "utf8");
}

module.exports = { carregar, salvar };
