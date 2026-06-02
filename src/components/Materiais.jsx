/* ============================================================================
   Materiais.jsx — tabela de controle de materiais
   ========================================================================== */

function FilterChip({ label, value, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 6, height: 32, padding: "0 11px",
      borderRadius: "var(--r-sm)", cursor: "pointer", whiteSpace: "nowrap",
      border: "1px solid", borderColor: active ? "var(--brand-600)" : "var(--line-2)",
      background: active ? "var(--brand-tint)" : "var(--bg-2)",
      color: active ? "var(--brand-300)" : "var(--fg-2)",
      font: "500 12.5px/1 var(--font-sans)", transition: "all var(--dur-fast)",
    }}>
      <Icon name="ListFilter" size={14} />
      {label}{value && <span style={{ color: active ? "var(--brand-200)" : "var(--fg-1)", fontWeight: 600 }}>: {value}</span>}
      <Icon name="ChevronDown" size={13} style={{ color: "var(--fg-4)" }} />
    </button>
  );
}

function CatCell({ cat }) {
  const c = getCat(cat);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 22, height: 22, borderRadius: 6, display: "grid", placeItems: "center", background: `color-mix(in srgb, ${c.color} 14%, transparent)`, color: c.color }}>
        <Icon name={c.icon} size={13} stroke={2} />
      </span>
      <span style={{ font: "500 12.5px/1 var(--font-sans)", color: "var(--fg-2)" }}>{c.label}</span>
    </span>
  );
}

function StockBar({ qty, min }) {
  const ratio = Math.min(qty / (min * 2 || 1), 1);
  const st = statusOf(qty, min);
  const color = STATUS[st].color;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <span style={{ font: "600 13px/1 var(--font-mono)", color: "var(--fg-1)", minWidth: 42, textAlign: "right" }}>{qty}</span>
      <div style={{ width: 56, height: 5, borderRadius: 999, background: "var(--bg-4)", overflow: "hidden" }}>
        <div style={{ width: `${ratio * 100}%`, height: "100%", borderRadius: 999, background: color }} />
      </div>
    </div>
  );
}

