const express = require("express");
const router = express.Router();
const { carregar, salvar } = require("../database");

// GET /api/config — retorna toda a configuração
router.get("/", (req, res) => {
  const dados = carregar();
  res.json(dados.config);
});

// PUT /api/config — salva toda a configuração
router.put("/", (req, res) => {
  const dados = carregar();
  dados.config = { ...dados.config, ...req.body };
  salvar(dados);
  res.json(dados.config);
});

// PUT /api/config/perfil — atualiza só o perfil
router.put("/perfil", (req, res) => {
  const dados = carregar();
  dados.config.perfil = { ...dados.config.perfil, ...req.body };
  salvar(dados);
  res.json(dados.config.perfil);
});

module.exports = router;
