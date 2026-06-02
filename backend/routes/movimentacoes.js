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

// GET /api/movimentacoes/stats — totais do mês atual (exclui anuladas e estornos)
router.get("/stats", (req, res) => {
  const dados = carregar();
  const agora = new Date();
  const mesAtual = agora.getMonth() + 1;
  const anoAtual = agora.getFullYear();

  let entradasMes = 0;
  let saidasMes = 0;

  dados.movimentacoes.forEach(m => {
    if (m.tipo === "adj" || m.tipo === "estorno") return;
    if (m.anulada) return; // exclui movimentações anuladas
    const partes = m.at.split(/[\/\s:]/);
    if (partes.length < 3) return;
    const mes = parseInt(partes[1], 10);
    const ano = parseInt(partes[2], 10);
    if (mes !== mesAtual || ano !== anoAtual) return;
    const qty = Math.abs(m.qty);
    if (m.tipo === "in")  entradasMes += qty;
    if (m.tipo === "out") saidasMes   += qty;
  });

  res.json({ entradasMes, saidasMes, mes: mesAtual, ano: anoAtual });
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
    tipo, sku,
    item: mat.name,
    qty: n, unit: mat.unit,
    antes, depois,
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
      tipo: "adj", sku,
      item: mat.name,
      qty: diff, unit: mat.unit,
      antes, depois,
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

// POST /api/movimentacoes/:id/anular — anula uma movimentação criando estorno
router.post("/:id/anular", (req, res) => {
  const dados = carregar();
  const id = parseInt(req.params.id, 10);
  const idx = dados.movimentacoes.findIndex(m => m.id === id);

  if (idx === -1) return res.status(404).json({ erro: "Movimentação não encontrada" });

  const mov = dados.movimentacoes[idx];

  if (mov.anulada)          return res.status(400).json({ erro: "Esta movimentação já foi anulada" });
  if (mov.tipo === "estorno") return res.status(400).json({ erro: "Não é possível anular um estorno" });

  const mat = dados.materiais.find(m => m.sku === mov.sku);
  const antesQty = mat ? mat.qty : 0;

  // Ajusta o estoque revertendo o efeito original
  if (mat) {
    if (mov.tipo === "in")  mat.qty = Math.max(0, mat.qty - Math.abs(mov.qty));
    if (mov.tipo === "out") mat.qty = mat.qty + Math.abs(mov.qty);
    if (mov.tipo === "adj") mat.qty = Math.max(0, mat.qty - mov.qty);
  }
  const depoisQty = mat ? mat.qty : 0;

  // Cria a movimentação de estorno
  const estorno = {
    id: dados.proximoId++,
    tipo: "estorno",
    sku: mov.sku,
    item: mov.item,
    qty: Math.abs(mov.qty),
    unit: mov.unit,
    antes: antesQty,
    depois: depoisQty,
    resp: req.body.resp || mov.resp,
    doc: `Estorno ref. #${mov.id}`,
    dest: "",
    at: dataHoraAgora(),
    refId: mov.id
  };

  // Marca a original como anulada
  dados.movimentacoes[idx].anulada = true;
  dados.movimentacoes.unshift(estorno);

  salvar(dados);
  res.json({
    estorno,
    movimentacaoOriginal: dados.movimentacoes.find(m => m.id === id),
    material: mat ? { ...mat, status: statusOf(mat.qty, mat.min) } : null
  });
});

module.exports = router;
