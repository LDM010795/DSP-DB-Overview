/**
 * API Service für DSP Database Overview
 *
 * Dieser Service stellt eine zentrale Schnittstelle für alle API-Aufrufe bereit.
 * Als Senior Backend-Entwickler weiß ich, wie wichtig es ist, API-Calls zu zentralisieren
 * für bessere Wartbarkeit, Fehlerbehandlung und Caching.
 */

import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/db-overview";

// Axios-Instance mit Standardkonfiguration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 Sekunden für komplexe Schema-Analysen
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Request-Interceptor für Logging
api.interceptors.request.use(
  (config) => {
    console.log(
      `🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`
    );
    return config;
  },
  (error) => {
    console.error("❌ API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response-Interceptor für Fehlerbehandlung
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error("❌ API Response Error:", error);
    if (error.response?.status === 401) {
      import("./authService").then(({ authService }) => {
        authService.logout();
        window.location.href = "/login";
      });
    }
    return Promise.reject(error);
  }
);

// Typen für API-Responses
export interface SchemaField {
  name: string;
  type: string;
  null: boolean;
  blank: boolean;
  unique: boolean;
  db_index: boolean;
  primary_key: boolean;
  auto_created: boolean;
  max_length?: number;
  choices?: string[];
  is_relationship: boolean;
}

export interface ModelRelationship {
  field_name: string;
  relationship_type: string;
  related_model: string;
  related_name: string | null;
  on_delete: string | null;
}

export interface ModelInfo {
  app_label: string;
  model_name: string;
  table_name: string;
  verbose_name: string;
  verbose_name_plural: string;
  abstract: boolean;
  fields: SchemaField[];
  relationships: ModelRelationship[];
  field_count: number;
  relationship_count: number;
  record_count: number;
  ordering: string[];
  indexes: string[];
}

export interface AppInfo {
  app_name: string;
  models: ModelInfo[];
  model_count: number;
}

export interface GlobalRelationship {
  source: string;
  target: string;
  type: string;
  field_name: string;
  related_name: string | null;
  on_delete: string | null;
}

export interface SchemaOverview {
  total_apps: number;
  total_models: number;
  total_relationships: number;
  generated_at: string;
  database_engine: string;
}

export interface DatabaseSchemaResponse {
  schema_overview: SchemaOverview;
  apps: AppInfo[];
  relationships: GlobalRelationship[];
  success: boolean;
}

export interface TableDataResponse {
  data: Record<string, any>[];
  pagination: {
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
  };
  success: boolean;
}

export interface DatabaseStatistics {
  database_type: string;
  tables: {
    table_name: string;
    row_count: number;
    create_sql: string;
  }[];
  total_tables: number;
  success: boolean;
}

// API-Funktionen
export const dbOverviewAPI = {
  /**
   * Komplettes Datenbankschema abrufen
   * Diese Funktion ist das Herzstück der Anwendung
   */
  async getDatabaseSchema(): Promise<DatabaseSchemaResponse> {
    const response = await api.get("/schema/");
    return response.data;
  },

  /**
   * Tabellendaten für ein spezifisches Model abrufen
   * Wichtig für die Dateninspektion
   */
  async getTableData(
    appLabel: string,
    modelName: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<TableDataResponse> {
    const response = await api.get(`/table/${appLabel}/${modelName}/`, {
      params: { page, page_size: pageSize },
    });
    return response.data;
  },

  /**
   * Erweiterte Datenbankstatistiken abrufen
   * Für Performance-Analysen und Optimierung
   */
  async getDatabaseStatistics(): Promise<DatabaseStatistics> {
    const response = await api.get("/statistics/");
    return response.data;
  },
};

export default api;
