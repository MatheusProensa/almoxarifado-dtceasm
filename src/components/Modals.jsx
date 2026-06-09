/* ============================================================================
   Modals.jsx — fluxos rápidos: entrada/saída, novo material, atualizar estoque
   Foco: poucos campos, rótulos claros, poucos cliques.
   ========================================================================== */

function Modal({ open, onClose, icon, iconColor = "var(--brand-600)", title, subtitle, children, footer, width = 480 }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 600, background: "var(--scrim)", backdropFilter: "blur(2px)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "9vh", animation: "fadeIn var(--dur-fast) ease both" }}>
      <div onClick={e => e.stopPropagation()} style={{ width, maxWidth: "94vw", maxHeight: "84vh", overflowY: "auto", background: "var(--bg-2)", border: "1px solid var(--line-2)", borderRadius: "var(--r-lg)", boxShadow: "var(--shadow-lg)", animation: "popIn var(--dur-base) var(--ease-out) both" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 13, padding: "18px 20px", borderBottom: "1px solid var(--line-1)" }}>
          <span style={{ width: 38, height: 38, borderRadius: "var(--r-md)", display: "grid", placeItems: "center", background: `color-mix(in srgb, ${iconColor} 14%, transparent)`, color: iconColor, flexShrink: 0 }}>
            <Icon name={icon} size={19} stroke={2.1} />
          </span>
          <div style={{ flex: 1 }}>
            <h3 style={{ font: "700 16px/1.2 var(--font-sans)", color: "var(--fg-1)", letterSpacing: "-0.01em" }}>{title}</h3>
            {subtitle && <p style={{ font: "400 12.5px/1.4 var(--font-sans)", color: "var(--fg-3)", marginTop: 4 }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, display: "grid", placeItems: "center", borderRadius: "var(--r-sm)", border: "none", background: "transparent", color: "var(--fg-3)", cursor: "pointer" }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-3)"; e.currentTarget.style.color = "var(--fg-1)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--fg-3)"; }}>
            <Icon name="X" size={17} />
          </button>
        </div>
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 15 }}>{children}</div>
        {footer && <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "14px 20px", borderTop: "1px solid var(--line-1)", background: "var(--bg-inset)", borderRadius: "0 0 var(--r-lg) var(--r-lg)" }}>{footer}</div>}
      </div>
    </div>
  );
}

function MField({ label, hint, required, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <span style={{ font: "600 12.5px/1 var(--font-sans)", color: "var(--fg-1)" }}>
        {label}{required && <span style={{ color: "var(--danger-500)", marginLeft: 3 }}>*</span>}
      </span>
      {children}
      {hint && <span style={{ font: "400 11px/1.3 var(--font-sans)", color: "var(--fg-3)" }}>{hint}</span>}
    </label>
  );
}

function MSelect({ value, placeholder, options, onChange }) {
  return (
    <div style={{ position: "relative" }}>
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        width: "100%", height: 40, padding: "0 36px 0 12px", appearance: "none",
        background: "var(--bg-2)", border: "1px solid var(--line-2)", borderRadius: "var(--r-sm)",
        color: value ? "var(--fg-1)" : "var(--fg-3)", font: "500 13.5px/1 var(--font-sans)", cursor: "pointer", outline: "none",
      }}>
        <option value="" disabled>{placeholder}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--fg-3)" }}>
        <Icon name="ChevronDown" size={16} />
      </span>
    </div>
  );
}

function MText({ value, onChange, placeholder, type = "text" }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} inputMode={type === "number" ? "numeric" : undefined}
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      style={{
        height: 40, padding: "0 12px", width: "100%", background: "var(--bg-2)",
        border: "1px solid", borderColor: focus ? "var(--brand-500)" : "var(--line-2)",
        boxShadow: focus ? "var(--ring-focus)" : "none", borderRadius: "var(--r-sm)",
        color: "var(--fg-1)", font: "500 13.5px/1 var(--font-sans)", outline: "none",
        transition: "border-color var(--dur-fast), box-shadow var(--dur-fast)",
      }} />
  );
}

