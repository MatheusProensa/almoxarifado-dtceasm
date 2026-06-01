/* ============================================================================
   Screens.jsx — telas dedicadas: Entrada, Saída, Histórico, Relatórios
   ========================================================================== */

const HOJE_ISO = "2026-05-31";
function brToDate(s) { // "31/05/2026 14:38" -> Date
  const [d, t] = s.split(" ");
  const [dd, mm, yy] = d.split("/").map(Number);
  const [hh, mi] = (t || "00:00").split(":").map(Number);
  return new Date(yy, mm - 1, dd, hh || 0, mi || 0);
}
function isoToBR(iso) { const [y, m, d] = iso.split("-"); return `${d}/${m}/${y}`; }

/* ===========================================================================
   Entrada / Saída — tela dedicada (mesmo componente, tipo controla)
   ========================================================================= */
function MovementScreen({ tipo: tipoProp, materiais, onSubmit, onAdjust }) {
  const [tipo, setTipo] = React.useState(tipoProp);
  React.useEffect(() => { setTipo(tipoProp); }, [tipoProp]);
  const isIn = tipo === "in", isAdj = tipo === "adj";
  const t = MOVTYPE[tipo];
  const HEAD = { in: { c: "var(--ok-500)", icon: "ArrowDownToLine", title: "Entrada de material", desc: "Registrar o recebimento de materiais — aumenta o estoque." }, out: { c: "#F59E0B", icon: "ArrowUpFromLine", title: "Saída de material", desc: "Registrar a retirada de materiais — reduz o estoque." }, adj: { c: "#6E5BE0", icon: "SlidersHorizontal", title: "Ajuste de estoque", desc: "Corrigir o saldo do material (inventário / correção)." } }[tipo];
  const [sku, setSku] = React.useState("");
  const [qty, setQty] = React.useState("");
  const [novo, setNovo] = React.useState("");
  const [motivo, setMotivo] = React.useState("Inventário");
  const [resp, setResp] = React.useState("");
  const [dest, setDest] = React.useState("");
  const [doc, setDoc] = React.useState("");
  const [data, setData] = React.useState(HOJE_ISO);
  const [obs, setObs] = React.useState("");
  const mat = materiais.find(m => m.sku === sku);
  const n = parseInt(qty, 10) || 0;
  const semSaldo = tipo === "out" && mat && n > mat.qty;
  const diff = isAdj && mat && novo !== "" ? (parseInt(novo, 10) - mat.qty) : null;
  const ready = isAdj ? (sku && novo !== "" && !isNaN(parseInt(novo, 10)) && resp) : (sku && n > 0 && resp && data && (isIn || dest) && !semSaldo);

  const reset = () => { setSku(""); setQty(""); setNovo(""); setDest(""); setDoc(""); setObs(""); setData(HOJE_ISO); setMotivo("Inventário"); };
  const confirm = () => { if (isAdj) onAdjust({ sku, novo: parseInt(novo, 10), motivo }); else onSubmit({ tipo, sku, qty: n, resp, doc: isIn ? doc : dest, dest, obs, at: isoToBR(data) }); reset(); };

  return (
    <div className="view-enter" style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ width: 48, height: 48, borderRadius: "var(--r-md)", display: "grid", placeItems: "center", background: HEAD.c, color: "#fff", boxShadow: `0 8px 18px -8px ${HEAD.c}` }}>
          <Icon name={HEAD.icon} size={24} stroke={2.2} />
        </span>
        <div>
          <h2 style={{ font: "700 24px/1.1 var(--font-sans)", letterSpacing: "-0.025em", color: "var(--fg-1)" }}>{HEAD.title}</h2>
          <p style={{ font: "400 13.5px/1.4 var(--font-sans)", color: "var(--fg-3)", marginTop: 5 }}>{HEAD.desc}</p>
        </div>
      </div>

      <Card pad={22}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <MField label="1 · Buscar e selecionar o material" required>
            <MaterialPicker materiais={materiais} value={sku} onChange={setSku} />
          </MField>

          {mat && (
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 15px", background: "var(--bg-inset)", border: "1px solid var(--line-1)", borderRadius: "var(--r-md)" }}>
              <span style={{ width: 38, height: 38, borderRadius: "var(--r-sm)", display: "grid", placeItems: "center", background: `color-mix(in srgb, ${CATEGORIAS[mat.cat].color} 14%, transparent)`, color: CATEGORIAS[mat.cat].color }}>
                <Icon name={CATEGORIAS[mat.cat].icon} size={18} />
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ font: "600 13.5px/1.2 var(--font-sans)", color: "var(--fg-1)" }}>{mat.name}</div>
                <div style={{ font: "500 11.5px/1 var(--font-sans)", color: "var(--fg-3)", marginTop: 4 }}>{CATEGORIAS[mat.cat].label} · Local {mat.loc}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ font: "700 18px/1 var(--font-sans)", color: STATUS[mat.status].color }}>{mat.qty} <span style={{ font: "500 11px/1 var(--font-sans)", color: "var(--fg-3)" }}>{mat.unit}</span></div>
                <div style={{ marginTop: 6 }}><StatusPill status={mat.status} /></div>
              </div>
            </div>
          )}

          <div style={{ height: 1, background: "var(--line-1)" }} />

          {isAdj ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <MField label="Saldo atual">
                  <div style={{ height: 40, display: "flex", alignItems: "center", padding: "0 12px", background: "var(--bg-inset)", border: "1px solid var(--line-1)", borderRadius: "var(--r-sm)", font: "600 14px/1 var(--font-sans)", color: "var(--fg-1)" }}>{mat ? `${mat.qty} ${mat.unit}` : "—"}</div>
                </MField>
                <MField label="2 · Novo saldo" required hint={mat ? `Em ${mat.unit}` : null}>
                  <MText value={novo} onChange={setNovo} placeholder={mat ? String(mat.qty) : "0"} type="number" />
                </MField>
              </div>
              {diff != null && diff !== 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, font: "600 12.5px/1 var(--font-sans)", color: diff > 0 ? "var(--ok-500)" : "var(--warn-500)" }}>
                  <Icon name={diff > 0 ? "TrendingUp" : "TrendingDown"} size={15} />Ajuste de {diff > 0 ? "+" : ""}{diff} {mat.unit} será registrado no histórico
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <MField label="Responsável" required>
                  <MSelect value={resp} placeholder="Selecione" onChange={setResp} options={RESPONSAVEIS.map(r => ({ value: r.name, label: r.name }))} />
                </MField>
                <MField label="Motivo do ajuste">
                  <MSelect value={motivo} placeholder="Selecione" onChange={setMotivo} options={["Inventário", "Correção de cadastro", "Perda / avaria", "Devolução"].map(m => ({ value: m, label: m }))} />
                </MField>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <MField label={isIn ? "2 · Quantidade recebida" : "2 · Quantidade retirada"} required hint={mat ? `Em ${mat.unit}` : null}>
                  <MText value={qty} onChange={setQty} placeholder="0" type="number" />
                </MField>
                <MField label="Data" required>
                  <input type="date" value={data} max={HOJE_ISO} onChange={e => setData(e.target.value)}
                    style={{ height: 40, padding: "0 12px", width: "100%", background: "var(--bg-2)", border: "1px solid var(--line-2)", borderRadius: "var(--r-sm)", color: "var(--fg-1)", font: "500 13.5px/1 var(--font-sans)", outline: "none", colorScheme: "light" }} />
                </MField>
              </div>
              {semSaldo && (
                <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 14px", background: "var(--danger-tint)", border: "1px solid color-mix(in srgb, var(--danger-500) 35%, transparent)", borderRadius: "var(--r-sm)" }}>
                  <Icon name="TriangleAlert" size={19} style={{ color: "var(--danger-500)", flexShrink: 0 }} />
                  <span style={{ font: "500 12.5px/1.4 var(--font-sans)", color: "var(--danger-500)" }}>Quantidade maior que o saldo disponível (<b>{mat.qty} {mat.unit}</b>). Reduza a quantidade ou registre uma entrada antes.</span>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {isIn
                  ? <MField label="Responsável" required><MSelect value={resp} placeholder="Selecione" onChange={setResp} options={RESPONSAVEIS.map(r => ({ value: r.name, label: r.name }))} /></MField>
                  : <MField label="Militar (quem retirou)" required><MText value={resp} onChange={setResp} placeholder="Nome do militar" /></MField>}
                {isIn
                  ? <MField label="Documento" hint="GFM / GMM"><MText value={doc} onChange={setDoc} placeholder="GFM/GMM nº 0000" /></MField>
                  : <MField label="Destino / setor" required>
                      <MSelect value={dest} placeholder="Selecione o setor" onChange={setDest} options={SETORES.map(s => ({ value: s, label: s }))} />
                    </MField>}
              </div>
            </>
          )}

          <MField label="Observações">
            <textarea value={obs} onChange={e => setObs(e.target.value)} rows={2} placeholder="Informações adicionais (opcional)…"
              style={{ width: "100%", padding: "10px 12px", background: "var(--bg-2)", border: "1px solid var(--line-2)", borderRadius: "var(--r-sm)", color: "var(--fg-1)", font: "500 13px/1.45 var(--font-sans)", outline: "none", resize: "vertical" }} />
          </MField>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--line-1)" }}>
          <Button variant="ghost" onClick={reset}>Limpar</Button>
          <Button variant={isIn || isAdj ? "primary" : "gold"} size="lg" icon={HEAD.icon} disabled={!ready} onClick={confirm}>
            {isAdj ? "Confirmar ajuste" : isIn ? "Confirmar entrada" : "Confirmar saída"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

/* ===========================================================================
   Histórico de movimentações (tabela com filtros + saldo ant/final)
   ========================================================================= */
function Historico({ movs, initialTab = "all" }) {
  const [tipo, setTipo] = React.useState(initialTab);
  React.useEffect(() => { setTipo(initialTab); }, [initialTab]);
  const [resp, setResp] = React.useState("");
  const [q, setQ] = React.useState("");
  const [per, setPer] = React.useState("all");

  const ref = brToDate("31/05/2026 23:59");
  const dias = { "15d": 15, "1m": 30, "3m": 90, "1a": 365 }[per];
  const rows = movs.filter(m => {
    if (tipo !== "all" && m.tipo !== tipo) return false;
    if (resp && m.resp !== resp) return false;
    if (q) { const s = q.toLowerCase(); if (!m.item.toLowerCase().includes(s) && !m.sku.toLowerCase().includes(s)) return false; }
    if (dias) { const diff = (ref - brToDate(m.at)) / 86400000; if (diff > dias) return false; }
    return true;
  });

  const exportCSV = () => {
    const head = ["Data", "Tipo", "Material", "Quantidade", "Saldo anterior", "Saldo final", "Responsavel", "Documento/Destino"];
    const lines = rows.map(m => [m.at, MOVTYPE[m.tipo].label, m.item, m.qty, m.antes ?? "", m.depois ?? "", m.resp, m.dest || m.doc || ""]);
    downloadCSV("historico-movimentacoes", [head, ...lines]);
  };

  return (
    <div className="view-enter" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ font: "700 24px/1.1 var(--font-sans)", letterSpacing: "-0.025em", color: "var(--fg-1)" }}>Histórico de movimentações</h2>
          <p style={{ font: "400 13.5px/1.4 var(--font-sans)", color: "var(--fg-3)", marginTop: 5 }}>Entradas, saídas e ajustes — com saldo anterior e final de cada lançamento.</p>
        </div>
        <Button variant="secondary" icon="Download" onClick={exportCSV}>Exportar CSV</Button>
      </div>

      {/* filtros */}
      <Card pad={14}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: "1 1 240px", minWidth: 200 }}>
            <Input icon="Search" placeholder="Buscar material ou código…" value={q} onChange={setQ} full />
          </div>
          <Segmented options={[
            { value: "all", label: "Tudo" }, { value: "in", label: "Entradas" },
            { value: "out", label: "Saídas" }, { value: "adj", label: "Ajustes" },
          ]} value={tipo} onChange={setTipo} />
          <div style={{ width: 180 }}>
            <MSelect value={resp} placeholder="Todos responsáveis" onChange={setResp}
              options={[{ value: "", label: "Todos responsáveis" }, ...RESPONSAVEIS.map(r => ({ value: r.name, label: r.name }))]} />
          </div>
          <div style={{ width: 160 }}>
            <MSelect value={per} placeholder="Período" onChange={setPer} options={[
              { value: "all", label: "Todo período" }, { value: "15d", label: "Últimos 15 dias" },
              { value: "1m", label: "Último mês" }, { value: "3m", label: "Últimos 3 meses" }, { value: "1a", label: "Último ano" },
            ]} />
          </div>
        </div>
      </Card>

      <Card pad={0}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
            <thead>
              <tr>
                <HTh style={{ paddingLeft: 20 }}>Data</HTh><HTh>Tipo</HTh><HTh>Material</HTh>
                <HTh align="right">Qtde</HTh><HTh align="right">Saldo ant.</HTh><HTh align="right">Saldo final</HTh>
                <HTh>Responsável</HTh><HTh style={{ paddingRight: 20 }}>Doc/Destino</HTh>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0
                ? <tr><td colSpan={8}><div style={{ padding: 40, textAlign: "center", color: "var(--fg-3)", font: "400 13px var(--font-sans)" }}>Nenhuma movimentação para os filtros selecionados.</div></td></tr>
                : rows.map(m => {
                  const t = MOVTYPE[m.tipo];
                  return (
                    <tr key={m.id} className="rowh">
                      <HTd style={{ paddingLeft: 20 }}><span style={{ font: "500 12px/1 var(--font-sans)", color: "var(--fg-2)", whiteSpace: "nowrap" }}>{m.at}</span></HTd>
                      <HTd><span style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 22, padding: "0 9px", borderRadius: "var(--r-xs)", background: t.tint, color: t.color, font: "600 11.5px/1 var(--font-sans)", border: "1px solid color-mix(in srgb, currentColor 20%, transparent)" }}><Icon name={t.icon} size={12} stroke={2.3} />{t.label}</span></HTd>
                      <HTd><div style={{ font: "600 12.5px/1.2 var(--font-sans)", color: "var(--fg-1)" }}>{m.item}</div></HTd>
                      <HTd align="right"><span style={{ font: "600 13px/1 var(--font-sans)", color: t.color }}>{t.sign}{Math.abs(m.qty)} <span style={{ color: "var(--fg-4)", fontWeight: 500 }}>{m.unit}</span></span></HTd>
                      <HTd align="right"><span style={{ font: "500 12.5px/1 var(--font-sans)", color: "var(--fg-3)" }}>{m.antes ?? "—"}</span></HTd>
                      <HTd align="right"><span style={{ font: "600 12.5px/1 var(--font-sans)", color: "var(--fg-1)" }}>{m.depois ?? "—"}</span></HTd>
                      <HTd><span style={{ font: "500 12px/1 var(--font-sans)", color: "var(--fg-2)" }}>{m.resp}</span></HTd>
                      <HTd style={{ paddingRight: 20 }}><span style={{ font: "500 11.5px/1 var(--font-sans)", color: "var(--fg-3)" }}>{m.dest || m.doc || "—"}</span></HTd>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--line-1)", font: "500 12px/1 var(--font-sans)", color: "var(--fg-3)" }}>{rows.length} lançamento(s)</div>
      </Card>
    </div>
  );
}
function HTh({ children, align = "left", style = {} }) { return <th style={{ textAlign: align, padding: "11px 12px", font: "600 11px/1 var(--font-sans)", letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--fg-3)", borderBottom: "1px solid var(--line-1)", whiteSpace: "nowrap", background: "var(--bg-inset)", ...style }}>{children}</th>; }
function HTd({ children, align = "left", style = {} }) { return <td style={{ textAlign: align, padding: "12px", borderBottom: "1px solid var(--line-1)", verticalAlign: "middle", ...style }}>{children}</td>; }

/* ===========================================================================
   Relatórios — período + resumo + gráficos + exportação
   ========================================================================= */
function Relatorios({ materiais, movs, alertas }) {
  const [per, setPer] = React.useState("1m");
  const [ini, setIni] = React.useState("2026-05-01");
  const [fim, setFim] = React.useState(HOJE_ISO);
  const toast = useToast();

  const ref = brToDate("31/05/2026 23:59");
  const dias = { "15d": 15, "1m": 30, "3m": 90, "1a": 365 }[per];
  const inPeriodo = (m) => {
    const d = brToDate(m.at);
    if (per === "custom") return d >= new Date(ini) && d <= new Date(fim + "T23:59");
    if (!dias) return true;
    return (ref - d) / 86400000 <= dias;
  };
  const [matFilter, setMatFilter] = React.useState("");
  const movP = movs.filter(inPeriodo);
  const matObj = materiais.find(m => m.sku === matFilter);
  const movsMat = movP.filter(m => m.sku === matFilter);
  const matIn = movsMat.filter(m => m.tipo === "in").reduce((s, m) => s + Math.abs(m.qty), 0);
  const matOut = movsMat.filter(m => m.tipo === "out").reduce((s, m) => s + Math.abs(m.qty), 0);
  const matAdj = movsMat.filter(m => m.tipo === "adj").length;
  const [tipoF, setTipoF] = React.useState("all");
  const [catF, setCatF] = React.useState("");
  const [setorF, setSetorF] = React.useState("");
  const [respF, setRespF] = React.useState("");
  const [docF, setDocF] = React.useState("");
  const skuCat = {}; materiais.forEach(m => { skuCat[m.sku] = m.cat; });
  const movF = movP.filter(m => {
    if (matFilter && m.sku !== matFilter) return false;
    if (tipoF !== "all" && m.tipo !== tipoF) return false;
    if (catF && skuCat[m.sku] !== catF) return false;
    if (setorF && m.dest !== setorF) return false;
    if (respF && !String(m.resp || "").toLowerCase().includes(respF.toLowerCase())) return false;
    if (docF && !String(m.doc || "").toLowerCase().includes(docF.toLowerCase())) return false;
    return true;
  });
  const fIn = movF.filter(m => m.tipo === "in").reduce((s, m) => s + Math.abs(m.qty), 0);
  const fOut = movF.filter(m => m.tipo === "out").reduce((s, m) => s + Math.abs(m.qty), 0);
  const fAdj = movF.filter(m => m.tipo === "adj").length;
  const anyFilter = !!(matFilter || tipoF !== "all" || catF || setorF || respF || docF);
  const filterDesc = [matObj && ("Material: " + matObj.name), tipoF !== "all" && ("Tipo: " + MOVTYPE[tipoF].label), catF && ("Categoria: " + CATEGORIAS[catF].label), setorF && ("Seção/setor: " + setorF), respF && ("Responsável: " + respF), docF && ("Documento: " + docF)].filter(Boolean).join("  ·  ");

  const estoqueAtual = materiais.reduce((s, m) => s + m.qty, 0);
  const entradasP = movP.filter(m => m.tipo === "in").reduce((s, m) => s + Math.abs(m.qty), 0);
  const saidasP = movP.filter(m => m.tipo === "out").reduce((s, m) => s + Math.abs(m.qty), 0);
  const ajustesP = movP.filter(m => m.tipo === "adj").length;
  const baixa = materiais.filter(m => m.status === "baixa").length;
  const crit = materiais.filter(m => m.status === "crit").length;
  const zero = materiais.filter(m => m.status === "zero").length;
  const perLabel = { "15d": "Últimos 15 dias", "1m": "Último mês", "3m": "Últimos 3 meses", "1a": "Último ano", custom: `${isoToBR(ini)} a ${isoToBR(fim)}` }[per];

  const exportCSV = () => {
    const head = ["Data", "Tipo", "Material", "Categoria", "Quantidade", "Saldo final", "Responsavel", "Documento/Destino"];
    const lines = movF.map(m => [m.at, MOVTYPE[m.tipo].label, m.item, (CATEGORIAS[skuCat[m.sku]] || {}).label || "", m.qty, m.depois ?? "", m.resp, m.dest || m.doc || ""]);
    downloadCSV("relatorio-movimentacoes", [head, ...lines]);
    toast({ title: "Relatório exportado", desc: movF.length + " movimentações no CSV", tone: "success" });
  };
  const exportPDF = () => { toast({ title: "Gerando PDF", desc: "Na janela de impressão, escolha “Salvar como PDF”.", tone: "info" }); setTimeout(() => window.print(), 350); };

  const tiles = [
    { label: "Materiais cadastrados", value: materiais.length, icon: "Boxes", color: "var(--brand-600)" },
    { label: "Estoque atual", value: estoqueAtual, icon: "Package", color: "var(--brand-600)" },
    { label: "Entradas no período", value: entradasP, icon: "ArrowDownToLine", color: "var(--ok-500)" },
    { label: "Saídas no período", value: saidasP, icon: "ArrowUpFromLine", color: "#F59E0B" },
    { label: "Ajustes no período", value: ajustesP, icon: "SlidersHorizontal", color: "#6E5BE0" },
    { label: "Em atenção", value: baixa, icon: "TrendingDown", color: "var(--warn-500)" },
    { label: "Críticos", value: crit, icon: "TriangleAlert", color: "var(--crit-500)" },
    { label: "Zerados", value: zero, icon: "Ban", color: "var(--danger-500)" },
  ];

  return (
    <div className="view-enter" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ font: "700 24px/1.1 var(--font-sans)", letterSpacing: "-0.025em", color: "var(--fg-1)" }}>Relatórios</h2>
          <p style={{ font: "400 13.5px/1.4 var(--font-sans)", color: "var(--fg-3)", marginTop: 5 }}>Estoque e movimentações por período · gerado em 31/05/2026.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Button variant="secondary" icon="Download" onClick={exportCSV}>Exportar CSV</Button>
          <Button variant="primary" icon="FileDown" onClick={exportPDF}>Exportar PDF</Button>
        </div>
      </div>

      {/* período */}
      <Card pad={16}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <span style={{ font: "600 12.5px/1 var(--font-sans)", color: "var(--fg-2)" }}>Período</span>
          <Segmented options={[
            { value: "15d", label: "15 dias" }, { value: "1m", label: "1 mês" }, { value: "3m", label: "3 meses" },
            { value: "1a", label: "1 ano" }, { value: "custom", label: "Personalizado" },
          ]} value={per} onChange={setPer} />
          {per === "custom" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="date" value={ini} max={fim} onChange={e => setIni(e.target.value)} style={dateStyle} />
              <span style={{ color: "var(--fg-3)" }}>até</span>
              <input type="date" value={fim} max={HOJE_ISO} onChange={e => setFim(e.target.value)} style={dateStyle} />
            </div>
          )}
          <span style={{ marginLeft: "auto", font: "500 12px/1 var(--font-sans)", color: "var(--fg-3)" }}>{perLabel}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line-1)" }}>
          <FField label="Material"><MaterialPicker materiais={materiais} value={matFilter} onChange={setMatFilter} placeholder="Todos os materiais" /></FField>
          <FField label="Tipo de movimentação"><MSelect value={tipoF} placeholder="Todos" onChange={setTipoF} options={[{ value: "all", label: "Todos os tipos" }, { value: "in", label: "Entradas" }, { value: "out", label: "Saídas" }, { value: "adj", label: "Ajustes" }]} /></FField>
          <FField label="Categoria"><MSelect value={catF} placeholder="Todas" onChange={setCatF} options={[{ value: "", label: "Todas as categorias" }, ...Object.entries(CATEGORIAS).map(([k, c]) => ({ value: k, label: c.label }))]} /></FField>
          <FField label="Seção / setor (saídas)"><MSelect value={setorF} placeholder="Todos" onChange={setSetorF} options={[{ value: "", label: "Todos os setores" }, ...SETORES.map(s => ({ value: s, label: s }))]} /></FField>
          <FField label="Militar (quem retirou)"><MText value={respF} onChange={setRespF} placeholder="Digite o nome do militar…" /></FField>
          <FField label="Documento (GFM / RM)"><MText value={docF} onChange={setDocF} placeholder="Ex.: GFM 2210" /></FField>
        </div>
        {anyFilter && <div style={{ marginTop: 12 }}><Button variant="ghost" size="sm" icon="X" onClick={() => { setMatFilter(""); setTipoF("all"); setCatF(""); setSetorF(""); setRespF(""); setDocF(""); }}>Limpar todos os filtros</Button></div>}
      </Card>

      {/* resultado filtrado */}
      {anyFilter && (
        <Card pad={20} style={{ borderColor: "color-mix(in srgb, var(--brand-600) 30%, var(--line-1))" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ font: "700 16px/1.2 var(--font-sans)", color: "var(--fg-1)" }}>Movimentações filtradas <span style={{ color: "var(--fg-3)", fontWeight: 600 }}>({movF.length})</span></h3>
              {filterDesc && <p style={{ font: "400 12px/1.5 var(--font-sans)", color: "var(--fg-3)", marginTop: 6 }}>{filterDesc}</p>}
            </div>
            <div style={{ display: "flex", gap: 18 }}>
              <FSum label="Entradas" v={`+${fIn}`} c="var(--ok-500)" />
              <FSum label="Saídas" v={`−${fOut}`} c="#F59E0B" />
              <FSum label="Ajustes" v={fAdj} c="#6E5BE0" />
            </div>
          </div>
          {movF.length === 0
            ? <div style={{ padding: "10px 0", font: "400 12.5px/1.4 var(--font-sans)", color: "var(--fg-3)" }}>Nenhuma movimentação para os filtros selecionados.</div>
            : <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", minWidth: 660 }}>
                <thead><tr><HTh style={{ paddingLeft: 0 }}>Data</HTh><HTh>Tipo</HTh><HTh>Material</HTh><HTh align="right">Qtde</HTh><HTh align="right">Saldo final</HTh><HTh>Responsável</HTh><HTh style={{ paddingRight: 0 }}>Doc/Destino</HTh></tr></thead>
                <tbody>{movF.map(mv => { const t = MOVTYPE[mv.tipo]; return (
                  <tr key={mv.id} className="rowh">
                    <HTd style={{ paddingLeft: 0 }}><span style={{ font: "500 12px/1 var(--font-sans)", color: "var(--fg-2)", whiteSpace: "nowrap" }}>{mv.at}</span></HTd>
                    <HTd><span style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 22, padding: "0 9px", borderRadius: "var(--r-xs)", background: t.tint, color: t.color, font: "600 11.5px/1 var(--font-sans)", border: "1px solid color-mix(in srgb, currentColor 20%, transparent)" }}>{t.label}</span></HTd>
                    <HTd><span style={{ font: "500 12.5px/1.2 var(--font-sans)", color: "var(--fg-1)" }}>{mv.item}</span></HTd>
                    <HTd align="right"><span style={{ font: "600 12.5px/1 var(--font-sans)", color: t.color }}>{t.sign}{Math.abs(mv.qty)} {mv.unit}</span></HTd>
                    <HTd align="right"><span style={{ font: "500 12px/1 var(--font-sans)", color: "var(--fg-2)" }}>{mv.depois ?? "—"}</span></HTd>
                    <HTd><span style={{ font: "500 12px/1 var(--font-sans)", color: "var(--fg-2)" }}>{mv.resp}</span></HTd>
                    <HTd style={{ paddingRight: 0 }}><span style={{ font: "500 11.5px/1 var(--font-sans)", color: "var(--fg-3)" }}>{mv.dest || mv.doc || "—"}</span></HTd>
                  </tr>); })}</tbody>
              </table></div>}
        </Card>
      )}

      {/* resumo */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {tiles.map((t, i) => (
          <Card key={i} pad={16}>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <span style={{ width: 38, height: 38, borderRadius: "var(--r-sm)", display: "grid", placeItems: "center", background: `color-mix(in srgb, ${t.color} 14%, transparent)`, color: t.color, flexShrink: 0 }}>
                <Icon name={t.icon} size={18} stroke={2.1} />
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ font: "700 22px/1 var(--font-sans)", color: "var(--fg-1)", letterSpacing: "-0.02em" }}>{t.value.toLocaleString("pt-BR")}</div>
                <div style={{ font: "500 11.5px/1.2 var(--font-sans)", color: "var(--fg-3)", marginTop: 5 }}>{t.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* gráficos */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16, alignItems: "start" }}>
        <Card pad={20}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <h3 style={{ font: "700 15px/1.2 var(--font-sans)", color: "var(--fg-1)" }}>Entradas vs. saídas</h3>
            <div style={{ display: "flex", gap: 14 }}>
              <Lg dot="var(--ok-500)" label="Entradas" /><Lg dot="var(--warn-500)" label="Saídas" />
            </div>
          </div>
          <FlowChart serie={SERIE} height={230} />
        </Card>
        <Card pad={20}>
          <h3 style={{ font: "700 15px/1.2 var(--font-sans)", color: "var(--fg-1)", marginBottom: 16 }}>Categorias com maior movimentação</h3>
          <HBarRank data={MOV_CATEGORIA} color="var(--brand-500)" unit="un" />
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
        <Card pad={20}>
          <h3 style={{ font: "700 15px/1.2 var(--font-sans)", color: "var(--fg-1)", marginBottom: 16 }}>Produtos com menor estoque</h3>
          <HBarRank data={menorEstoque(materiais).map(m => ({ name: m.name, value: m.qty }))} color="var(--crit-500)" unit="" />
        </Card>
        <Card pad={20}>
          <h3 style={{ font: "700 15px/1.2 var(--font-sans)", color: "var(--fg-1)", marginBottom: 16 }}>Materiais mais retirados</h3>
          <HBarRank data={MAIS_USADOS} color="#F59E0B" unit="un" />
        </Card>
      </div>
      {ReactDOM.createPortal(<ReportSheet materiais={materiais} movP={anyFilter ? movF : movP} perLabel={perLabel} entradasP={entradasP} saidasP={saidasP} ajustesP={ajustesP} filterDesc={anyFilter ? filterDesc : ""} />, document.body)}
    </div>
  );
}

