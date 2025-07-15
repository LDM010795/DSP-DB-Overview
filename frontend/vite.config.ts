/**
 * Vite Configuration - DSP Database Overview Frontend
 *
 * Diese Datei konfiguriert den Vite-Build-Prozess für das Frontend:
 * - React-Plugin für JSX-Unterstützung
 * - Tailwind CSS-Integration
 * - Development-Server-Konfiguration
 * - Build-Optimierungen
 * 
 * Features:
 * - Hot Module Replacement (HMR)
 * - TypeScript-Unterstützung
 * - Tailwind CSS-Integration
 * - Optimierte Build-Konfiguration
 * 
 * Author: DSP Development Team
 * Created: 10.07.2025
 * Version: 1.0.0
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // React-Plugin für JSX und HMR
    react(),
    // Tailwind CSS-Integration
    tailwindcss(),
  ],
  
  // Development-Server-Konfiguration
  server: {
    port: 5173,
    host: true,
    open: true,
  },
  
  // Build-Konfiguration
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
        },
      },
    },
  },
});
