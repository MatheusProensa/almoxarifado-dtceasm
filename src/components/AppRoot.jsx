/* ============================================================================
   AppRoot.jsx — shell, tema claro/escuro, roteamento, modais, estado global
   ========================================================================== */

function CommandPalette({ open, onClose, materiais, setView, onMatSelect }) {
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
            <PRow key={m.id} icon={getCat(m.cat).icon} label={m.name}
              right={<><span style={{ font: "500 11px/1 var(--font-sans)", color: "var(--fg-4)" }}>{m.loc}</span><StatusPill status={m.status} /></>}
              onClick={() => { onMatSelect && onMatSelect(m.name); setView("materiais"); onClose(); }} />
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


function ErroConexao() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "var(--bg-1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", maxWidth: 420, padding: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <div style={{ font: "700 20px/1.3 var(--font-sans)", color: "var(--fg-1)", marginBottom: 12 }}>Servidor não encontrado</div>
        <div style={{ font: "400 14px/1.6 var(--font-sans)", color: "var(--fg-3)", marginBottom: 24 }}>
          O servidor backend não está rodando.<br />
          Abra o arquivo <strong>Almox Proensa.exe</strong> na pasta do projeto e aguarde.
        </div>
        <button onClick={() => window.location.reload()}
          style={{ padding: "10px 24px", borderRadius: "var(--r-sm)", border: "none", background: "var(--brand-600)", color: "#fff", font: "600 14px var(--font-sans)", cursor: "pointer" }}>
          Tentar novamente
        </button>
      </div>
    </div>
  );
}

