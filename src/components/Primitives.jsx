/* ============================================================================
   Primitives.jsx — botões, badges, pills, cards, inputs, avatar, toasts
   ========================================================================== */

/* ---- Status de estoque (config central) ---------------------------------- */
const STATUS = {
  ok:    { label: "Normal",   color: "var(--ok-500)",     tint: "var(--ok-tint)",     icon: "Check" },
  baixa: { label: "Atenção",  color: "var(--warn-500)",   tint: "var(--warn-tint)",   icon: "TriangleAlert" },
  crit:  { label: "Crítico",  color: "var(--crit-500)",   tint: "var(--crit-tint)",   icon: "TriangleAlert" },
  zero:  { label: "Zerado",   color: "var(--danger-500)", tint: "var(--danger-tint)", icon: "Ban" },
};
function statusOf(qty, min) {
  if (qty <= 0) return "zero";
  if (qty <= min * 0.5) return "crit";
  if (qty <= min) return "baixa";
  return "ok";
}

/* ---- Tipo de movimentação ------------------------------------------------ */
const MOVTYPE = {
  in:  { label: "Entrada", color: "var(--ok-500)",    tint: "var(--ok-tint)",    icon: "ArrowDownLeft",  sign: "+" },
  out: { label: "Saída",   color: "var(--warn-500)",  tint: "var(--warn-tint)",  icon: "ArrowUpRight",   sign: "−" },
  adj: { label: "Ajuste",  color: "var(--brand-600)", tint: "var(--brand-tint)", icon: "SlidersHorizontal", sign: "" },
};

/* ---- Button -------------------------------------------------------------- */
function Button({ children, variant = "secondary", size = "md", icon, iconRight, onClick, full, disabled, style = {} }) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const sizes = {
    sm: { h: 30, px: 11, fs: 13, gap: 6, ic: 15 },
    md: { h: 36, px: 14, fs: 13.5, gap: 7, ic: 16 },
    lg: { h: 42, px: 18, fs: 14.5, gap: 8, ic: 18 },
  }[size];
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: sizes.gap,
    height: sizes.h, padding: `0 ${sizes.px}px`, width: full ? "100%" : undefined,
    font: `600 ${sizes.fs}px/1 var(--font-sans)`, letterSpacing: "-0.01em",
    borderRadius: "var(--r-sm)", border: "1px solid transparent", cursor: disabled ? "not-allowed" : "pointer",
    whiteSpace: "nowrap", userSelect: "none", opacity: disabled ? 0.5 : 1,
    transform: press ? "translateY(0.5px) scale(0.985)" : "none",
    transition: "background var(--dur-fast), border-color var(--dur-fast), transform var(--dur-fast), box-shadow var(--dur-fast)",
    ...style,
  };
  const variants = {
    primary: {
      background: hover ? "var(--brand-500)" : "var(--brand-600)",
      color: "var(--on-brand)", borderColor: "rgba(255,255,255,0.14)",
      boxShadow: hover ? "0 6px 18px -8px var(--brand-glow), var(--inner-hairline)" : "var(--shadow-sm)",
    },
    gold: {
      background: hover ? "var(--gold-bg-hover)" : "var(--gold-bg)",
      color: "var(--on-gold)", borderColor: "rgba(0,0,0,0.16)",
      boxShadow: "var(--shadow-sm)",
    },
    secondary: {
      background: hover ? "var(--bg-4)" : "var(--bg-3)",
      color: "var(--fg-1)", borderColor: hover ? "var(--line-3)" : "var(--line-2)",
    },
    ghost: {
      background: hover ? "var(--bg-3)" : "transparent",
      color: hover ? "var(--fg-1)" : "var(--fg-2)", borderColor: "transparent",
    },
    danger: {
      background: hover ? "rgba(237,28,36,0.16)" : "rgba(237,28,36,0.10)",
      color: "var(--danger-400)", borderColor: "rgba(237,28,36,0.30)",
    },
  };
  return (
    <button
      style={{ ...base, ...variants[variant] }}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)} onMouseUp={() => setPress(false)}
    >
      {icon && <Icon name={icon} size={sizes.ic} stroke={2} />}
      {children}
      {iconRight && <Icon name={iconRight} size={sizes.ic} stroke={2} />}
    </button>
  );
}

