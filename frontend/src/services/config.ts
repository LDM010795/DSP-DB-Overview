/**
 * Zentrale API-Konfiguration für DSP Database Overview
 *
 * Diese Datei definiert die zentrale Konfiguration für alle API-Services:
 * - Einheitliche Base-URL für alle Services
 * - Gemeinsame Axios-Instanz mit Interceptors
 * - Zentrale Fehlerbehandlung
 * - JWT Token-Management
 *
 * Author: DSP Development Team
 * Created: 10.07.2025
 * Version: 1.0.0
 */

import axios from "axios";

// --- Zentrale Konfiguration ---

export const API_CONFIG = {
  // Einheitliche Base-URL für alle Services
  BASE_URL: import.meta.env.VITE_BACKEND_URL || "http://localhost:8000/api",

  // Timeout für alle Requests
  TIMEOUT: 30000,

  // Standard-Headers
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
  },
};

// --- Zentrale Axios-Instanz ---

export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
});

// --- Request Interceptor für JWT Token ---

apiClient.interceptors.request.use(
  (config) => {
    // JWT Token automatisch anhängen
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Logging für Debugging
    console.log(
      `📡 API Request: ${config.method?.toUpperCase()} ${config.url}`
    );

    return config;
  },
  (error) => {
    console.error("❌ API Request Error:", error);
    return Promise.reject(error);
  }
);

// --- Response Interceptor für Fehlerbehandlung ---

apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error("❌ API Response Error:", error);

    // Automatisches Logout bei 401-Fehlern
    if (error.response?.status === 401) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// --- Service-spezifische Axios-Instanzen ---

// Für Services, die eine andere Base-URL benötigen
export const createServiceClient = (baseURL: string) => {
  const client = axios.create({
    baseURL: `${API_CONFIG.BASE_URL}${baseURL}`,
    timeout: API_CONFIG.TIMEOUT,
    headers: API_CONFIG.DEFAULT_HEADERS,
  });

  // Gleiche Interceptors wie die Haupt-Instanz
  client.interceptors.request.use(
    (config) => {
      // JWT Token automatisch anhängen
      const token = localStorage.getItem("access");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Logging für Debugging
      console.log(
        `📡 API Request: ${config.method?.toUpperCase()} ${config.url}`
      );

      return config;
    },
    (error) => {
      console.error("❌ API Request Error:", error);
      return Promise.reject(error);
    }
  );

  client.interceptors.response.use(
    (response) => {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
      return response;
    },
    (error) => {
      console.error("❌ API Response Error:", error);

      // Automatisches Logout bei 401-Fehlern
      if (error.response?.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/login";
      }

      return Promise.reject(error);
    }
  );

  return client;
};

export default apiClient;
