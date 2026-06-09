/* ============================================================================
   Sidebar.jsx — navegação lateral + drawer mobile
   ========================================================================== */

function NavItem({ icon, label, active, collapsed, badge, badgeTone = "danger", onClick }) {
  const [hover, setHover] = React.useState(false);
  const tone = badgeTone === "danger" ? "var(--danger-500)" : "var(--warn-500)";
  return (
    <button onClick={onClick} title={collapsed ? label : undefined}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        position: "relative", display: "flex", alignItems: "center", gap: 11, width: "100%",
        height: 38, padding: collapsed ? 0 : "0 10px", justifyContent: collapsed ? "center" : "flex-start",
        border: "none", cursor: "pointer", borderRadius: "var(--r-sm)", textAlign: "left",
        background: active ? "var(--brand-tint)" : (hover ? "var(--bg-3)" : "transparent"),
        color: active ? "var(--brand-300)" : (hover ? "var(--fg-1)" : "var(--fg-2)"),
        transition: "background var(--dur-fast), color var(--dur-fast)",
      }}>
      {active && <span style={{ position: "absolute", left: -10, top: "50%", transform: "translateY(-50%)", width: 3, height: 20, borderRadius: 999, background: "var(--brand-600)" }} />}
      <Icon name={icon} size={18} stroke={active ? 2.2 : 1.9} />
      {!collapsed && <span style={{ flex: 1, font: `${active ? 600 : 500} 13.5px/1 var(--font-sans)`, letterSpacing: "-0.005em" }}>{label}</span>}
      {!collapsed && badge != null && badge > 0 && (
        <span style={{ font: "700 11px/1 var(--font-sans)", color: tone, background: "color-mix(in srgb, " + tone + " 13%, transparent)", padding: "3px 7px", borderRadius: 999 }}>{badge}</span>
      )}
      {collapsed && badge != null && badge > 0 && (
        <span style={{ position: "absolute", top: 5, right: 10, width: 7, height: 7, borderRadius: 999, background: tone, border: "2px solid var(--bg-1)" }} />
      )}
    </button>
  );
}

function NavGroup({ title, collapsed, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {!collapsed && <div style={{ padding: "0 10px", margin: "0 0 6px", font: "700 10px/1 var(--font-sans)", letterSpacing: "0.11em", textTransform: "uppercase", color: "var(--fg-4)" }}>{title}</div>}
      {collapsed && <div style={{ height: 1, background: "var(--line-1)", margin: "7px 10px" }} />}
      {children}
    </div>
  );
}