/* ---- Folha de relatório para impressão / PDF ----------------------------- */
function ReportSheet({ materiais, movP, perLabel, entradasP, saidasP, ajustesP, filterDesc }) {
  const estoque = materiais.reduce((s, m) => s + m.qty, 0);
  const nBaixa = materiais.filter(m => m.status === "baixa").length;
  const nCrit = materiais.filter(m => m.status === "crit").length;
  const nZero = materiais.filter(m => m.status === "zero").length;
  const repor = alertasFrom(materiais);
  const STC = { zero: { l: "Zerado", c: "#C0271F" }, crit: { l: "Crítico", c: "#C75300" }, baixa: { l: "Atenção", c: "#8A6D00" }, ok: { l: "Normal", c: "#0E7A52" } };
  const ink = "#1a2433", mut = "#5a6675", line = "#d8dee6", brand = "#006BB5";
  const th = { textAlign: "left", padding: "7px 9px", font: "700 9.5px/1.2 var(--font-sans)", letterSpacing: "0.04em", textTransform: "uppercase", color: mut, borderBottom: "1.5px solid " + line };
  const td = { padding: "7px 9px", font: "400 11px/1.3 var(--font-sans)", color: ink, borderBottom: "1px solid #eef1f4" };
  const box = { flex: 1, border: "1px solid " + line, borderRadius: 7, padding: "11px 13px" };
  const Stat = (n, l, c) => (
    <div style={box}><div style={{ font: "700 21px/1 var(--font-sans)", color: c || ink }}>{n}</div><div style={{ font: "500 9.5px/1.2 var(--font-sans)", color: mut, marginTop: 5 }}>{l}</div></div>
  );
  return (
    <div id="print-report" style={{ width: "100%", padding: 0, background: "#fff", color: ink, fontFamily: "var(--font-sans)" }}>
      {/* cabeçalho */}
      <div style={{ paddingBottom: 12, borderBottom: "2px solid " + brand }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img src="/assets/dtcea-sm-logo.png" alt="" style={{ width: 44, height: 52, objectFit: "contain" }} />
          <div style={{ flex: 1 }}>
            <div style={{ font: "800 14px/1.25 var(--font-sans)", letterSpacing: "-0.01em", color: ink }}>DTCEA-SM — Destacamento de Controle do Espaço Aéreo de Santa Maria</div>
            <div style={{ font: "600 9.5px/1.3 var(--font-sans)", color: mut, letterSpacing: "0.05em", marginTop: 5 }}>CINDACTA II · SEÇÃO DE SUPRIMENTO · ALMOXARIFADO</div>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 14 }}>
          <div style={{ font: "800 15px/1.2 var(--font-sans)", color: brand, letterSpacing: "0.03em" }}>RELATÓRIO DE MOVIMENTO DE ESTOQUE</div>
          <div style={{ font: "500 10px/1.4 var(--font-sans)", color: mut, marginTop: 6 }}>Período: {perLabel} · Gerado em 31/05/2026</div>
          {filterDesc && <div style={{ font: "600 9.5px/1.4 var(--font-sans)", color: brand, marginTop: 5 }}>Filtros aplicados — {filterDesc}</div>}
        </div>
      </div>

      {/* totais do relatório */}
      <div style={{ display: "flex", gap: 26, padding: "12px 0", borderBottom: "1px solid " + line, marginBottom: 2 }}>
        {[["Entradas", "+" + movP.filter(m => m.tipo === "in").reduce((s, m) => s + Math.abs(m.qty), 0), "#0E7A52"], ["Saídas", "−" + movP.filter(m => m.tipo === "out").reduce((s, m) => s + Math.abs(m.qty), 0), "#C75300"], ["Ajustes", movP.filter(m => m.tipo === "adj").length, "#5a4ec2"], ["Lançamentos", movP.length, ink]].map(([l, v, c], i) => (
          <div key={i}><span style={{ font: "700 16px/1 var(--font-sans)", color: c }}>{v}</span> <span style={{ font: "500 10px/1 var(--font-sans)", color: mut }}>{l}</span></div>
        ))}
      </div>

      {/* reposição (só no relatório geral, sem filtros) */}
      {!filterDesc && (<>
      <div style={{ font: "700 11px/1 var(--font-sans)", color: ink, margin: "18px 0 6px" }}>Itens que precisam de reposição ({repor.length})</div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr><th style={th}>Material</th><th style={th}>Categoria</th><th style={{ ...th, textAlign: "right" }}>Atual</th><th style={{ ...th, textAlign: "right" }}>Mínimo</th><th style={th}>Status</th><th style={th}>Local</th></tr></thead>
        <tbody>
          {repor.map((m, i) => (
            <tr key={m.id} style={{ background: i % 2 ? "#f6f8fb" : "#fff", breakInside: "avoid" }}>
              <td style={td}>{m.name}</td>
              <td style={{ ...td, color: mut }}>{CATEGORIAS[m.cat].label}</td>
              <td style={{ ...td, textAlign: "right", fontWeight: 700, color: STC[m.status].c }}>{m.qty} {m.unit}</td>
              <td style={{ ...td, textAlign: "right", color: mut }}>{m.min} {m.unit}</td>
              <td style={{ ...td, fontWeight: 700, color: STC[m.status].c }}>{STC[m.status].l}</td>
              <td style={{ ...td, color: mut }}>{m.loc}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </>)}

      {/* movimentações */}
      <div style={{ font: "700 11px/1 var(--font-sans)", color: ink, margin: "18px 0 6px" }}>{filterDesc ? "Movimentações filtradas" : "Movimentações do período"} ({movP.length})</div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr><th style={th}>Data</th><th style={th}>Tipo</th><th style={th}>Material</th><th style={{ ...th, textAlign: "right" }}>Qtde</th><th style={{ ...th, textAlign: "right" }}>Saldo final</th><th style={th}>Responsável</th><th style={th}>Doc/Destino</th></tr></thead>
        <tbody>
          {movP.map((mv, i) => { const t = MOVTYPE[mv.tipo]; return (
            <tr key={mv.id} style={{ background: i % 2 ? "#f6f8fb" : "#fff", breakInside: "avoid" }}>
              <td style={{ ...td, whiteSpace: "nowrap" }}>{mv.at}</td>
              <td style={{ ...td, fontWeight: 600 }}>{t.label}</td>
              <td style={td}>{mv.item}</td>
              <td style={{ ...td, textAlign: "right", fontWeight: 700 }}>{t.sign}{Math.abs(mv.qty)} {mv.unit}</td>
              <td style={{ ...td, textAlign: "right" }}>{mv.depois ?? "—"}</td>
              <td style={{ ...td, color: mut }}>{mv.resp}</td>
              <td style={{ ...td, color: mut }}>{mv.dest || mv.doc || "—"}</td>
            </tr>
          ); })}
        </tbody>
      </table>

      <div style={{ marginTop: 22, paddingTop: 10, borderTop: "1px solid " + line, font: "400 8.5px/1.4 var(--font-sans)", color: mut, textAlign: "center" }}>
        Documento gerado pelo sistema de controle de almoxarifado do DTCEA-SM · CINDACTA II. Materiais recebidos via GFM/GMM (Guia de Fornecimento de Material).
      </div>
    </div>
  );
}

function FField({ label, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ font: "600 11px/1 var(--font-sans)", color: "var(--fg-2)" }}>{label}</span>
      {children}
    </label>
  );
}
function FSum({ label, v, c }) {
  return (
    <div style={{ textAlign: "right" }}>
      <div style={{ font: "700 17px/1 var(--font-sans)", color: c }}>{v}</div>
      <div style={{ font: "500 10px/1 var(--font-sans)", color: "var(--fg-3)", marginTop: 4 }}>{label}</div>
    </div>
  );
}
const dateStyle = { height: 34, padding: "0 10px", background: "var(--bg-2)", border: "1px solid var(--line-2)", borderRadius: "var(--r-sm)", color: "var(--fg-1)", font: "500 12.5px/1 var(--font-sans)", outline: "none", colorScheme: "light" };
function Lg({ dot, label }) { return <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: dot }} /><span style={{ font: "500 12px/1 var(--font-sans)", color: "var(--fg-3)" }}>{label}</span></div>; }

