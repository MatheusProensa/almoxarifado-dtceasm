const express = require("express");
const helmet  = require("helmet");
const path    = require("path");
const os      = require("os");

const materiaisRouter     = require("./routes/materiais");
const movimentacoesRouter = require("./routes/movimentacoes");
const configRouter        = require("./routes/config");
const authRouter          = require("./routes/auth");
const backupRouter        = require("./routes/backup");
const auth                = require("./middleware/auth");

const app  = express();
const PORT = process.env.PORT || 3001;

// Pasta do frontend compilado (dist/)
const DIST = path.join(__dirname, "..", "dist");

// Segurança: cabeçalhos HTTP
app.use(helmet({ contentSecurityPolicy: false }));

// Corpo das requisições
app.use(express.json({ limit: "64kb" }));
app.use(express.urlencoded({ limit: "64kb", extended: false }));

// Arquivos estáticos do frontend (gerados pelo npm run build)
app.use(express.static(DIST));

// Rotas públicas da API
app.use("/api/auth", authRouter);
app.get("/api/status", (req, res) => res.json({ ok: true }));

// Rotas protegidas da API
app.use("/api/materiais",     auth, materiaisRouter);
app.use("/api/movimentacoes", auth, movimentacoesRouter);
app.use("/api/config",        auth, configRouter);
app.use("/api/backup",        auth, backupRouter);

// Handler de erros — não expõe detalhes ao cliente
app.use((err, req, res, _next) => {
  console.error("[ERRO]", err.message);
  res.status(500).json({ erro: "Erro interno do servidor." });
});

// Qualquer outra rota devolve o index.html (SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(DIST, "index.html"));
});

// Escuta em todas as interfaces da rede (permite acesso de outros PCs)
app.listen(PORT, "0.0.0.0", () => {
  // Descobre o IP local para mostrar no console
  const redes = Object.values(os.networkInterfaces())
    .flat()
    .filter(n => n.family === "IPv4" && !n.internal)
    .map(n => n.address);

  console.log("===========================================");
  console.log("  Almox Proensa — rodando!");
  console.log(`  Neste PC:      http://localhost:${PORT}`);
  if (redes.length > 0) {
    console.log(`  Rede local:    http://${redes[0]}:${PORT}`);
  }
  console.log("===========================================");
});
