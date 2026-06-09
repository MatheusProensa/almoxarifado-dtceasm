/* ============================================================================
   Dashboard.jsx — visão geral operacional (layout da referência)
   ========================================================================== */

function MetricCard({ m, onLink }) {
  return (
    <Card pad={18}>
      <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 14 }}>
        <span style={{ width: 46, height: 46, borderRadius: "var(--r-md)", display: "grid", placeItems: "center", background: m.accent, color: "#fff", flexShrink: 0, boxShadow: `0 6px 16px -8px ${m.accent}` }}>
          <Icon name={m.icon} size={22} stroke={2.1} />
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={{ font: "500 13px/1 var(--font-sans)", color: "var(--fg-3)", marginBottom: 8, whiteSpace: "nowrap" }}>{m.label}</div>
          <div style={{ font: "700 27px/1 var(--font-sans)", letterSpacing: "-0.02em", color: "var(--fg-1)", whiteSpace: "nowrap" }}>{m.value.toLocaleString("pt-BR")}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 5, font: "500 12px/1.3 var(--font-sans)", color: m.trend ? "var(--ok-500)" : "var(--fg-3)" }}>
        {m.trend && <Icon name="TrendingUp" size={14} stroke={2.3} />}
        {m.sub}
      </div>
      <div style={{ height: 1, background: "var(--line-1)", margin: "14px -18px 12px" }} />
      <button onClick={onLink} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "none", border: "none", padding: 0, cursor: "pointer", color: "var(--brand-600)", font: "600 12.5px/1 var(--font-sans)", whiteSpace: "nowrap" }}>
        {m.link.label} <Icon name="ArrowRight" size={14} stroke={2.2} />
      </button>
    </Card>
  );
}

function QuickAction({ icon, color, title, desc, onClick }) {
  const [h, setH] = React.useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: "flex", alignItems: "center", gap: 13, padding: 14, textAlign: "left", cursor: "pointer",
        background: h ? "var(--bg-3)" : "var(--bg-2)", border: "1px solid", borderColor: h ? "var(--line-2)" : "var(--line-1)",
        borderRadius: "var(--r-md)", transition: "all var(--dur-fast)", transform: h ? "translateY(-1px)" : "none",
      }}>
      <span style={{ width: 42, height: 42, borderRadius: "var(--r-md)", display: "grid", placeItems: "center", background: `color-mix(in srgb, ${color} 15%, transparent)`, color, flexShrink: 0 }}>
        <Icon name={icon} size={20} stroke={2.1} />
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ font: "600 13.5px/1.2 var(--font-sans)", color: "var(--fg-1)" }}>{title}</div>
        <div style={{ font: "400 11.5px/1.3 var(--font-sans)", color: "var(--fg-3)", marginTop: 4 }}>{desc}</div>
      </div>
    </button>
  );
}

