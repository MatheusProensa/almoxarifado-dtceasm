const express = require("express");
const router = express.Router();
const { getDb, proximoId } = require("../database");
const requireAdmin = require("../middleware/requireAdmin");

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

function validarQtd(val, campo) {
  const n = Number(val);
  if (val === undefined || val === null || val === "") return { n: 0, erro: null };
  if (isNaN(n) || n < 0 || n > 9_999_999) return { erro: `${campo} deve ser um número entre 0 e 9.999.999.` };
  return { n, erro: null };
}

function validarSku(sku) {
  return typeof sku === "string" && sku.trim().length > 0 && sku.length <= 50;
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

  if (!name || typeof name !== "string" || name.trim().length === 0) return res.status(400).json({ erro: "Nome é obrigatório." });
  if (name.length > 200) return res.status(400).json({ erro: "Nome muito longo (máx. 200 caracteres)." });
  if (!cat || typeof cat !== "string") return res.status(400).json({ erro: "Categoria é obrigatória." });
  if (!unit || typeof unit !== "string") return res.status(400).json({ erro: "Unidade é obrigatória." });

  const qtyV = validarQtd(qty, "Quantidade");
  if (qtyV.erro) return res.status(400).json({ erro: qtyV.erro });
  const minV = validarQtd(min, "Estoque mínimo");
  if (minV.erro) return res.status(400).json({ erro: minV.erro });

  const id = proximoId();
  const sku = "NEW-" + Date.now().toString(36).toUpperCase();

  db.prepare(`
    INSERT INTO materiais (id, sku, name, cat, loc, qty, unit, min, obs)
    VALUES (@id, @sku, @name, @cat, @loc, @qty, @unit, @min, @obs)
  `).run({
    id, sku,
    name: name.trim(),
    cat: cat.trim(),
    loc: typeof loc === "string" ? loc.trim().slice(0, 50) : "—",
    qty: qtyV.n,
    unit: String(unit).slice(0, 20),
    min: minV.n,
    obs: obs ? String(obs).slice(0, 500) : "",
  });

  if (qtyV.n > 0) {
    db.prepare(`
      INSERT INTO movimentacoes (id, tipo, sku, item, qty, unit, antes, depois, resp, doc, dest, at)
      VALUES (@id, @tipo, @sku, @item, @qty, @unit, @antes, @depois, @resp, @doc, @dest, @at)
    `).run({
      id: proximoId(),
      tipo: "in", sku, item: name.trim(),
      qty: qtyV.n, unit: String(unit).slice(0, 20),
      antes: 0, depois: qtyV.n,
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
  const sku = req.params.sku;
  if (!validarSku(sku)) return res.status(400).json({ erro: "SKU inválido." });

  const db = getDb();
  const original = db.prepare("SELECT * FROM materiais WHERE sku = ?").get(sku);
  if (!original) return res.status(404).json({ erro: "Material não encontrado." });

  const { resp, ...campos } = req.body;

  if (campos.name !== undefined) {
    if (typeof campos.name !== "string" || campos.name.trim().length === 0) return res.status(400).json({ erro: "Nome inválido." });
    if (campos.name.length > 200) return res.status(400).json({ erro: "Nome muito longo (máx. 200 caracteres)." });
  }

  let novaQty = original.qty;
  if (campos.qty !== undefined) {
    const v = validarQtd(campos.qty, "Quantidade");
    if (v.erro) return res.status(400).json({ erro: v.erro });
    novaQty = v.n;
  }

  let novoMin = original.min;
  if (campos.min !== undefined) {
    const v = validarQtd(campos.min, "Estoque mínimo");
    if (v.erro) return res.status(400).json({ erro: v.erro });
    novoMin = v.n;
  }

  const novo = {
    name: campos.name  !== undefined ? campos.name.trim() : original.name,
    cat:  campos.cat   !== undefined ? String(campos.cat).trim() : original.cat,
    loc:  campos.loc   !== undefined ? String(campos.loc).slice(0, 50) : original.loc,
    qty:  novaQty,
    unit: campos.unit  !== undefined ? String(campos.unit).slice(0, 20) : original.unit,
    min:  novoMin,
    obs:  campos.obs   !== undefined ? String(campos.obs).slice(0, 500) : original.obs,
  };

  db.prepare(`
    UPDATE materiais SET name=@name, cat=@cat, loc=@loc, qty=@qty, unit=@unit, min=@min, obs=@obs
    WHERE sku = @sku
  `).run({ ...novo, sku });

  if (novo.qty !== original.qty) {
    db.prepare(`
      INSERT INTO movimentacoes (id, tipo, sku, item, qty, unit, antes, depois, resp, doc, dest, at)
      VALUES (@id, @tipo, @sku, @item, @qty, @unit, @antes, @depois, @resp, @doc, @dest, @at)
    `).run({
      id: proximoId(),
      tipo: "adj", sku, item: novo.name,
      qty: novo.qty - original.qty, unit: novo.unit,
      antes: original.qty, depois: novo.qty,
      resp: resp || (req.user ? req.user.name : "Sistema"),
      doc: "Ajuste de estoque",
      dest: "",
      at: dataHoraAgora()
    });
  }

  const atualizado = db.prepare("SELECT * FROM materiais WHERE sku = ?").get(sku);
  res.json({ ...atualizado, status: statusOf(atualizado.qty, atualizado.min) });
});

// DELETE /api/materiais/:sku  — restrito ao admin
router.delete("/:sku", requireAdmin, (req, res) => {
  const sku = req.params.sku;
  if (!validarSku(sku)) return res.status(400).json({ erro: "SKU inválido." });

  const db = getDb();
  const result = db.prepare("DELETE FROM materiais WHERE sku = ?").run(sku);
  if (result.changes === 0) return res.status(404).json({ erro: "Material não encontrado." });
  res.json({ ok: true });
});

module.exports = router;
