/* ============================================================================
   data.jsx — catálogo de almoxarifado ADMINISTRATIVO (DTCEA-SM / CINDACTA II)
   Nomenclaturas baseadas nos materiais reais solicitados ao suprimento.
   Materiais chegam pela GFM/GMM: nomenclatura + quantidade (sem código/SKU).
   ========================================================================== */

const CATEGORIAS = {
  exp:  { label: "Expediente",  color: "var(--brand-600)", icon: "PenLine" },
  lmp:  { label: "Limpeza",     color: "var(--ok-500)",    icon: "SprayCan" },
  hig:  { label: "Higiene",     color: "#1B9FB0",          icon: "Droplets" },
  copa: { label: "Copa",        color: "#B5701A",          icon: "Coffee" },
  desc: { label: "Descarte",    color: "#6B7A90",          icon: "Trash2" },
  inf:  { label: "Informática", color: "#6E5BE0",          icon: "Printer" },
  fer:  { label: "Ferramentas", color: "#5C6F8A",          icon: "Wrench" },
  epi:  { label: "EPI",         color: "#A8506B",          icon: "HardHat" },
};

const UNIDADES = ["un", "cx", "pct", "rm", "rl", "tubo", "par", "kg", "L", "fd"];
const SETORES = ["APP", "TWR", "AIS/CMM", "SMST", "SMSO", "SEC", "CASCÃO", "EMS"];

let _id = 1000;
const M = (sku, name, cat, loc, qty, unit, min) =>
  ({ id: ++_id, sku, name, cat, loc, qty, unit, min });

