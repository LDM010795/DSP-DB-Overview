/**
 * Learning Management Page - DSP Database Overview Frontend
 *
 * Verwaltungsseite für die E-Learning-Plattform:
 * - Inhaltserstellung (Module, Videos, Artikel, Kategorien)
 * - Inhaltsverwaltung und -bearbeitung
 * - Tab-basierte Navigation
 * - Kategorien-Management
 *
 * Features:
 * - Create- und Manage-Modi
 * - Tab-basierte Formulare
 * - Kategorien-Verwaltung
 * - Responsive Design
 * - DSP-Branding-Farben
 *
 * Author: DSP Development Team
 * Created: 10.07.2025
 * Version: 1.0.0
 */

import React from "react";
import ModuleForm from "../components/forms/ModuleForm";
import ChapterForm from "../components/forms/ChapterForm";
import VideoForm from "../components/forms/VideoForm";
import ArticleForm from "../components/forms/ArticleForm";
import TaskForm from "../components/forms/TaskForm";
import CategoryForm from "../components/forms/CategoryForm";
import ManageContentPanel from "../components/manage/ManageContentPanel";
import HierarchicalContentManager from "../components/manage/HierarchicalContentManager";
import { useState } from "react";
import CategoryList from "../components/CategoryList";

/**
 * Learning Management Komponente
 *
 * Hauptseite für die Verwaltung der E-Learning-Plattform.
 * Ermöglicht die Erstellung und Verwaltung von Lerninhalten.
 */
const LearningManagement: React.FC = () => {
  // --- State Management ---
  const [view, setView] = useState<"create" | "manage" | "hierarchical">(
    "create"
  );
  const [tab, setTab] = useState("module");

  // --- Navigation-Konfiguration ---
  const categories = [
    { id: "create", label: "Daten anlegen" },
    { id: "manage", label: "Daten verwalten" },
    { id: "hierarchical", label: "Hierarchische Verwaltung" },
  ];

  const tabs = [
    { id: "category", label: "Kategorie anlegen" },
    { id: "module", label: "Modul anlegen" },
    { id: "chapter", label: "Kapitel anlegen" },
    { id: "video", label: "Lernvideo anlegen" },
    { id: "article", label: "Lernbeitrag anlegen" },
    { id: "task", label: "Aufgabe anlegen" },
  ];

  return (
    <div className="p-8 max-w-[95vw] mx-auto">
      {/* --- Seiten-Header --- */}
      <h1 className="text-2xl font-bold mb-6">Lernplattform – Verwaltung</h1>
      <p className="text-gray-600 mb-4">
        Hier können Administratoren Inhalte anlegen oder bestehende Daten
        verwalten.
      </p>

      {/* --- Haupt-Navigation --- */}
      <div className="flex space-x-4 mb-6">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() =>
              setView(c.id as "create" | "manage" | "hierarchical")
            }
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              view === c.id
                ? "bg-[#ff863d] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* --- Create-Modus --- */}
      {view === "create" && (
        <div className="bg-white shadow-lg border border-gray-100 rounded-2xl p-6">
          {/* --- Tab-Navigation --- */}
          <div className="flex space-x-4 mb-6">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  tab === t.id
                    ? "bg-[#ff863d] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* --- Tab-Content --- */}
          {tab === "module" && <ModuleForm />}
          {tab === "chapter" && <ChapterForm />}
          {tab === "video" && <VideoForm />}
          {tab === "article" && <ArticleForm />}
          {tab === "task" && <TaskForm />}
          {tab === "category" && (
            <div className="grid md:grid-cols-2 gap-8">
              <CategoryForm
                onSuccess={() => {
                  // refetch categories by invalidating query key
                }}
              />
              {/* Kategorienliste */}
              <CategoryList />
            </div>
          )}
        </div>
      )}

      {/* --- Manage-Modus --- */}
      {view === "manage" && (
        <div className="bg-white shadow-sm rounded-xl p-6">
          <ManageContentPanel />
        </div>
      )}

      {/* --- Hierarchical-Modus --- */}
      {view === "hierarchical" && (
        <div className="bg-white shadow-sm rounded-xl p-6">
          <HierarchicalContentManager />
        </div>
      )}
    </div>
  );
};

export default LearningManagement;
