/* Comunicação com Supabase — substitui o Express backend */
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Mapeia username digitado na tela para o email cadastrado no Supabase Auth
const USUARIOS = {
  suprimento: "suprimentodtcea@gmail.com",
};
const toEmail = (username) =>
  USUARIOS[username.toLowerCase().trim()] || username.toLowerCase().trim();

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

async function sb(queryPromise) {
  const { data, error } = await queryPromise;
  if (error) throw new Error(error.message);
  return data;
}

const api = {
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

Object.assign(window, { api });
