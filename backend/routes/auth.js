const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const { getDb, getJwtSecret } = require("../database");
const authMiddleware = require("../middleware/auth");

const JWT_EXPIRES = "8h";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: "Muitas tentativas de login. Aguarde 15 minutos." },
  skipSuccessfulRequests: true,
});

// POST /api/auth/login
router.post("/login", loginLimiter, (req, res) => {
  const { username, senha } = req.body;
  if (!username || !senha) return res.status(400).json({ erro: "Usuário e senha são obrigatórios." });

  const db = getDb();
  const user = db.prepare("SELECT * FROM users WHERE username = ? AND ativo = 1").get(
    String(username).toLowerCase().trim().slice(0, 60)
  );

  // Resposta genérica — não revela se o usuário existe
  if (!user || !bcrypt.compareSync(String(senha).slice(0, 128), user.password_hash)) {
    return res.status(401).json({ erro: "Usuário ou senha incorretos." });
  }

  const payload = { id: user.id, username: user.username, name: user.name, role: user.role };
  const token = jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES });

  res.json({ token, user: payload });
});

// POST /api/auth/trocar-senha  (requer login)
router.post("/trocar-senha", authMiddleware, (req, res) => {
  const { senhaAtual, novaSenha } = req.body;
  if (!senhaAtual || !novaSenha) return res.status(400).json({ erro: "senhaAtual e novaSenha são obrigatórios." });
  if (String(novaSenha).length < 6) return res.status(400).json({ erro: "A nova senha deve ter pelo menos 6 caracteres." });
  if (String(novaSenha).length > 128) return res.status(400).json({ erro: "Senha muito longa." });

  const db = getDb();
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  if (!bcrypt.compareSync(String(senhaAtual).slice(0, 128), user.password_hash)) {
    return res.status(401).json({ erro: "Senha atual incorreta." });
  }

  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(bcrypt.hashSync(novaSenha, 10), req.user.id);
  res.json({ ok: true });
});

module.exports = router;
