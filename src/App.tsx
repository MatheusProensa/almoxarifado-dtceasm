import "./App.css";

export default function App() {
  const R = (window as any).React;
  const Root = (window as any).App;
  return R.createElement(Root);
}
