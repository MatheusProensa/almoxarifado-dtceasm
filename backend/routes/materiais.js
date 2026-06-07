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

// GET /api/materiais
router.get("/", (req, res) => {
  const db = getDb();
  const materiais = db.prepare("SELECT * FROM materiais ORDER BY name ASC").all();
  res.json(materiais.map(m => ({ ...m, status: statusOf(m.qty, m.min) })));
});

// POST /api/materiais
router.post("/", (req, res) => {
  const db = getDb();
  const { name, cat, loc, qty, unit, min, obs } = req.body;
  if (!name || !cat || !unit) return res.status(400).json({ erro: "name, cat e unit são obrigatórios" });

  const id = proximoId();
  const sku = "NEW-" + Date.now().toString(36).toUpperCase();
  const qtyNum = Number(qty) || 0;
  const minNum = Number(min) || 0;

  db.prepare(`
    INSERT INTO materiais (id, sku, name, cat, loc, qty, unit, min, obs)
    VALUES (@id, @sku, @name, @cat, @loc, @qty, @unit, @min, @obs)
  `).run({ id, sku, name, cat, loc: loc || "—", qty: qtyNum, unit, min: minNum, obs: obs || "" });

  if (qtyNum > 0) {
    db.prepare(`
      INSERT INTO movimentacoes (id, tipo, sku, item, qty, unit, antes, depois, resp, doc, dest, at)
      VALUES (@id, @tipo, @sku, @item, @qty, @unit, @antes, @depois, @resp, @doc, @dest, @at)
    `).run({
      id: proximoId(),
      tipo: "in", sku, item: name,
      qty: qtyNum, unit,
      antes: 0, depois: qtyNum,
      resp: req.user ? req.user.name : "Sistema",
      doc: "Cadastro inicial",
      dest: "",
      at: dataHoraAgora()
    });
  }

  const novo = db.prepare("SELECT * FROM materiais WHERE sku = ?").get(sku);
  res.status(201).json({ ...novo, status: statusOf(novo.qty, novo.min) });
});

// PUT /api/materiais/:sku
router.put("/:sku", (req, res) => {
  const db = getDb();
  const original = db.prepare("SELECT * FROM materiais WHERE sku = ?").get(req.params.sku);
  if (!original) return res.status(404).json({ erro: "Material não encontrado" });

  const { resp, ...campos } = req.body;
  const novo = {
    name: campos.name  ?? original.name,
    cat:  campos.cat   ?? original.cat,
    loc:  campos.loc   ?? original.loc,
    qty:  campos.qty   !== undefined ? Number(campos.qty) : original.qty,
    unit: campos.unit  ?? original.unit,
    min:  campos.min   !== undefined ? Number(campos.min) : original.min,
    obs:  campos.obs   ?? original.obs,
  };

  db.prepare(`
    UPDATE materiais SET name=@name, cat=@cat, loc=@loc, qty=@qty, unit=@unit, min=@min, obs=@obs
    WHERE sku = @sku
  `).run({ ...novo, sku: req.params.sku });

  if (novo.qty !== original.qty) {
    const diff = novo.qty - original.qty;
    db.prepare(`
      INSERT INTO movimentacoes (id, tipo, sku, item, qty, unit, antes, depois, resp, doc, dest, at)
      VALUES (@id, @tipo, @sku, @item, @qty, @unit, @antes, @depois, @resp, @doc, @dest, @at)
    `).run({
      id: proximoId(),
      tipo: "adj", sku: req.params.sku, item: novo.name,
      qty: diff, unit: novo.unit,
      antes: original.qty, depois: novo.qty,
      resp: resp || (req.user ? req.user.name : "Sistema"),
      doc: "Ajuste de estoque",
      dest: "",
      at: dataHoraAgora()
    });
  }

  const atualizado = db.prepare("SELECT * FROM materiais WHERE sku = ?").get(req.params.sku);
  res.json({ ...atualizado, status: statusOf(atualizado.qty, atualizado.min) });
});

// DELETE /api/materiais/:sku
router.delete("/:sku", (req, res) => {
  const db = getDb();
  const result = db.prepare("DELETE FROM materiais WHERE sku = ?").run(req.params.sku);
  if (result.changes === 0) return res.status(404).json({ erro: "Material não encontrado" });
  res.json({ ok: true });
});

module.exports = router;
