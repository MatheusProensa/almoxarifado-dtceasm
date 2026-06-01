import "./App.css";

// Componente raiz da aplicação.
// As telas/componentes são carregados em main.tsx e registrados em window.App
// (padrão clássico do kit). App.tsx é o ponto único que o main renderiza.
export default function App() {
  const R = (window as any).React;
  const Root = (window as any).App;
  return R.createElement(Root);
}
