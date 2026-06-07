/* ============================================================================
   Login.jsx — tela de autenticação do Almox Proensa
   ========================================================================== */

function Login({ onLogin }) {
  const [username, setUsername] = React.useState("");
  const [senha, setSenha] = React.useState("");
  const [erro, setErro] = React.useState("");
  const [carregando, setCarregando] = React.useState(false);
  const [mostrarSenha, setMostrarSenha] = React.useState(false);

  const limparErro = () => setErro("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !senha) return setErro("Preencha o usuário e a senha.");
    setErro("");
    setCarregando(true);
    api.login(username.trim(), senha)
      .then(({ token, user }) => {
        localStorage.setItem("almox-token", token);
        localStorage.setItem("almox-user", JSON.stringify(user));
        onLogin(user);
      })
      .catch(err => {
        setErro(err.message || "Usuário ou senha incorretos.");
        setCarregando(false);
      });
  };

  const fieldStyle = {
    width: "100%", padding: "10px 12px 10px 34px",
    background: "var(--bg-3)", border: "1.5px solid var(--line-2)",
    borderRadius: "var(--r-sm)", font: "500 14px var(--font-sans)",
    color: "var(--fg-1)", outline: "none", boxSizing: "border-box",
    transition: "border-color var(--dur-fast)",
  };

  const labelStyle = {
    display: "block", font: "600 11.5px/1 var(--font-sans)",
    color: "var(--fg-3)", marginBottom: 6,
    textTransform: "uppercase", letterSpacing: "0.07em",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "var(--bg-1)", padding: 24,
    }}>
      {/* Glow de fundo */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "-15%", left: "50%", transform: "translateX(-50%)",
          width: 700, height: 700, borderRadius: "50%",
          background: "radial-gradient(circle, var(--brand-600) 0%, transparent 70%)",
          opacity: 0.055,
        }} />
      </div>

      <div style={{ width: "100%", maxWidth: 400, animation: "popIn var(--dur-base) var(--ease-out) both" }}>

        {/* Cabeçalho */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <img
            src="assets/dtcea-sm-logo.png"
            alt="DTCEA-SM"
            style={{ width: 68, height: 68, marginBottom: 14 }}
            onError={e => (e.target.style.display = "none")}
          />
          <div style={{ font: "800 21px/1.2 var(--font-sans)", color: "var(--fg-1)", marginBottom: 4 }}>
            Almox Proensa
          </div>
          <div style={{ font: "400 13px/1 var(--font-sans)", color: "var(--fg-3)" }}>
            Sistema de Almoxarifado · DTCEA-SM
          </div>
        </div>

        {/* Card do formulário */}
        <div style={{
          background: "var(--bg-2)", border: "1px solid var(--line-2)",
          borderRadius: "var(--r-lg)", padding: "28px 28px 24px",
          boxShadow: "var(--shadow-lg)",
        }}>
          <form onSubmit={handleSubmit} autoComplete="on">

            {/* Usuário */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Usuário</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--fg-3)", display: "flex" }}>
                  <Icon name="User" size={15} />
                </span>
                <input
                  value={username}
                  onChange={e => { setUsername(e.target.value); limparErro(); }}
                  placeholder="seu.login"
                  autoFocus
                  autoComplete="username"
                  style={fieldStyle}
                  onFocus={e => (e.target.style.borderColor = "var(--brand-600)")}
                  onBlur={e => (e.target.style.borderColor = "var(--line-2)")}
                />
              </div>
            </div>

            {/* Senha */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Senha</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--fg-3)", display: "flex" }}>
                  <Icon name="Lock" size={15} />
                </span>
                <input
                  type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={e => { setSenha(e.target.value); limparErro(); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{ ...fieldStyle, paddingRight: 38 }}
                  onFocus={e => (e.target.style.borderColor = "var(--brand-600)")}
                  onBlur={e => (e.target.style.borderColor = "var(--line-2)")}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(v => !v)}
                  title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  style={{
                    position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--fg-3)", display: "flex", padding: 2,
                  }}>
                  <Icon name={mostrarSenha ? "EyeOff" : "Eye"} size={15} />
                </button>
              </div>
            </div>

            {/* Mensagem de erro */}
            {erro && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "color-mix(in srgb, var(--danger-500, #dc2626) 10%, transparent)",
                border: "1px solid color-mix(in srgb, var(--danger-500, #dc2626) 30%, transparent)",
                borderRadius: "var(--r-sm)", padding: "9px 12px", marginBottom: 16,
                animation: "fadeIn var(--dur-fast) ease both",
              }}>
                <Icon name="AlertCircle" size={14} style={{ color: "var(--danger-500, #dc2626)", flexShrink: 0 }} />
                <span style={{ font: "500 13px var(--font-sans)", color: "var(--danger-500, #dc2626)" }}>{erro}</span>
              </div>
            )}

            {/* Botão entrar */}
            <button
              type="submit"
              disabled={carregando}
              style={{
                width: "100%", padding: "11px 16px",
                background: carregando ? "color-mix(in srgb, var(--brand-600) 60%, transparent)" : "var(--brand-600)",
                color: "#fff", border: "none", borderRadius: "var(--r-sm)",
                font: "700 14px var(--font-sans)", cursor: carregando ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "background var(--dur-fast)",
              }}>
              {carregando
                ? <><Icon name="Loader" size={15} style={{ animation: "spin 0.9s linear infinite" }} /> Entrando…</>
                : <><Icon name="LogIn" size={15} /> Entrar</>}
            </button>
          </form>
        </div>

        {/* Rodapé */}
        <div style={{ textAlign: "center", marginTop: 18, font: "400 11.5px/1 var(--font-sans)", color: "var(--fg-4)" }}>
          Seção de Suprimento · DTCEA-SM
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Login });