/* ---- Seletor de material com busca (combobox) ---------------------------- */
function MaterialPicker({ materiais, value, onChange, placeholder = "Buscar material por nome ou código…" }) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const ref = React.useRef(null);
  const sel = materiais.find(m => m.sku === value);
  React.useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const list = materiais
    .filter(m => { const s = q.toLowerCase(); return !q || m.name.toLowerCase().includes(s) || m.sku.toLowerCase().includes(s); })
    .sort((a, b) => a.name.localeCompare(b.name, "pt")).slice(0, 30);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div onClick={() => { setOpen(true); setQ(""); }} style={{
        display: "flex", alignItems: "center", gap: 9, height: 40, padding: "0 12px", cursor: "text",
        background: "var(--bg-2)", border: "1px solid", borderColor: open ? "var(--brand-500)" : "var(--line-2)",
        boxShadow: open ? "var(--ring-focus)" : "none", borderRadius: "var(--r-sm)", transition: "border-color var(--dur-fast), box-shadow var(--dur-fast)",
      }}>
        <Icon name="Search" size={16} style={{ color: "var(--fg-3)", flexShrink: 0 }} />
        {open
          ? <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder={placeholder}
              style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", color: "var(--fg-1)", font: "500 13.5px/1 var(--font-sans)" }} />
          : sel
            ? <span style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ font: "600 13.5px/1 var(--font-sans)", color: "var(--fg-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sel.name}</span>
              </span>
            : <span style={{ flex: 1, font: "500 13.5px/1 var(--font-sans)", color: "var(--fg-3)" }}>{placeholder}</span>}
        <Icon name="ChevronDown" size={16} style={{ color: "var(--fg-3)", flexShrink: 0 }} />
      </div>
      {open && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 46, zIndex: 40, maxHeight: 264, overflowY: "auto", padding: 6, background: "var(--bg-2)", border: "1px solid var(--line-2)", borderRadius: "var(--r-md)", boxShadow: "var(--shadow-pop)", animation: "popIn var(--dur-fast) var(--ease-out) both" }}>
          {list.length === 0 && <div style={{ padding: 18, textAlign: "center", font: "400 12.5px var(--font-sans)", color: "var(--fg-3)" }}>Nenhum material encontrado</div>}
          {list.map(m => (
            <button key={m.id} onClick={() => { onChange(m.sku); setOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 9px", border: "none", borderRadius: "var(--r-sm)", cursor: "pointer", background: m.sku === value ? "var(--brand-tint)" : "transparent", textAlign: "left" }}
              onMouseEnter={e => { if (m.sku !== value) e.currentTarget.style.background = "var(--bg-3)"; }}
              onMouseLeave={e => { if (m.sku !== value) e.currentTarget.style.background = "transparent"; }}>
              <span style={{ width: 26, height: 26, borderRadius: 6, display: "grid", placeItems: "center", background: `color-mix(in srgb, ${getCat(m.cat).color} 14%, transparent)`, color: getCat(m.cat).color, flexShrink: 0 }}>
                <Icon name={getCat(m.cat).icon} size={14} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", font: "600 12.5px/1.2 var(--font-sans)", color: "var(--fg-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.name}</span>
                <span style={{ font: "500 11px/1 var(--font-sans)", color: "var(--fg-3)" }}>{getCat(m.cat).label} · {m.loc}</span>
              </span>
              <span style={{ font: "600 12px/1 var(--font-sans)", color: STATUS[m.status].color, flexShrink: 0 }}>{m.qty} {m.unit}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---- Registrar entrada / saída ------------------------------------------- */
function MovementModal({ open, tipo, materiais, onClose, onSubmit, initialSku = "" }) {
  const t = MOVTYPE[tipo] || MOVTYPE.in;
  const HOJE = new Date().toISOString().slice(0, 10);
  const toBR = d => { const p = d.split("-"); return p[2] + "/" + p[1] + "/" + p[0]; };
  const [sku, setSku] = React.useState("");
  const [qty, setQty] = React.useState("");
  const [resp, setResp] = React.useState("");
  const [doc, setDoc] = React.useState("");
  const [dest, setDest] = React.useState("");
  const [data, setData] = React.useState(HOJE);
  const [obs, setObs] = React.useState("");
  React.useEffect(() => { if (open) { setSku(initialSku); setQty(""); setResp(""); setDoc(""); setDest(""); setData(HOJE); setObs(""); } }, [open, tipo]);
  const mat = materiais.find(m => m.sku === sku);
  const isIn = tipo === "in";
  const n = parseInt(qty, 10) || 0;
  const semSaldo = !isIn && mat && n > mat.qty;
  const ready = sku && n > 0 && resp && data && (isIn || dest) && !semSaldo;
  return (
    <Modal open={open} onClose={onClose} icon={isIn ? "ArrowDownToLine" : "ArrowUpFromLine"} iconColor={t.color}
      title={isIn ? "Registrar entrada" : "Registrar saída"}
      subtitle={isIn ? "Adicionar materiais ao estoque" : "Retirar materiais do estoque"}
      footer={<>
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button variant={isIn ? "primary" : "gold"} icon={isIn ? "ArrowDownToLine" : "ArrowUpFromLine"} disabled={!ready}
          onClick={() => onSubmit({ tipo, sku, qty: n, resp, doc: isIn ? doc : dest, dest, obs, at: toBR(data) })}>
          {isIn ? "Confirmar entrada" : "Confirmar saída"}
        </Button>
      </>}>
      <MField label="Material" required>
        <MaterialPicker materiais={materiais} value={sku} onChange={setSku} />
      </MField>
      {mat && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 13px", background: "var(--bg-inset)", border: "1px solid var(--line-1)", borderRadius: "var(--r-sm)" }}>
          <Icon name="MapPin" size={15} style={{ color: "var(--fg-3)" }} />
          <span style={{ font: "500 12.5px/1 var(--font-sans)", color: "var(--fg-2)" }}>Saldo atual: <b style={{ color: "var(--fg-1)" }}>{mat.qty} {mat.unit}</b> · Local {mat.loc}</span>
          <span style={{ marginLeft: "auto" }}><StatusPill status={mat.status} /></span>
        </div>
      )}
      {semSaldo && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 13px", background: "var(--danger-tint)", border: "1px solid color-mix(in srgb, var(--danger-500) 35%, transparent)", borderRadius: "var(--r-sm)" }}>
          <Icon name="TriangleAlert" size={18} style={{ color: "var(--danger-500)", flexShrink: 0 }} />
          <span style={{ font: "500 12px/1.4 var(--font-sans)", color: "var(--danger-500)" }}>Quantidade maior que o saldo disponível (<b>{mat.qty} {mat.unit}</b>).</span>
        </div>
      )}
      <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13 }}>
        <MField label={isIn ? "Quantidade recebida" : "Quantidade retirada"} required><MText value={qty} onChange={setQty} placeholder="0" type="number" /></MField>
        <MField label="Data" required>
          <input type="date" value={data} max={HOJE} onChange={e => setData(e.target.value)}
            style={{ height: 40, padding: "0 12px", width: "100%", background: "var(--bg-2)", border: "1px solid var(--line-2)", borderRadius: "var(--r-sm)", color: "var(--fg-1)", font: "500 13.5px/1 var(--font-sans)", outline: "none", colorScheme: "light" }} />
        </MField>
      </div>
      <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13 }}>
        {isIn
          ? <MField label="Responsável" required><MSelect value={resp} placeholder="Selecione" onChange={setResp} options={RESPONSAVEIS.map(r => ({ value: r.name, label: r.name }))} /></MField>
          : <MField label="Militar (quem retirou)" required><MText value={resp} onChange={setResp} placeholder="Nome do militar" /></MField>}
        {isIn
          ? <MField label="Documento"><MText value={doc} onChange={setDoc} placeholder="GFM/GMM nº 0000" /></MField>
          : <MField label="Destino / setor" required><MSelect value={dest} placeholder="Selecione o setor" onChange={setDest} options={SETORES.map(s => ({ value: s, label: s }))} /></MField>}
      </div>
      <MField label="Observações">
        <textarea value={obs} onChange={e => setObs(e.target.value)} rows={2} placeholder="Informações adicionais (opcional)…"
          style={{ width: "100%", padding: "10px 12px", background: "var(--bg-2)", border: "1px solid var(--line-2)", borderRadius: "var(--r-sm)", color: "var(--fg-1)", font: "500 13px/1.45 var(--font-sans)", outline: "none", resize: "vertical" }} />
      </MField>
    </Modal>
  );
}

