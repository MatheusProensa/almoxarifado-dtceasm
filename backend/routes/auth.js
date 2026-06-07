const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDb } = require("../database");
const authMiddleware = require("../middleware/auth");

const JWT_SECRET = process.env.JWT_SECRET || "almox-dtcea-sm-secret-2026";
const JWT_EXPIRES = "8h";

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { username, senha } = req.body;
  if (!username || !senha) return res.status(400).json({ erro: "username e senha são obrigatórios" });

  const db = getDb();
  const user = db.prepare("SELECT * FROM users WHERE username = ? AND ativo = 1").get(username.toLowerCase().trim());
  if (!user) return res.status(401).json({ erro: "Usuário ou senha incorretos" });

  if (!bcrypt.compareSync(senha, user.password_hash)) {
    return res.status(401).json({ erro: "Usuário ou senha incorretos" });
  }

  const payload = { id: user.id, username: user.username, name: user.name, role: user.role };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

  res.json({ token, user: payload });
});

// POST /api/auth/trocar-senha  (requer login)
router.post("/trocar-senha", authMiddleware, (req, res) => {
  const { senhaAtual, novaSenha } = req.body;
  if (!senhaAtual || !novaSenha) return res.status(400).json({ erro: "senhaAtual e novaSenha são obrigatórios" });
  if (novaSenha.length < 6) return res.status(400).json({ erro: "A nova senha deve ter pelo menos 6 caracteres" });

  const db = getDb();
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  if (!bcrypt.compareSync(senhaAtual, user.password_hash)) {
    return res.status(401).json({ erro: "Senha atual incorreta" });
  }

  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(bcrypt.hashSync(novaSenha, 10), req.user.id);
  res.json({ ok: true });
});

module.exports = router;