/* ---- IconButton ---------------------------------------------------------- */
function IconButton({ name, size = 18, onClick, active, label, badge, style = {} }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button onClick={onClick} title={label} aria-label={label}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        position: "relative", width: 34, height: 34, display: "grid", placeItems: "center",
        borderRadius: "var(--r-sm)", cursor: "pointer",
        border: "1px solid", borderColor: active ? "var(--line-2)" : (hover ? "var(--line-2)" : "transparent"),
        background: active ? "var(--bg-3)" : (hover ? "var(--bg-3)" : "transparent"),
        color: active || hover ? "var(--fg-1)" : "var(--fg-2)",
        transition: "all var(--dur-fast)", ...style,
      }}>
      <Icon name={name} size={size} />
      {badge != null && (
        <span style={{
          position: "absolute", top: -3, right: -3, minWidth: 16, height: 16, padding: "0 4px",
          borderRadius: 999, background: "var(--danger-500)", color: "#fff",
          font: "700 9.5px/16px var(--font-mono)", textAlign: "center",
          border: "2px solid var(--bg-1)",
        }}>{badge}</span>
      )}
    </button>
  );
}

/* ---- Badge --------------------------------------------------------------- */
function Badge({ children, color = "var(--fg-2)", tint = "var(--bg-3)", icon, dot, style = {} }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, height: 22, padding: "0 9px",
      borderRadius: "var(--r-pill)", background: tint, color,
      font: "600 11.5px/1 var(--font-sans)", letterSpacing: "-0.005em",
      border: "1px solid color-mix(in srgb, currentColor 22%, transparent)",
      whiteSpace: "nowrap", ...style,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 999, background: color }} />}
      {icon && <Icon name={icon} size={12} stroke={2.2} />}
      {children}
    </span>
  );
}

function StatusPill({ status, style = {} }) {
  const s = STATUS[status];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, height: 23, padding: "0 9px",
      borderRadius: "var(--r-xs)", background: s.tint, color: s.color,
      font: "600 12px/1 var(--font-sans)",
      border: "1px solid color-mix(in srgb, currentColor 20%, transparent)", whiteSpace: "nowrap", ...style,
    }}>
      <Icon name={s.icon} size={12.5} stroke={2.4} />{s.label}
    </span>
  );
}

/* ---- Card ---------------------------------------------------------------- */
function Card({ children, pad = 20, hover, onClick, style = {} }) {
  const [h, setH] = React.useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => hover && setH(true)} onMouseLeave={() => hover && setH(false)}
      style={{
        position: "relative", background: "var(--bg-2)",
        border: "1px solid", borderColor: h ? "var(--line-2)" : "var(--line-1)",
        borderRadius: "var(--r-lg)", padding: pad,
        boxShadow: h ? "var(--shadow-md)" : "var(--shadow-sm)",
        transition: "border-color var(--dur-base), box-shadow var(--dur-base), transform var(--dur-base)",
        transform: h && onClick ? "translateY(-2px)" : "none",
        cursor: onClick ? "pointer" : "default", ...style,
      }}>
      {children}
    </div>
  );
}

/* ---- Input / SearchInput ------------------------------------------------- */
function Input({ value, onChange, placeholder, icon, kbd, size = "md", full, onKeyDown, style = {} }) {
  const [focus, setFocus] = React.useState(false);
  const h = size === "sm" ? 32 : 38;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, height: h, padding: "0 11px",
      width: full ? "100%" : undefined, background: "var(--bg-2)",
      border: "1px solid", borderColor: focus ? "var(--brand-500)" : "var(--line-2)",
      borderRadius: "var(--r-sm)", boxShadow: focus ? "var(--ring-focus)" : "none",
      transition: "border-color var(--dur-fast), box-shadow var(--dur-fast)", ...style,
    }}>
      {icon && <Icon name={icon} size={16} style={{ color: "var(--fg-3)" }} />}
      <input value={value} onChange={e => onChange && onChange(e.target.value)} placeholder={placeholder}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} onKeyDown={onKeyDown}
        style={{
          flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none",
          color: "var(--fg-1)", font: "500 13.5px/1 var(--font-sans)",
        }} />
      {kbd && <kbd style={{
        font: "600 11px/1 var(--font-mono)", color: "var(--fg-3)", background: "var(--bg-4)",
        padding: "3px 6px", borderRadius: 5, border: "1px solid var(--line-2)",
      }}>{kbd}</kbd>}
    </div>
  );
}

