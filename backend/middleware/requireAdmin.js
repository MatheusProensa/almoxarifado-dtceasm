module.exports = function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ erro: "Ação restrita ao administrador." });
  }
  next();
};
