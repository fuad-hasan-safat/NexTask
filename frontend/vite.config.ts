import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Load VITE_* vars from the shared .env at the monorepo root.
  envDir: "..",
  build: {
    outDir: "dist",
  },
});
