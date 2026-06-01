/* ============================================================================
   App.jsx — shell, tema claro/escuro, roteamento, modais, estado global
   ========================================================================== */

function CommandPalette({ open, onClose, materiais, setView }) {
  const [q, setQ] = React.useState("");
  const inputRef = React.useRef(null);
  React.useEffect(() => { if (open) { setQ(""); setTimeout(() => inputRef.current && inputRef.current.focus(), 30); } }, [open]);
  if (!open) return null;
  const nav = [
    { label: "Dashboard", icon: "LayoutDashboard", to: "dashboard" },
    { label: "Materiais", icon: "Boxes", to: "materiais" },
    { label: "Movimentações", icon: "ArrowRightLeft", to: "movimentacao" },
    { label: "Estoque baixo / Alertas", icon: "TriangleAlert", to: "alertas" },
  ].filter(n => !q || n.label.toLowerCase().includes(q.toLowerCase()));
  const mats = (q ? materiais.filter(m => m.name.toLowerCase().includes(q.toLowerCase()) || m.sku.toLowerCase().includes(q.toLowerCase())) : materiais).slice(0, 6);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 700, background: "var(--scrim)", backdropFilter: "blur(2px)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "12vh", animation: "fadeIn var(--dur-fast) ease both" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 560, maxWidth: "92vw", background: "var(--bg-2)", border: "1px solid var(--line-2)", borderRadius: "var(--r-lg)", boxShadow: "var(--shadow-lg)", overflow: "hidden", animation: "popIn var(--dur-base) var(--ease-out) both" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "14px 16px", borderBottom: "1px solid var(--line-1)" }}>
          <Icon name="Search" size={18} style={{ color: "var(--fg-3)" }} />
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar material, SKU ou ir para…"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--fg-1)", font: "500 15px/1 var(--font-sans)" }} />
          <kbd style={{ font: "600 11px/1 var(--font-sans)", color: "var(--fg-3)", background: "var(--bg-4)", padding: "4px 7px", borderRadius: 5, border: "1px solid var(--line-2)" }}>ESC</kbd>
        </div>
        <div style={{ maxHeight: 380, overflowY: "auto", padding: 8 }}>
          {nav.length > 0 && <PSection title="Navegação" />}
          {nav.map(n => <PRow key={n.to} icon={n.icon} label={n.label} onClick={() => { setView(n.to); onClose(); }} />)}
          {mats.length > 0 && <PSection title="Materiais" />}
          {mats.map(m => (
            <PRow key={m.id} icon={CATEGORIAS[m.cat].icon} label={m.name}
              right={<><span style={{ font: "500 11px/1 var(--font-sans)", color: "var(--fg-4)" }}>{m.loc}</span><StatusPill status={m.status} /></>}
              onClick={() => { setView("materiais"); onClose(); }} />
          ))}
          {nav.length === 0 && mats.length === 0 && <div style={{ padding: 28, textAlign: "center", color: "var(--fg-3)", font: "400 13px var(--font-sans)" }}>Nenhum resultado para "{q}"</div>}
        </div>
      </div>
    </div>
  );
}
function PSection({ title }) { return <div style={{ padding: "10px 10px 4px", font: "700 10px/1 var(--font-sans)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--fg-4)" }}>{title}</div>; }
function PRow({ icon, label, right, onClick }) {
  const [h, setH] = React.useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: "flex", alignItems: "center", gap: 11, width: "100%", height: 42, padding: "0 10px", border: "none", borderRadius: "var(--r-sm)", cursor: "pointer", background: h ? "var(--bg-3)" : "transparent", color: "var(--fg-1)", textAlign: "left" }}>
      <span style={{ width: 28, height: 28, borderRadius: 7, display: "grid", placeItems: "center", background: "var(--bg-4)", color: "var(--fg-2)", flexShrink: 0 }}><Icon name={icon} size={15} /></span>
      <span style={{ flex: 1, font: "500 13.5px/1 var(--font-sans)" }}>{label}</span>
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>{right}</span>
    </button>
  );
}

