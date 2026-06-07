const express = require("express");
const cors = require("cors");

const materiaisRouter    = require("./routes/materiais");
const movimentacoesRouter = require("./routes/movimentacoes");
const configRouter       = require("./routes/config");
const authRouter         = require("./routes/auth");
const auth               = require("./middleware/auth");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Rotas públicas
app.use("/api/auth", authRouter);
app.get("/api/status", (req, res) => res.json({ ok: true, mensagem: "Servidor almox-proensa rodando!" }));

// Rotas protegidas (exigem token JWT)
app.use("/api/materiais",    auth, materiaisRouter);
app.use("/api/movimentacoes", auth, movimentacoesRouter);
app.use("/api/config",       auth, configRouter);

app.listen(PORT, () => {
  console.log("===========================================");
  console.log("  Servidor almox-proensa iniciado!");
  console.log(`  API disponivel em: http://localhost:${PORT}/api`);
  console.log("===========================================");
});