/* ---- Novo material -------------------------------------------------------- */
function AddMaterialModal({ open, onClose, onSubmit }) {
  const blank = { name: "", cat: "", unit: "un", qty: "", min: "", loc: "", obs: "" };
  const [f, setF] = React.useState(blank);
  React.useEffect(() => { if (open) setF(blank); }, [open]);
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const qty = parseInt(f.qty, 10) || 0;
  const min = parseInt(f.min, 10) || 0;
  const alertaImediato = f.min && f.qty && min > 0 && qty < min;
  const ready = f.name && f.cat && f.min;
  return (
    <Modal open={open} onClose={onClose} icon="PackagePlus" iconColor="var(--brand-600)" width={540}
      title="Novo material" subtitle="Cadastrar item no almoxarifado"
      footer={<>
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" icon="Check" disabled={!ready}
          onClick={() => onSubmit({ ...f, qty, min })}>Salvar material</Button>
      </>}>
      <MField label="Nome do material" required hint="Nomenclatura conforme a GFM (Guia de Fornecimento de Material)"><MText value={f.name} onChange={v => set("name", v)} placeholder="Ex.: Cabo coaxial RG-213/U" /></MField>
      <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13 }}>
        <MField label="Categoria" required>
          <MSelect value={f.cat} placeholder="Selecione" onChange={v => set("cat", v)} options={Object.entries(CATEGORIAS).map(([k, c]) => ({ value: k, label: c.label }))} />
        </MField>
        <MField label="Unidade de medida"><MSelect value={f.unit} placeholder="un" onChange={v => set("unit", v)} options={UNIDADES.map(u => ({ value: u, label: u }))} /></MField>
      </div>
      <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13 }}>
        <MField label="Quantidade inicial"><MText value={f.qty} onChange={v => set("qty", v)} placeholder="0" type="number" /></MField>
        <MField label="Estoque mínimo" required><MText value={f.min} onChange={v => set("min", v)} placeholder="0" type="number" /></MField>
      </div>
      {alertaImediato && (
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 13px", background: "var(--warn-tint, color-mix(in srgb, #F59E0B 12%, transparent))", border: "1px solid color-mix(in srgb, #F59E0B 30%, transparent)", borderRadius: "var(--r-sm)" }}>
          <Icon name="TriangleAlert" size={15} style={{ color: "#F59E0B", flexShrink: 0 }} />
          <span style={{ font: "500 12px/1.4 var(--font-sans)", color: "#92610A" }}>
            A quantidade inicial ({qty}) está abaixo do mínimo ({min}) — este material já entrará como alerta de estoque.
          </span>
        </div>
      )}
      <MField label="Localização física" hint="Corredor-Prateleira-Nível"><MText value={f.loc} onChange={v => set("loc", v.toUpperCase())} placeholder="B-04-2" /></MField>
      <MField label="Observações">
        <textarea value={f.obs} onChange={e => set("obs", e.target.value)} placeholder="Notas, especificações, fornecedor preferencial…" rows={2}
          style={{ width: "100%", padding: "10px 12px", background: "var(--bg-2)", border: "1px solid var(--line-2)", borderRadius: "var(--r-sm)", color: "var(--fg-1)", font: "500 13px/1.45 var(--font-sans)", outline: "none", resize: "vertical" }} />
      </MField>
    </Modal>
  );
}