const MATERIAIS = [
  // Expediente
  M("EXP01", "Caneta esferográfica azul", "exp", "A-01-1", 10, "un", 8),
  M("EXP02", "Caneta esferográfica preta", "exp", "A-01-2", 5, "un", 8),
  M("EXP03", "Caneta esferográfica vermelha", "exp", "A-01-3", 5, "un", 6),
  M("EXP04", "Caneta marca-texto amarela", "exp", "A-01-4", 3, "un", 6),
  M("EXP05", "Lápis preto nº 2 HB", "exp", "A-02-1", 5, "un", 10),
  M("EXP06", "Borracha branca macia", "exp", "A-02-2", 5, "un", 6),
  M("EXP07", "Régua de alumínio 30 cm", "exp", "A-02-3", 3, "un", 4),
  M("EXP08", "Lapiseira 0,7 mm", "exp", "A-02-4", 2, "un", 4),
  M("EXP09", "Clips para papel 2/0 (cx 100)", "exp", "A-03-1", 2, "cx", 6),
  M("EXP10", "Grampeador médio 26/6", "exp", "A-03-2", 0, "un", 4),
  M("EXP11", "Grampo para grampeador 26/6 (cx 5000)", "exp", "A-03-3", 0, "cx", 5),
  M("EXP12", "Cola branca 90 g", "exp", "A-04-1", 5, "un", 6),
  M("EXP13", "Cola instantânea incolor", "exp", "A-04-2", 2, "un", 4),
  M("EXP14", "Fita adesiva transparente (rolo 33m x 12mm)", "exp", "A-04-3", 5, "rl", 8),
  M("EXP15", "Fita adesiva dupla face 19mm x 30m", "exp", "A-04-4", 1, "rl", 3),
  M("EXP16", "Bloco adesivo amarelo 76 x 102 mm", "exp", "A-05-1", 5, "un", 6),
  M("EXP17", "Papel sulfite A4 75g (resma)", "exp", "A-05-2", 10, "rm", 12),
  M("EXP18", "Envelope pardo 229 x 324 mm", "exp", "A-05-3", 1, "pct", 4),
  M("EXP19", "Caixa arquivo papelão 37 x 24,5 x 13,6 cm", "exp", "A-06-1", 5, "un", 8),
  M("EXP20", "Pasta plástica com elástico ofício", "exp", "A-06-2", 5, "un", 8),
  M("EXP21", "Pasta suspensa para arquivo", "exp", "A-06-3", 0, "un", 10),
  M("EXP22", "Livro ata 100 fls pautado", "exp", "A-07-1", 2, "un", 4),
  M("EXP23", "Livro protocolo de correspondência 100 fls", "exp", "A-07-2", 1, "un", 4),
  M("EXP24", "Marcador para quadro branco azul", "exp", "A-07-3", 5, "un", 6),
  M("EXP25", "Estilete grande com lâmina 18mm", "exp", "A-08-1", 5, "un", 6),
  M("EXP26", "Prancheta acrílico fumê ofício", "exp", "A-08-2", 4, "un", 4),
  // Limpeza
  M("LMP01", "Álcool etílico hidratado 70° (garrafa 1L)", "lmp", "B-01-1", 2, "un", 12),
  M("LMP02", "Álcool gel 70° glicerinado (galão 5L)", "lmp", "B-01-2", 0, "un", 6),
  M("LMP03", "Detergente lava-louças neutro 500 ml", "lmp", "B-02-1", 0, "un", 10),
  M("LMP04", "Desinfetante quaternário (frasco 1L)", "lmp", "B-02-2", 4, "un", 8),
  M("LMP05", "Sabão em pó (pct 1 kg)", "lmp", "B-02-3", 3, "pct", 6),
  M("LMP06", "Esponja dupla face 100 x 70 x 20 mm", "lmp", "B-03-1", 6, "un", 6),
  M("LMP07", "Pano de chão alvejado multiuso", "lmp", "B-03-2", 8, "un", 10),
  M("LMP08", "Flanela de algodão 30 x 40 cm", "lmp", "B-03-3", 7, "un", 5),
  M("LMP09", "Vassoura cerdas de nylon", "lmp", "B-04-1", 4, "un", 4),
  M("LMP10", "Rodo de alumínio 40 cm com cabo", "lmp", "B-04-2", 2, "un", 4),
  M("LMP11", "Borrifador plástico 500 ml", "lmp", "B-04-3", 4, "un", 3),
  M("LMP12", "Cera líquida incolor (emb 5L)", "lmp", "B-05-1", 2, "un", 4),
  M("LMP13", "Inseticida aerossol base água 300 ml", "lmp", "B-05-2", 7, "un", 3),
  // Higiene
  M("HIG01", "Papel higiênico folha dupla (rolo 30m)", "hig", "C-01-1", 0, "rl", 12),
  M("HIG02", "Papel toalha interfolhado (pct 1000 fls)", "hig", "C-01-2", 1, "pct", 8),
  M("HIG03", "Sabonete líquido (frasco 500 ml)", "hig", "C-02-1", 0, "un", 6),
  // Copa
  M("COP01", "Filtro de café descartável nº 103", "copa", "D-01-1", 5, "cx", 10),
  M("COP02", "Copo plástico descartável 180 ml", "copa", "D-01-2", 2, "pct", 6),
  M("COP03", "Copo plástico descartável 300 ml", "copa", "D-01-3", 10, "pct", 6),
  M("COP04", "Guardanapo de papel 20 x 22 cm (pct 50)", "copa", "D-02-1", 10, "pct", 8),
  M("COP05", "Garfo plástico descartável (pct 50)", "copa", "D-02-2", 10, "pct", 8),
  // Descarte
  M("DES01", "Saco coletor de lixo preto 15L (pct 100)", "desc", "E-01-1", 0, "pct", 8),
  M("DES02", "Saco coletor de lixo preto 40L (pct 100)", "desc", "E-01-2", 0, "pct", 10),
  M("DES03", "Saco coletor de lixo preto 100L (pct 100)", "desc", "E-01-3", 0, "pct", 8),
  M("DES04", "Saco coletor de lixo preto 200L (pct 100)", "desc", "E-01-4", 0, "pct", 6),
  M("DES05", "Cesto de lixo 20L com tampa e pedal", "desc", "E-02-1", 3, "un", 4),
  M("DES06", "Cesto de lixo 30L com tampa e pedal", "desc", "E-02-2", 3, "un", 4),
  // Informática
  M("INF01", "Cartucho toner HP 122A preto (Q3960A)", "inf", "F-01-1", 0, "un", 4),
  M("INF02", "Cartucho toner HP 122A ciano (Q3961A)", "inf", "F-01-2", 0, "un", 2),
  M("INF03", "Mouse óptico USB", "inf", "F-02-1", 0, "un", 4),
  M("INF04", "Organizador de cabos velcro (rolo 2x300cm)", "inf", "F-02-2", 10, "un", 6),
  // Ferramentas
  M("FER01", "Alicate universal", "fer", "G-01-1", 3, "un", 2),
  M("FER02", "Chave de fenda 1/8 x 3\" (3 x 80 mm)", "fer", "G-01-2", 2, "un", 3),
  M("FER03", "Estopa (kg)", "fer", "G-02-1", 9, "kg", 5),
  M("FER04", "Óleo lubrificante WD-40", "fer", "G-02-2", 2, "un", 3),
  // EPI
  M("EPI01", "Óculos de proteção incolor", "epi", "H-01-1", 0, "un", 10),
  M("EPI02", "Luva de látex tamanho M (par)", "epi", "H-01-2", 0, "par", 10),
  M("EPI03", "Luva de raspa de couro cano longo (par)", "epi", "H-01-3", 5, "par", 5),
  M("EPI04", "Máscara descartável TNT branca", "epi", "H-02-1", 0, "un", 20),
].map(m => ({ ...m, status: window.statusOf(m.qty, m.min) }));

