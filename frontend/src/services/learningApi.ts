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

import { apiClient } from "./config";

// --- API-Konfiguration ---

// Verwende die zentrale Axios-Instanz
const learningApi = apiClient;

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
  module_id: number;
  title: string;
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
  moduleId: string | number;
  title: string;
  description?: string;
  url: string;
  order?: number;
}

export interface ResourcePayload {
  contentId: string;
  label: string;
  url: string;
}

export interface ArticlePayload {
  module_id: number;
  chapter_id?: number | null;
  title: string;
  url: string;
  order?: number;
}

export interface ArticleFromCloudPayload {
  moduleId: string;
  chapterId?: string;
  cloudUrl: string;
}

export interface CategoryPayload {
  name: string;
}

export interface TaskPayload {
  chapter: number;
  title: string;
  description: string;
  difficulty: string;
  hint?: string;
  order?: number;
}

export interface TaskMultipleChoicePayload {
  task: number;
  question: string;
  option_1: string;
  option_2: string;
  option_3: string;
  option_4: string;
  correct_answer: number;
  order?: number;
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
   * Modul löschen
   */
  deleteModule: (id: string | number) =>
    learningApi.delete(`/elearning/modules/${id}/`),

  /**
   * Alle Module abrufen
   */
  getModulesAll: () => learningApi.get("/elearning/modules/"),

  /**
   * Einzelnes Modul abrufen
   */
  getModule: (id: string | number) =>
    learningApi.get(`/elearning/modules/${id}/detail/`),

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
   * Kapitel löschen
   */
  deleteChapter: (id: string | number) =>
    learningApi.delete(`/elearning/modules/chapters/${id}/`),

  /**
   * Alle Kapitel abrufen
   */
  getChaptersAll: () => learningApi.get("/elearning/modules/chapters/list/"),

  /**
   * Einzelnes Kapitel abrufen
   */
  getChapter: (id: string | number) =>
    learningApi.get(`/elearning/modules/chapters/${id}/detail/`),

  // --- Task CRUD-Operationen ---

  /**
   * Neue Aufgabe erstellen
   */
  createTask: (data: TaskPayload) =>
    learningApi.post("/elearning/modules/tasks/", data),

  /**
   * Aufgabe aktualisieren
   */
  updateTask: (id: string | number, data: TaskPayload) =>
    learningApi.put(`/elearning/modules/tasks/${id}/`, data),

  /**
   * Aufgabe löschen
   */
  deleteTask: (id: string | number) =>
    learningApi.delete(`/elearning/modules/tasks/${id}/`),

  /**
   * Alle Aufgaben abrufen
   */
  getTasksAll: () => learningApi.get("/elearning/modules/tasks/list/"),

  /**
   * Aufgaben nach Kapitel abrufen
   */
  getTasksByChapter: (chapterId: string | number) =>
    learningApi.get(`/elearning/modules/tasks/list/?chapter_id=${chapterId}`),

  /**
   * Einzelne Aufgabe abrufen
   */
  getTask: (id: string | number) =>
    learningApi.get(`/elearning/modules/tasks/${id}/`),

  // --- TaskMultipleChoice CRUD-Operationen ---

  /**
   * Neue Multiple Choice Frage erstellen
   */
  createTaskMultipleChoice: (data: TaskMultipleChoicePayload) =>
    learningApi.post("/elearning/modules/task-multiple-choice/", data),

  /**
   * Multiple Choice Frage aktualisieren
   */
  updateTaskMultipleChoice: (
    id: string | number,
    data: TaskMultipleChoicePayload
  ) => learningApi.put(`/elearning/modules/task-multiple-choice/${id}/`, data),

  /**
   * Multiple Choice Frage löschen
   */
  deleteTaskMultipleChoice: (id: string | number) =>
    learningApi.delete(`/elearning/modules/task-multiple-choice/${id}/`),

  /**
   * Alle Multiple Choice Fragen abrufen
   */
  getTaskMultipleChoiceAll: () =>
    learningApi.get("/elearning/modules/task-multiple-choice/list/"),

  /**
   * Multiple Choice Fragen nach Task abrufen
   */
  getTaskMultipleChoiceByTask: (taskId: string | number) =>
    learningApi.get(
      `/elearning/modules/task-multiple-choice/list/?task_id=${taskId}`
    ),

  /**
   * Einzelne Multiple Choice Frage abrufen
   */
  getTaskMultipleChoice: (id: string | number) =>
    learningApi.get(`/elearning/modules/task-multiple-choice/${id}/`),

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
};

export default learningApi;