const PLACEHOLDER_META = {
  transferencias: { icon: "Repeat", title: "Transferências", desc: "Transferências entre locais e setores do depósito." },
  unidades:       { icon: "Ruler", title: "Unidades de medida", desc: "Cadastro de unidades (un, cx, pct, rm, fd, L…)." },
  locais:         { icon: "MapPin", title: "Locais de estoque", desc: "Corredores, prateleiras e níveis do depósito." },
  usuarios:       { icon: "Users", title: "Usuários", desc: "Militares com permissão para operar o sistema." },
};
function Placeholder({ view }) {
  const meta = PLACEHOLDER_META[view] || { icon: "Construction", title: "Em construção", desc: "Tela do roadmap do UI kit." };
  return (
    <div className="view-enter">
      <Card style={{ minHeight: 440, display: "grid", placeItems: "center" }}>
        <EmptyState icon={meta.icon} title={meta.title} desc={meta.desc}
          action={<Badge color="var(--brand-600)" tint="var(--brand-tint)" icon="Hammer">Tela demonstrativa do UI kit</Badge>} />
      </Card>
    </div>
  );
}

function Shell() {
  const toast = useToast();
  const [theme, setTheme] = React.useState(() => localStorage.getItem("almox-theme") || "light");
  const [view, setViewRaw] = React.useState("dashboard");
  const [collapsed, setCollapsed] = React.useState(false);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [modal, setModal] = React.useState(null); // "in" | "out" | "adj" | "new"
  const [preset, setPreset] = React.useState("");
  const openModal = (type, sku = "") => { setPreset(sku); setModal(type); };
  const [editMat, setEditMat] = React.useState(null);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const openEdit = (m) => { setEditMat(m); setModal("edit"); };
  const [materiais, setMateriais] = React.useState(MATERIAIS);
  const [movs, setMovs] = React.useState(MOVIMENTACOES);
  const [, setDataVer] = React.useState(0);
  const refreshData = React.useCallback(() => setDataVer(v => v + 1), []);
  const [loadingMat, setLoadingMat] = React.useState(false);
  const [histFilter, setHistFilter] = React.useState("all");
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    if (theme === "dark") document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("almox-theme", theme);
  }, [theme]);

  const setView = (v, filter) => {
    if (v === "movimentacao" || v === "historico") setHistFilter(filter || "all");
    setViewRaw(v);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    if (v === "materiais") { setLoadingMat(true); setTimeout(() => setLoadingMat(false), 600); }
  };

  React.useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen(o => !o); }
      if (e.key === "Escape") setPaletteOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const alertas = alertasFrom(materiais);
  const counts = {
    baixa: materiais.filter(m => m.status === "baixa").length,
    crit: materiais.filter(m => m.status === "crit" || m.status === "zero").length,
  };

  const submitMovement = ({ tipo, sku, mat, qty, resp, doc, dest, obs, at }) => {
    const code = sku || mat;
    const n = parseInt(qty, 10) || 0;
    const item = materiais.find(m => m.sku === code);
    const antes = item ? item.qty : 0;
    const depois = Math.max(0, antes + (tipo === "in" ? n : -n));
    setMateriais(prev => prev.map(m => m.sku === code ? { ...m, qty: depois, status: statusOf(depois, m.min) } : m));
    setMovs(prev => [{ id: Date.now(), tipo, sku: code, item: item ? item.name : code, qty: n, unit: item ? item.unit : "un", antes, depois, resp: resp || "2S Geraldo", doc: doc || "—", dest: dest || "", at: at || "31/05/2026" }, ...prev]);
    toast({ title: tipo === "in" ? "Entrada registrada" : "Saída registrada", desc: n + " " + (item ? item.unit : "un") + " · " + (item ? item.name : code), tone: tipo === "in" ? "success" : "info" });
    setModal(null);
  };

  const submitNewMaterial = (f) => {
    const sku = "NEW-" + Date.now().toString(36).toUpperCase();
    const m = { id: Date.now(), sku, name: f.name, cat: f.cat, loc: f.loc || "—", qty: f.qty, unit: f.unit, min: f.min, obs: f.obs };
    m.status = statusOf(m.qty, m.min);
    setMateriais(prev => [m, ...prev]);
    toast({ title: "Material cadastrado", desc: f.name, tone: "success" });
    setModal(null);
  };

  const submitEditMaterial = (upd) => {
    const orig = materiais.find(m => m.sku === upd.sku);
    setMateriais(prev => prev.map(m => m.sku === upd.sku ? { ...upd, status: statusOf(upd.qty, upd.min) } : m));
    if (orig && upd.qty !== orig.qty) {
      const diff = upd.qty - orig.qty;
      setMovs(prev => [{ id: Date.now(), tipo: "adj", sku: upd.sku, item: upd.name, qty: diff, unit: upd.unit, antes: orig.qty, depois: upd.qty, resp: "2S Geraldo", doc: "Edição de cadastro", dest: "", at: "31/05/2026" }, ...prev]);
    }
    toast({ title: "Material atualizado", desc: upd.name, tone: "success" });
    setModal(null);
  };

  const deleteMaterial = (m) => {
    if (!window.confirm(`Excluir "${m.name}" do catálogo? Esta ação não pode ser desfeita.`)) return;
    setMateriais(prev => prev.filter(x => x.sku !== m.sku));
    toast({ title: "Material excluído", desc: m.name, tone: "warn" });
  };

  const submitUpdateQty = ({ sku, novo, motivo }) => {
    const item = materiais.find(m => m.sku === sku);
    if (!item) return;
    const antes = item.qty;
    const diff = novo - antes;
    setMateriais(prev => prev.map(m => m.sku === sku ? { ...m, qty: novo, status: statusOf(novo, m.min) } : m));
    if (diff !== 0) setMovs(prev => [{ id: Date.now(), tipo: "adj", sku, item: item.name, qty: diff, unit: item.unit, antes, depois: novo, resp: "2S Geraldo", doc: motivo, dest: "", at: "31/05/2026" }, ...prev]);
    toast({ title: "Estoque atualizado", desc: item.name, tone: "success" });
    setModal(null);
  };

  return (
    <div className="app-shell" style={{ display: "flex", height: "100%", position: "relative" }}>
      <Sidebar view={view} setView={setView} collapsed={collapsed} setCollapsed={setCollapsed} counts={counts} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, position: "relative", zIndex: 1 }}>
        <Topbar theme={theme} onToggleTheme={() => setTheme(t => t === "dark" ? "light" : "dark")}
          onSearch={() => setPaletteOpen(true)} alertas={alertas} movs={movs}
          onOpenAlertas={() => setView("alertas")} onOpenHistorico={() => setView("movimentacao")}
          onOpenGuia={() => setView("guia")} onOpenProfile={() => setProfileOpen(true)} toast={toast} />
        <main ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "24px 26px 44px" }}>
          <div style={{ maxWidth: 1340, margin: "0 auto" }}>
            {view === "dashboard" && <Dashboard materiais={materiais} alertas={alertas} movs={movs} openModal={openModal} setView={setView} toast={toast} />}
            {view === "materiais" && <Materiais materiais={materiais} loading={loadingMat} onNew={() => openModal("new")} openModal={openModal} onEdit={openEdit} onDelete={deleteMaterial} toast={toast} />}
            {view === "entradas" && <MovementScreen tipo="in" materiais={materiais} onSubmit={submitMovement} onAdjust={submitUpdateQty} />}
            {view === "saidas" && <MovementScreen tipo="out" materiais={materiais} onSubmit={submitMovement} onAdjust={submitUpdateQty} />}
            {(view === "movimentacao" || view === "historico") && <Historico movs={movs} initialTab={histFilter} />}
            {view === "relatorios" && <Relatorios materiais={materiais} movs={movs} alertas={alertas} />}
            {view === "categorias" && <Cadastros materiais={materiais} toast={toast} onChange={refreshData} />}
            {view === "config" && <Configuracoes theme={theme} onToggleTheme={() => setTheme(t => t === "dark" ? "light" : "dark")} toast={toast} onChange={refreshData} setView={setView} />}
            {view === "guia" && <Guia setView={setView} />}
            {view === "alertas" && <Alertas alertas={alertas} toast={toast} openModal={openModal} />}
            {PLACEHOLDER_META[view] && <Placeholder view={view} />}
          </div>
        </main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} materiais={materiais} setView={setView} />
      <MovementModal open={modal === "in" || modal === "out"} tipo={modal} materiais={materiais} initialSku={preset} onClose={() => setModal(null)} onSubmit={submitMovement} />
      <AddMaterialModal open={modal === "new"} onClose={() => setModal(null)} onSubmit={submitNewMaterial} />
      <EditMaterialModal open={modal === "edit"} material={editMat} onClose={() => setModal(null)} onSubmit={submitEditMaterial} />
      <EditProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} onSaved={refreshData} />
      <UpdateQtyModal open={modal === "adj"} materiais={materiais} initialSku={preset} onClose={() => setModal(null)} onSubmit={submitUpdateQty} />
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <Shell />
    </ToastProvider>
  );
}

Object.assign(window, { App });