function Sidebar({ view, setView, collapsed, setCollapsed, counts, drawerOpen, onDrawerClose }) {
  // Desktop nav item (respeita collapsed)
  const I = (icon, label, v, badge, badgeTone) =>
    <NavItem icon={icon} label={label} active={view === v} collapsed={collapsed} badge={badge} badgeTone={badgeTone} onClick={() => setView(v)} />;

  // Drawer nav item (sempre expandido, fecha drawer ao navegar)
  const ID = (icon, label, v, badge, badgeTone) =>
    <NavItem icon={icon} label={label} active={view === v} collapsed={false} badge={badge} badgeTone={badgeTone}
      onClick={() => { setView(v); onDrawerClose && onDrawerClose(); }} />;

  return (
    <>
      {/* ── Sidebar desktop (oculta no mobile via CSS .sidebar-desktop) ── */}
      <aside className="sidebar-desktop" style={{
        position: "relative", zIndex: 2,
        width: collapsed ? "var(--sidebar-w-collapsed)" : "var(--sidebar-w)",
        flexShrink: 0, height: "100%", background: "var(--bg-1)", borderRight: "1px solid var(--line-1)",
        display: "flex", flexDirection: "column", transition: "width var(--dur-slow) var(--ease-out)",
      }}>
        {/* brand */}
        <div style={{ height: "var(--topbar-h)", display: "flex", alignItems: "center", padding: collapsed ? 0 : "0 16px", justifyContent: collapsed ? "center" : "flex-start", borderBottom: "1px solid var(--line-1)", flexShrink: 0 }}>
          <BrandMark collapsed={collapsed} />
        </div>

        {/* nav */}
        <nav style={{ flex: 1, overflowY: "auto", padding: collapsed ? "14px 10px" : "16px 12px", display: "flex", flexDirection: "column", gap: 18 }}>
          <NavGroup title="Principal" collapsed={collapsed}>
            {I("LayoutDashboard", "Dashboard", "dashboard")}
            {I("Boxes", "Materiais", "materiais")}
          </NavGroup>
          <NavGroup title="Movimentação" collapsed={collapsed}>
            {I("ArrowDownToLine", "Entradas", "entradas")}
            {I("ArrowUpFromLine", "Saídas", "saidas")}
            {I("ArrowRightLeft", "Movimentações", "movimentacao")}
            {I("TriangleAlert", "Alertas", "alertas", counts.baixa + counts.crit, "danger")}
          </NavGroup>
          <NavGroup title="Gestão" collapsed={collapsed}>
            {I("FileBarChart", "Relatórios", "relatorios")}
            {I("Tags", "Cadastros", "categorias")}
            {I("Settings", "Configurações", "config")}
          </NavGroup>
        </nav>

        {/* footer */}
        <div style={{ padding: collapsed ? "10px" : "12px", borderTop: "1px solid var(--line-1)", display: "flex", flexDirection: "column", gap: 10 }}>
          {!collapsed && (
            <div style={{ padding: "13px", background: "var(--brand-tint)", border: "1px solid color-mix(in srgb, var(--brand-600) 18%, transparent)", borderRadius: "var(--r-md)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ color: "var(--brand-600)" }}><Icon name="LifeBuoy" size={17} /></span>
                <span style={{ font: "700 12.5px/1 var(--font-sans)", color: "var(--fg-1)" }}>Precisa de ajuda?</span>
              </div>
              <div style={{ font: "400 11.5px/1.45 var(--font-sans)", color: "var(--fg-3)", marginBottom: 10 }}>Acesse o guia rápido do sistema.</div>
              <button onClick={() => setView("guia")} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", height: 32, borderRadius: "var(--r-sm)", border: "1px solid var(--line-2)", background: "var(--bg-2)", color: "var(--fg-1)", font: "600 12px/1 var(--font-sans)", cursor: "pointer" }}>
                Abrir guia <Icon name="BookOpen" size={13} />
              </button>
            </div>
          )}
          <button onClick={() => setCollapsed(c => !c)}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: 34, border: "1px solid var(--line-1)", background: "transparent", color: "var(--fg-3)", borderRadius: "var(--r-sm)", cursor: "pointer", font: "600 12px/1 var(--font-sans)" }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-3)"; e.currentTarget.style.color = "var(--fg-1)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--fg-3)"; }}>
            <Icon name={collapsed ? "PanelLeftOpen" : "PanelLeftClose"} size={17} />
            {!collapsed && "Recolher"}
          </button>
          {!collapsed && (
            <div style={{ paddingTop: 4, textAlign: "center", font: "500 9.5px/1.5 var(--font-sans)", color: "var(--fg-4)" }}>
              Desenvolvido por <span style={{ color: "var(--fg-3)", fontWeight: 600 }}>Matheus Proensa</span><br />
              Ex Cb Proensa · DTCEA-SM
            </div>
          )}
        </div>
      </aside>

      {/* ── Drawer mobile ── */}
      {drawerOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 400 }}>
          {/* backdrop */}
          <div onClick={onDrawerClose}
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)", animation: "fadeIn var(--dur-fast) ease both" }} />
          {/* painel */}
          <aside style={{
            position: "absolute", left: 0, top: 0, bottom: 0, width: 264,
            background: "var(--bg-1)", borderRight: "1px solid var(--line-1)",
            display: "flex", flexDirection: "column", zIndex: 1,
            animation: "slideInLeft 0.22s var(--ease-out) both",
            boxShadow: "4px 0 24px rgba(0,0,0,0.18)",
          }}>
            {/* brand + fechar */}
            <div style={{ height: "var(--topbar-h)", display: "flex", alignItems: "center", padding: "0 12px 0 16px", justifyContent: "space-between", borderBottom: "1px solid var(--line-1)", flexShrink: 0 }}>
              <BrandMark collapsed={false} />
              <button onClick={onDrawerClose}
                style={{ width: 34, height: 34, border: "none", background: "transparent", cursor: "pointer", color: "var(--fg-3)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--r-sm)", flexShrink: 0 }}>
                <Icon name="X" size={18} />
              </button>
            </div>

            {/* nav */}
            <nav style={{ flex: 1, overflowY: "auto", padding: "16px 12px", display: "flex", flexDirection: "column", gap: 18 }}>
              <NavGroup title="Principal" collapsed={false}>
                {ID("LayoutDashboard", "Dashboard", "dashboard")}
                {ID("Boxes", "Materiais", "materiais")}
              </NavGroup>
              <NavGroup title="Movimentação" collapsed={false}>
                {ID("ArrowDownToLine", "Entradas", "entradas")}
                {ID("ArrowUpFromLine", "Saídas", "saidas")}
                {ID("ArrowRightLeft", "Movimentações", "movimentacao")}
                {ID("TriangleAlert", "Alertas", "alertas", counts.baixa + counts.crit, "danger")}
              </NavGroup>
              <NavGroup title="Gestão" collapsed={false}>
                {ID("FileBarChart", "Relatórios", "relatorios")}
                {ID("Tags", "Cadastros", "categorias")}
                {ID("Settings", "Configurações", "config")}
              </NavGroup>
            </nav>

            {/* footer */}
            <div style={{ padding: "12px", borderTop: "1px solid var(--line-1)" }}>
              <div style={{ paddingTop: 4, textAlign: "center", font: "500 9.5px/1.5 var(--font-sans)", color: "var(--fg-4)" }}>
                Desenvolvido por <span style={{ color: "var(--fg-3)", fontWeight: 600 }}>Matheus Proensa</span><br />
                Ex Cb Proensa · DTCEA-SM
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

Object.assign(window, { Sidebar });
