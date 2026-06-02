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

// GET /api/movimentacoes — listar todas
router.get("/", (req, res) => {
  const dados = carregar();
  res.json(dados.movimentacoes);
});

// POST /api/movimentacoes — registrar entrada ou saída
router.post("/", (req, res) => {
  const dados = carregar();
  const { tipo, sku, qty, resp, doc, dest, obs } = req.body;

  if (!tipo || !sku || !qty) return res.status(400).json({ erro: "tipo, sku e qty são obrigatórios" });

  const mat = dados.materiais.find(m => m.sku === sku);
  if (!mat) return res.status(404).json({ erro: "Material não encontrado" });

  const n = Math.abs(parseInt(qty, 10));
  const antes = mat.qty;
  const depois = tipo === "in" ? antes + n : Math.max(0, antes - n);

  mat.qty = depois;
  mat.status = statusOf(depois, mat.min);

  const mov = {
    id: dados.proximoId++,
    tipo,
    sku,
    item: mat.name,
    qty: n,
    unit: mat.unit,
    antes,
    depois,
    resp: resp || "2S Geraldo",
    doc: doc || "—",
    dest: dest || "",
    obs: obs || "",
    at: dataHoraAgora()
  };

  dados.movimentacoes.unshift(mov);
  salvar(dados);
  res.status(201).json({ movimentacao: mov, material: { ...mat, status: statusOf(mat.qty, mat.min) } });
});

// POST /api/movimentacoes/ajuste — ajuste de estoque
router.post("/ajuste", (req, res) => {
  const dados = carregar();
  const { sku, novoQty, motivo } = req.body;

  if (!sku || novoQty === undefined) return res.status(400).json({ erro: "sku e novoQty são obrigatórios" });

  const mat = dados.materiais.find(m => m.sku === sku);
  if (!mat) return res.status(404).json({ erro: "Material não encontrado" });

  const antes = mat.qty;
  const depois = Math.max(0, Number(novoQty));
  const diff = depois - antes;

  mat.qty = depois;

  if (diff !== 0) {
    const mov = {
      id: dados.proximoId++,
      tipo: "adj",
      sku,
      item: mat.name,
      qty: diff,
      unit: mat.unit,
      antes,
      depois,
      resp: "2S Geraldo",
      doc: motivo || "Ajuste manual",
      dest: "",
      at: dataHoraAgora()
    };
    dados.movimentacoes.unshift(mov);
  }

  salvar(dados);
  res.json({ material: { ...mat, status: statusOf(mat.qty, mat.min) } });
});

module.exports = router;
