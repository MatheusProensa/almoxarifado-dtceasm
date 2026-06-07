const express = require("express");
const router = express.Router();
const { getConfig, salvarConfig } = require("../database");

// GET /api/config
router.get("/", (req, res) => {
  res.json(getConfig());
});

// PUT /api/config
router.put("/", (req, res) => {
  const config = { ...getConfig(), ...req.body };
  salvarConfig(config);
  res.json(config);
});

// PUT /api/config/perfil
router.put("/perfil", (req, res) => {
  const config = getConfig();
  config.perfil = { ...config.perfil, ...req.body };
  salvarConfig(config);
  res.json(config.perfil);
});

module.exports = router;
