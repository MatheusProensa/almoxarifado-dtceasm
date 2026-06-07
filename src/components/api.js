/* Funções para comunicar com o backend */
const BASE = "http://localhost:3001/api";

function getToken() {
  return localStorage.getItem("almox-token") || "";
}

function authHeaders() {
  return { "Content-Type": "application/json", "Authorization": "Bearer " + getToken() };
}

async function req(method, url, body) {
  const opts = { method, headers: authHeaders() };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const r = await fetch(BASE + url, opts);
  if (r.status === 401) {
    localStorage.removeItem("almox-token");
    localStorage.removeItem("almox-user");
    window.dispatchEvent(new Event("almox-logout"));
    throw new Error("Sessão expirada. Faça login novamente.");
  }
  return r.json();
}

const api = {
  async login(username, senha) {
    const r = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, senha }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.erro || "Erro ao fazer login");
    return data;
  },

  async trocarSenha(senhaAtual, novaSenha) {
    return req("POST", "/auth/trocar-senha", { senhaAtual, novaSenha });
  },

  async getMateriais()          { return req("GET",    "/materiais"); },
  async postMaterial(dados)     { return req("POST",   "/materiais", dados); },
  async putMaterial(sku, dados) { return req("PUT",    `/materiais/${sku}`, dados); },
  async deleteMaterial(sku)     { return req("DELETE", `/materiais/${sku}`); },

  async getMovimentacoes()      { return req("GET",  "/movimentacoes"); },
  async getMovimentacoesStats() { return req("GET",  "/movimentacoes/stats"); },
  async postMovimentacao(dados) { return req("POST", "/movimentacoes", dados); },
  async anularMovimentacao(id)  { return req("POST", `/movimentacoes/${id}/anular`, {}); },
  async postAjuste(dados)       { return req("POST", "/movimentacoes/ajuste", dados); },

  async getConfig()       { return req("GET",  "/config"); },
  async putConfig(dados)  { return req("PUT",  "/config", dados); },
  async putPerfil(dados)  { return req("PUT",  "/config/perfil", dados); },
};

Object.assign(window, { api });
