const express = require("express");
const cors = require("cors");

const materiaisRouter = require("./routes/materiais");
const movimentacoesRouter = require("./routes/movimentacoes");
const configRouter = require("./routes/config");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use("/api/materiais", materiaisRouter);
app.use("/api/movimentacoes", movimentacoesRouter);
app.use("/api/config", configRouter);

app.get("/api/status", (req, res) => {
  res.json({ ok: true, mensagem: "Servidor almox-proensa rodando!" });
});

app.listen(PORT, () => {
  console.log("===========================================");
  console.log("  Servidor almox-proensa iniciado!");
  console.log(`  API disponivel em: http://localhost:${PORT}/api`);
  console.log("===========================================");
});
