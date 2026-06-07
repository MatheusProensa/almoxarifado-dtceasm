const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "almox-dtcea-sm-secret-2026";

module.exports = function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ erro: "Não autenticado" });
  }
  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ erro: "Token inválido ou expirado. Faça login novamente." });
  }
};