/* ---- Editar material ------------------------------------------------------ */
function EditMaterialModal({ open, material, onClose, onSubmit }) {
  const [f, setF] = React.useState({ name: "", cat: "", unit: "un", loc: "", qty: "", min: "", obs: "", resp: "" });
  React.useEffect(() => { if (open && material) setF({ name: material.name, cat: material.cat, unit: material.unit, loc: material.loc, qty: String(material.qty), min: String(material.min), obs: material.obs || "", resp: "" }); }, [open, material]);
  if (!material) return null;
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const qtyChanged = parseInt(f.qty, 10) !== material.qty;
  const ready = f.name && f.cat && f.min !== "" && f.resp;
  return (
    <Modal open={open} onClose={onClose} icon="Pencil" iconColor="var(--brand-600)" width={540}
      title="Editar material" subtitle={material.name}
      footer={<>
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" icon="Check" disabled={!ready}
          onClick={() => onSubmit({ ...material, name: f.name, cat: f.cat, unit: f.unit, loc: f.loc || "—", qty: parseInt(f.qty, 10) || 0, min: parseInt(f.min, 10) || 0, obs: f.obs, resp: f.resp })}>Salvar alterações</Button>
      </>}>
      <MField label="Nomenclatura do material" required><MText value={f.name} onChange={v => set("name", v)} placeholder="Nome do material" /></MField>
      <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13 }}>
        <MField label="Categoria" required>
          <MSelect value={f.cat} placeholder="Selecione" onChange={v => set("cat", v)} options={Object.entries(CATEGORIAS).map(([k, c]) => ({ value: k, label: c.label }))} />
        </MField>
        <MField label="Unidade de medida"><MSelect value={f.unit} placeholder="un" onChange={v => set("unit", v)} options={UNIDADES.map(u => ({ value: u, label: u }))} /></MField>
      </div>
      <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13 }}>
        <MField label="Estoque atual" hint={qtyChanged ? "Gera um ajuste no histórico" : null}><MText value={f.qty} onChange={v => set("qty", v)} placeholder="0" type="number" /></MField>
        <MField label="Estoque mínimo" required><MText value={f.min} onChange={v => set("min", v)} placeholder="0" type="number" /></MField>
      </div>
      {qtyChanged && (
        <div style={{ display: "flex", alignItems: "center", gap: 9, font: "500 12px/1.4 var(--font-sans)", color: "var(--warn-500)" }}>
          <Icon name="Info" size={15} style={{ flexShrink: 0 }} />
          A mudança de saldo ({material.qty} → {parseInt(f.qty, 10) || 0} {f.unit}) será registrada como ajuste no histórico.
        </div>
      )}
      <MField label="Responsável" required>
        <MSelect value={f.resp} placeholder="Selecione o responsável" onChange={v => set("resp", v)}
          options={RESPONSAVEIS.map(r => ({ value: r.name, label: r.name }))} />
      </MField>
      <MField label="Localização física" hint="Corredor-Prateleira-Nível"><MText value={f.loc} onChange={v => set("loc", v.toUpperCase())} placeholder="A-01-1" /></MField>
      <MField label="Observações">
        <textarea value={f.obs} onChange={e => set("obs", e.target.value)} rows={2} placeholder="Notas, especificações…"
          style={{ width: "100%", padding: "10px 12px", background: "var(--bg-2)", border: "1px solid var(--line-2)", borderRadius: "var(--r-sm)", color: "var(--fg-1)", font: "500 13px/1.45 var(--font-sans)", outline: "none", resize: "vertical" }} />
      </MField>
    </Modal>
  );
}

