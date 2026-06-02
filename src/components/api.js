/* Funções para comunicar com o backend */
const BASE = "http://localhost:3001/api";

const api = {
  async getMateriais() {
    const r = await fetch(`${BASE}/materiais`);
    return r.json();
  },
  async postMaterial(dados) {
    const r = await fetch(`${BASE}/materiais`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    return r.json();
  },
  async putMaterial(sku, dados) {
    const r = await fetch(`${BASE}/materiais/${sku}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    return r.json();
  },
  async deleteMaterial(sku) {
    const r = await fetch(`${BASE}/materiais/${sku}`, { method: "DELETE" });
    return r.json();
  },
  async getMovimentacoes() {
    const r = await fetch(`${BASE}/movimentacoes`);
    return r.json();
  },
  async postMovimentacao(dados) {
    const r = await fetch(`${BASE}/movimentacoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    return r.json();
  },
  async postAjuste(dados) {
    const r = await fetch(`${BASE}/movimentacoes/ajuste`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    return r.json();
  },
  async getConfig() {
    const r = await fetch(`${BASE}/config`);
    return r.json();
  },
  async putConfig(dados) {
    const r = await fetch(`${BASE}/config`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    return r.json();
  },
  async putPerfil(dados) {
    const r = await fetch(`${BASE}/config/perfil`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    return r.json();
  },
};

Object.assign(window, { api });
