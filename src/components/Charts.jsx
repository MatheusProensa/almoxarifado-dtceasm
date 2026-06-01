/* ============================================================================
   Charts.jsx — visualizações em SVG (sem libs)
   ========================================================================== */

/* ---- Sparkline ----------------------------------------------------------- */
function Sparkline({ data, color = "var(--brand-400)", w = 78, h = 28 }) {
  const max = Math.max(...data), min = Math.min(...data);
  const rng = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - ((v - min) / rng) * (h - 4) - 2]);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const area = `${d} L${w} ${h} L0 ${h} Z`;
  const id = React.useId();
  return (
    <svg width={w} height={h} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id={"sp" + id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sp${id})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.4" fill={color} />
    </svg>
  );
}

/* ---- Area/line chart: entradas x saídas ---------------------------------- */
function FlowChart({ serie, height = 240 }) {
  const [hover, setHover] = React.useState(null);
  const pad = { t: 16, r: 14, b: 28, l: 38 };
  const W = 640, H = height;
  const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
  const max = Math.ceil(Math.max(...serie.flatMap(d => [d.in, d.out])) / 100) * 100;
  const x = i => pad.l + (i / (serie.length - 1)) * iw;
  const y = v => pad.t + ih - (v / max) * ih;
  const mk = key => serie.map((d, i) => [x(i), y(d[key])]);
  const line = pts => pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const inPts = mk("in"), outPts = mk("out");
  const areaIn = `${line(inPts)} L${x(serie.length - 1)} ${pad.t + ih} L${x(0)} ${pad.t + ih} Z`;
  const yticks = [0, max / 2, max];

  return (
    <div style={{ position: "relative" }}
      onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", overflow: "visible" }}>
        <defs>
          <linearGradient id="flowIn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--ok-500)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--ok-500)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* grid */}
        {yticks.map((t, i) => (
          <g key={i}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="var(--line-1)" strokeDasharray="3 4" />
            <text x={pad.l - 9} y={y(t) + 3.5} textAnchor="end"
              style={{ font: "500 10px var(--font-mono)", fill: "var(--fg-4)" }}>{t}</text>
          </g>
        ))}
        {/* x labels */}
        {serie.map((d, i) => (
          <text key={i} x={x(i)} y={H - 8} textAnchor="middle"
            style={{ font: "500 10.5px var(--font-sans)", fill: hover === i ? "var(--fg-1)" : "var(--fg-3)" }}>{d.m}</text>
        ))}
        {/* entradas area + line (verde) */}
        <path d={areaIn} fill="url(#flowIn)" />
        <path d={line(inPts)} fill="none" stroke="var(--ok-500)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        {/* saídas line (âmbar) */}
        <path d={line(outPts)} fill="none" stroke="var(--warn-500)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        {/* hover guides + points */}
        {hover != null && <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + ih} stroke="var(--line-3)" />}
        {inPts.map((p, i) => <circle key={"i" + i} cx={p[0]} cy={p[1]} r={hover === i ? 4.5 : 2.8} fill="var(--ok-500)" stroke="var(--bg-2)" strokeWidth="2" />)}
        {outPts.map((p, i) => <circle key={"o" + i} cx={p[0]} cy={p[1]} r={hover === i ? 4 : 2.4} fill="var(--warn-500)" stroke="var(--bg-2)" strokeWidth="2" />)}
        {/* hover hit zones */}
        {serie.map((d, i) => (
          <rect key={i} x={x(i) - iw / serie.length / 2} y={pad.t} width={iw / serie.length} height={ih}
            fill="transparent" onMouseEnter={() => setHover(i)} />
        ))}
      </svg>
      {hover != null && (
        <div style={{
          position: "absolute", left: `${(x(hover) / W) * 100}%`, top: 4, transform: "translateX(-50%)",
          pointerEvents: "none", background: "var(--bg-4)", border: "1px solid var(--line-2)",
          borderRadius: "var(--r-sm)", padding: "8px 10px", boxShadow: "var(--shadow-pop)", minWidth: 110,
        }}>
          <div style={{ font: "700 11px/1 var(--font-sans)", color: "var(--fg-1)", marginBottom: 6 }}>{serie[hover].m}/26</div>
          <Row dot="var(--ok-500)" label="Entradas" v={serie[hover].in} />
          <Row dot="var(--warn-500)" label="Saídas" v={serie[hover].out} />
        </div>
      )}
    </div>
  );
}
function Row({ dot, label, v }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 2 }}>
      <span style={{ width: 7, height: 7, borderRadius: 2, background: dot }} />
      <span style={{ font: "500 11px/1 var(--font-sans)", color: "var(--fg-3)", flex: 1 }}>{label}</span>
      <span style={{ font: "600 11px/1 var(--font-mono)", color: "var(--fg-1)" }}>{v}</span>
    </div>
  );
}