/* ---- Atualizar estoque (ajuste / inventário) ----------------------------- */
function UpdateQtyModal({ open, materiais, onClose, onSubmit, initialSku = "" }) {
  const [sku, setSku] = React.useState("");
  const [novo, setNovo] = React.useState("");
  const [motivo, setMotivo] = React.useState("Inventário");
  React.useEffect(() => { if (open) { setSku(initialSku); setNovo(""); setMotivo("Inventário"); } }, [open]);
  const mat = materiais.find(m => m.sku === sku);
  const diff = mat && novo !== "" ? parseInt(novo, 10) - mat.qty : null;
  const ready = sku && novo !== "" && !isNaN(parseInt(novo, 10));
  return (
    <Modal open={open} onClose={onClose} icon="SlidersHorizontal" iconColor="var(--brand-600)"
      title="Atualizar estoque" subtitle="Ajustar a quantidade existente (inventário / correção)"
      footer={<>
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" icon="Check" disabled={!ready}
          onClick={() => onSubmit({ sku, novo: parseInt(novo, 10), motivo })}>Atualizar</Button>
      </>}>
      <MField label="Material" required>
        <MaterialPicker materiais={materiais} value={sku} onChange={setSku} />
      </MField>
      {mat && (
        <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13 }}>
          <div style={{ padding: "11px 13px", background: "var(--bg-inset)", border: "1px solid var(--line-1)", borderRadius: "var(--r-sm)" }}>
            <div style={{ font: "600 10px/1 var(--font-sans)", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--fg-4)", marginBottom: 6 }}>Saldo atual</div>
            <div style={{ font: "700 18px/1 var(--font-sans)", color: "var(--fg-1)" }}>{mat.qty} <span style={{ font: "500 12px/1 var(--font-sans)", color: "var(--fg-3)" }}>{mat.unit}</span></div>
          </div>
          <MField label="Novo saldo" required><MText value={novo} onChange={setNovo} placeholder={String(mat.qty)} type="number" /></MField>
        </div>
      )}
      {diff != null && diff !== 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, font: "600 12.5px/1 var(--font-sans)", color: diff > 0 ? "var(--ok-500)" : "var(--warn-500)" }}>
          <Icon name={diff > 0 ? "TrendingUp" : "TrendingDown"} size={15} />
          Ajuste de {diff > 0 ? "+" : ""}{diff} {mat.unit} será registrado no histórico
        </div>
      )}
      <MField label="Motivo do ajuste">
        <MSelect value={motivo} placeholder="Selecione" onChange={setMotivo}
          options={["Inventário", "Correção de cadastro", "Perda / avaria", "Devolução"].map(m => ({ value: m, label: m }))} />
      </MField>
    </Modal>
  );
}