const RESPONSAVEIS = [
  { name: "2S Geraldo",    color: "var(--brand-600)" },
  { name: "2S Friedrich",  color: "#6E5BE0" },
  { name: "Cb Zimmerman",  color: "var(--warn-500)" },
];

// movimentações — tipo: in | out | adj · com saldo anterior/final
const MOVIMENTACOES = [
  { id: 1, tipo: "out", sku: "EXP17", item: "Papel sulfite A4 75g (resma)", qty: 12, unit: "rm", antes: 22, depois: 10, resp: "2S Geraldo",  doc: "RM-2026-0481", dest: "APP", at: "31/05/2026 14:38" },
  { id: 2, tipo: "in",  sku: "LMP01", item: "Álcool etílico hidratado 70° (garrafa 1L)", qty: 10, unit: "un", antes: 2, depois: 12, resp: "2S Geraldo", doc: "GFM nº 2210", dest: "", at: "31/05/2026 11:02" },
  { id: 3, tipo: "adj", sku: "EXP09", item: "Clips para papel 2/0 (cx 100)", qty: 1, unit: "cx", antes: 1, depois: 2, resp: "2S Friedrich", doc: "Inventário", dest: "", at: "31/05/2026 09:20" },
  { id: 4, tipo: "out", sku: "LMP02", item: "Álcool gel 70° glicerinado (galão 5L)", qty: 6, unit: "un", antes: 6, depois: 0, resp: "Cb Zimmerman", doc: "RM-2026-0479", dest: "SMSO", at: "30/05/2026 16:44" },
  { id: 5, tipo: "in",  sku: "COP04", item: "Guardanapo de papel 20 x 22 cm (pct 50)", qty: 6, unit: "pct", antes: 4, depois: 10, resp: "2S Friedrich", doc: "GFM nº 2204", dest: "", at: "30/05/2026 13:20" },
  { id: 6, tipo: "out", sku: "DES03", item: "Saco coletor de lixo preto 100L (pct 100)", qty: 5, unit: "pct", antes: 5, depois: 0, resp: "Cb Zimmerman", doc: "RM-2026-0478", dest: "SMST", at: "30/05/2026 10:05" },
  { id: 7, tipo: "in",  sku: "HIG02", item: "Papel toalha interfolhado (pct 1000 fls)", qty: 1, unit: "pct", antes: 0, depois: 1, resp: "2S Geraldo", doc: "GFM nº 2198", dest: "", at: "27/05/2026 15:51" },
  { id: 8, tipo: "out", sku: "COP01", item: "Filtro de café descartável nº 103", qty: 3, unit: "cx", antes: 8, depois: 5, resp: "Cb Zimmerman", doc: "RM-2026-0475", dest: "TWR", at: "27/05/2026 08:32" },
  { id: 9, tipo: "adj", sku: "FER03", item: "Estopa (kg)", qty: 2, unit: "kg", antes: 7, depois: 9, resp: "Cb Zimmerman", doc: "Correção", dest: "", at: "26/05/2026 17:10" },
  { id: 10, tipo: "in", sku: "EXP18", item: "Envelope pardo 229 x 324 mm", qty: 1, unit: "pct", antes: 0, depois: 1, resp: "2S Friedrich", doc: "GFM nº 2185", dest: "", at: "26/05/2026 09:48" },
];

