const express = require("express");
const router = express.Router();
const { getConfig, salvarConfig } = require("../database");
const requireAdmin = require("../middleware/requireAdmin");

// GET /api/config  — qualquer usuário autenticado
router.get("/", (req, res) => {
  res.json(getConfig());
});

// PUT /api/config  — restrito ao admin
router.put("/", requireAdmin, (req, res) => {
  const config = { ...getConfig(), ...req.body };
  salvarConfig(config);
  res.json(config);
});

// PUT /api/config/perfil  — qualquer usuário autenticado (cada um edita o próprio perfil)
router.put("/perfil", (req, res) => {
  const config = getConfig();
  config.perfil = { ...config.perfil, ...req.body };
  salvarConfig(config);
  res.json(config.perfil);
});

module.exports = router;
