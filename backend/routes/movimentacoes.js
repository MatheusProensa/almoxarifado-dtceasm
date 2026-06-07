const express = require("express");
const router = express.Router();
const { getDb, proximoId } = require("../database");

function statusOf(qty, min) {
  if (qty === 0) return "zero";
  if (qty <= min * 0.4) return "crit";
  if (qty < min) return "baixa";
  return "ok";
}

function dataHoraAgora() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

function formatarMov(m) {
  return { ...m, anulada: m.anulada === 1, refId: m.ref_id || undefined };
}

// GET /api/movimentacoes
router.get("/", (req, res) => {
  const db = getDb();
  const movs = db.prepare("SELECT * FROM movimentacoes ORDER BY id DESC").all();
  res.json(movs.map(formatarMov));
});

// GET /api/movimentacoes/stats
router.get("/stats", (req, res) => {
  const db = getDb();
  const agora = new Date();
  const mesAtual = agora.getMonth() + 1;
  const anoAtual = agora.getFullYear();

  let entradasMes = 0;
  let saidasMes = 0;

  const movs = db.prepare("SELECT tipo, qty, at FROM movimentacoes WHERE tipo IN ('in','out') AND anulada = 0").all();
  movs.forEach(m => {
    const partes = m.at.split(/[\/\s:]/);
    if (partes.length < 3) return;
    const mes = parseInt(partes[1], 10);
    const ano = parseInt(partes[2], 10);
    if (mes !== mesAtual || ano !== anoAtual) return;
    if (m.tipo === "in")  entradasMes += Math.abs(m.qty);
    if (m.tipo === "out") saidasMes   += Math.abs(m.qty);
  });

  res.json({ entradasMes, saidasMes, mes: mesAtual, ano: anoAtual });
});

// POST /api/movimentacoes
router.post("/", (req, res) => {
  const db = getDb();
  const { tipo, sku, qty, resp, doc, dest, obs } = req.body;

  if (!tipo || !["in", "out"].includes(tipo)) return res.status(400).json({ erro: "Tipo deve ser 'in' ou 'out'." });
  if (!sku || typeof sku !== "string" || sku.trim().length === 0) return res.status(400).json({ erro: "SKU é obrigatório." });

  const n = parseInt(qty, 10);
  if (!qty || isNaN(n) || n <= 0 || n > 9_999_999) return res.status(400).json({ erro: "Quantidade deve ser um número inteiro positivo." });

  const mat = db.prepare("SELECT * FROM materiais WHERE sku = ?").get(sku.trim());
  if (!mat) return res.status(404).json({ erro: "Material não encontrado." });

  const antes = mat.qty;
  const depois = tipo === "in" ? antes + n : Math.max(0, antes - n);

  db.prepare("UPDATE materiais SET qty = ? WHERE sku = ?").run(depois, sku);

  const id = proximoId();
  db.prepare(`
    INSERT INTO movimentacoes (id, tipo, sku, item, qty, unit, antes, depois, resp, doc, dest, obs, at)
    VALUES (@id, @tipo, @sku, @item, @qty, @unit, @antes, @depois, @resp, @doc, @dest, @obs, @at)
  `).run({
    id, tipo, sku: sku.trim(),
    item: mat.name,
    qty: n, unit: mat.unit,
    antes, depois,
    resp: resp ? String(resp).slice(0, 80) : (req.user ? req.user.name : "Sistema"),
    doc:  doc  ? String(doc).slice(0, 80)  : "—",
    dest: dest ? String(dest).slice(0, 60) : "",
    obs:  obs  ? String(obs).slice(0, 300) : "",
    at: dataHoraAgora()
  });

  const mov = db.prepare("SELECT * FROM movimentacoes WHERE id = ?").get(id);
  const matAtualizado = db.prepare("SELECT * FROM materiais WHERE sku = ?").get(sku);
  res.status(201).json({
    movimentacao: formatarMov(mov),
    material: { ...matAtualizado, status: statusOf(matAtualizado.qty, matAtualizado.min) }
  });
});

