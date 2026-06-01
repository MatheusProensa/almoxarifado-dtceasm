import * as ReactLib from "react";
import * as ReactDOMLib from "react-dom";

// Expomos React/ReactDOM em window ANTES de carregar os componentes.
// Obs.: não importamos como "React" porque o esbuild (jsxInject) já injeta
// `const React = window.React` em cada arquivo — usar o mesmo nome aqui causaria
// "The symbol React has already been declared".
(window as any).React = ReactLib;
(window as any).ReactDOM = ReactDOMLib;
