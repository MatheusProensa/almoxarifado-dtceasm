/* ============================================================================
   Alertas.jsx — central de alertas por severidade
   ========================================================================== */

function AlertCard({ m, onAct }) {
  const s = STATUS[m.status];
  const c = getCat(m.cat);
  const pct = Math.round((m.qty / m.min) * 100);
  const msg = m.status === "zero" ? "Item zerado — reposição urgente"
    : m.status === "crit" ? "Nível crítico — abaixo de 50% do mínimo"
    : "Estoque em baixa — programar compra";
  return (
    <Card pad={16} hover style={{ borderColor: `color-mix(in srgb, ${s.color} 30%, var(--line-1))` }}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <span style={{ width: 42, height: 42, borderRadius: "var(--r-md)", display: "grid", placeItems: "center", background: s.tint, color: s.color, flexShrink: 0, border: `1px solid color-mix(in srgb, ${s.color} 28%, transparent)` }}>
          <Icon name={s.icon} size={20} stroke={2.1} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
            <StatusPill status={m.status} />
            <span style={{ font: "500 11.5px/1 var(--font-sans)", color: "var(--fg-3)" }}>{c.label}</span>
          </div>
          <div style={{ font: "600 14px/1.3 var(--font-sans)", color: "var(--fg-1)" }}>{m.name}</div>
          <div style={{ font: "500 12px/1.4 var(--font-sans)", color: s.color, marginTop: 5 }}>{msg}</div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 13 }}>
            <Meta label="Saldo atual" value={`${m.qty} ${m.unit}`} />
            <Meta label="Mínimo" value={`${m.min} ${m.unit}`} />
            <Meta label="Cobertura" value={`${pct}%`} valueColor={s.color} />
            <Meta label="Local" value={m.loc} mono />
          </div>
        </div>
      </div>
    </Card>
  );
}

function Meta({ label, value, valueColor = "var(--fg-1)", mono }) {
  return (
    <div>
      <div style={{ font: "600 9.5px/1 var(--font-sans)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-4)", marginBottom: 5 }}>{label}</div>
      <div style={{ font: `600 13px/1 ${mono ? "var(--font-mono)" : "var(--font-sans)"}`, color: valueColor }}>{value}</div>
    </div>
  );
}

function SeverityGroup({ title, color, icon, items, onAct }) {
  if (items.length === 0) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <span style={{ color }}><Icon name={icon} size={17} stroke={2.2} /></span>
        <h3 style={{ font: "700 14px/1 var(--font-sans)", color: "var(--fg-1)", letterSpacing: "-0.01em" }}>{title}</h3>
        <Badge color={color} tint={`color-mix(in srgb, ${color} 13%, transparent)`}>{items.length}</Badge>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {items.map(m => <AlertCard key={m.id} m={m} onAct={onAct} />)}
      </div>
    </div>
  );
}

function Alertas({ alertas, toast, openModal }) {
  const zero = alertas.filter(m => m.status === "zero");
  const crit = alertas.filter(m => m.status === "crit");
  const baixa = alertas.filter(m => m.status === "baixa");
  const onAct = (type, m) => openModal(type, m.sku);

  return (
    <div className="view-enter" style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ font: "700 21px/1.1 var(--font-sans)", letterSpacing: "-0.025em", color: "var(--fg-1)" }}>Central de alertas</h2>
          <p style={{ font: "400 13px/1 var(--font-sans)", color: "var(--fg-3)", marginTop: 6 }}>{alertas.length} itens exigem atenção · priorizados por gravidade e cobertura de estoque.</p>
        </div>
      </div>

      {/* summary strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        <SummaryTile color="var(--danger-400)" icon="Ban" n={zero.length} label="Zerados" sub="Sem saldo disponível" />
        <SummaryTile color="var(--crit-500)" icon="AlertTriangle" n={crit.length} label="Críticos" sub="Abaixo de 50% do mínimo" />
        <SummaryTile color="var(--warn-500)" icon="TrendingDown" n={baixa.length} label="Em atenção" sub="No limite do mínimo" />
      </div>

      {alertas.length === 0
        ? <Card><EmptyState icon="ShieldCheck" title="Tudo sob controle" desc="Nenhum item abaixo do mínimo no momento. Os alertas aparecerão aqui automaticamente." /></Card>
        : (
          <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
            <SeverityGroup title="Zerados" color="var(--danger-400)" icon="Ban" items={zero} onAct={onAct} />
            <SeverityGroup title="Críticos" color="var(--crit-500)" icon="AlertTriangle" items={crit} onAct={onAct} />
            <SeverityGroup title="Em atenção" color="var(--warn-500)" icon="TrendingDown" items={baixa} onAct={onAct} />
          </div>
        )}
    </div>
  );
}

function SummaryTile({ color, icon, n, label, sub }) {
  return (
    <Card pad={16}>
      <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
        <span style={{ width: 44, height: 44, borderRadius: "var(--r-md)", display: "grid", placeItems: "center", background: `color-mix(in srgb, ${color} 13%, transparent)`, color, border: `1px solid color-mix(in srgb, ${color} 26%, transparent)` }}>
          <Icon name={icon} size={21} stroke={2.1} />
        </span>
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
            <span style={{ font: "700 26px/1 var(--font-mono)", color: "var(--fg-1)", letterSpacing: "-0.02em" }}>{n}</span>
            <span style={{ font: "600 13px/1 var(--font-sans)", color: "var(--fg-2)" }}>{label}</span>
          </div>
          <div style={{ font: "400 11.5px/1 var(--font-sans)", color: "var(--fg-3)", marginTop: 6 }}>{sub}</div>
        </div>
      </div>
    </Card>
  );
}

Object.assign(window, { Alertas });