/* ---- Segmented control --------------------------------------------------- */
function Segmented({ options, value, onChange, size = "md" }) {
  const h = size === "sm" ? 30 : 34;
  return (
    <div style={{
      display: "inline-flex", padding: 3, gap: 2, background: "var(--bg-inset)",
      border: "1px solid var(--line-1)", borderRadius: "var(--r-sm)",
    }}>
      {options.map(o => {
        const active = o.value === value;
        return (
          <button key={o.value} onClick={() => onChange(o.value)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6, height: h - 6, padding: "0 12px",
              borderRadius: 6, border: "none", cursor: "pointer",
              background: active ? "var(--bg-4)" : "transparent",
              color: active ? "var(--fg-1)" : "var(--fg-3)",
              font: "600 12.5px/1 var(--font-sans)", letterSpacing: "-0.01em",
              boxShadow: active ? "var(--shadow-sm), var(--inner-hairline)" : "none",
              transition: "all var(--dur-fast)",
            }}>
            {o.icon && <Icon name={o.icon} size={14} stroke={2.1} />}
            {o.label}
            {o.count != null && <span style={{
              font: "600 10.5px/1 var(--font-mono)", color: active ? "var(--fg-3)" : "var(--fg-4)",
              background: active ? "var(--bg-2)" : "transparent", padding: "2px 5px", borderRadius: 999,
            }}>{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

/* ---- Avatar -------------------------------------------------------------- */
function Avatar({ name, size = 32, color = "var(--brand-600)" }) {
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      display: "grid", placeItems: "center", color: "#fff",
      background: `linear-gradient(140deg, ${color}, color-mix(in srgb, ${color} 60%, #000))`,
      font: `700 ${size * 0.38}px/1 var(--font-sans)`, letterSpacing: "-0.02em",
      border: "1px solid rgba(255,255,255,0.12)",
    }}>{initials}</div>
  );
}

/* ---- Empty state --------------------------------------------------------- */
function EmptyState({ icon = "Inbox", title, desc, action }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      textAlign: "center", padding: "56px 24px", gap: 4,
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: "var(--r-lg)", display: "grid", placeItems: "center",
        background: "var(--bg-3)", border: "1px solid var(--line-2)", color: "var(--fg-3)", marginBottom: 8,
      }}><Icon name={icon} size={24} /></div>
      <div className="t-h3">{title}</div>
      <div style={{ color: "var(--fg-3)", font: "400 13px/1.5 var(--font-sans)", maxWidth: 320 }}>{desc}</div>
      {action && <div style={{ marginTop: 12 }}>{action}</div>}
    </div>
  );
}

/* ---- Toast system -------------------------------------------------------- */
const ToastCtx = React.createContext(() => {});
function useToast() { return React.useContext(ToastCtx); }
function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);
  const push = React.useCallback((t) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(ts => [...ts, { id, ...t }]);
    setTimeout(() => setToasts(ts => ts.filter(x => x.id !== id)), t.duration || 3200);
  }, []);
  const tone = {
    success: { color: "var(--ok-500)", icon: "CircleCheck" },
    info:    { color: "var(--brand-400)", icon: "Info" },
    warn:    { color: "var(--warn-500)", icon: "AlertTriangle" },
    danger:  { color: "var(--danger-400)", icon: "CircleAlert" },
  };
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div style={{ position: "fixed", bottom: 22, right: 22, zIndex: 1000, display: "flex", flexDirection: "column", gap: 10 }}>
        {toasts.map(t => {
          const tn = tone[t.tone || "success"];
          return (
            <div key={t.id} style={{
              display: "flex", alignItems: "flex-start", gap: 11, minWidth: 280, maxWidth: 380,
              padding: "12px 14px", background: "var(--bg-3)", border: "1px solid var(--line-2)",
              borderRadius: "var(--r-md)", boxShadow: "var(--shadow-lg)", animation: "popIn var(--dur-base) var(--ease-out) both",
            }}>
              <span style={{ color: tn.color, marginTop: 1 }}><Icon name={tn.icon} size={18} /></span>
              <div style={{ flex: 1 }}>
                <div style={{ font: "600 13px/1.3 var(--font-sans)", color: "var(--fg-1)" }}>{t.title}</div>
                {t.desc && <div style={{ marginTop: 2, font: "400 12px/1.4 var(--font-sans)", color: "var(--fg-3)" }}>{t.desc}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}

/* ---- Misc ---------------------------------------------------------------- */
function Divider({ vertical, style = {} }) {
  return <div style={vertical
    ? { width: 1, alignSelf: "stretch", background: "var(--line-1)", ...style }
    : { height: 1, width: "100%", background: "var(--line-1)", ...style }} />;
}
function SectionLabel({ children, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <h3 className="t-h3">{children}</h3>
      {action}
    </div>
  );
}

const CAT_FALLBACK = { label: "Sem categoria", color: "var(--fg-4)", icon: "Package" };
function getCat(cat) {
  return (window.CATEGORIAS && window.CATEGORIAS[cat]) || CAT_FALLBACK;
}

Object.assign(window, {
  STATUS, MOVTYPE, statusOf, getCat, Button, IconButton, Badge, StatusPill, Card, Input,
  Segmented, Avatar, EmptyState, ToastProvider, useToast, Divider, SectionLabel,
});