/* ---- Saída em lote ------------------------------------------------------- */
function BulkOutModal({ open, materiais, ids, onClose, onSubmit }) {
  const items = materiais.filter(m => ids.includes(m.id));
  const [qtds, setQtds] = React.useState({});
  const [resp, setResp] = React.useState("");
  const [dest, setDest] = React.useState("");
  React.useEffect(() => { if (open) { setQtds({}); setResp(""); setDest(""); } }, [open]);
  const set = (id, v) => setQtds(p => ({ ...p, [id]: v }));
  const temQtd = items.some(m => parseInt(qtds[m.id] || 0) > 0);
  const semSaldo = items.some(m => { const n = parseInt(qtds[m.id] || 0); return n > 0 && n > m.qty; });
  const ready = temQtd && resp && dest && !semSaldo;
  return (
    <Modal open={open} onClose={onClose} icon="ArrowUpFromLine" iconColor="#F59E0B" width={560}
      title="Saída em lote" subtitle={`${items.length} material(is) selecionado(s)`}
      footer={<>
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button variant="gold" icon="ArrowUpFromLine" disabled={!ready} onClick={() => onSubmit({ items, qtds, resp, dest })}>Confirmar saídas</Button>
      </>}>
      <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13 }}>
        <MField label="Militar (quem retirou)" required><MText value={resp} onChange={setResp} placeholder="Nome do militar" /></MField>
        <MField label="Destino / setor" required>
          <MSelect value={dest} placeholder="Selecione o setor" onChange={setDest} options={SETORES.map(s => ({ value: s, label: s }))} />
        </MField>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map(m => {
          const n = parseInt(qtds[m.id] || 0);
          const excede = n > m.qty;
          return (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 13px", background: excede ? "var(--danger-tint)" : "var(--bg-inset)", border: `1px solid ${excede ? "color-mix(in srgb, var(--danger-500) 30%, transparent)" : "var(--line-1)"}`, borderRadius: "var(--r-sm)" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: "600 13px/1.2 var(--font-sans)", color: "var(--fg-1)" }}>{m.name}</div>
                <div style={{ font: "500 11.5px/1 var(--font-sans)", color: excede ? "var(--danger-500)" : "var(--fg-3)", marginTop: 3 }}>
                  Saldo: {m.qty} {m.unit}{excede ? " — quantidade excede o saldo!" : ""}
                </div>
              </div>
              <div style={{ width: 90 }}>
                <MText value={qtds[m.id] || ""} onChange={v => set(m.id, v)} placeholder="0" type="number" />
              </div>
            </div>
          );
        })}
      </div>
      {!temQtd && <div style={{ font: "400 12px var(--font-sans)", color: "var(--fg-3)", textAlign: "center" }}>Informe a quantidade para pelo menos um material.</div>}
    </Modal>
  );
}