function CardHead({ title, subtitle, action }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
      <div>
        <h3 style={{ font: "700 16px/1.2 var(--font-sans)", color: "var(--fg-1)", letterSpacing: "-0.01em" }}>{title}</h3>
        {subtitle && <p style={{ font: "400 12.5px/1 var(--font-sans)", color: "var(--fg-3)", marginTop: 6 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function LinkBtn({ children, onClick }) {
  return <button onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 30, padding: "0 11px", background: "var(--bg-2)", border: "1px solid var(--line-2)", borderRadius: "var(--r-sm)", color: "var(--fg-2)", font: "600 12px/1 var(--font-sans)", cursor: "pointer", whiteSpace: "nowrap" }}>{children}</button>;
}

/* ---- tabela estoque baixo ------------------------------------------------ */
function LowStockTable({ rows, onAll }) {
  return (
    <Card pad={0}>
      <div style={{ padding: "18px 20px 10px" }}>
        <CardHead title="Estoque baixo" subtitle="Materiais que precisam de reposição" action={<LinkBtn onClick={onAll}>Ver todos</LinkBtn>} />
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <ThD style={{ paddingLeft: 20 }}>Material</ThD>
            <ThD align="right">Atual</ThD><ThD align="right">Mínimo</ThD><ThD style={{ paddingRight: 20 }}>Status</ThD>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0
            ? <tr><td colSpan={4}><div style={{ padding: "28px", textAlign: "center", color: "var(--fg-3)", font: "400 13px var(--font-sans)" }}>Nenhum item abaixo do mínimo 🎉</div></td></tr>
            : rows.map(m => (
              <tr key={m.id} className="rowh">
                <TdD style={{ paddingLeft: 20 }}><span style={{ font: "600 13px/1.3 var(--font-sans)", color: "var(--fg-1)" }}>{m.name}</span></TdD>
                <TdD align="right"><span style={{ font: "700 13px/1 var(--font-sans)", color: STATUS[m.status].color }}>{m.qty} <span style={{ font: "500 11px/1 var(--font-sans)", color: "var(--fg-4)" }}>{m.unit}</span></span></TdD>
                <TdD align="right"><span style={{ font: "500 12.5px/1 var(--font-sans)", color: "var(--fg-3)" }}>{m.min} {m.unit}</span></TdD>
                <TdD style={{ paddingRight: 20 }}><StatusPill status={m.status} /></TdD>
              </tr>
            ))}
        </tbody>
      </table>
    </Card>
  );
}

/* ---- últimas movimentações ----------------------------------------------- */
function LastMov({ movs, onAll }) {
  return (
    <Card pad={0}>
      <div style={{ padding: "18px 20px 10px" }}>
        <CardHead title="Últimas movimentações" action={<LinkBtn onClick={onAll}>Ver todas</LinkBtn>} />
      </div>
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
      <table style={{ width: "100%", minWidth: 480, borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <ThD style={{ paddingLeft: 20 }}>Tipo</ThD><ThD>Material</ThD>
            <ThD align="right">Qtde</ThD><ThD>Responsável</ThD><ThD style={{ paddingRight: 20 }}>Data</ThD>
          </tr>
        </thead>
        <tbody>
          {movs.slice(0, 5).map(mv => {
            const t = MOVTYPE[mv.tipo];
            return (
              <tr key={mv.id} className="rowh">
                <TdD style={{ paddingLeft: 20 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 22, padding: "0 9px", borderRadius: "var(--r-xs)", background: t.tint, color: t.color, font: "600 11.5px/1 var(--font-sans)", border: "1px solid color-mix(in srgb, currentColor 20%, transparent)" }}>{t.label}</span>
                </TdD>
                <TdD><span style={{ font: "500 12.5px/1.3 var(--font-sans)", color: "var(--fg-1)" }}>{mv.item}</span></TdD>
                <TdD align="right"><span style={{ font: "600 12.5px/1 var(--font-sans)", color: t.color }}>{t.sign}{Math.abs(mv.qty)} <span style={{ color: "var(--fg-4)", fontWeight: 500 }}>{mv.unit}</span></span></TdD>
                <TdD><span style={{ font: "500 12px/1 var(--font-sans)", color: "var(--fg-2)" }}>{mv.resp}</span></TdD>
                <TdD style={{ paddingRight: 20 }}><span style={{ font: "500 11.5px/1 var(--font-sans)", color: "var(--fg-3)" }}>{mv.at}</span></TdD>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </Card>
  );
}

function ThD({ children, align = "left", style = {} }) {
  return <th style={{ textAlign: align, padding: "10px 12px", font: "600 11px/1 var(--font-sans)", letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--fg-3)", borderBottom: "1px solid var(--line-1)", whiteSpace: "nowrap", background: "var(--bg-inset)", ...style }}>{children}</th>;
}
function TdD({ children, align = "left", style = {} }) {
  return <td style={{ textAlign: align, padding: "13px 12px", borderBottom: "1px solid var(--line-1)", verticalAlign: "middle", ...style }}>{children}</td>;
}

function calcularSerie(movs) {
  const meses = [];
  const agora = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
    meses.push({ mes: d.getMonth(), ano: d.getFullYear(), m: d.toLocaleString("pt-BR", { month: "short" }).replace(".", ""), in: 0, out: 0 });
  }
  movs.forEach(mv => {
    if (mv.tipo === "adj") return;
    const partes = mv.at.split(/[\/ :]/);
    if (partes.length < 3) return;
    const d = new Date(Number(partes[2]), Number(partes[1]) - 1, Number(partes[0]));
    const slot = meses.find(s => s.mes === d.getMonth() && s.ano === d.getFullYear());
    if (slot) { if (mv.tipo === "in") slot.in += Math.abs(mv.qty); else slot.out += Math.abs(mv.qty); }
  });
  return meses;
}

function calcularMaisUsados(movs, materiais) {
  const totais = {};
  movs.filter(m => m.tipo === "out").forEach(m => { totais[m.item] = (totais[m.item] || 0) + Math.abs(m.qty); });
  return Object.entries(totais).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value }));
}

function calcularMovCategoria(movs, materiais) {
  const skuCat = {}; materiais.forEach(m => { skuCat[m.sku] = m.cat; });
  const totais = {};
  movs.filter(m => m.tipo !== "adj").forEach(m => {
    const cat = skuCat[m.sku];
    if (!cat) return;
    const label = getCat(cat).label;
    totais[label] = (totais[label] || 0) + Math.abs(m.qty);
  });
  return Object.entries(totais).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value }));
}

function calcularPorCategoria(materiais) {
  const totais = {};
  materiais.forEach(m => { totais[m.cat] = (totais[m.cat] || 0) + m.qty; });
  return Object.entries(totais).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([cat, value]) => ({ cat, value }));
}


