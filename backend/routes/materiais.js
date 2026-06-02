const express = require("express");
const router = express.Router();
const { carregar, salvar } = require("../database");

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
  const dados = carregar();
  const materiais = dados.materiais.map(m => ({ ...m, status: statusOf(m.qty, m.min) }));
  res.json(materiais);
});

// POST /api/materiais — cadastrar novo
router.post("/", (req, res) => {
  const dados = carregar();
  const { name, cat, loc, qty, unit, min, obs } = req.body;
  if (!name || !cat || !unit) return res.status(400).json({ erro: "name, cat e unit são obrigatórios" });

  const sku = "NEW-" + Date.now().toString(36).toUpperCase();
  const novo = {
    id: dados.proximoId++,
    sku,
    name,
    cat,
    loc: loc || "—",
    qty: Number(qty) || 0,
    unit,
    min: Number(min) || 0,
    obs: obs || ""
  };
  dados.materiais.unshift(novo);

  // Registra entrada inicial se qty > 0
  if (novo.qty > 0) {
    dados.movimentacoes.unshift({
      id: dados.proximoId++,
      tipo: "in",
      sku: novo.sku,
      item: novo.name,
      qty: novo.qty,
      unit: novo.unit,
      antes: 0,
      depois: novo.qty,
      resp: "2S Geraldo",
      doc: "Cadastro inicial",
      dest: "",
      at: dataHoraAgora()
    });
  }

  salvar(dados);
  res.status(201).json({ ...novo, status: statusOf(novo.qty, novo.min) });
});

// PUT /api/materiais/:sku — editar material
router.put("/:sku", (req, res) => {
  const dados = carregar();
  const idx = dados.materiais.findIndex(m => m.sku === req.params.sku);
  if (idx === -1) return res.status(404).json({ erro: "Material não encontrado" });

  const original = dados.materiais[idx];
  const atualizado = { ...original, ...req.body, sku: req.params.sku };
  atualizado.qty = Number(atualizado.qty);
  atualizado.min = Number(atualizado.min);
  dados.materiais[idx] = atualizado;

  // Se qty mudou, registra ajuste no histórico
  if (atualizado.qty !== original.qty) {
    const diff = atualizado.qty - original.qty;
    dados.movimentacoes.unshift({
      id: dados.proximoId++,
      tipo: "adj",
      sku: req.params.sku,
      item: atualizado.name,
      qty: diff,
      unit: atualizado.unit,
      antes: original.qty,
      depois: atualizado.qty,
      resp: req.body.resp || "Sistema",
      doc: "Ajuste de estoque",
      dest: "",
      at: dataHoraAgora()
    });
  }

  // Remove campo resp do material salvo (não é atributo do material)
  delete atualizado.resp;

  salvar(dados);
  res.json({ ...atualizado, status: statusOf(atualizado.qty, atualizado.min) });
});

// DELETE /api/materiais/:sku
router.delete("/:sku", (req, res) => {
  const dados = carregar();
  const antes = dados.materiais.length;
  dados.materiais = dados.materiais.filter(m => m.sku !== req.params.sku);
  if (dados.materiais.length === antes) return res.status(404).json({ erro: "Material não encontrado" });
  salvar(dados);
  res.json({ ok: true });
});

module.exports = router;