/* ===========================================================================
   CSV download helper
   ========================================================================= */
function downloadCSV(name, rows) {
  const csv = rows.map(r => r.map(c => {
    const s = String(c ?? "");
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }).join(";")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${name}-${HOJE_ISO}.csv`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const CAD_ICONS = ["PenLine", "SprayCan", "Droplets", "Coffee", "Trash2", "Printer", "Wrench", "HardHat", "Package", "Boxes", "Zap", "FileText", "ClipboardList", "Layers", "ScanLine", "Box"];
const CAD_COLORS = ["var(--brand-600)", "var(--ok-500)", "#1B9FB0", "#B5701A", "#6B7A90", "#6E5BE0", "#5C6F8A", "#A8506B", "var(--warn-500)", "var(--crit-500)"];
const UNID_LABELS = { un: "unidade", cx: "caixa", pct: "pacote", rm: "resma", rl: "rolo", tubo: "tubo", par: "par", kg: "quilograma", L: "litro", fd: "fardo" };

function CadRowActions({ onEdit, onDel }) {
  return (
    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
      <IconButton name="Pencil" size={15} label="Editar" onClick={onEdit} />
      <IconButton name="Trash2" size={15} label="Excluir" onClick={onDel} />
    </div>
  );
}

function Cadastros({ materiais, toast, onChange }) {
  const cats = Object.entries(CATEGORIAS).map(([id, c]) => ({ id, label: c.label, color: c.color, icon: c.icon }));
  const unids = UNIDADES.map(code => ({ id: code, code, label: (window.UNID_LABELS && window.UNID_LABELS[code]) || code }));
  const [locais, setLocais] = React.useState(() => {
    const seen = {}; materiais.forEach(m => { seen[(m.loc || "—").charAt(0)] = true; });
    return Object.keys(seen).sort().map(c => ({ id: c, code: c, desc: "Corredor " + c }));
  });
  const [editing, setEditing] = React.useState(null);
  const [f, setF] = React.useState({});
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  const catCount = id => materiais.filter(m => m.cat === id).length;
  const locCount = code => materiais.filter(m => (m.loc || "").charAt(0) === code).length;

  const openNew = type => { setF(type === "cat" ? { label: "", icon: "Package", color: CAD_COLORS[0] } : type === "unid" ? { code: "", label: "" } : { code: "", desc: "" }); setEditing({ type, item: null }); };
  const openEdit = (type, item) => { setF({ ...item }); setEditing({ type, item }); };
  const close = () => setEditing(null);

  const save = () => {
    const { type, item } = editing;
    if (type === "cat") {
      if (!f.label) return;
      if (item) Object.assign(CATEGORIAS[item.id], { label: f.label, icon: f.icon, color: f.color });
      else CATEGORIAS["cat" + Date.now()] = { label: f.label, icon: f.icon, color: f.color };
      onChange && onChange();
    } else if (type === "unid") {
      if (!f.code) return;
      if (!window.UNID_LABELS) window.UNID_LABELS = {};
      if (item) { const i = UNIDADES.indexOf(item.code); if (i >= 0) UNIDADES[i] = f.code; }
      else if (!UNIDADES.includes(f.code)) UNIDADES.push(f.code);
      window.UNID_LABELS[f.code] = f.label || f.code;
      onChange && onChange();
    } else {
      if (!f.code) return;
      const code = f.code.toUpperCase();
      if (item) setLocais(ls => ls.map(l => l.id === item.id ? { ...l, code, desc: f.desc || ("Corredor " + code) } : l));
      else setLocais(ls => [...ls, { id: "l" + Date.now(), code, desc: f.desc || ("Corredor " + code) }]);
    }
    toast({ title: item ? "Cadastro atualizado" : "Cadastro criado", tone: "success" });
    close();
  };
  const del = (type, item) => {
    if (type === "cat") {
      if (materiais.filter(m => m.cat === item.id).length > 0) { toast({ title: "Não foi possível excluir", desc: "Há materiais nesta categoria.", tone: "warn" }); return; }
      if (!window.confirm(`Excluir a categoria "${item.label}"?`)) return;
      delete CATEGORIAS[item.id]; onChange && onChange();
    } else if (type === "unid") {
      if (!window.confirm(`Excluir a unidade "${item.code}"?`)) return;
      const i = UNIDADES.indexOf(item.code); if (i >= 0) UNIDADES.splice(i, 1); onChange && onChange();
    } else {
      if (!window.confirm(`Excluir "${item.desc}"?`)) return;
      setLocais(ls => ls.filter(l => l.id !== item.id));
    }
    toast({ title: "Excluído", desc: item.label || item.desc || item.code, tone: "warn" });
  };

  const secHead = (title, desc, type) => (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
      <div><h3 style={{ font: "700 16px/1.2 var(--font-sans)", color: "var(--fg-1)" }}>{title}</h3><p style={{ font: "400 12.5px/1 var(--font-sans)", color: "var(--fg-3)", marginTop: 5 }}>{desc}</p></div>
      <Button variant="secondary" size="sm" icon="Plus" onClick={() => openNew(type)}>Adicionar</Button>
    </div>
  );

  return (
    <div className="view-enter" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h2 style={{ font: "700 24px/1.1 var(--font-sans)", letterSpacing: "-0.025em", color: "var(--fg-1)" }}>Cadastros</h2>
        <p style={{ font: "400 13.5px/1.4 var(--font-sans)", color: "var(--fg-3)", marginTop: 5 }}>Gerencie categorias, unidades de medida e locais de estoque do almoxarifado.</p>
      </div>

      {/* Categorias */}
      <Card pad={20}>
        {secHead("Categorias", "Agrupam os materiais por tipo", "cat")}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
          {cats.map(c => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, background: "var(--bg-inset)", border: "1px solid var(--line-1)", borderRadius: "var(--r-md)" }}>
              <span style={{ width: 40, height: 40, borderRadius: "var(--r-sm)", display: "grid", placeItems: "center", background: `color-mix(in srgb, ${c.color} 15%, transparent)`, color: c.color, flexShrink: 0 }}>
                <Icon name={c.icon} size={20} stroke={2} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: "600 13.5px/1.2 var(--font-sans)", color: "var(--fg-1)" }}>{c.label}</div>
                <div style={{ font: "500 11.5px/1 var(--font-sans)", color: "var(--fg-3)", marginTop: 4 }}>{catCount(c.id)} {catCount(c.id) === 1 ? "material" : "materiais"}</div>
              </div>
              <CadRowActions onEdit={() => openEdit("cat", c)} onDel={() => del("cat", c)} />
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.25fr", gap: 16, alignItems: "start" }}>
        {/* Unidades */}
        <Card pad={20}>
          {secHead("Unidades de medida", "Como cada material é contado", "unid")}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {unids.map(u => (
              <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "8px 10px 8px 12px", background: "var(--bg-inset)", border: "1px solid var(--line-1)", borderRadius: "var(--r-sm)" }}>
                <span style={{ minWidth: 40, textAlign: "center", font: "700 13px/1 var(--font-sans)", color: "var(--brand-600)", background: "var(--brand-tint)", padding: "6px 8px", borderRadius: 6 }}>{u.code}</span>
                <span style={{ flex: 1, font: "500 13px/1 var(--font-sans)", color: "var(--fg-2)", textTransform: "capitalize" }}>{u.label}</span>
                <CadRowActions onEdit={() => openEdit("unid", u)} onDel={() => del("unid", u)} />
              </div>
            ))}
          </div>
        </Card>

        {/* Locais */}
        <Card pad={20}>
          {secHead("Locais de estoque", "Corredores · padrão Corredor-Prateleira-Nível (ex.: A-01-2)", "local")}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
            {locais.map(l => (
              <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 10px 10px 13px", background: "var(--bg-inset)", border: "1px solid var(--line-1)", borderRadius: "var(--r-sm)" }}>
                <span style={{ width: 34, height: 34, borderRadius: "var(--r-sm)", display: "grid", placeItems: "center", background: "var(--bg-4)", color: "var(--fg-1)", font: "700 15px/1 var(--font-sans)", flexShrink: 0 }}>{l.code}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: "600 12.5px/1.2 var(--font-sans)", color: "var(--fg-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.desc}</div>
                  <div style={{ font: "500 11px/1 var(--font-sans)", color: "var(--fg-3)", marginTop: 3 }}>{locCount(l.code)} {locCount(l.code) === 1 ? "material" : "materiais"}</div>
                </div>
                <CadRowActions onEdit={() => openEdit("local", l)} onDel={() => del("local", l)} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Modal de edição/criação */}
      <Modal open={!!editing} onClose={close}
        icon={editing && editing.type === "cat" ? "Tags" : editing && editing.type === "unid" ? "Ruler" : "MapPin"} iconColor="var(--brand-600)"
        title={editing ? (editing.item ? "Editar " : "Adicionar ") + (editing.type === "cat" ? "categoria" : editing.type === "unid" ? "unidade" : "local") : ""}
        footer={<>
          <Button variant="ghost" onClick={close}>Cancelar</Button>
          <Button variant="primary" icon="Check" onClick={save}>Salvar</Button>
        </>}>
        {editing && editing.type === "cat" && <>
          <MField label="Nome da categoria" required><MText value={f.label || ""} onChange={v => set("label", v)} placeholder="Ex.: Material de escritório" /></MField>
          <MField label="Ícone">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 6 }}>
              {CAD_ICONS.map(ic => (
                <button key={ic} onClick={() => set("icon", ic)} style={{ height: 38, display: "grid", placeItems: "center", borderRadius: "var(--r-sm)", cursor: "pointer", border: "1px solid", borderColor: f.icon === ic ? "var(--brand-500)" : "var(--line-2)", background: f.icon === ic ? "var(--brand-tint)" : "var(--bg-2)", color: f.icon === ic ? "var(--brand-600)" : "var(--fg-2)" }}>
                  <Icon name={ic} size={17} />
                </button>
              ))}
            </div>
          </MField>
          <MField label="Cor">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {CAD_COLORS.map(col => (
                <button key={col} onClick={() => set("color", col)} style={{ width: 30, height: 30, borderRadius: "50%", cursor: "pointer", background: col, border: "2px solid", borderColor: f.color === col ? "var(--fg-1)" : "transparent", boxShadow: "0 0 0 1px var(--line-2)" }} />
              ))}
            </div>
          </MField>
        </>}
        {editing && editing.type === "unid" && <>
          <MField label="Sigla" required hint="Como aparece nas tabelas (ex.: cx, pct, kg)"><MText value={f.code || ""} onChange={v => set("code", v)} placeholder="cx" /></MField>
          <MField label="Descrição"><MText value={f.label || ""} onChange={v => set("label", v)} placeholder="caixa" /></MField>
        </>}
        {editing && editing.type === "local" && <>
          <MField label="Código do corredor" required hint="Uma letra (ex.: A, B, C…)"><MText value={f.code || ""} onChange={v => set("code", v.toUpperCase().slice(0, 2))} placeholder="A" /></MField>
          <MField label="Descrição"><MText value={f.desc || ""} onChange={v => set("desc", v)} placeholder="Corredor A — Expediente" /></MField>
        </>}
      </Modal>
    </div>
  );
}

function Configuracoes({ theme, onToggleTheme, toast, onChange, setView }) {
  const P = window.PROFILE || { name: "2S Geraldo", role: "Encarregado do almoxarifado · Seção de Suprimento", unit: "DTCEA-SM" };
  const [editP, setEditP] = React.useState(false);
  const [pf, setPf] = React.useState({ name: P.name, role: P.role });
  const savePf = () => { window.PROFILE = { ...P, name: pf.name, role: pf.role }; setEditP(false); onChange && onChange(); toast({ title: "Perfil atualizado", tone: "success" }); };
  const Sec = ({ icon, title, desc, children, color = "var(--brand-600)" }) => (
    <Card pad={20}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
        <span style={{ width: 38, height: 38, borderRadius: "var(--r-md)", display: "grid", placeItems: "center", background: `color-mix(in srgb, ${color} 14%, transparent)`, color, flexShrink: 0 }}><Icon name={icon} size={19} /></span>
        <div><h3 style={{ font: "700 16px/1.2 var(--font-sans)", color: "var(--fg-1)" }}>{title}</h3>{desc && <p style={{ font: "400 12.5px/1.3 var(--font-sans)", color: "var(--fg-3)", marginTop: 5 }}>{desc}</p>}</div>
      </div>
      {children}
    </Card>
  );
  return (
    <div className="view-enter" style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 920 }}>
      <div>
        <h2 style={{ font: "700 24px/1.1 var(--font-sans)", letterSpacing: "-0.025em", color: "var(--fg-1)" }}>Configurações</h2>
        <p style={{ font: "400 13.5px/1.4 var(--font-sans)", color: "var(--fg-3)", marginTop: 5 }}>Perfil, aparência, guia de uso e informações do sistema.</p>
      </div>

      <Sec icon="User" title="Perfil do operador" desc="Quem está usando o sistema">
        {editP ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            <MField label="Nome / posto"><MText value={pf.name} onChange={v => setPf(p => ({ ...p, name: v }))} placeholder="Ex.: 2S Geraldo" /></MField>
            <MField label="Função"><MText value={pf.role} onChange={v => setPf(p => ({ ...p, role: v }))} placeholder="Ex.: Encarregado do almoxarifado" /></MField>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <Button variant="ghost" onClick={() => { setPf({ name: P.name, role: P.role }); setEditP(false); }}>Cancelar</Button>
              <Button variant="primary" icon="Check" onClick={savePf}>Salvar alterações</Button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px", background: "var(--bg-inset)", border: "1px solid var(--line-1)", borderRadius: "var(--r-md)" }}>
            <Avatar name={P.name} size={48} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ font: "700 15px/1.2 var(--font-sans)", color: "var(--fg-1)" }}>{P.name}</div>
              <div style={{ font: "500 12.5px/1.3 var(--font-sans)", color: "var(--fg-3)", marginTop: 5 }}>{P.role}</div>
            </div>
            <Button variant="secondary" size="sm" icon="Pencil" onClick={() => { setPf({ name: P.name, role: P.role }); setEditP(true); }}>Editar perfil</Button>
          </div>
        )}
      </Sec>

      <Sec icon="BookOpen" title="Guia rápido" desc="Como usar o sistema no dia a dia" color="var(--ok-500)" >
        <Button variant="secondary" icon="BookOpen" onClick={() => setView && setView("guia")}>Abrir guia completo</Button>
      </Sec>

      <Sec icon="Info" title="Sobre o sistema" desc="Informações e versão" color="#6B7A90">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img src="/assets/dtcea-sm-logo.png" alt="" style={{ width: 40, height: 47, objectFit: "contain" }} />
          <div style={{ flex: 1, font: "400 12.5px/1.6 var(--font-sans)", color: "var(--fg-2)" }}>
            Sistema de almoxarifado e controle de estoque do <b>DTCEA-SM</b> · CINDACTA II.<br />
            Versão 1.0 · Desenvolvido por <b>Matheus Proensa</b> (Cb Proensa · ex-DTCEA-SM).
          </div>
        </div>
      </Sec>
    </div>
  );
}

function Guia({ setView }) {
  const T = [
    { id: "inicio", icon: "Compass", title: "Visão geral", lead: "O Almox Proensa controla o estoque do almoxarifado — tudo que entra, sai e o que está em falta, substituindo as planilhas.", steps: ["No Dashboard você vê o resumo: materiais cadastrados, entradas e saídas do mês e itens críticos.", "A barra lateral organiza tudo: Materiais, Entradas, Saídas, Movimentações, Alertas, Relatórios e Cadastros.", "O sino no topo avisa o que precisa de reposição."], tip: "Comece sempre pelo Dashboard — é a fotografia do estoque a qualquer momento." },
    { id: "materiais", icon: "Boxes", title: "Materiais", lead: "A lista de todos os itens cadastrados, em ordem alfabética.", steps: ["Use a busca para achar um item pelo nome ou localização.", "Filtre por status (Atenção, Crítico, Zerado) nas abas.", "Clique em “Adicionar material” para cadastrar um item novo.", "No menu “⋯” de cada linha: registrar entrada/saída, editar ou excluir.", "“Exportar” baixa a lista filtrada em CSV."], tip: "Para corrigir um saldo errado, use “Editar material” e altere o “Estoque atual” — isso registra um ajuste no histórico." },
    { id: "entrada", icon: "ArrowDownToLine", color: "var(--ok-500)", title: "Entrada de material", lead: "Use quando o material chega pela GFM/GMM.", steps: ["Abra Entradas (barra lateral) ou a ação rápida “Registrar entrada”.", "Busque e selecione o material.", "Informe a quantidade recebida e a data.", "Escolha o responsável (efetivo do Suprimento) e o documento (GFM/GMM).", "Confirme — o saldo aumenta automaticamente."] },
    { id: "saida", icon: "ArrowUpFromLine", color: "#F59E0B", title: "Saída de material", lead: "Use quando alguém retira material do estoque.", steps: ["Abra Saídas ou a ação rápida “Registrar saída”.", "Selecione o material e a quantidade retirada.", "Digite o nome do militar que retirou e o setor de destino (APP, TWR, SMST…).", "Confirme — o saldo diminui automaticamente."], tip: "Se a quantidade pedida for maior que o saldo, o sistema mostra um alerta vermelho e não deixa confirmar." },
    { id: "ajuste", icon: "SlidersHorizontal", color: "#6E5BE0", title: "Corrigir saldo (ajuste)", lead: "Para inventário, perda ou correção de contagem.", steps: ["Vá em Materiais e abra o menu “⋯” do item.", "Clique em “Editar material”.", "Altere o campo “Estoque atual” para o valor correto.", "Salve — a diferença é registrada como Ajuste no histórico."] },
    { id: "alertas", icon: "TriangleAlert", color: "var(--danger-500)", title: "Alertas", lead: "A central de avisos do que precisa de reposição.", steps: ["Vermelho = Zerado (sem saldo). Laranja = Crítico (abaixo de 50% do mínimo). Amarelo = Atenção (no limite do mínimo).", "O alerta some sozinho quando você dá entrada e o saldo passa do mínimo.", "No sino, “Marcar como lidas” limpa o número vermelho."], tip: "O alerta é consequência do estoque — não precisa fechar manualmente." },
    { id: "historico", icon: "ArrowRightLeft", title: "Movimentações", lead: "O histórico de tudo que entrou, saiu e foi ajustado.", steps: ["Filtre por tipo, responsável, material e período.", "Cada linha mostra o saldo anterior e o saldo final.", "Exporte o histórico em CSV."] },
    { id: "relatorios", icon: "FileBarChart", color: "#1B9FB0", title: "Relatórios", lead: "Gere relatórios específicos para apresentar a um superior.", steps: ["Escolha o período (15 dias, mês, 3 meses, ano ou personalizado).", "Combine filtros: material, tipo, categoria, setor e militar.", "Exporte em CSV (planilha) ou PDF (documento oficial com brasão)."], tip: "Ex.: Saídas + setor APP + categoria Expediente = exatamente o que a APP consumiu de material de escritório no período." },
    { id: "cadastros", icon: "Tags", title: "Cadastros", lead: "Organize a estrutura do almoxarifado.", steps: ["Crie, edite e exclua Categorias, Unidades de medida e Locais/Corredores.", "O que você criar aqui passa a valer em todo o sistema (ex.: no cadastro de material)."] },
    { id: "conceitos", icon: "BookMarked", title: "Conceitos", defs: [{ term: "Estoque mínimo", desc: "O limite de segurança. Quando o saldo chega nele ou abaixo, o item vira alerta." }, { term: "GFM / GMM", desc: "Guia de Fornecimento/Movimentação de Material — documento do CINDACTA II pelo qual o material chega (nomenclatura e quantidade)." }, { term: "Status", desc: "Normal · Atenção · Crítico · Zerado — calculado pelo saldo vs. estoque mínimo." }, { term: "Localização", desc: "Padrão Corredor-Prateleira-Nível (ex.: A-01-2)." }] },
    { id: "faq", icon: "CircleHelp", title: "Perguntas frequentes", faq: [{ q: "Como faço o alerta sumir?", a: "Registre uma entrada que leve o saldo acima do mínimo — o alerta some sozinho." }, { q: "Errei a contagem, como corrijo?", a: "Materiais → ⋯ → Editar material → altere o “Estoque atual”. Vira um ajuste no histórico." }, { q: "Posso desfazer uma movimentação?", a: "Lance a movimentação inversa (uma entrada para corrigir uma saída a mais, por exemplo) ou use o ajuste." }, { q: "Quem aparece como responsável?", a: "Na entrada, o efetivo do Suprimento (lista). Na saída, você digita o nome do militar que retirou." }] },
  ];
  const [sel, setSel] = React.useState("inicio");
  const cur = T.find(t => t.id === sel) || T[0];
  const accent = cur.color || "var(--brand-600)";
  return (
    <div className="view-enter" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <h2 style={{ font: "700 24px/1.1 var(--font-sans)", letterSpacing: "-0.025em", color: "var(--fg-1)" }}>Guia do sistema</h2>
        <p style={{ font: "400 13.5px/1.4 var(--font-sans)", color: "var(--fg-3)", marginTop: 5 }}>Central de ajuda — escolha um tópico no índice ao lado.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "232px 1fr", gap: 16, alignItems: "start" }}>
        <Card pad={8} style={{ position: "sticky", top: 0 }}>
          {T.map(t => {
            const on = t.id === sel;
            return (
              <button key={t.id} onClick={() => setSel(t.id)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", height: 40, padding: "0 11px", border: "none", borderRadius: "var(--r-sm)", cursor: "pointer", textAlign: "left", background: on ? "var(--brand-tint)" : "transparent", color: on ? "var(--brand-300)" : "var(--fg-2)", font: `${on ? 600 : 500} 13px/1 var(--font-sans)` }}
                onMouseEnter={e => { if (!on) e.currentTarget.style.background = "var(--bg-3)"; }} onMouseLeave={e => { if (!on) e.currentTarget.style.background = "transparent"; }}>
                <Icon name={t.icon} size={16} stroke={on ? 2.2 : 1.9} />{t.title}
              </button>
            );
          })}
        </Card>
        <Card pad={24}>
          <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 14 }}>
            <span style={{ width: 44, height: 44, borderRadius: "var(--r-md)", display: "grid", placeItems: "center", background: `color-mix(in srgb, ${accent} 14%, transparent)`, color: accent, flexShrink: 0 }}><Icon name={cur.icon} size={22} /></span>
            <h3 style={{ font: "700 19px/1.2 var(--font-sans)", color: "var(--fg-1)", letterSpacing: "-0.01em" }}>{cur.title}</h3>
          </div>
          {cur.lead && <p style={{ font: "400 14px/1.6 var(--font-sans)", color: "var(--fg-2)", marginBottom: 18 }}>{cur.lead}</p>}
          {cur.steps && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {cur.steps.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
                  <span style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, display: "grid", placeItems: "center", background: accent, color: "#fff", font: "700 12px/1 var(--font-sans)" }}>{i + 1}</span>
                  <span style={{ font: "400 13.5px/1.55 var(--font-sans)", color: "var(--fg-2)", paddingTop: 4 }}>{s}</span>
                </div>
              ))}
            </div>
          )}
          {cur.defs && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {cur.defs.map((d, i) => (
                <div key={i} style={{ padding: "13px 15px", background: "var(--bg-inset)", border: "1px solid var(--line-1)", borderRadius: "var(--r-md)" }}>
                  <div style={{ font: "700 13.5px/1.2 var(--font-sans)", color: "var(--fg-1)" }}>{d.term}</div>
                  <div style={{ font: "400 12.5px/1.55 var(--font-sans)", color: "var(--fg-3)", marginTop: 5 }}>{d.desc}</div>
                </div>
              ))}
            </div>
          )}
          {cur.faq && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {cur.faq.map((q, i) => (
                <div key={i}>
                  <div style={{ display: "flex", gap: 8, font: "600 13.5px/1.4 var(--font-sans)", color: "var(--fg-1)" }}><span style={{ color: accent }}>P.</span>{q.q}</div>
                  <div style={{ font: "400 13px/1.55 var(--font-sans)", color: "var(--fg-3)", marginTop: 5, paddingLeft: 18 }}>{q.a}</div>
                </div>
              ))}
            </div>
          )}
          {cur.tip && (
            <div style={{ display: "flex", gap: 10, marginTop: 18, padding: "12px 14px", background: "var(--brand-tint)", border: "1px solid color-mix(in srgb, var(--brand-600) 18%, transparent)", borderRadius: "var(--r-md)" }}>
              <Icon name="Lightbulb" size={17} style={{ color: "var(--brand-600)", flexShrink: 0, marginTop: 1 }} />
              <span style={{ font: "500 12.5px/1.5 var(--font-sans)", color: "var(--fg-2)" }}>{cur.tip}</span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

Object.assign(window, { MovementScreen, Historico, Relatorios, Cadastros, Configuracoes, Guia, downloadCSV, brToDate, isoToBR, HOJE_ISO });
