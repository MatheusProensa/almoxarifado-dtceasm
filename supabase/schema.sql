-- ============================================================
-- Almox Proensa — Schema Supabase
-- Execute este arquivo no SQL Editor do Supabase
-- ============================================================

-- ── Tabelas ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS materiais (
  id    BIGSERIAL PRIMARY KEY,
  sku   TEXT UNIQUE NOT NULL,
  name  TEXT NOT NULL,
  cat   TEXT NOT NULL,
  loc   TEXT DEFAULT '—',
  qty   NUMERIC DEFAULT 0,
  unit  TEXT NOT NULL,
  min   NUMERIC DEFAULT 0,
  obs   TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS movimentacoes (
  id      BIGSERIAL PRIMARY KEY,
  tipo    TEXT NOT NULL,
  sku     TEXT NOT NULL,
  item    TEXT NOT NULL,
  qty     NUMERIC NOT NULL,
  unit    TEXT NOT NULL,
  antes   NUMERIC NOT NULL,
  depois  NUMERIC NOT NULL,
  resp    TEXT DEFAULT '',
  doc     TEXT DEFAULT '—',
  dest    TEXT DEFAULT '',
  obs     TEXT DEFAULT '',
  at      TEXT NOT NULL,
  anulada BOOLEAN DEFAULT FALSE,
  ref_id  BIGINT REFERENCES movimentacoes(id)
);

CREATE TABLE IF NOT EXISTS config (
  id   INT PRIMARY KEY DEFAULT 1,
  data JSONB DEFAULT '{}'
);

-- ── RLS (Row Level Security) ──────────────────────────────────

ALTER TABLE materiais     ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE config        ENABLE ROW LEVEL SECURITY;

-- Apenas usuários autenticados podem acessar os dados
CREATE POLICY "acesso_autenticado" ON materiais
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "acesso_autenticado" ON movimentacoes
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "acesso_autenticado" ON config
  FOR ALL USING (auth.role() = 'authenticated');

-- ── Funções auxiliares ────────────────────────────────────────

CREATE OR REPLACE FUNCTION data_hora_agora()
RETURNS TEXT LANGUAGE sql AS $$
  SELECT to_char(NOW() AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI')
$$;

-- ── Função: registrar_movimentacao (entrada ou saída atômica) ──

CREATE OR REPLACE FUNCTION registrar_movimentacao(
  p_tipo TEXT,
  p_sku  TEXT,
  p_qty  NUMERIC,
  p_resp TEXT DEFAULT 'Sistema',
  p_doc  TEXT DEFAULT '—',
  p_dest TEXT DEFAULT '',
  p_obs  TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_mat  materiais%ROWTYPE;
  v_antes  NUMERIC;
  v_depois NUMERIC;
  v_id     BIGINT;
BEGIN
  SELECT * INTO v_mat FROM materiais WHERE sku = p_sku FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Material não encontrado.'; END IF;

  v_antes := v_mat.qty;
  IF p_tipo = 'in' THEN
    v_depois := v_antes + p_qty;
  ELSE
    v_depois := GREATEST(0, v_antes - p_qty);
  END IF;

  UPDATE materiais SET qty = v_depois WHERE sku = p_sku;

  INSERT INTO movimentacoes (tipo, sku, item, qty, unit, antes, depois, resp, doc, dest, obs, at)
  VALUES (p_tipo, p_sku, v_mat.name, p_qty, v_mat.unit, v_antes, v_depois,
          p_resp, p_doc, p_dest, p_obs, data_hora_agora())
  RETURNING id INTO v_id;

  RETURN jsonb_build_object('mov_id', v_id, 'depois', v_depois, 'sku', p_sku);
END;
$$;

-- ── Função: registrar_ajuste (ajuste manual atômico) ──────────

CREATE OR REPLACE FUNCTION registrar_ajuste(
  p_sku      TEXT,
  p_novo_qty NUMERIC,
  p_motivo   TEXT DEFAULT 'Ajuste manual',
  p_resp     TEXT DEFAULT 'Sistema'
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_mat  materiais%ROWTYPE;
  v_diff NUMERIC;
  v_id   BIGINT;
BEGIN
  SELECT * INTO v_mat FROM materiais WHERE sku = p_sku FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Material não encontrado.'; END IF;

  v_diff := p_novo_qty - v_mat.qty;
  UPDATE materiais SET qty = p_novo_qty WHERE sku = p_sku;

  IF v_diff <> 0 THEN
    INSERT INTO movimentacoes (tipo, sku, item, qty, unit, antes, depois, resp, doc, dest, at)
    VALUES ('adj', p_sku, v_mat.name, v_diff, v_mat.unit, v_mat.qty, p_novo_qty,
            p_resp, p_motivo, '', data_hora_agora())
    RETURNING id INTO v_id;
  END IF;

  RETURN jsonb_build_object('mov_id', v_id, 'depois', p_novo_qty, 'sku', p_sku);
END;
$$;

-- ── Função: anular_movimentacao (estorno atômico) ─────────────

CREATE OR REPLACE FUNCTION anular_movimentacao(
  p_id   BIGINT,
  p_resp TEXT DEFAULT 'Sistema'
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_mov   movimentacoes%ROWTYPE;
  v_mat   materiais%ROWTYPE;
  v_antes  NUMERIC;
  v_depois NUMERIC;
  v_estorno_id BIGINT;
BEGIN
  SELECT * INTO v_mov FROM movimentacoes WHERE id = p_id;
  IF NOT FOUND   THEN RAISE EXCEPTION 'Movimentação não encontrada.'; END IF;
  IF v_mov.anulada THEN RAISE EXCEPTION 'Esta movimentação já foi anulada.'; END IF;
  IF v_mov.tipo = 'estorno' THEN RAISE EXCEPTION 'Não é possível anular um estorno.'; END IF;

  SELECT * INTO v_mat FROM materiais WHERE sku = v_mov.sku FOR UPDATE;
  v_antes := COALESCE(v_mat.qty, 0);

  IF v_mov.tipo = 'in'  THEN v_depois := GREATEST(0, v_antes - ABS(v_mov.qty));
  ELSIF v_mov.tipo = 'out' THEN v_depois := v_antes + ABS(v_mov.qty);
  ELSIF v_mov.tipo = 'adj' THEN v_depois := GREATEST(0, v_antes - v_mov.qty);
  ELSE v_depois := v_antes;
  END IF;

  IF v_mat IS NOT NULL THEN
    UPDATE materiais SET qty = v_depois WHERE sku = v_mov.sku;
  END IF;

  INSERT INTO movimentacoes (tipo, sku, item, qty, unit, antes, depois, resp, doc, dest, at, ref_id)
  VALUES ('estorno', v_mov.sku, v_mov.item, ABS(v_mov.qty), v_mov.unit,
          v_antes, v_depois, p_resp,
          'Estorno ref. #' || p_id::TEXT, '', data_hora_agora(), p_id)
  RETURNING id INTO v_estorno_id;

  UPDATE movimentacoes SET anulada = TRUE WHERE id = p_id;

  RETURN jsonb_build_object(
    'estorno_id', v_estorno_id,
    'depois', v_depois,
    'sku', v_mov.sku
  );
END;
$$;

-- ── Inserir config padrão ─────────────────────────────────────

INSERT INTO config (id, data) VALUES (1, '{}') ON CONFLICT DO NOTHING;
