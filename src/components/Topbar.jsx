/* ============================================================================
   Topbar.jsx — busca, alternador de tema, notificações, perfil
   ========================================================================== */

function ThemeToggle({ theme, onToggle }) {
  const dark = theme === "dark";
  return (
    <button onClick={onToggle} title="Alternar tema claro/escuro"
      style={{
        display: "flex", alignItems: "center", gap: 7, height: 36, padding: "0 12px 0 6px",
        borderRadius: "var(--r-pill)", border: "1px solid var(--line-2)", background: "var(--bg-2)",
        cursor: "pointer", color: "var(--fg-2)",
      }}>
      <span style={{ display: "flex", gap: 2 }}>
        <span style={{ width: 26, height: 26, borderRadius: "50%", display: "grid", placeItems: "center", background: dark ? "var(--brand-tint)" : "transparent", color: dark ? "var(--brand-300)" : "var(--fg-4)" }}>
          <Icon name="Moon" size={15} stroke={2.1} />
        </span>
        <span style={{ width: 26, height: 26, borderRadius: "50%", display: "grid", placeItems: "center", background: dark ? "transparent" : "var(--gold-tint)", color: dark ? "var(--fg-4)" : "var(--gold-500)" }}>
          <Icon name="Sun" size={15} stroke={2.1} />
        </span>
      </span>
      <span style={{ font: "600 12.5px/1 var(--font-sans)", color: "var(--fg-1)" }}>{dark ? "Escuro" : "Claro"}</span>
    </button>
  );
}

