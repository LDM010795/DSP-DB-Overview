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
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8000/api";

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

export interface ChapterPayload {
  module_id: number;
  title: string;
  description?: string;
  order: number;
  is_active?: boolean;
}

export interface VideoPayload {
  chapter: number;
  description?: string;
  video_url: string;
  order?: number; // Für Drag & Drop Reordering
}

export interface VideoUpdatePayload {
  chapter?: number;
  description?: string;
  video_url?: string;
  order?: number; // Für Drag & Drop Reordering
}

export interface ContentPayload {
  moduleId: string;
  title: string;
  description?: string;
  url: string;
}

export interface ResourcePayload {
  contentId: string;
  label: string;
  url: string;
}

export interface ArticlePayload {
  module_id: number;
  title: string;
  url: string;
  order?: number;
}

export interface ArticleFromCloudPayload {
  moduleId: string;
  cloudUrl: string;
}

export interface CategoryPayload {
  name: string;
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
   * Modul-Details abrufen
   */
  getModule: (id: string | number) =>
    learningApi.get(`/elearning/modules/${id}/detail/`),

  /**
   * Modul löschen
   */
  deleteModule: (id: string | number) =>
    learningApi.delete(`/elearning/modules/${id}/`),

  // --- Chapter CRUD-Operationen ---

  /**
   * Neues Kapitel erstellen
   */
  createChapter: (data: ChapterPayload) =>
    learningApi.post("/elearning/modules/chapters/", data),

  /**
   * Kapitel aktualisieren
   */
  updateChapter: (id: string | number, data: ChapterPayload) =>
    learningApi.put(`/elearning/modules/chapters/${id}/`, data),

  /**
   * Kapitel-Details abrufen
   */
  getChapter: (id: string | number) =>
    learningApi.get(`/elearning/modules/chapters/${id}/`),

  /**
   * Kapitel löschen
   */
  deleteChapter: (id: string | number) =>
    learningApi.delete(`/elearning/modules/chapters/${id}/delete/`),

  // --- Content CRUD-Operationen ---

  /**
   * Neuen Content erstellen
   */
  createContent: (data: ContentPayload) =>
    learningApi.post("/elearning/modules/content/", data),

  /**
   * Content aktualisieren
   */
  updateContent: (id: string | number, data: ContentPayload) =>
    learningApi.put(`/elearning/modules/content/${id}/`, data),

  /**
   * Content löschen
   */
  deleteContent: (id: string | number) =>
    learningApi.delete(`/elearning/modules/content/${id}/`),

  // --- Video CRUD-Operationen ---

  /**
   * Neues Video erstellen
   */
  createVideo: (data: VideoPayload) => {
    console.log("📡 [LearningAPI] POST /elearning/modules/content/");
    console.log("📡 [LearningAPI] createVideo payload:", data);
    return learningApi.post("/elearning/modules/content/", data);
  },

  /**
   * Video aktualisieren
   */
  updateVideo: (id: string | number, data: VideoUpdatePayload) =>
    learningApi.put(`/elearning/modules/content/${id}/`, data),

  /**
   * Video löschen
   */
  deleteVideo: (id: string | number) =>
    learningApi.delete(`/elearning/modules/content/${id}/`),

  // --- Article CRUD-Operationen ---

  /**
   * Neuen Artikel erstellen
   */
  createArticle: (data: ArticlePayload) =>
    learningApi.post("/elearning/modules/article/", data),

  /**
   * Artikel aus Cloud Storage erstellen
   */
  createArticleFromCloud: (data: ArticleFromCloudPayload) =>
    learningApi.post("/elearning/modules/content/process-article/", data),

  /**
   * Artikel aktualisieren
   */
  updateArticle: (id: string | number, data: ArticlePayload) => {
    console.log(`[DEBUG] learningApi.updateArticle() called for id: ${id}`);
    console.log(`[DEBUG] Data being sent:`, data);
    return learningApi.put(`/elearning/modules/article/${id}/`, data);
  },

  /**
   * Artikel löschen
   */
  deleteArticle: (id: string | number) =>
    learningApi.delete(`/elearning/modules/article/${id}/`),

  // --- Chapter Management ---

  /**
   * Kapitel löschen
   */
  deleteChapter: (id: string | number) =>
    learningApi.delete(`/elearning/modules/chapters/${id}/delete/`),

  // --- Category CRUD-Operationen ---

  /**
   * Alle Kategorien abrufen
   */
  getCategories: () => learningApi.get("/elearning/modules/categories/"),

  /**
   * Neue Kategorie erstellen
   */
  createCategory: (data: CategoryPayload) =>
    learningApi.post("/elearning/modules/categories/", data),

  /**
   * Kategorie aktualisieren
   */
  updateCategory: (id: string | number, data: CategoryPayload) =>
    learningApi.put(`/elearning/modules/categories/${id}/`, data),

  /**
   * Kategorie löschen
   */
  deleteCategory: (id: string | number) =>
    learningApi.delete(`/elearning/modules/categories/${id}/`),

  // --- Module Management ---

  /**
   * Modul löschen
   */
  deleteModule: (id: string | number) =>
    learningApi.delete(`/elearning/modules/${id}/`),

  // --- Video Management ---

  /**
   * Video löschen
   */
  deleteVideo: (id: string | number) =>
    learningApi.delete(`/elearning/modules/content/${id}/`),

  // --- Article Management ---

  /**
   * Alle Artikel abrufen
   */
  getArticlesAll: () => learningApi.get("/elearning/modules/article/"),
};

export default learningApi;