function Materiais({ materiais, loading, initialQ = "", onNew, openModal, onEdit, onDelete, toast }) {
  const [q, setQ] = React.useState(initialQ);
  React.useEffect(() => { setQ(initialQ); }, [initialQ]);
  const [cat, setCat] = React.useState(null);
  const [stat, setStat] = React.useState(null);
  const [sel, setSel] = React.useState(new Set());
  const [menuId, setMenuId] = React.useState(null);

  const filtered = materiais.filter(m => {
    if (cat && m.cat !== cat) return false;
    if (stat && m.status !== stat) return false;
    if (q) {
      const s = q.toLowerCase();
      return m.name.toLowerCase().includes(s) || m.loc.toLowerCase().includes(s);
    }
    return true;
  }).sort((a, b) => a.name.localeCompare(b.name, "pt"));

  const statCounts = { ok: 0, baixa: 0, crit: 0, zero: 0 };
  materiais.forEach(m => statCounts[m.status]++);

  const allSel = filtered.length > 0 && filtered.every(m => sel.has(m.id));
  const toggleAll = () => setSel(allSel ? new Set() : new Set(filtered.map(m => m.id)));
  const toggle = id => setSel(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="view-enter" style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
      {/* toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "space-between", flexWrap: "wrap" }}>
        <div>
          <h2 style={{ font: "700 21px/1.1 var(--font-sans)", letterSpacing: "-0.025em", color: "var(--fg-1)" }}>Controle de materiais</h2>
          <p style={{ font: "400 13px/1 var(--font-sans)", color: "var(--fg-3)", marginTop: 6 }}>
            {filtered.length} de {materiais.length} itens · {statCounts.zero + statCounts.crit} requerem atenção
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Button variant="primary" icon="Plus" onClick={onNew}>Adicionar material</Button>
        </div>
      </div>

      {/* filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ width: 340 }}>
          <Input icon="Search" placeholder="Buscar material por nome ou localização…" value={q} onChange={setQ} full />
        </div>
        <Segmented
          options={[
            { value: null, label: "Todos", count: materiais.length },
            { value: "baixa", label: "Atenção", count: statCounts.baixa },
            { value: "crit", label: "Crítico", count: statCounts.crit },
            { value: "zero", label: "Zerado", count: statCounts.zero },
          ]}
          value={stat} onChange={setStat} />
        <FilterChip label="Categoria" value={cat ? getCat(cat).label : null} active={!!cat}
          onClick={() => { const keys = [null, ...Object.keys(CATEGORIAS)]; setCat(keys[(keys.indexOf(cat) + 1) % keys.length]); }} />
        <div style={{ flex: 1 }} />
        <Button variant="secondary" size="sm" icon="Download" onClick={() => {
          const head = ["Material", "Categoria", "Unidade", "Estoque atual", "Estoque minimo", "Status", "Localizacao"];
          const lines = filtered.map(m => [m.name, getCat(m.cat).label, m.unit, m.qty, m.min, STATUS[m.status].label, m.loc]);
          window.downloadCSV("materiais", [head, ...lines]);
          toast({ title: "Lista exportada", desc: filtered.length + " materiais no CSV", tone: "success" });
        }}>Exportar</Button>
      </div>

      {/* bulk bar */}
      {sel.size > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "var(--brand-tint)", border: "1px solid var(--brand-800)", borderRadius: "var(--r-md)", animation: "popIn var(--dur-base) var(--ease-out) both" }}>
          <span style={{ font: "600 12.5px/1 var(--font-sans)", color: "var(--brand-200)" }}>{sel.size} selecionado(s)</span>
          <Divider vertical style={{ height: 18, background: "var(--brand-800)" }} />
          <Button size="sm" variant="ghost" icon="ArrowUpFromLine" onClick={() => toast({ title: "Saída em lote", tone: "info" })}>Registrar saída</Button>
          <Button size="sm" variant="ghost" icon="Tag">Etiquetar</Button>
          <div style={{ flex: 1 }} />
          <button onClick={() => setSel(new Set())} style={{ background: "none", border: "none", color: "var(--fg-3)", cursor: "pointer", display: "grid", placeItems: "center" }}><Icon name="X" size={16} /></button>
        </div>
      )}

      {/* table */}
      <Card pad={0} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ flex: 1, overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 880 }}>
            <thead>
              <tr style={{ position: "sticky", top: 0, zIndex: 1, background: "var(--bg-inset)" }}>
                <Th style={{ width: 40, paddingLeft: 18 }}>
                  <Checkbox checked={allSel} onChange={toggleAll} />
                </Th>
                <Th>Material</Th>
                <Th>Categoria</Th>
                <Th>Localização</Th>
                <Th align="right">Estoque</Th>
                <Th align="right">Mínimo</Th>
                <Th>Status</Th>
                <Th style={{ width: 44 }}></Th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 9 }).map((_, i) => <SkeletonRow key={i} />)
                : filtered.length === 0
                  ? <tr><td colSpan={8}><EmptyState icon="PackageSearch" title="Nenhum material encontrado" desc="Ajuste os filtros ou o termo de busca para ver resultados." action={<Button variant="secondary" size="sm" icon="RotateCcw" onClick={() => { setQ(""); setCat(null); setStat(null); }}>Limpar filtros</Button>} /></td></tr>
                  : filtered.map((m) => (
                    <Row key={m.id} m={m} selected={sel.has(m.id)} onToggle={() => toggle(m.id)}
                      menuOpen={menuId === m.id} onMenu={() => setMenuId(menuId === m.id ? null : m.id)}
                      onAction={(type) => { setMenuId(null); if (type === "in" || type === "out") openModal(type, m.sku); else if (type === "edit") onEdit(m); else if (type === "delete") onDelete(m); }} />
                  ))}
            </tbody>
          </table>
        </div>
        {/* pagination */}
        {!loading && filtered.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderTop: "1px solid var(--line-1)" }}>
            <span style={{ font: "500 12px/1 var(--font-sans)", color: "var(--fg-3)" }}>Mostrando 1–{filtered.length} de {filtered.length}</span>
            <div style={{ display: "flex", gap: 6 }}>
              <Button size="sm" variant="secondary" icon="ChevronLeft" disabled>Anterior</Button>
              <Button size="sm" variant="secondary" iconRight="ChevronRight">Próximo</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function Row({ m, selected, onToggle, menuOpen, onMenu, onAction }) {
  const [hover, setHover] = React.useState(false);
  const [menuPos, setMenuPos] = React.useState({ top: 0, right: 0 });
  const btnRef = React.useRef(null);

  const handleMenu = () => {
    if (!menuOpen && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const menuH = 160;
      const abreParaCima = r.bottom + menuH > window.innerHeight;
      setMenuPos({
        top: abreParaCima ? r.top - menuH : r.bottom + 4,
        right: window.innerWidth - r.right,
      });
    }
    onMenu();
  };

  return (
    <tr onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ background: selected ? "var(--brand-tint)" : (hover ? "var(--bg-3)" : "transparent"), transition: "background var(--dur-fast)" }}>
      <Td style={{ paddingLeft: 18 }}><Checkbox checked={selected} onChange={onToggle} /></Td>
      <Td>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={{ font: "600 13px/1.3 var(--font-sans)", color: "var(--fg-1)" }}>{m.name}</span>
        </div>
      </Td>
      <Td><CatCell cat={m.cat} /></Td>
      <Td>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "600 12px/1 var(--font-mono)", color: "var(--fg-2)", background: "var(--bg-inset)", padding: "4px 8px", borderRadius: 6, border: "1px solid var(--line-1)" }}>
          <Icon name="MapPin" size={12} style={{ color: "var(--fg-4)" }} />{m.loc}
        </span>
      </Td>
      <Td align="right"><StockBar qty={m.qty} min={m.min} /></Td>
      <Td align="right"><span style={{ font: "500 12.5px/1 var(--font-mono)", color: "var(--fg-3)" }}>{m.min} {m.unit}</span></Td>
      <Td><StatusPill status={m.status} /></Td>
      <Td>
        <div ref={btnRef}>
          <IconButton name="MoreHorizontal" size={16} onClick={handleMenu} active={menuOpen} />
          {menuOpen && ReactDOM.createPortal(
            <div style={{ position: "fixed", top: menuPos.top, right: menuPos.right, zIndex: 999, minWidth: 180, padding: 6, background: "var(--bg-3)", border: "1px solid var(--line-2)", borderRadius: "var(--r-md)", boxShadow: "var(--shadow-pop)", animation: "popIn var(--dur-fast) var(--ease-out) both" }}>
              <MenuItem icon="ArrowDownToLine" label="Registrar entrada" onClick={() => onAction("in")} />
              <MenuItem icon="ArrowUpFromLine" label="Registrar saída" onClick={() => onAction("out")} />
              <div style={{ height: 1, background: "var(--line-1)", margin: "5px 4px" }} />
              <MenuItem icon="Pencil" label="Editar material" onClick={() => onAction("edit")} />
              <MenuItem icon="Trash2" label="Excluir" danger onClick={() => onAction("delete")} />
            </div>,
            document.body
          )}
        </div>
      </Td>
    </tr>
  );
}