/* ---- Donut: estoque por categoria ---------------------------------------- */
function Donut({ data, size = 150, thick = 16 }) {
  const [hover, setHover] = React.useState(null);
  const total = data.reduce((s, d) => s + d.value, 0);
  const R = size / 2, r = R - thick / 2;
  const C = 2 * Math.PI * r;
  let acc = 0;
  const arcs = data.map(d => {
    const frac = d.value / total;
    const seg = { ...d, frac, dash: frac * C, offset: acc * C, color: window.CATEGORIAS[d.cat].color };
    acc += frac; return seg;
  });
  const active = hover != null ? arcs[hover] : null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
      <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={R} cy={R} r={r} fill="none" stroke="var(--bg-4)" strokeWidth={thick} />
          {arcs.map((a, i) => (
            <circle key={i} cx={R} cy={R} r={r} fill="none" stroke={a.color}
              strokeWidth={hover === i ? thick + 3 : thick}
              strokeDasharray={`${a.dash} ${C - a.dash}`} strokeDashoffset={-a.offset}
              strokeLinecap="butt" opacity={hover == null || hover === i ? 1 : 0.4}
              style={{ transition: "stroke-width var(--dur-fast), opacity var(--dur-fast)", cursor: "pointer" }}
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} />
          ))}
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
          <div>
            <div style={{ font: "700 22px/1 var(--font-mono)", color: "var(--fg-1)", letterSpacing: "-0.03em" }}>
              {active ? active.value : total.toLocaleString("pt-BR")}
            </div>
            <div style={{ font: "600 9.5px/1 var(--font-sans)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-3)", marginTop: 4 }}>
              {active ? window.CATEGORIAS[active.cat].label : "itens"}
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, flex: 1 }}>
        {arcs.map((a, i) => (
          <div key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
            style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer", opacity: hover == null || hover === i ? 1 : 0.5, transition: "opacity var(--dur-fast)" }}>
            <span style={{ width: 9, height: 9, borderRadius: 3, background: a.color, flexShrink: 0 }} />
            <span style={{ flex: 1, font: "500 12.5px/1 var(--font-sans)", color: "var(--fg-2)" }}>{window.CATEGORIAS[a.cat].label}</span>
            <span style={{ font: "600 12px/1 var(--font-sans)", color: "var(--fg-1)" }}>{(a.frac * 100).toFixed(0)}%</span>
            <span style={{ font: "500 11.5px/1 var(--font-sans)", color: "var(--fg-3)", minWidth: 38, textAlign: "right" }}>{a.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- Ranking de barras horizontais --------------------------------------- */
function HBarRank({ data, color = "var(--brand-500)", unit = "", labelKey = "name" }) {
  const max = Math.max(...data.map(d => d.value)) || 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <span style={{ font: "500 12.5px/1 var(--font-sans)", color: "var(--fg-2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              <span style={{ color: "var(--fg-4)", marginRight: 7, font: "600 11px/1 var(--font-sans)" }}>{i + 1}</span>{d[labelKey]}
            </span>
            <span style={{ font: "600 12.5px/1 var(--font-sans)", color: "var(--fg-1)", flexShrink: 0 }}>{d.value}{unit && <span style={{ color: "var(--fg-3)", fontWeight: 500 }}> {unit}</span>}</span>
          </div>
          <div style={{ height: 7, borderRadius: 999, background: "var(--bg-4)", overflow: "hidden" }}>
            <div style={{ width: `${(d.value / max) * 100}%`, height: "100%", borderRadius: 999, background: color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { Sparkline, FlowChart, Donut, HBarRank });
