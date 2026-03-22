import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // Ensure this matches your Tailwind version setup

// vite.config.js
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        // Add this rewrite to ensure the path is preserved exactly
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
    },
  },
});