function MenuItem({ icon, label, onClick, danger }) {
  const [h, setH] = React.useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", height: 32, padding: "0 9px", border: "none", borderRadius: 6, cursor: "pointer", textAlign: "left",
        background: h ? (danger ? "var(--danger-tint)" : "var(--bg-4)") : "transparent",
        color: danger ? "var(--danger-400)" : (h ? "var(--fg-1)" : "var(--fg-2)"),
        font: "500 12.5px/1 var(--font-sans)" }}>
      <Icon name={icon} size={15} />{label}
    </button>
  );
}

function Checkbox({ checked, onChange }) {
  return (
    <button onClick={onChange} style={{ width: 17, height: 17, borderRadius: 5, display: "grid", placeItems: "center", cursor: "pointer",
      border: "1.5px solid", borderColor: checked ? "var(--brand-500)" : "var(--line-3)",
      background: checked ? "var(--brand-600)" : "transparent", transition: "all var(--dur-fast)" }}>
      {checked && <Icon name="Check" size={12} stroke={3} style={{ color: "#fff" }} />}
    </button>
  );
}

function Th({ children, align = "left", style = {} }) {
  return <th style={{ textAlign: align, padding: "11px 14px", font: "600 11px/1 var(--font-sans)", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--fg-3)", borderBottom: "1px solid var(--line-1)", whiteSpace: "nowrap", ...style }}>{children}</th>;
}
function Td({ children, align = "left", style = {} }) {
  return <td style={{ textAlign: align, padding: "12px 14px", borderBottom: "1px solid var(--line-1)", verticalAlign: "middle", ...style }}>{children}</td>;
}
function SkeletonRow() {
  return (
    <tr>
      <Td style={{ paddingLeft: 18 }}><div className="skeleton" style={{ width: 17, height: 17, borderRadius: 5 }} /></Td>
      <Td><div className="skeleton" style={{ width: 170, height: 13 }} /><div className="skeleton" style={{ width: 70, height: 10, marginTop: 6 }} /></Td>
      <Td><div className="skeleton" style={{ width: 110, height: 22, borderRadius: 999 }} /></Td>
      <Td><div className="skeleton" style={{ width: 64, height: 24, borderRadius: 6 }} /></Td>
      <Td align="right"><div className="skeleton" style={{ width: 90, height: 13, marginLeft: "auto" }} /></Td>
      <Td align="right"><div className="skeleton" style={{ width: 40, height: 13, marginLeft: "auto" }} /></Td>
      <Td><div className="skeleton" style={{ width: 88, height: 22, borderRadius: 999 }} /></Td>
      <Td></Td>
    </tr>
  );
}

Object.assign(window, { Materiais });