function Shell() {
  const toast = useToast();
  const [autenticado, setAutenticado] = React.useState(() => !!localStorage.getItem("almox-token"));
  const [theme, setTheme] = React.useState(() => localStorage.getItem("almox-theme") || "light");
  const [view, setViewRaw] = React.useState("dashboard");
  const [collapsed, setCollapsed] = React.useState(false);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [modal, setModal] = React.useState(null);
  const [preset, setPreset] = React.useState("");
  const openModal = (type, sku = "") => { setPreset(sku); setModal(type); };
  const [editMat, setEditMat] = React.useState(null);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const openEdit = (m) => { setEditMat(m); setModal("edit"); };
  const [bulkIds, setBulkIds] = React.useState([]);
  const [materiais, setMateriais] = React.useState([]);
  const [movs, setMovs] = React.useState([]);
  const [statsKpis, setStatsKpis] = React.useState({ entradasMes: 0, saidasMes: 0 });
  const [config, setConfig] = React.useState(null);
  const [carregando, setCarregando] = React.useState(true);
  const [erroConexao, setErroConexao] = React.useState(false);
  const [loadingMat, setLoadingMat] = React.useState(false);
  const [matInitialQ, setMatInitialQ] = React.useState("");
  const [histFilter, setHistFilter] = React.useState("all");
  const scrollRef = React.useRef(null);

  // Ouvir evento de logout (token expirado / 401)
  React.useEffect(() => {
    const onLogout = () => setAutenticado(false);
    window.addEventListener("almox-logout", onLogout);
    return () => window.removeEventListener("almox-logout", onLogout);
  }, []);

  // Carregar dados do backend ao iniciar
  React.useEffect(() => {
    if (!autenticado) return;
    Promise.all([api.getMateriais(), api.getMovimentacoes(), api.getConfig(), api.getMovimentacoesStats()])
      .then(([mats, movimentos, cfg, stats]) => {
        setMateriais(mats);
        setMovs(movimentos);
        setStatsKpis(stats);
        setConfig(cfg);
        // Atualiza globals usados pelos componentes
        window.CATEGORIAS = cfg.categorias;
        window.UNIDADES = cfg.unidades;
        window.PROFILE = cfg.perfil;
        window.RESPONSAVEIS = cfg.responsaveis;
        window.SETORES = cfg.setores || window.SETORES;
        setCarregando(false);
      })
      .catch(() => {
        setErroConexao(true);
        setCarregando(false);
      });
  }, [autenticado]);

  const updateConfig = React.useCallback((novoConfig) => {
    setConfig(novoConfig);
    window.CATEGORIAS = novoConfig.categorias;
    window.UNIDADES = novoConfig.unidades;
    window.PROFILE = novoConfig.perfil;
    window.RESPONSAVEIS = novoConfig.responsaveis;
    if (novoConfig.setores) window.SETORES = novoConfig.setores;
    api.putConfig(novoConfig).catch(() => {});
  }, []);

  React.useEffect(() => {
    if (theme === "dark") document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("almox-theme", theme);
  }, [theme]);

  const setView = (v, filter) => {
    if (v === "movimentacao" || v === "historico") setHistFilter(filter || "all");
    if (v !== "materiais") setMatInitialQ("");
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

  const atualizarStats = () => api.getMovimentacoesStats().then(setStatsKpis).catch(() => {});

  const anularMovimentacao = (id) => {
    api.anularMovimentacao(id)
      .then(({ estorno, movimentacaoOriginal, material }) => {
        setMovs(prev => {
          const sem = prev.filter(m => m.id !== id);
          const original = { ...movimentacaoOriginal };
          return [estorno, original, ...sem.filter(m => m.id !== id)];
        });
        if (material) setMateriais(prev => prev.map(m => m.sku === material.sku ? material : m));
        atualizarStats();
        toast({ title: "Movimentação anulada", desc: `Estorno #${id} registrado`, tone: "warn" });
      })
      .catch(err => toast({ title: "Erro ao anular", desc: "Verifique a conexão com o servidor.", tone: "danger" }));
  };

  const submitMovement = ({ tipo, sku, mat, qty, resp, doc, dest, obs }) => {
    const code = sku || mat;
    api.postMovimentacao({ tipo, sku: code, qty, resp, doc, dest, obs })
      .then(({ movimentacao, material }) => {
        setMateriais(prev => prev.map(m => m.sku === material.sku ? material : m));
        setMovs(prev => [movimentacao, ...prev]);
        atualizarStats();
        toast({ title: tipo === "in" ? "Entrada registrada" : "Saída registrada", desc: qty + " " + material.unit + " · " + material.name, tone: tipo === "in" ? "success" : "info" });
        setModal(null);
      })
      .catch(() => toast({ title: "Erro ao registrar", desc: "Verifique a conexão com o servidor.", tone: "danger" }));
  };

  const submitNewMaterial = (f) => {
    api.postMaterial(f)
      .then(novo => {
        setMateriais(prev => [novo, ...prev]);
        toast({ title: "Material cadastrado", desc: f.name, tone: "success" });
        setModal(null);
      })
      .catch(() => toast({ title: "Erro ao cadastrar", desc: "Verifique a conexão com o servidor.", tone: "danger" }));
  };

  const submitEditMaterial = (upd) => {
    const { resp, ...dadosMaterial } = upd;
    api.putMaterial(upd.sku, { ...dadosMaterial, resp: resp || "Suprimento" })
      .then(atualizado => {
        setMateriais(prev => prev.map(m => m.sku === upd.sku ? atualizado : m));
        api.getMovimentacoes().then(setMovs);
        toast({ title: "Material atualizado", desc: upd.name, tone: "success" });
        setModal(null);
      })
      .catch(() => toast({ title: "Erro ao atualizar", desc: "Verifique a conexão com o servidor.", tone: "danger" }));
  };

  const deleteMaterial = (m) => {
    if (!window.confirm(`Excluir "${m.name}" do catálogo? Esta ação não pode ser desfeita.`)) return;
    api.deleteMaterial(m.sku)
      .then(() => {
        setMateriais(prev => prev.filter(x => x.sku !== m.sku));
        toast({ title: "Material excluído", desc: m.name, tone: "warn" });
      })
      .catch(() => toast({ title: "Erro ao excluir", desc: "Verifique a conexão com o servidor.", tone: "danger" }));
  };

  const submitUpdateQty = ({ sku, novo, motivo }) => {
    api.postAjuste({ sku, novoQty: novo, motivo })
      .then(({ material }) => {
        setMateriais(prev => prev.map(m => m.sku === sku ? material : m));
        api.getMovimentacoes().then(setMovs);
        toast({ title: "Estoque atualizado", desc: material.name, tone: "success" });
        setModal(null);
      })
      .catch(() => toast({ title: "Erro ao ajustar", desc: "Verifique a conexão com o servidor.", tone: "danger" }));
  };

  const submitBulkOut = ({ items, qtds, resp, dest }) => {
    const itensValidos = items.filter(m => parseInt(qtds[m.id] || 0) > 0);
    if (itensValidos.length === 0) return;
    Promise.all(itensValidos.map(m =>
      api.postMovimentacao({ tipo: "out", sku: m.sku, qty: parseInt(qtds[m.id]), resp, dest })
    )).then(resultados => {
      resultados.forEach(({ material }) => {
        setMateriais(prev => prev.map(m => m.sku === material.sku ? material : m));
      });
      api.getMovimentacoes().then(setMovs);
      toast({ title: "Saídas registradas", desc: `${itensValidos.length} material(is) retirado(s)`, tone: "info" });
      setModal(null);
      setBulkIds([]);
    }).catch(() => toast({ title: "Erro ao registrar", desc: "Verifique a conexão com o servidor.", tone: "danger" }));
  };

  if (!autenticado) return <Login onLogin={() => setAutenticado(true)} />;

  if (erroConexao) return <ErroConexao />;

  if (carregando) return (
    <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-1)" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ font: "600 15px var(--font-sans)", color: "var(--fg-3)" }}>Carregando dados...</div>
      </div>
    </div>
  );

  const totalAlertas = counts.baixa + counts.crit;

  const MobileNav = () => {
    const btn = (icon, label, v, badge) => (
      <button className={"mobile-nav-btn" + (view === v ? " active" : "")} onClick={() => setView(v)}>
        {badge > 0 && <span className="mobile-nav-badge">{badge > 9 ? "9+" : badge}</span>}
        <Icon name={icon} size={22} stroke={view === v ? 2.2 : 1.8} />
        <span className="label">{label}</span>
      </button>
    );
    return (
      <nav className="mobile-nav" aria-label="Navegação principal">
        <div className="mobile-nav-inner">
          {btn("ArrowDownToLine", "Entrada",  "entradas")}
          {btn("ArrowUpFromLine", "Saída",    "saidas")}
          {btn("Boxes",           "Materiais","materiais")}
          {btn("TriangleAlert",   "Alertas",  "alertas", totalAlertas)}
          {btn("LayoutDashboard", "Início",   "dashboard")}
        </div>
      </nav>
    );
  };

  return (
    <div className="app-shell" style={{ display: "flex", height: "100%", position: "relative" }}>
      <Sidebar view={view} setView={setView} collapsed={collapsed} setCollapsed={setCollapsed} counts={counts} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, position: "relative", zIndex: 1 }}>
        <Topbar theme={theme} onToggleTheme={() => setTheme(t => t === "dark" ? "light" : "dark")}
          onSearch={() => setPaletteOpen(true)} alertas={alertas} movs={movs}
          onOpenAlertas={() => setView("alertas")} onOpenHistorico={() => setView("movimentacao")}
          onOpenGuia={() => setView("guia")} onOpenProfile={() => setProfileOpen(true)} toast={toast}
          perfil={config && config.perfil} />
        <main ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "24px 26px 44px" }}>
          <div style={{ maxWidth: 1340, margin: "0 auto" }}>
            {view === "dashboard" && <Dashboard materiais={materiais} alertas={alertas} movs={movs} statsKpis={statsKpis} openModal={openModal} setView={setView} toast={toast} />}
            {view === "materiais" && <Materiais materiais={materiais} loading={loadingMat} initialQ={matInitialQ} onNew={() => openModal("new")} openModal={openModal} onEdit={openEdit} onDelete={deleteMaterial} toast={toast} onBulkOut={ids => { setBulkIds(ids); setModal("bulk"); }} />}
            {view === "entradas" && <MovementScreen tipo="in" materiais={materiais} onSubmit={submitMovement} onAdjust={submitUpdateQty} />}
            {view === "saidas" && <MovementScreen tipo="out" materiais={materiais} onSubmit={submitMovement} onAdjust={submitUpdateQty} />}
            {(view === "movimentacao" || view === "historico") && <Historico movs={movs} initialTab={histFilter} onAnular={anularMovimentacao} />}
            {view === "relatorios" && <Relatorios materiais={materiais} movs={movs} alertas={alertas} />}
            {view === "categorias" && <Cadastros materiais={materiais} toast={toast} config={config} onConfigChange={updateConfig} onChange={() => api.getMateriais().then(setMateriais)} />}
            {view === "config" && <Configuracoes theme={theme} onToggleTheme={() => setTheme(t => t === "dark" ? "light" : "dark")} toast={toast} config={config} onConfigChange={updateConfig} setView={setView} />}
            {view === "guia" && <Guia setView={setView} />}
            {view === "alertas" && <Alertas alertas={alertas} toast={toast} openModal={openModal} />}
          </div>
        </main>
      </div>

      <MobileNav />

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} materiais={materiais} setView={setView} onMatSelect={q => setMatInitialQ(q)} />
      <MovementModal open={modal === "in" || modal === "out"} tipo={modal} materiais={materiais} initialSku={preset} onClose={() => setModal(null)} onSubmit={submitMovement} />
      <AddMaterialModal open={modal === "new"} onClose={() => setModal(null)} onSubmit={submitNewMaterial} />
      <EditMaterialModal open={modal === "edit"} material={editMat} onClose={() => setModal(null)} onSubmit={submitEditMaterial} />
      <EditProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} config={config} onSaved={(novoPerfil) => { if (config) updateConfig({ ...config, perfil: novoPerfil }); }} />
      <UpdateQtyModal open={modal === "adj"} materiais={materiais} initialSku={preset} onClose={() => setModal(null)} onSubmit={submitUpdateQty} />
      <BulkOutModal open={modal === "bulk"} materiais={materiais} ids={bulkIds} onClose={() => { setModal(null); setBulkIds([]); }} onSubmit={submitBulkOut} />
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
