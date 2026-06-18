/* Camada de comunicação com o Supabase — com fallback para modo demonstração
   (dados locais no navegador) quando VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY
   não estiverem configuradas. */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const DEMO_MODE = !SUPABASE_URL || !SUPABASE_ANON_KEY;

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
  return { ...m, anulada: m.anulada === true, refId: m.ref_id || undefined };
}

function nowStr() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/* ── Implementação real: Supabase ────────────────────────────────────────── */

function buildSupabaseApi() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Mapeia username digitado na tela para o email cadastrado no Supabase Auth
  const USUARIOS = {
    suprimento: "suprimentodtcea@gmail.com",
  };
  const toEmail = (username) =>
    USUARIOS[username.toLowerCase().trim()] || username.toLowerCase().trim();

  async function sb(queryPromise) {
    const { data, error } = await queryPromise;
    if (error) throw new Error(error.message);
    return data;
  }

  return {
    // ── Auth ──────────────────────────────────────────────────

    async login(username, senha) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: toEmail(username),
        password: senha,
      });
      if (error) throw new Error("Usuário ou senha incorretos.");
      const meta = data.user.user_metadata || {};
      return { user: { name: meta.name || "Suprimento", role: meta.role || "admin" } };
    },

    async logout() {
      await supabase.auth.signOut();
    },

    async getSession() {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },

    onAuthChange(callback) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
      return () => subscription.unsubscribe();
    },

    async trocarSenha(senhaAtual, novaSenha) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado.");
      const { error: reAuthErr } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: senhaAtual,
      });
      if (reAuthErr) throw new Error("Senha atual incorreta.");
      const { error } = await supabase.auth.updateUser({ password: novaSenha });
      if (error) throw new Error(error.message);
      return { ok: true };
    },

    // ── Materiais ─────────────────────────────────────────────

    async getMateriais() {
      const data = await sb(supabase.from("materiais").select("*").order("name"));
      return data.map(formatMat);
    },

    async postMaterial(dados) {
      const sku = "NEW-" + Date.now().toString(36).toUpperCase();
      const mat = {
        sku,
        name: String(dados.name).trim(),
        cat: String(dados.cat).trim(),
        loc: dados.loc ? String(dados.loc).trim().slice(0, 50) : "—",
        qty: Number(dados.qty) || 0,
        unit: String(dados.unit).slice(0, 20),
        min: Number(dados.min) || 0,
        obs: dados.obs ? String(dados.obs).slice(0, 500) : "",
      };

      const novo = await sb(
        supabase.from("materiais").insert(mat).select().single()
      );

      if (mat.qty > 0) {
        await supabase.rpc("registrar_movimentacao", {
          p_tipo: "in", p_sku: sku, p_qty: mat.qty,
          p_resp: "Sistema", p_doc: "Cadastro inicial", p_dest: "", p_obs: "",
        });
      }

      return formatMat(novo);
    },

    async putMaterial(sku, dados) {
      const original = await sb(
        supabase.from("materiais").select("*").eq("sku", sku).single()
      );

      const update = {
        name: dados.name !== undefined ? String(dados.name).trim() : original.name,
        cat:  dados.cat  !== undefined ? String(dados.cat).trim()  : original.cat,
        loc:  dados.loc  !== undefined ? String(dados.loc).slice(0, 50) : original.loc,
        qty:  dados.qty  !== undefined ? Number(dados.qty)  : Number(original.qty),
        unit: dados.unit !== undefined ? String(dados.unit).slice(0, 20) : original.unit,
        min:  dados.min  !== undefined ? Number(dados.min)  : Number(original.min),
        obs:  dados.obs  !== undefined ? String(dados.obs).slice(0, 500) : original.obs,
      };

      if (update.qty !== Number(original.qty)) {
        await supabase.rpc("registrar_ajuste", {
          p_sku: sku, p_novo_qty: update.qty,
          p_motivo: "Ajuste de estoque",
          p_resp: dados.resp || "Sistema",
        });
      }

      const atualizado = await sb(
        supabase.from("materiais").update(update).eq("sku", sku).select().single()
      );
      return formatMat(atualizado);
    },

    async deleteMaterial(sku) {
      await sb(supabase.from("materiais").delete().eq("sku", sku));
      return { ok: true };
    },

    // ── Movimentações ─────────────────────────────────────────

    async getMovimentacoes() {
      const data = await sb(
        supabase.from("movimentacoes").select("*").order("id", { ascending: false })
      );
      return data.map(formatMov);
    },

    async getMovimentacoesStats() {
      const agora = new Date();
      const mesAtual = agora.getMonth() + 1;
      const anoAtual = agora.getFullYear();

      const data = await sb(
        supabase.from("movimentacoes")
          .select("tipo, qty, at")
          .in("tipo", ["in", "out"])
          .eq("anulada", false)
      );

      let entradasMes = 0, saidasMes = 0;
      for (const m of data) {
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
      const result = await sb(supabase.rpc("registrar_movimentacao", {
        p_tipo: tipo,
        p_sku:  sku,
        p_qty:  Number(qty),
        p_resp: resp  ? String(resp).slice(0, 80)  : "Sistema",
        p_doc:  doc   ? String(doc).slice(0, 80)   : "—",
        p_dest: dest  ? String(dest).slice(0, 60)  : "",
        p_obs:  obs   ? String(obs).slice(0, 300)  : "",
      }));

      const [movRow, matRow] = await Promise.all([
        sb(supabase.from("movimentacoes").select("*").eq("id", result.mov_id).single()),
        sb(supabase.from("materiais").select("*").eq("sku", sku).single()),
      ]);
      return { movimentacao: formatMov(movRow), material: formatMat(matRow) };
    },

    async anularMovimentacao(id) {
      const result = await sb(supabase.rpc("anular_movimentacao", {
        p_id:   id,
        p_resp: "Sistema",
      }));

      const [estornoRow, movRow, matRow] = await Promise.all([
        sb(supabase.from("movimentacoes").select("*").eq("id", result.estorno_id).single()),
        sb(supabase.from("movimentacoes").select("*").eq("id", id).single()),
        sb(supabase.from("materiais").select("*").eq("sku", result.sku).single()),
      ]);
      return {
        estorno: formatMov(estornoRow),
        movimentacaoOriginal: formatMov(movRow),
        material: formatMat(matRow),
      };
    },

    async postAjuste(dados) {
      const { sku, novoQty, motivo } = dados;
      await sb(supabase.rpc("registrar_ajuste", {
        p_sku:      sku,
        p_novo_qty: Number(novoQty),
        p_motivo:   motivo || "Ajuste manual",
        p_resp:     "Sistema",
      }));
      const matRow = await sb(
        supabase.from("materiais").select("*").eq("sku", sku).single()
      );
      return { material: formatMat(matRow) };
    },

    // ── Config ────────────────────────────────────────────────

    async getConfig() {
      const { data, error } = await supabase
        .from("config").select("data").eq("id", 1).single();
      if (error && error.code !== "PGRST116") throw new Error(error.message);
      return data?.data || {};
    },

    async putConfig(dados) {
      const atual = await this.getConfig();
      const novo = { ...atual, ...dados };
      await sb(supabase.from("config").upsert({ id: 1, data: novo }));
      return novo;
    },

    async putPerfil(dados) {
      const config = await this.getConfig();
      config.perfil = { ...config.perfil, ...dados };
      await sb(supabase.from("config").upsert({ id: 1, data: config }));
      return config.perfil;
    },

    // ── Backup ────────────────────────────────────────────────

    async baixarBackup() {
      const [matsRes, movsRes, cfgRes] = await Promise.all([
        supabase.from("materiais").select("*").order("name"),
        supabase.from("movimentacoes").select("*").order("id"),
        supabase.from("config").select("data").eq("id", 1).single(),
      ]);
      const backup = {
        materiais: matsRes.data || [],
        movimentacoes: movsRes.data || [],
        config: cfgRes.data?.data || {},
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
}

/* ── Implementação local: modo demonstração (sem Supabase) ──────────────────
   Guarda tudo no localStorage do navegador. Cada dispositivo/navegador tem
   sua própria cópia dos dados — nada é sincronizado entre pessoas. Serve só
   para apresentação/treinamento até existir um projeto Supabase configurado. */

function buildDemoApi() {
  const SESSION_KEY = "almox_demo_session";
  const DB_KEY = "almox_demo_db";
  const authListeners = [];

  function loadDB() {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
    const seedMateriais = (window.MATERIAIS || []).map((m) => ({
      sku: m.sku, name: m.name, cat: m.cat, loc: m.loc,
      qty: m.qty, unit: m.unit, min: m.min, obs: "",
    }));
    const seedMovs = (window.MOVIMENTACOES || []).map((m) => ({
      id: m.id, tipo: m.tipo, sku: m.sku, item: m.item, qty: m.qty, unit: m.unit,
      antes: m.antes, depois: m.depois, resp: m.resp, doc: m.doc, dest: m.dest || "",
      obs: "", at: m.at, anulada: false, ref_id: null,
    }));
    const db = {
      materiais: seedMateriais,
      movimentacoes: seedMovs,
      config: {},
      nextMovId: seedMovs.reduce((max, m) => Math.max(max, m.id), 0) + 1,
    };
    saveDB(db);
    return db;
  }

  function saveDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  }

  return {
    // ── Auth ──────────────────────────────────────────────────
    // Modo demo: aceita qualquer usuário/senha não vazios.

    async login(username, senha) {
      if (!username.trim() || !senha) throw new Error("Usuário ou senha incorretos.");
      localStorage.setItem(SESSION_KEY, "1");
      authListeners.forEach((cb) => cb("SIGNED_IN", { user: true }));
      return { user: { name: "Suprimento", role: "admin" } };
    },

    async logout() {
      localStorage.removeItem(SESSION_KEY);
      authListeners.forEach((cb) => cb("SIGNED_OUT", null));
    },

    async getSession() {
      return localStorage.getItem(SESSION_KEY) ? { user: true } : null;
    },

    onAuthChange(callback) {
      authListeners.push(callback);
      return () => {
        const i = authListeners.indexOf(callback);
        if (i >= 0) authListeners.splice(i, 1);
      };
    },

    async trocarSenha() {
      return { ok: true };
    },

    // ── Materiais ─────────────────────────────────────────────

    async getMateriais() {
      return loadDB().materiais.map(formatMat);
    },

    async postMaterial(dados) {
      const db = loadDB();
      const sku = "NEW-" + Date.now().toString(36).toUpperCase();
      const mat = {
        sku,
        name: String(dados.name).trim(),
        cat: String(dados.cat).trim(),
        loc: dados.loc ? String(dados.loc).trim().slice(0, 50) : "—",
        qty: Number(dados.qty) || 0,
        unit: String(dados.unit).slice(0, 20),
        min: Number(dados.min) || 0,
        obs: dados.obs ? String(dados.obs).slice(0, 500) : "",
      };
      db.materiais.unshift(mat);
      if (mat.qty > 0) {
        db.movimentacoes.unshift({
          id: db.nextMovId++, tipo: "in", sku, item: mat.name, qty: mat.qty, unit: mat.unit,
          antes: 0, depois: mat.qty, resp: "Sistema", doc: "Cadastro inicial", dest: "", obs: "",
          at: nowStr(), anulada: false, ref_id: null,
        });
      }
      saveDB(db);
      return formatMat(mat);
    },

    async putMaterial(sku, dados) {
      const db = loadDB();
      const idx = db.materiais.findIndex((m) => m.sku === sku);
      if (idx === -1) throw new Error("Material não encontrado.");
      const original = db.materiais[idx];
      const update = {
        ...original,
        name: dados.name !== undefined ? String(dados.name).trim() : original.name,
        cat:  dados.cat  !== undefined ? String(dados.cat).trim()  : original.cat,
        loc:  dados.loc  !== undefined ? String(dados.loc).slice(0, 50) : original.loc,
        qty:  dados.qty  !== undefined ? Number(dados.qty)  : Number(original.qty),
        unit: dados.unit !== undefined ? String(dados.unit).slice(0, 20) : original.unit,
        min:  dados.min  !== undefined ? Number(dados.min)  : Number(original.min),
        obs:  dados.obs  !== undefined ? String(dados.obs).slice(0, 500) : original.obs,
      };
      if (update.qty !== Number(original.qty)) {
        db.movimentacoes.unshift({
          id: db.nextMovId++, tipo: "adj", sku, item: update.name,
          qty: Math.abs(update.qty - Number(original.qty)), unit: update.unit,
          antes: Number(original.qty), depois: update.qty,
          resp: dados.resp || "Sistema", doc: "Ajuste de estoque", dest: "", obs: "",
          at: nowStr(), anulada: false, ref_id: null,
        });
      }
      db.materiais[idx] = update;
      saveDB(db);
      return formatMat(update);
    },

    async deleteMaterial(sku) {
      const db = loadDB();
      db.materiais = db.materiais.filter((m) => m.sku !== sku);
      saveDB(db);
      return { ok: true };
    },

    // ── Movimentações ─────────────────────────────────────────

    async getMovimentacoes() {
      const db = loadDB();
      return [...db.movimentacoes].sort((a, b) => b.id - a.id).map(formatMov);
    },

    async getMovimentacoesStats() {
      const db = loadDB();
      const agora = new Date();
      const mesAtual = agora.getMonth() + 1;
      const anoAtual = agora.getFullYear();
      let entradasMes = 0, saidasMes = 0;
      for (const m of db.movimentacoes) {
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
      const db = loadDB();
      const { tipo, sku, qty, resp, doc, dest, obs } = dados;
      const idx = db.materiais.findIndex((m) => m.sku === sku);
      if (idx === -1) throw new Error("Material não encontrado.");
      const mat = db.materiais[idx];
      const antes = Number(mat.qty);
      const delta = tipo === "in" ? Number(qty) : -Number(qty);
      const depois = antes + delta;
      if (tipo === "out" && depois < 0) throw new Error("Saldo insuficiente.");
      mat.qty = depois;
      const mov = {
        id: db.nextMovId++, tipo, sku, item: mat.name, qty: Number(qty), unit: mat.unit,
        antes, depois, resp: resp ? String(resp).slice(0, 80) : "Sistema",
        doc: doc ? String(doc).slice(0, 80) : "—", dest: dest ? String(dest).slice(0, 60) : "",
        obs: obs ? String(obs).slice(0, 300) : "", at: nowStr(), anulada: false, ref_id: null,
      };
      db.movimentacoes.unshift(mov);
      saveDB(db);
      return { movimentacao: formatMov(mov), material: formatMat(mat) };
    },

    async anularMovimentacao(id) {
      const db = loadDB();
      const mov = db.movimentacoes.find((m) => m.id === id);
      if (!mov) throw new Error("Movimentação não encontrada.");
      const mat = db.materiais.find((m) => m.sku === mov.sku);
      if (!mat) throw new Error("Material não encontrado.");
      const antes = Number(mat.qty);
      const depois = antes - (mov.depois - mov.antes);
      mat.qty = depois;
      mov.anulada = true;
      const estorno = {
        id: db.nextMovId++, tipo: "estorno", sku: mov.sku, item: mov.item,
        qty: mov.qty, unit: mov.unit, antes, depois, resp: "Sistema",
        doc: `Estorno de #${id}`, dest: "", obs: "", at: nowStr(), anulada: false, ref_id: id,
      };
      db.movimentacoes.unshift(estorno);
      saveDB(db);
      return {
        estorno: formatMov(estorno),
        movimentacaoOriginal: formatMov(mov),
        material: formatMat(mat),
      };
    },

    async postAjuste(dados) {
      const db = loadDB();
      const { sku, novoQty, motivo } = dados;
      const mat = db.materiais.find((m) => m.sku === sku);
      if (!mat) throw new Error("Material não encontrado.");
      const antes = Number(mat.qty);
      mat.qty = Number(novoQty);
      db.movimentacoes.unshift({
        id: db.nextMovId++, tipo: "adj", sku, item: mat.name,
        qty: Math.abs(Number(novoQty) - antes), unit: mat.unit,
        antes, depois: Number(novoQty), resp: "Sistema",
        doc: motivo || "Ajuste manual", dest: "", obs: "", at: nowStr(), anulada: false, ref_id: null,
      });
      saveDB(db);
      return { material: formatMat(mat) };
    },

    // ── Config ────────────────────────────────────────────────

    async getConfig() {
      return loadDB().config || {};
    },

    async putConfig(dados) {
      const db = loadDB();
      db.config = { ...db.config, ...dados };
      saveDB(db);
      return db.config;
    },

    async putPerfil(dados) {
      const db = loadDB();
      db.config.perfil = { ...db.config.perfil, ...dados };
      saveDB(db);
      return db.config.perfil;
    },

    // ── Backup ────────────────────────────────────────────────

    async baixarBackup() {
      const db = loadDB();
      const backup = {
        materiais: db.materiais,
        movimentacoes: db.movimentacoes,
        config: db.config,
        exportado_em: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const ts = new Date().toISOString().slice(0, 16).replace("T", "_").replace(":", "-");
      a.href = url;
      a.download = `almox-demo-backup-${ts}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
  };
}

const api = DEMO_MODE ? buildDemoApi() : buildSupabaseApi();

Object.assign(window, { api, DEMO_MODE });
