import { defineConfig } from "vite";
import { readFileSync } from "fs";
import { VitePWA } from "vite-plugin-pwa";

const pkg = JSON.parse(readFileSync("./package.json", "utf8"));

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  esbuild: {
    jsxInject: `const React = (window).React`,
  },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["assets/dtcea-sm-logo.png", "icons/*.png"],
      manifest: {
        name: "Almox Proensa — DTCEA-SM",
        short_name: "Almox",
        description: "Sistema de Almoxarifado e Controle de Estoque · Seção de Suprimento DTCEA-SM",
        start_url: "/",
        display: "standalone",
        background_color: "#EEF2F7",
        theme_color: "#006BB5",
        orientation: "portrait-primary",
        lang: "pt-BR",
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        shortcuts: [
          {
            name: "Registrar Entrada",
            short_name: "Entrada",
            url: "/?view=entradas",
            icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
          },
          {
            name: "Registrar Saída",
            short_name: "Saída",
            url: "/?view=saidas",
            icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,ico,svg,woff2}"],
        runtimeCaching: [
          {
            // Ícones Lucide via CDN — cache longo
            urlPattern: /unpkg\.com\/lucide/,
            handler: "CacheFirst",
            options: {
              cacheName: "lucide-cache",
              expiration: { maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            // API local — sempre tenta a rede primeiro, sem fallback offline
            urlPattern: /localhost:3001\/api/,
            handler: "NetworkOnly",
          },
        ],
      },
    }),
  ],
});
