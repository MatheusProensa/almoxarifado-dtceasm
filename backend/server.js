const express = require("express");
const cors    = require("cors");
const helmet  = require("helmet");

const materiaisRouter     = require("./routes/materiais");
const movimentacoesRouter = require("./routes/movimentacoes");
const configRouter        = require("./routes/config");
const authRouter          = require("./routes/auth");
const auth                = require("./middleware/auth");

const app  = express();
const PORT = process.env.PORT || 3001;

// Origens permitidas — apenas a própria máquina
const ORIGENS_PERMITIDAS = [
  "http://localhost:5173",
  "http://localhost:4173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:4173",
];

// Segurança: cabeçalhos HTTP
app.use(helmet({ contentSecurityPolicy: false }));

// CORS restrito
app.use(cors({
  origin: (origin, cb) => {
    // Sem origem = Electron / Postman / curl local → permitido
    if (!origin || ORIGENS_PERMITIDAS.includes(origin)) return cb(null, true);
    cb(new Error("Origem não permitida pelo CORS."));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
}));

// Limite de tamanho de corpo
app.use(express.json({ limit: "64kb" }));
app.use(express.urlencoded({ limit: "64kb", extended: false }));

// Rotas públicas
app.use("/api/auth", authRouter);
app.get("/api/status", (req, res) => res.json({ ok: true }));

// Rotas protegidas (exigem token JWT)
app.use("/api/materiais",     auth, materiaisRouter);
app.use("/api/movimentacoes", auth, movimentacoesRouter);
app.use("/api/config",        auth, configRouter);

// Handler global de erros — não expõe stack trace ao cliente
app.use((err, req, res, _next) => {
  if (err.message && err.message.includes("CORS")) {
    return res.status(403).json({ erro: "Acesso negado." });
  }
  console.error("[ERRO]", err.message);
  res.status(500).json({ erro: "Erro interno do servidor." });
});

app.listen(PORT, "127.0.0.1", () => {
  console.log("===========================================");
  console.log("  Servidor almox-proensa iniciado!");
  console.log(`  API disponivel em: http://localhost:${PORT}/api`);
  console.log("===========================================");
});
