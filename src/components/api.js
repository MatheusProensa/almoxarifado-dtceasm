/* Camada de dados local (modo demonstração — sem backend)
   O Supabase foi removido temporariamente. Os dados vivem em memória e em
   localStorage neste navegador, com o catálogo de exemplo de data.jsx como
   carga inicial. Quando o backend voltar, este arquivo volta a falar com ele. */

const DB_KEY = "almox_demo_db_v1";
const SESSION_KEY = "almox_demo_session_v1";
const SENHA_KEY = "almox_demo_senha_v1";
const USERNAME = "suprimento";
const SENHA_PADRAO = "Dtcea@2026";

let db = null;
const authListeners = [];

function agora() {
  const d = new Date();
  const partes = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(d).reduce((acc, p) => ({ ...acc, [p.type]: p.value }), {});
  return `${partes.day}/${partes.month}/${partes.year} ${partes.hour}:${partes.minute}`;
}

function persist() {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function seed() {
  const materiaisSeed = (window.MATERIAIS || []).map(m => ({
    id: m.id, sku: m.sku, name: m.name, cat: m.cat, loc: m.loc || "—",
    qty: m.qty, unit: m.unit, min: m.min, obs: m.obs || "",
  }));
  const movimentacoesSeed = (window.MOVIMENTACOES || []).map(m => ({
    id: m.id, tipo: m.tipo, sku: m.sku, item: m.item, qty: m.qty, unit: m.unit,
    antes: m.antes, depois: m.depois, resp: m.resp || "", doc: m.doc || "—",
    dest: m.dest || "", obs: m.obs || "", at: m.at, anulada: false, ref_id: null,
  }));
  const maxMatId = materiaisSeed.reduce((max, m) => Math.max(max, m.id), 0);
  const maxMovId = movimentacoesSeed.reduce((max, m) => Math.max(max, m.id), 0);
  return {
    materiais: materiaisSeed,
    movimentacoes: movimentacoesSeed,
    config: {},
    nextMatId: maxMatId + 1,
    nextMovId: maxMovId + 1,
  };
}

function load() {
  if (db) return db;
  const saved = localStorage.getItem(DB_KEY);
  db = saved ? JSON.parse(saved) : seed();
  return db;
}

function statusOf(qty, min) {
  if (qty === 0) return "zero";
  if (qty <= min * 0.4) return "crit";
  if (qty < min) return "baixa";
  return "ok";
}

function formatMat(m) {
  return { ...m, status: statusOf(Number(m.qty), Number(m.min)) };
}

function formatMov(m) {
  return { ...m, refId: m.ref_id || undefined };
}

function acharMaterial(sku) {
  const mat = load().materiais.find(m => m.sku === sku);
  if (!mat) throw new Error("Material não encontrado.");
  return mat;
}

function registrarMovimentacao(tipo, sku, qty, resp, doc, dest, obs) {
  const data = load();
  const mat = acharMaterial(sku);
  const antes = Number(mat.qty);
  const depois = tipo === "in" ? antes + qty : Math.max(0, antes - qty);
  mat.qty = depois;
  const mov = {
    id: data.nextMovId++, tipo, sku, item: mat.name, qty, unit: mat.unit,
    antes, depois, resp, doc, dest, obs, at: agora(), anulada: false, ref_id: null,
  };
  data.movimentacoes.push(mov);
  persist();
  return mov;
}

function registrarAjuste(sku, novoQty, motivo, resp) {
  const data = load();
  const mat = acharMaterial(sku);
  const antes = Number(mat.qty);
  const diff = novoQty - antes;
  mat.qty = novoQty;
  if (diff !== 0) {
    data.movimentacoes.push({
      id: data.nextMovId++, tipo: "adj", sku, item: mat.name, qty: diff, unit: mat.unit,
      antes, depois: novoQty, resp, doc: motivo, dest: "", obs: "", at: agora(),
      anulada: false, ref_id: null,
    });
  }
  persist();
  return mat;
}

function anularMovimentacaoInterno(id, resp) {
  const data = load();
  const mov = data.movimentacoes.find(m => m.id === id);
  if (!mov) throw new Error("Movimentação não encontrada.");
  if (mov.anulada) throw new Error("Esta movimentação já foi anulada.");
  if (mov.tipo === "estorno") throw new Error("Não é possível anular um estorno.");

  const mat = data.materiais.find(m => m.sku === mov.sku);
  const antes = mat ? Number(mat.qty) : 0;
  let depois;
  if (mov.tipo === "in") depois = Math.max(0, antes - Math.abs(mov.qty));
  else if (mov.tipo === "out") depois = antes + Math.abs(mov.qty);
  else if (mov.tipo === "adj") depois = Math.max(0, antes - mov.qty);
  else depois = antes;

  if (mat) mat.qty = depois;

  const estorno = {
    id: data.nextMovId++, tipo: "estorno", sku: mov.sku, item: mov.item,
    qty: Math.abs(mov.qty), unit: mov.unit, antes, depois, resp,
    doc: `Estorno ref. #${id}`, dest: "", obs: "", at: agora(),
    anulada: false, ref_id: id,
  };
  data.movimentacoes.push(estorno);
  mov.anulada = true;
  persist();
  return estorno;
}

function notifyAuth(session) {
  authListeners.forEach(cb => cb(session ? "SIGNED_IN" : "SIGNED_OUT", session));
}

const api = {
  // ── Auth ──────────────────────────────────────────────────

  async login(username, senha) {
    const senhaSalva = localStorage.getItem(SENHA_KEY) || SENHA_PADRAO;
    if (username.toLowerCase().trim() !== USERNAME || senha !== senhaSalva) {
      throw new Error("Usuário ou senha incorretos.");
    }
    localStorage.setItem(SESSION_KEY, "1");
    notifyAuth({ user: USERNAME });
    return { user: { name: "Suprimento", role: "admin" } };
  },

  async logout() {
    localStorage.removeItem(SESSION_KEY);
    notifyAuth(null);
  },

  async getSession() {
    return localStorage.getItem(SESSION_KEY) ? { user: USERNAME } : null;
  },

  onAuthChange(callback) {
    authListeners.push(callback);
    return () => {
      const i = authListeners.indexOf(callback);
      if (i >= 0) authListeners.splice(i, 1);
    };
  },

  async trocarSenha(senhaAtual, novaSenha) {
    const senhaSalva = localStorage.getItem(SENHA_KEY) || SENHA_PADRAO;
    if (senhaAtual !== senhaSalva) throw new Error("Senha atual incorreta.");
    localStorage.setItem(SENHA_KEY, novaSenha);
    return { ok: true };
  },

  // ── Materiais ─────────────────────────────────────────────

  async getMateriais() {
    return [...load().materiais].sort((a, b) => a.name.localeCompare(b.name)).map(formatMat);
  },

  async postMaterial(dados) {
    const data = load();
    const sku = "NEW-" + Date.now().toString(36).toUpperCase();
    const mat = {
      id: data.nextMatId++, sku,
      name: String(dados.name).trim(),
      cat: String(dados.cat).trim(),
      loc: dados.loc ? String(dados.loc).trim().slice(0, 50) : "—",
      qty: Number(dados.qty) || 0,
      unit: String(dados.unit).slice(0, 20),
      min: Number(dados.min) || 0,
      obs: dados.obs ? String(dados.obs).slice(0, 500) : "",
    };
    data.materiais.push(mat);

    if (mat.qty > 0) {
      data.movimentacoes.push({
        id: data.nextMovId++, tipo: "in", sku, item: mat.name, qty: mat.qty, unit: mat.unit,
        antes: 0, depois: mat.qty, resp: "Sistema", doc: "Cadastro inicial", dest: "",
        obs: "", at: agora(), anulada: false, ref_id: null,
      });
    }
    persist();
    return formatMat(mat);
  },

  async putMaterial(sku, dados) {
    const mat = acharMaterial(sku);
    const novaQty = dados.qty !== undefined ? Number(dados.qty) : Number(mat.qty);

    if (novaQty !== Number(mat.qty)) {
      registrarAjuste(sku, novaQty, "Ajuste de estoque", dados.resp || "Sistema");
    }

    if (dados.name !== undefined) mat.name = String(dados.name).trim();
    if (dados.cat  !== undefined) mat.cat  = String(dados.cat).trim();
    if (dados.loc  !== undefined) mat.loc  = String(dados.loc).slice(0, 50);
    if (dados.unit !== undefined) mat.unit = String(dados.unit).slice(0, 20);
    if (dados.min  !== undefined) mat.min  = Number(dados.min);
    if (dados.obs  !== undefined) mat.obs  = String(dados.obs).slice(0, 500);
    persist();
    return formatMat(mat);
  },

  async deleteMaterial(sku) {
    const data = load();
    data.materiais = data.materiais.filter(m => m.sku !== sku);
    persist();
    return { ok: true };
  },

  // ── Movimentações ─────────────────────────────────────────

  async getMovimentacoes() {
    return [...load().movimentacoes].sort((a, b) => b.id - a.id).map(formatMov);
  },

  async getMovimentacoesStats() {
    const agoraData = new Date();
    const mesAtual = agoraData.getMonth() + 1;
    const anoAtual = agoraData.getFullYear();

    let entradasMes = 0, saidasMes = 0;
    for (const m of load().movimentacoes) {
      if (m.anulada || !["in", "out"].includes(m.tipo)) continue;
      const partes = m.at.split(/[\/\s:]/);
      if (partes.length < 3) continue;
      const mes = parseInt(partes[1], 10);
      const ano = parseInt(partes[2], 10);
      if (mes !== mesAtual || ano !== anoAtual) continue;
      if (m.tipo === "in")  entradasMes += Math.abs(Number(m.qty));
      if (m.tipo === "out") saidasMes   += Math.abs(Number(m.qty));
    }
    return { entradasMes, saidasMes, mes: mesAtual, ano: anoAtual };
  },

  async postMovimentacao(dados) {
    const { tipo, sku, qty, resp, doc, dest, obs } = dados;
    const mov = registrarMovimentacao(
      tipo, sku, Number(qty),
      resp ? String(resp).slice(0, 80) : "Sistema",
      doc  ? String(doc).slice(0, 80)  : "—",
      dest ? String(dest).slice(0, 60) : "",
      obs  ? String(obs).slice(0, 300) : ""
    );
    return { movimentacao: formatMov(mov), material: formatMat(acharMaterial(sku)) };
  },

  async anularMovimentacao(id) {
    const estorno = anularMovimentacaoInterno(id, "Sistema");
    const data = load();
    const movimentacaoOriginal = data.movimentacoes.find(m => m.id === id);
    const material = data.materiais.find(m => m.sku === estorno.sku);
    return {
      estorno: formatMov(estorno),
      movimentacaoOriginal: formatMov(movimentacaoOriginal),
      material: material ? formatMat(material) : null,
    };
  },

  async postAjuste(dados) {
    const { sku, novoQty, motivo } = dados;
    registrarAjuste(sku, Number(novoQty), motivo || "Ajuste manual", "Sistema");
    return { material: formatMat(acharMaterial(sku)) };
  },

  // ── Config ────────────────────────────────────────────────

  async getConfig() {
    return load().config;
  },

  async putConfig(dados) {
    const data = load();
    data.config = { ...data.config, ...dados };
    persist();
    return data.config;
  },

  async putPerfil(dados) {
    const data = load();
    data.config.perfil = { ...data.config.perfil, ...dados };
    persist();
    return data.config.perfil;
  },

  // ── Backup ────────────────────────────────────────────────

  async baixarBackup() {
    const data = load();
    const backup = {
      materiais: data.materiais,
      movimentacoes: data.movimentacoes,
      config: data.config,
      exportado_em: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const ts = new Date().toISOString().slice(0, 16).replace("T", "_").replace(":", "-");
    a.href = url;
    a.download = `almox-backup-${ts}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },
};

Object.assign(window, { api });