// série mensal entradas x saídas (un. movimentadas)
const SERIE = [
  { m: "Dez", in: 320, out: 240 },
  { m: "Jan", in: 410, out: 360 },
  { m: "Fev", in: 280, out: 300 },
  { m: "Mar", in: 520, out: 430 },
  { m: "Abr", in: 380, out: 470 },
  { m: "Mai", in: 560, out: 510 },
];

// estoque por categoria (somatório de saldos) — calculado do catálogo
const POR_CATEGORIA = Object.keys(CATEGORIAS)
  .map(cat => ({ cat, value: MATERIAIS.filter(m => m.cat === cat).reduce((s, m) => s + m.qty, 0) }))
  .filter(x => x.value > 0)
  .sort((a, b) => b.value - a.value);
const TOTAL_ESTOQUE = MATERIAIS.reduce((s, m) => s + m.qty, 0);

// KPIs do topo
const METRICS = [
  { key: "estoque", label: "Materiais cadastrados",   value: TOTAL_ESTOQUE, icon: "Boxes",          accent: "var(--brand-600)", sub: "Itens no catálogo",        link: { label: "Ver materiais", view: "materiais" } },
  { key: "entrada", label: "Entradas (mês)",  value: 560,  icon: "ArrowDownToLine", accent: "var(--ok-500)",    sub: "+12,5% vs. mês anterior", trend: "up", link: { label: "Ver entradas", view: "movimentacao", filter: "in" } },
  { key: "saida",   label: "Saídas (mês)",    value: 510,  icon: "ArrowUpFromLine", accent: "#F59E0B",          sub: "+5,1% vs. mês anterior",  trend: "up", link: { label: "Ver saídas", view: "movimentacao", filter: "out" } },
  { key: "critico", label: "Itens críticos",  value: 7,    icon: "TriangleAlert",   accent: "var(--danger-500)",sub: "Precisam de atenção",        link: { label: "Ver itens", view: "alertas" } },
];

// materiais mais retirados (saídas no mês)
const MAIS_USADOS = [
  { name: "Papel sulfite A4 75g", value: 58 },
  { name: "Caneta esferográfica azul", value: 44 },
  { name: "Saco coletor de lixo 100L", value: 37 },
  { name: "Álcool gel 70°", value: 33 },
  { name: "Copo plástico 180 ml", value: 29 },
];

// categorias com maior movimentação (entradas + saídas no mês)
const MOV_CATEGORIA = [
  { name: "Expediente", value: 286 },
  { name: "Limpeza", value: 198 },
  { name: "Descarte", value: 164 },
  { name: "Higiene", value: 96 },
  { name: "Copa", value: 88 },
];

function alertasFrom(materiais) {
  const order = { zero: 0, crit: 1, baixa: 2 };
  return materiais
    .filter(m => m.status !== "ok")
    .sort((a, b) => order[a.status] - order[b.status] || (a.qty / a.min) - (b.qty / b.min));
}

// menor estoque (cobertura = qty/min) — produtos mais próximos de acabar
function menorEstoque(materiais, n = 6) {
  return [...materiais].filter(m => m.min > 0).sort((a, b) => (a.qty / a.min) - (b.qty / b.min)).slice(0, n);
}

const UNID_LABELS = { un: "unidade", cx: "caixa", pct: "pacote", rm: "resma", rl: "rolo", tubo: "tubo", par: "par", kg: "quilograma", L: "litro", fd: "fardo" };
const PROFILE = { name: "Suprimento", role: "Administrador", unit: "DTCEA-SM" };

Object.assign(window, {
  CATEGORIAS, UNIDADES, UNID_LABELS, PROFILE, SETORES, MATERIAIS, RESPONSAVEIS, MOVIMENTACOES, SERIE, METRICS,
  POR_CATEGORIA, TOTAL_ESTOQUE, MAIS_USADOS, MOV_CATEGORIA, alertasFrom, menorEstoque,
});