// POST /api/movimentacoes/ajuste
router.post("/ajuste", (req, res) => {
  const db = getDb();
  const { sku, novoQty, motivo } = req.body;

  if (!sku || typeof sku !== "string") return res.status(400).json({ erro: "SKU é obrigatório." });
  if (novoQty === undefined || novoQty === null) return res.status(400).json({ erro: "novoQty é obrigatório." });

  const novo = Number(novoQty);
  if (isNaN(novo) || novo < 0 || novo > 9_999_999) return res.status(400).json({ erro: "Quantidade inválida." });

  const mat = db.prepare("SELECT * FROM materiais WHERE sku = ?").get(sku.trim());
  if (!mat) return res.status(404).json({ erro: "Material não encontrado." });

  const antes = mat.qty;
  const depois = novo;
  const diff = depois - antes;

  db.prepare("UPDATE materiais SET qty = ? WHERE sku = ?").run(depois, sku);

  if (diff !== 0) {
    const id = proximoId();
    db.prepare(`
      INSERT INTO movimentacoes (id, tipo, sku, item, qty, unit, antes, depois, resp, doc, dest, at)
      VALUES (@id, @tipo, @sku, @item, @qty, @unit, @antes, @depois, @resp, @doc, @dest, @at)
    `).run({
      id, tipo: "adj", sku: sku.trim(),
      item: mat.name,
      qty: diff, unit: mat.unit,
      antes, depois,
      resp: req.user ? req.user.name : "Sistema",
      doc: motivo ? String(motivo).slice(0, 80) : "Ajuste manual",
      dest: "",
      at: dataHoraAgora()
    });
  }

  const matAtualizado = db.prepare("SELECT * FROM materiais WHERE sku = ?").get(sku);
  res.json({ material: { ...matAtualizado, status: statusOf(matAtualizado.qty, matAtualizado.min) } });
});

// POST /api/movimentacoes/:id/anular
router.post("/:id/anular", (req, res) => {
  const db = getDb();
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id <= 0) return res.status(400).json({ erro: "ID inválido." });

  const mov = db.prepare("SELECT * FROM movimentacoes WHERE id = ?").get(id);

  if (!mov)                    return res.status(404).json({ erro: "Movimentação não encontrada." });
  if (mov.anulada)             return res.status(400).json({ erro: "Esta movimentação já foi anulada." });
  if (mov.tipo === "estorno")  return res.status(400).json({ erro: "Não é possível anular um estorno." });

  const mat = db.prepare("SELECT * FROM materiais WHERE sku = ?").get(mov.sku);
  const antesQty = mat ? mat.qty : 0;
  let depoisQty = antesQty;

  if (mat) {
    if (mov.tipo === "in")  depoisQty = Math.max(0, mat.qty - Math.abs(mov.qty));
    if (mov.tipo === "out") depoisQty = mat.qty + Math.abs(mov.qty);
    if (mov.tipo === "adj") depoisQty = Math.max(0, mat.qty - mov.qty);
    db.prepare("UPDATE materiais SET qty = ? WHERE sku = ?").run(depoisQty, mov.sku);
  }

  const estornoId = proximoId();
  db.prepare(`
    INSERT INTO movimentacoes (id, tipo, sku, item, qty, unit, antes, depois, resp, doc, dest, at, ref_id)
    VALUES (@id, @tipo, @sku, @item, @qty, @unit, @antes, @depois, @resp, @doc, @dest, @at, @ref_id)
  `).run({
    id: estornoId,
    tipo: "estorno", sku: mov.sku, item: mov.item,
    qty: Math.abs(mov.qty), unit: mov.unit,
    antes: antesQty, depois: depoisQty,
    resp: req.user ? req.user.name : mov.resp,
    doc: `Estorno ref. #${mov.id}`,
    dest: "",
    at: dataHoraAgora(),
    ref_id: mov.id
  });

  db.prepare("UPDATE movimentacoes SET anulada = 1 WHERE id = ?").run(id);

  const estorno = db.prepare("SELECT * FROM movimentacoes WHERE id = ?").get(estornoId);
  const movOriginal = db.prepare("SELECT * FROM movimentacoes WHERE id = ?").get(id);
  const matAtualizado = mat ? db.prepare("SELECT * FROM materiais WHERE sku = ?").get(mov.sku) : null;

  res.json({
    estorno: formatarMov(estorno),
    movimentacaoOriginal: formatarMov(movOriginal),
    material: matAtualizado ? { ...matAtualizado, status: statusOf(matAtualizado.qty, matAtualizado.min) } : null
  });
});

module.exports = router;