/* ---- Botão "Nova movimentação" com dropdown ------------------------------ */
function NovaMovButton({ onPick }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const items = [
    { k: "in", label: "Nova entrada", icon: "ArrowDownToLine", color: "var(--ok-500)" },
    { k: "out", label: "Nova saída", icon: "ArrowUpFromLine", color: "var(--warn-500)" },
    { k: "new", label: "Novo material", icon: "PackagePlus", color: "var(--brand-600)" },
  ];
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: "inline-flex", alignItems: "center", gap: 8, height: 40, padding: "0 16px", whiteSpace: "nowrap",
        background: "var(--brand-600)", color: "var(--on-brand)", border: "1px solid rgba(255,255,255,0.14)",
        borderRadius: "var(--r-sm)", font: "600 13.5px/1 var(--font-sans)", cursor: "pointer", boxShadow: "var(--shadow-sm)",
      }}
        onMouseEnter={e => e.currentTarget.style.background = "var(--brand-500)"}
        onMouseLeave={e => e.currentTarget.style.background = "var(--brand-600)"}>
        <Icon name="Plus" size={17} stroke={2.3} /> Nova movimentação
        <Icon name="ChevronDown" size={15} style={{ marginLeft: 2, opacity: 0.85 }} />
      </button>
      {open && (
        <div style={{ position: "absolute", right: 0, top: 46, zIndex: 30, minWidth: 220, padding: 6, background: "var(--bg-2)", border: "1px solid var(--line-2)", borderRadius: "var(--r-md)", boxShadow: "var(--shadow-pop)", animation: "popIn var(--dur-fast) var(--ease-out) both" }}>
          {items.map(it => (
            <button key={it.k} onClick={() => { setOpen(false); onPick(it.k); }}
              style={{ display: "flex", alignItems: "center", gap: 11, width: "100%", height: 40, padding: "0 10px", border: "none", borderRadius: "var(--r-sm)", cursor: "pointer", background: "transparent", color: "var(--fg-1)", textAlign: "left", font: "500 13px/1 var(--font-sans)" }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--bg-3)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <span style={{ width: 28, height: 28, borderRadius: 7, display: "grid", placeItems: "center", background: `color-mix(in srgb, ${it.color} 14%, transparent)`, color: it.color }}>
                <Icon name={it.icon} size={15} stroke={2.1} />
              </span>
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---- Editar perfil -------------------------------------------------------- */
function EditProfileModal({ open, onClose, config, onSaved }) {
  const base = (config && config.perfil) || window.PROFILE || { name: "Suprimento", role: "Administrador" };
  const [name, setName] = React.useState(base.name);
  const [role, setRole] = React.useState(base.role);
  React.useEffect(() => { if (open) { const p = (config && config.perfil) || window.PROFILE || base; setName(p.name); setRole(p.role); } }, [open, config]);
  return (
    <Modal open={open} onClose={onClose} icon="User" iconColor="var(--brand-600)" title="Editar perfil" subtitle="Seus dados de operador"
      footer={<>
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" icon="Check" disabled={!name} onClick={() => {
          const novoPerfil = { ...(config && config.perfil || {}), name, role };
          window.PROFILE = novoPerfil;
          onSaved && onSaved(novoPerfil);
          onClose();
        }}>Salvar</Button>
      </>}>
      <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 2 }}>
        <Avatar name={name || "--"} size={46} />
        <span style={{ font: "500 12px/1.4 var(--font-sans)", color: "var(--fg-3)" }}>As iniciais do avatar mudam conforme o nome.</span>
      </div>
      <MField label="Nome / posto" required><MText value={name} onChange={setName} placeholder="Ex.: 2S Geraldo" /></MField>
      <MField label="Função" hint="A linha que aparece abaixo do nome"><MText value={role} onChange={setRole} placeholder="Ex.: Encarregado do almoxarifado" /></MField>
    </Modal>
  );
}

Object.assign(window, { Modal, MaterialPicker, MovementModal, AddMaterialModal, EditMaterialModal, EditProfileModal, UpdateQtyModal, BulkOutModal, NovaMovButton, MField, MSelect, MText });