function Dashboard({ materiais, alertas, movs, statsKpis, openModal, setView, toast }) {
  const critCount = alertas.filter(m => m.status === "crit" || m.status === "zero").length;
  const kpis = statsKpis || { entradasMes: 0, saidasMes: 0 };
  const serie = React.useMemo(() => calcularSerie(movs), [movs]);
  const maisUsados = React.useMemo(() => calcularMaisUsados(movs, materiais), [movs, materiais]);
  const porCategoria = React.useMemo(() => calcularPorCategoria(materiais), [materiais]);

  const metrics = [
    { key: "estoque", label: "Materiais cadastrados", value: materiais.length, icon: "Boxes", accent: "var(--brand-600)", sub: "Itens no catálogo", link: { label: "Ver materiais", view: "materiais" } },
    { key: "entrada", label: "Entradas (mês)", value: kpis.entradasMes, icon: "ArrowDownToLine", accent: "var(--ok-500)", sub: "Unidades recebidas no mês", link: { label: "Ver entradas", view: "movimentacao", filter: "in" } },
    { key: "saida", label: "Saídas (mês)", value: kpis.saidasMes, icon: "ArrowUpFromLine", accent: "#F59E0B", sub: "Unidades retiradas no mês", link: { label: "Ver saídas", view: "movimentacao", filter: "out" } },
    { key: "critico", label: "Itens críticos", value: critCount, icon: "TriangleAlert", accent: "var(--danger-500)", sub: "Precisam de atenção", link: { label: "Ver itens", view: "alertas" } },
  ];

  return (
    <div className="view-enter" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ font: "700 24px/1.1 var(--font-sans)", letterSpacing: "-0.025em", color: "var(--fg-1)" }}>Dashboard</h2>
          <p style={{ font: "400 13.5px/1.4 var(--font-sans)", color: "var(--fg-3)", marginTop: 6 }}>Visão geral do almoxarifado</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {metrics.map(m => <MetricCard key={m.key} m={m} onLink={() => setView(m.link.view, m.link.filter)} />)}
      </div>

      {/* Ações rápidas — em destaque */}
      <Card pad={18}>
        <CardHead title="Ações rápidas" subtitle="As operações mais usadas no dia a dia — em um clique" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(186px, 1fr))", gap: 12 }}>
          <QuickAction icon="ArrowDownToLine" color="var(--ok-500)" title="Registrar entrada" desc="Adicionar ao estoque" onClick={() => openModal("in")} />
          <QuickAction icon="ArrowUpFromLine" color="#F59E0B" title="Registrar saída" desc="Retirar do estoque" onClick={() => openModal("out")} />
          <QuickAction icon="PackagePlus" color="var(--brand-600)" title="Novo material" desc="Cadastrar item" onClick={() => openModal("new")} />
          <QuickAction icon="FileBarChart" color="#1B9FB0" title="Gerar relatório" desc="Estoque e movimentações" onClick={() => setView("relatorios")} />
        </div>
      </Card>

      {/* duas colunas */}
      <div className="dash-cols" style={{ display: "grid", gridTemplateColumns: "1.42fr 1fr", gap: 16, alignItems: "start" }}>
        {/* esquerda */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <LowStockTable rows={alertas.slice(0, 6)} onAll={() => setView("alertas")} />
          <LastMov movs={movs} onAll={() => setView("movimentacao")} />
        </div>

        {/* direita — escondido no mobile via .dash-charts */}
        <div className="dash-charts" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card pad={20}>
            <CardHead title="Movimentações" subtitle="Entradas e saídas — últimos 6 meses"
              action={<div style={{ display: "flex", gap: 14 }}><Legend dot="var(--ok-500)" label="Entradas" /><Legend dot="var(--warn-500)" label="Saídas" /></div>} />
            <FlowChart serie={serie} height={230} />
          </Card>

          <Card pad={20}>
            <CardHead title="Categorias" subtitle="Distribuição dos materiais" />
            <div style={{ paddingTop: 4 }}><Donut data={porCategoria} /></div>
          </Card>

          <Card pad={20}>
            <CardHead title="Mais utilizados" subtitle="Saídas registradas por material" />
            {maisUsados.length > 0
              ? <HBarRank data={maisUsados} color="var(--brand-500)" unit="un" />
              : <div style={{ padding: "20px 0", textAlign: "center", font: "400 13px var(--font-sans)", color: "var(--fg-3)" }}>Nenhuma saída registrada ainda.</div>
            }
          </Card>
        </div>
      </div>
    </div>
  );
}

function Legend({ dot, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 9, height: 9, borderRadius: 3, background: dot }} />
      <span style={{ font: "500 12px/1 var(--font-sans)", color: "var(--fg-3)" }}>{label}</span>
    </div>
  );
}

Object.assign(window, { Dashboard, calcularSerie, calcularMaisUsados, calcularMovCategoria, calcularPorCategoria });
