const express = require("express");
const path    = require("path");
const fs      = require("fs");
const router  = express.Router();
const auth    = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");

router.get("/download", auth, requireAdmin, (req, res) => {
  const dbPath = path.join(__dirname, "..", "almox.db");

  if (!fs.existsSync(dbPath)) {
    return res.status(404).json({ erro: "Banco de dados não encontrado." });
  }

  const agora = new Date();
  const ts = agora.getFullYear() + "-" +
    String(agora.getMonth() + 1).padStart(2, "0") + "-" +
    String(agora.getDate()).padStart(2, "0") + "_" +
    String(agora.getHours()).padStart(2, "0") + "-" +
    String(agora.getMinutes()).padStart(2, "0");

  res.download(dbPath, `almox-backup-${ts}.db`);
});

module.exports = router;
