import { defineConfig } from "vite";

// Os componentes (.jsx) foram escritos no padrão clássico (React.createElement)
// e usam React global. O jsxInject injeta `const React = window.React` em cada
// arquivo JSX, e reactGlobal.tsx define window.React antes do carregamento.
export default defineConfig({
  esbuild: {
    jsxInject: `const React = (window).React`,
  },
});
