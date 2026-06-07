const jwt = require("jsonwebtoken");
const { getJwtSecret } = require("../database");

module.exports = function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ erro: "Não autenticado" });
  }
  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, getJwtSecret());
    next();
  } catch {
    return res.status(401).json({ erro: "Token inválido ou expirado. Faça login novamente." });
  }
};
