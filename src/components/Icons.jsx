/* ============================================================================
   Icons.jsx — wrapper sobre Lucide (UMD) + marca Almox Proensa
   ========================================================================== */

function Icon({ name, size = 18, stroke = 1.9, className = "", style = {} }) {
  // Lucide UMD expõe cada ícone como IconNode (array de [tag, attrs]).
  const L = window.lucide || {};
  const node = L[name] || (L.icons && L.icons[name]);
  // Formato Lucide UMD: ["svg", {attrs}, [["path",{...}], ...]]
  const children = node && Array.isArray(node[2]) ? node[2] : null;
  if (!children) {
    // fallback discreto p/ nome inexistente (evita quebra de layout)
    return <span style={{ display: "inline-block", width: size, height: size, ...style }} className={className} />;
  }
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      className={className} style={{ flexShrink: 0, display: "block", ...style }}
      aria-hidden="true"
    >
      {children.map((c, i) => React.createElement(c[0], { key: i, ...c[1] }))}
    </svg>
  );
}

/* Marca: brasão DTCEA-SM (raster) + wordmark tipográfico.
   variant: "full" (lockup) | "mark" (só brasão) */
function BrandMark({ collapsed = false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
      <div style={{
        width: 34, height: 40, flexShrink: 0, position: "relative",
        display: "grid", placeItems: "center",
        filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))",
      }}>
        <img src="/assets/dtcea-sm-logo.png" alt="DTCEA-SM"
          style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </div>
      {!collapsed && (
        <div style={{ minWidth: 0, lineHeight: 1.05 }}>
          <div style={{
            font: "800 15px/1 var(--font-sans)", letterSpacing: "-0.02em", color: "var(--fg-1)",
            whiteSpace: "nowrap",
          }}>
            Almox <span style={{ color: "var(--brand-400)" }}>Proensa</span>
          </div>
          <div style={{
            marginTop: 4, font: "600 10px/1 var(--font-mono)", letterSpacing: "0.14em",
            textTransform: "uppercase", color: "var(--fg-3)",
          }}>
            DTCEA-SM · Suprimento
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { Icon, BrandMark });
