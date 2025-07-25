/**
 * Learning API Service für DSP Database Overview
 *
 * Service für E-Learning-Plattform-Integration:
 * - Module-Verwaltung (CRUD-Operationen)
 * - Video-Content-Management
 * - Ressourcen und Artikel-Verwaltung
 * - Kategorisierung und Organisation
 *
 * Features:
 * - Vollständige E-Learning-API-Integration
 * - JWT-basierte Authentifizierung
 * - Automatische Token-Injection
 * - Umfassende Fehlerbehandlung
 * - Logging für Debugging
 *
 * Author: DSP Development Team
 * Created: 10.07.2025
 * Version: 1.0.0
 */

import axios from "axios";

// --- API-Konfiguration ---

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "https://dsp-backend-0nnw.onrender.com/api";

const learningApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Request/Response Interceptors ---

// Logging für Debugging
learningApi.interceptors.request.use(
  (config) => {
    console.log(
      `📡 [LearningAPI] ${config.method?.toUpperCase()} ${config.url}`
    );
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Fehlerbehandlung und Token-Validierung
learningApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[LearningAPI] Error", error.response ?? error);
    if (error.response?.status === 401) {
      // Token abgelaufen – automatisch ausloggen und zur Login-Seite navigieren
      import("./authService").then(({ authService }) => {
        authService.logout();
        window.location.href = "/login";
      });
    }
    return Promise.reject(error);
  }
);

// JWT Token-Injection
learningApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- API-Typen ---

export interface ModulePayload {
  title: string;
  category_id: number;
  is_public?: boolean;
}

export interface VideoPayload {
  moduleId: string;
  title: string;
  description?: string;
  video_url: string;
}

export interface ResourcePayload {
  contentId: string;
  label: string;
  url: string;
}

export interface ArticlePayload {
  moduleId: string;
  title: string;
  url: string;
}

// --- Learning API Service ---

export const learningAPI = {
  // --- Module CRUD-Operationen ---

  /**
   * Neues Modul erstellen
   */
  createModule: (data: ModulePayload) =>
    learningApi.post("/elearning/modules/", data),

  /**
   * Modul aktualisieren
   */
  updateModule: (id: string | number, data: ModulePayload) =>
    learningApi.put(`/elearning/modules/${id}/`, data),

  /**
   * Öffentliche Module abrufen
   */
  getModules: () => learningApi.get("/elearning/modules/public/"),

  /**
   * Alle Module abrufen (Admin)
   */
  getModulesAll: () => learningApi.get("/elearning/modules/"),

  /**
   * Modul-Details abrufen (öffentlich)
   */
  getModuleDetail: (id: string | number) =>
    learningApi.get(`/elearning/modules/public/${id}/`),

  /**
   * Modul-Details abrufen (Admin)
   */
  getModule: (id: string | number) =>
    learningApi.get(`/elearning/modules/${id}/detail/`),

  // --- Content-Management ---

  /**
   * Video-Content erstellen
   */
  createVideo: (data: VideoPayload) =>
    learningApi.post("/elearning/modules/content/", data),

  /**
   * Video-Content aktualisieren
   */
  updateVideo: (
    id: string | number,
    data: Partial<VideoPayload & { order?: number }>
  ) => learningApi.patch(`/elearning/modules/content/${id}/`, data),

  /**
   * Ergänzende Ressource erstellen
   */
  createResource: (data: ResourcePayload) =>
    learningApi.post("/elearning/modules/supplementary/", data),

  /**
   * Artikel erstellen
   */
  createArticle: (data: ArticlePayload) =>
    learningApi.post("/elearning/modules/article/", data),

  /**
   * Artikel aktualisieren
   */
  updateArticle: (
    id: string | number,
    data: Partial<ArticlePayload & { order?: number }>
  ) => learningApi.patch(`/elearning/modules/article/${id}/`, data),

  // --- Kategorien-Management ---

  /**
   * Alle Kategorien abrufen
   */
  getCategories: () => learningApi.get("/elearning/modules/categories/"),

  /**
   * Neue Kategorie erstellen
   */
  createCategory: (data: { name: string }) =>
    learningApi.post("/elearning/modules/categories/", data),

  /**
   * Kategorie aktualisieren
   */
  updateCategory: (id: string | number, data: { name: string }) =>
    learningApi.patch(`/elearning/modules/categories/${id}/`, data),
};

export default learningApi;
