const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

const DB_PATH = path.join(__dirname, "almox.db");
const JSON_PATH = path.join(__dirname, "dados.json");

let _db = null;

function getDb() {
  if (_db) return _db;
  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");
  criarTabelas(_db);
  migrarDeJSON(_db);
  criarUsuariosIniciais(_db);
  migrarParaContaUnica(_db);
  return _db;
}

function criarTabelas(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS materiais (
      id    INTEGER PRIMARY KEY,
      sku   TEXT UNIQUE NOT NULL,
      name  TEXT NOT NULL,
      cat   TEXT NOT NULL,
      loc   TEXT DEFAULT '—',
      qty   REAL DEFAULT 0,
      unit  TEXT NOT NULL,
      min   REAL DEFAULT 0,
      obs   TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS movimentacoes (
      id       INTEGER PRIMARY KEY,
      tipo     TEXT NOT NULL,
      sku      TEXT NOT NULL,
      item     TEXT NOT NULL,
      qty      REAL NOT NULL,
      unit     TEXT NOT NULL,
      antes    REAL NOT NULL,
      depois   REAL NOT NULL,
      resp     TEXT DEFAULT '',
      doc      TEXT DEFAULT '—',
      dest     TEXT DEFAULT '',
      obs      TEXT DEFAULT '',
      at       TEXT NOT NULL,
      anulada  INTEGER DEFAULT 0,
      ref_id   INTEGER
    );

    CREATE TABLE IF NOT EXISTS config (
      chave TEXT PRIMARY KEY,
      valor TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name          TEXT NOT NULL,
      role          TEXT DEFAULT 'operador',
      ativo         INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS meta (
      chave TEXT PRIMARY KEY,
      valor TEXT NOT NULL
    );
  `);
}

function migrarDeJSON(db) {
  const jaFeito = db.prepare("SELECT valor FROM meta WHERE chave = 'migrado'").get();
  if (jaFeito) return;

  if (!fs.existsSync(JSON_PATH)) {
    db.prepare("INSERT INTO meta (chave, valor) VALUES ('migrado','1')").run();
    db.prepare("INSERT INTO meta (chave, valor) VALUES ('proximo_id','2000')").run();
    return;
  }

  const dados = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));

  const insMat = db.prepare(`
    INSERT OR IGNORE INTO materiais (id, sku, name, cat, loc, qty, unit, min, obs)
    VALUES (@id, @sku, @name, @cat, @loc, @qty, @unit, @min, @obs)
  `);

  const insMov = db.prepare(`
    INSERT OR IGNORE INTO movimentacoes
      (id, tipo, sku, item, qty, unit, antes, depois, resp, doc, dest, obs, at, anulada, ref_id)
    VALUES
      (@id, @tipo, @sku, @item, @qty, @unit, @antes, @depois, @resp, @doc, @dest, @obs, @at, @anulada, @ref_id)
  `);

  const migrar = db.transaction(() => {
    for (const m of dados.materiais) {
      insMat.run({ obs: "", ...m });
    }
    for (const m of dados.movimentacoes) {
      insMov.run({
        ...m,
        obs:     m.obs     || "",
        dest:    m.dest    || "",
        anulada: m.anulada ? 1 : 0,
        ref_id:  m.refId   || null,
      });
    }

    db.prepare("INSERT OR REPLACE INTO config (chave, valor) VALUES ('config', ?)").run(
      JSON.stringify(dados.config)
    );

    const maxMat = db.prepare("SELECT MAX(id) as v FROM materiais").get().v || 0;
    const maxMov = db.prepare("SELECT MAX(id) as v FROM movimentacoes").get().v || 0;
    const proximo = Math.max(dados.proximoId || 0, maxMat + 1, maxMov + 1);
    db.prepare("INSERT INTO meta (chave, valor) VALUES ('proximo_id', ?)").run(String(proximo));
    db.prepare("INSERT INTO meta (chave, valor) VALUES ('migrado', '1')").run();
  });

  migrar();
  console.log(`Migração concluída: ${dados.materiais.length} materiais, ${dados.movimentacoes.length} movimentações.`);
}

const SENHA_PADRAO = "Dtcea@2026";

function criarUsuariosIniciais(db) {
  const n = db.prepare("SELECT COUNT(*) as n FROM users").get().n;
  if (n > 0) return;

  const hash = bcrypt.hashSync(SENHA_PADRAO, 10);
  db.prepare("INSERT INTO users (username, password_hash, name, role) VALUES (?,?,?,?)")
    .run("suprimento", hash, "Suprimento", "admin");

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Usuário criado. Login: suprimento / Dtcea@2026");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

// Remove contas antigas e garante que só existe a conta suprimento
function migrarParaContaUnica(db) {
  const temSuprimento = db.prepare("SELECT 1 FROM users WHERE username = 'suprimento'").get();
  if (temSuprimento) return; // já migrado

  const hash = bcrypt.hashSync(SENHA_PADRAO, 10);
  db.prepare("DELETE FROM users").run();
  db.prepare("INSERT INTO users (username, password_hash, name, role) VALUES (?,?,?,?)")
    .run("suprimento", hash, "Suprimento", "admin");

  console.log("  Contas antigas removidas. Login único: suprimento / Dtcea@2026");
}

function getJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;

  const db = getDb();
  const row = db.prepare("SELECT valor FROM meta WHERE chave = 'jwt_secret'").get();
  if (row) return row.valor;

  const crypto = require("crypto");
  const secret = crypto.randomBytes(48).toString("hex");
  db.prepare("INSERT INTO meta (chave, valor) VALUES ('jwt_secret', ?)").run(secret);
  console.log("JWT secret gerado e salvo no banco. Defina JWT_SECRET em variável de ambiente para maior controle.");
  return secret;
}

function proximoId() {
  const db = getDb();
  const row = db.prepare("SELECT valor FROM meta WHERE chave = 'proximo_id'").get();
  const id = parseInt(row ? row.valor : "2000", 10);
  db.prepare("INSERT OR REPLACE INTO meta (chave, valor) VALUES ('proximo_id', ?)").run(String(id + 1));
  return id;
}

function getConfig() {
  const db = getDb();
  const row = db.prepare("SELECT valor FROM config WHERE chave = 'config'").get();
  return row ? JSON.parse(row.valor) : {};
}

function salvarConfig(cfg) {
  const db = getDb();
  db.prepare("INSERT OR REPLACE INTO config (chave, valor) VALUES ('config', ?)").run(JSON.stringify(cfg));
}

module.exports = { getDb, proximoId, getConfig, salvarConfig, getJwtSecret };
