import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/elearning";

const learningApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Logging
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

// Token injection
learningApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// -------- API-Funktionen -------------------------------------------------
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

export const learningAPI = {
  // Module CRUD
  createModule: (data: ModulePayload) => learningApi.post("/modules/", data),
  updateModule: (id: string | number, data: ModulePayload) =>
    learningApi.put(`/modules/${id}/`, data),
  getModules: () => learningApi.get("/modules/public/"),
  getModulesAll: () => learningApi.get("/modules/"),
  getModuleDetail: (id: string | number) =>
    learningApi.get(`/modules/public/${id}/`),
  getModule: (id: string | number) => learningApi.get(`/modules/${id}/detail/`),
  // Video is Content
  createVideo: (data: VideoPayload) =>
    learningApi.post("/modules/content/", data),
  updateVideo: (
    id: string | number,
    data: Partial<VideoPayload & { order?: number }>
  ) => learningApi.patch(`/modules/content/${id}/`, data),
  createResource: (data: ResourcePayload) =>
    learningApi.post("/modules/supplementary/", data),
  createArticle: (data: ArticlePayload) =>
    learningApi.post("/modules/article/", data),
  updateArticle: (
    id: string | number,
    data: Partial<ArticlePayload & { order?: number }>
  ) => learningApi.patch(`/modules/article/${id}/`, data),

  // Categories
  getCategories: () => learningApi.get("/modules/categories/"),
  createCategory: (data: { name: string }) =>
    learningApi.post("/modules/categories/", data),
  updateCategory: (id: string | number, data: { name: string }) =>
    learningApi.patch(`/modules/categories/${id}/`, data),
};

export default learningApi;