function Notifications({ alertas, movs, onOpenAlertas, onOpenHistorico }) {
  const [open, setOpen] = React.useState(false);
  const [skusLidos, setSkusLidos] = React.useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("almox-notif-lidos") || "[]")); }
    catch { return new Set(); }
  });
  const ref = React.useRef(null);
  React.useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const criticos = alertas.filter(m => m.status === "zero" || m.status === "crit").slice(0, 4);
  const naoLidos = alertas.filter(m => !skusLidos.has(m.sku));
  const todasLidas = naoLidos.length === 0;
  const marcarLidas = () => {
    const novos = new Set([...skusLidos, ...alertas.map(m => m.sku)]);
    setSkusLidos(novos);
    localStorage.setItem("almox-notif-lidos", JSON.stringify([...novos]));
  };
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <IconButton name="Bell" label="Notificações" badge={todasLidas ? null : (naoLidos.length || null)} active={open} onClick={() => setOpen(o => !o)} />
      {open && (
        <div style={{ position: "absolute", right: 0, top: 44, zIndex: 40, width: 360, maxWidth: "86vw", background: "var(--bg-2)", border: "1px solid var(--line-2)", borderRadius: "var(--r-lg)", boxShadow: "var(--shadow-pop)", overflow: "hidden", animation: "popIn var(--dur-fast) var(--ease-out) both" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 15px", borderBottom: "1px solid var(--line-1)" }}>
            <span style={{ font: "700 13.5px/1 var(--font-sans)", color: "var(--fg-1)" }}>Notificações</span>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              {!todasLidas && alertas.length > 0 && <button onClick={marcarLidas} style={{ display: "inline-flex", alignItems: "center", gap: 4, font: "600 11px/1 var(--font-sans)", color: "var(--brand-600)", background: "none", border: "none", cursor: "pointer" }}><Icon name="CheckCheck" size={14} />Marcar como lidas</button>}
              <span style={{ font: "600 11px/1 var(--font-sans)", color: todasLidas ? "var(--ok-500)" : "var(--danger-500)", background: todasLidas ? "var(--ok-tint)" : "var(--danger-tint)", padding: "3px 8px", borderRadius: 999 }}>{todasLidas ? "Em dia" : naoLidos.length + " alertas"}</span>
            </div>
          </div>
          <div style={{ maxHeight: 380, overflowY: "auto" }}>
            <NSection label="Precisam de reposição" />
            {criticos.length === 0 && <div style={{ padding: "4px 15px 12px", font: "400 12px var(--font-sans)", color: "var(--fg-3)" }}>Nenhum item crítico no momento.</div>}
            {criticos.map(m => (
              <NRow key={m.id} onClick={onOpenAlertas}
                icon={STATUS[m.status].icon} color={STATUS[m.status].color}
                title={m.name} sub={m.status === "zero" ? "Item zerado — repor com urgência" : `Crítico — só ${m.qty} ${m.unit} (mín. ${m.min})`} />
            ))}
            <NSection label="Movimentações recentes" />
            {movs.slice(0, 4).map(mv => {
              const t = MOVTYPE[mv.tipo];
              return <NRow key={mv.id} onClick={onOpenHistorico} icon={t.icon} color={t.color}
                title={mv.item} sub={`${t.label} · ${t.sign}${Math.abs(mv.qty)} ${mv.unit} · ${mv.resp}`} />;
            })}
          </div>
          <button onClick={() => { setOpen(false); onOpenAlertas(); }} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", height: 40, border: "none", borderTop: "1px solid var(--line-1)", background: "var(--bg-inset)", color: "var(--brand-600)", font: "600 12.5px/1 var(--font-sans)", cursor: "pointer" }}>
            Ver central de alertas <Icon name="ArrowRight" size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
function NSection({ label }) { return <div style={{ padding: "11px 15px 5px", font: "700 10px/1 var(--font-sans)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-4)" }}>{label}</div>; }
function NRow({ icon, color, title, sub, onClick }) {
  const [h, setH] = React.useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: "flex", alignItems: "flex-start", gap: 11, width: "100%", padding: "9px 15px", border: "none", cursor: "pointer", background: h ? "var(--bg-3)" : "transparent", textAlign: "left" }}>
      <span style={{ width: 30, height: 30, borderRadius: 8, display: "grid", placeItems: "center", background: `color-mix(in srgb, ${color} 14%, transparent)`, color, flexShrink: 0, marginTop: 1 }}>
        <Icon name={icon} size={15} stroke={2.1} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", font: "600 12.5px/1.3 var(--font-sans)", color: "var(--fg-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</span>
        <span style={{ font: "400 11.5px/1.3 var(--font-sans)", color: "var(--fg-3)" }}>{sub}</span>
      </span>
    </button>
  );
}

function ProfileMenu({ theme, onToggleTheme, toast, onOpenGuia, onOpenProfile, perfil }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const dark = theme === "dark";
  const P = perfil || window.PROFILE || { name: "2S Geraldo", role: "Encarregado" };
  React.useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const item = (icon, label, onClick, danger) => {
    return (
      <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 11, width: "100%", height: 40, padding: "0 12px", border: "none", borderRadius: "var(--r-sm)", cursor: "pointer", background: "transparent", color: danger ? "var(--danger-500)" : "var(--fg-1)", font: "500 13px/1 var(--font-sans)", textAlign: "left" }}
        onMouseEnter={e => e.currentTarget.style.background = danger ? "var(--danger-tint)" : "var(--bg-3)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
        <Icon name={icon} size={16} style={{ color: danger ? "var(--danger-500)" : "var(--fg-3)" }} />{label}
      </button>
    );
  };
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: "flex", alignItems: "center", gap: 9, padding: "4px 8px 4px 4px",
        background: open ? "var(--bg-3)" : "transparent", border: "1px solid transparent", borderRadius: "var(--r-pill)", cursor: "pointer",
      }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = "var(--bg-3)"; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = "transparent"; }}>
        <Avatar name={P.name} size={32} />
        <div style={{ textAlign: "left", lineHeight: 1.2, paddingRight: 2 }}>
          <div style={{ font: "600 12.5px/1 var(--font-sans)", color: "var(--fg-1)", whiteSpace: "nowrap" }}>{P.name}</div>
          <div style={{ font: "500 10.5px/1 var(--font-sans)", color: "var(--fg-3)", marginTop: 3, whiteSpace: "nowrap", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }}>{P.role}</div>
        </div>
        <Icon name="ChevronDown" size={15} style={{ color: "var(--fg-3)" }} />
      </button>
      {open && (
        <div style={{ position: "absolute", right: 0, top: 48, zIndex: 40, width: 248, background: "var(--bg-2)", border: "1px solid var(--line-2)", borderRadius: "var(--r-lg)", boxShadow: "var(--shadow-pop)", overflow: "hidden", animation: "popIn var(--dur-fast) var(--ease-out) both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "14px 14px", borderBottom: "1px solid var(--line-1)" }}>
            <Avatar name={P.name} size={40} />
            <div>
              <div style={{ font: "700 13.5px/1.2 var(--font-sans)", color: "var(--fg-1)" }}>{P.name}</div>
              <div style={{ font: "500 11.5px/1.3 var(--font-sans)", color: "var(--fg-3)", marginTop: 4 }}>{P.role}</div>
              <div style={{ font: "600 10px/1 var(--font-sans)", color: "var(--brand-600)", marginTop: 5, letterSpacing: "0.04em" }}>DTCEA-SM · SUPRIMENTO</div>
            </div>
          </div>
          <div style={{ padding: 6 }}>
            {item("User", "Meus dados", () => { setOpen(false); onOpenProfile(); })}
            {item("LifeBuoy", "Ajuda e guia", () => { setOpen(false); onOpenGuia(); })}
          </div>
          <div style={{ padding: 6, borderTop: "1px solid var(--line-1)" }}>
            {item("LogOut", "Sair", () => {
              setOpen(false);
              toast({ title: "Saindo…", desc: `Até logo, ${P.name}`, tone: "info" });
              setTimeout(() => {
                localStorage.removeItem("almox-token");
                localStorage.removeItem("almox-user");
                window.dispatchEvent(new Event("almox-logout"));
              }, 900);
            }, true)}
          </div>
        </div>
      )}
    </div>
  );
}

function Topbar({ theme, onToggleTheme, onSearch, alertas, movs, onOpenAlertas, onOpenHistorico, onOpenGuia, onOpenProfile, toast, perfil }) {
  return (
    <header style={{
      position: "relative", zIndex: 3, height: "var(--topbar-h)", flexShrink: 0,
      display: "flex", alignItems: "center", gap: 16, padding: "0 22px",
      background: "var(--bg-1)", borderBottom: "1px solid var(--line-1)",
    }}>
      {/* busca */}
      <div onClick={onSearch} style={{ width: 400, maxWidth: "42vw", cursor: "text" }}>
        <Input icon="Search" placeholder="Buscar material ou localização…" full
          onChange={() => {}} value="" style={{ pointerEvents: "none", background: "var(--bg-3)", borderColor: "var(--line-1)" }} />
      </div>

      <div style={{ flex: 1 }} />

      {/* ações */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <Notifications alertas={alertas} movs={movs} onOpenAlertas={onOpenAlertas} onOpenHistorico={onOpenHistorico} />
        <Divider vertical style={{ height: 26, margin: "0 2px" }} />
        <ProfileMenu theme={theme} onToggleTheme={onToggleTheme} toast={toast} onOpenGuia={onOpenGuia} onOpenProfile={onOpenProfile} perfil={perfil} />
      </div>
    </header>
  );
}

Object.assign(window, { Topbar, ThemeToggle });
