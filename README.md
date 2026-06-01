# Almox Proensa — Sistema de Almoxarifado (React + Vite + TypeScript)

Controle de estoque do almoxarifado do **DTCEA-SM** (CINDACTA II): materiais, entradas,
saídas, ajustes, alertas, movimentações, relatórios e cadastros.

## Rodar

```bash
npm install
npm run dev      # ambiente de desenvolvimento (http://localhost:5173)
npm run build    # build de produção em /dist
npm run preview  # pré-visualiza o build
```

## Estrutura

```
almox-proensa/
├─ public/
│  └─ assets/dtcea-sm-logo.png    # brasão DTCEA-SM
├─ src/
│  ├─ components/                 # telas e componentes (JSX)
│  │  ├─ Icons.jsx  Primitives.jsx  data.jsx  Charts.jsx
│  │  ├─ Sidebar.jsx  Topbar.jsx  Dashboard.jsx  Materiais.jsx
│  │  ├─ Alertas.jsx  Modals.jsx  Screens.jsx  AppRoot.jsx
│  ├─ colors_and_type.css         # design tokens (cores, tipografia, sombras…)
│  ├─ index.css                   # estilos base + animações + CSS de impressão
│  ├─ reactGlobal.tsx             # expõe React/ReactDOM em window (ver nota)
│  └─ main.tsx                    # ponto de entrada (monta <App/>)
├─ index.html
├─ vite.config.ts
├─ tsconfig.json
└─ package.json
```

## Nota de arquitetura

Os componentes foram escritos no padrão **clássico** (`React.createElement`) e compartilham
funções via `window.*`. Para rodar no Vite sem reescrever tudo:

- `reactGlobal.tsx` define `window.React`/`window.ReactDOM` **antes** dos componentes.
- `vite.config.ts` usa `esbuild.jsxInject` para injetar `const React = window.React` em cada
  arquivo `.jsx`.
- `main.tsx` importa os componentes na ordem correta e monta o app.

Os ícones usam **Lucide** carregado via CDN no `index.html` (`window.lucide`). Para empacotar
offline, instale `lucide` e adapte `src/components/Icons.jsx`.

— Desenvolvido por **Matheus Proensa** (Cb Proensa · ex-DTCEA-SM).
