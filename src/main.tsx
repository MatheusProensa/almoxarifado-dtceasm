// Ordem importa: reactGlobal define window.React antes dos componentes.
import "./reactGlobal";
import "./index.css";

// Componentes (cada arquivo registra suas funções em window.*)
import "./components/Icons.jsx";
import "./components/Primitives.jsx";
import "./components/data.jsx";
import "./components/Charts.jsx";
import "./components/Sidebar.jsx";
import "./components/Topbar.jsx";
import "./components/Dashboard.jsx";
import "./components/Materiais.jsx";
import "./components/Alertas.jsx";
import "./components/Modals.jsx";
import "./components/Screens.jsx";
import "./components/AppRoot.jsx";

import { createRoot } from "react-dom/client";
import App from "./App";

const R = (window as any).React;
createRoot(document.getElementById("root") as HTMLElement).render(R.createElement(App));
