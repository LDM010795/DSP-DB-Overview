/**
 * DSP Database Overview Frontend - Haupt-Einstiegspunkt
 * 
 * Diese Datei initialisiert die React-Anwendung mit allen notwendigen Providern:
 * - React Query für Server-State-Management
 * - Strict Mode für Entwicklung
 * - Root-Element-Mounting
 * 
 * Features:
 * - QueryClient für API-Caching und -Synchronisation
 * - Strict Mode für bessere Entwicklungserfahrung
 * - TypeScript-Unterstützung
 * 
 * Author: DSP Development Team
 * Created: 10.07.2025
 * Version: 1.0.0
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// QueryClient für Server-State-Management konfigurieren
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 Minuten
      retry: 3,
    },
  },
});

// Anwendung in das DOM mounten
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
