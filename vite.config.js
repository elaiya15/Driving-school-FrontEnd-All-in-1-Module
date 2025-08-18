import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "service-worker.js",
      workbox: {
        swSrc: "src/service-worker.js",
        swDest: "sw.js",
      },
      devOptions: {
        enabled: true,
        type: "module",
      },
      scope: "/",
      registerType: "autoUpdate",
      injectRegister: "auto",
      manifest: {
        name: "Ganesh Driving School",
        short_name: "Ganesh Driving School",
        description: "Digital system of learning.",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        start_url: "/",
        display: "fullscreen",
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
