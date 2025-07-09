import React from "react";
import ModuleForm from "../components/forms/ModuleForm";
import VideoForm from "../components/forms/VideoForm";
import ArticleForm from "../components/forms/ArticleForm";
import CategoryForm from "../components/forms/CategoryForm";
import ManageContentPanel from "../components/manage/ManageContentPanel";
import { useState } from "react";
import CategoryList from "../components/CategoryList";

const LearningManagement: React.FC = () => {
  const [view, setView] = useState<"create" | "manage">("create");
  const [tab, setTab] = useState("module");

  const categories = [
    { id: "create", label: "Daten anlegen" },
    { id: "manage", label: "Daten verwalten" },
  ];

  const tabs = [
    { id: "category", label: "Kategorie anlegen" },
    { id: "module", label: "Modul anlegen" },
    { id: "video", label: "Lernvideo anlegen" },
    { id: "article", label: "Lernbeitrag anlegen" },
  ];

  return (
    <div className="p-8 max-w-[95vw] mx-auto">
      <h1 className="text-2xl font-bold mb-6">Lernplattform – Verwaltung</h1>
      <p className="text-gray-600 mb-4">
        Hier können Administratoren Inhalte anlegen oder bestehende Daten
        verwalten.
      </p>

      {/* Kategorie-Leiste */}
      <div className="flex space-x-4 mb-6">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setView(c.id as "create" | "manage")}
            className={`px-4 py-2 rounded-md font-medium ${
              view === c.id
                ? "bg-[#ff863d] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {view === "create" && (
        <div className="bg-white shadow-lg border border-gray-100 rounded-2xl p-6">
          <div className="flex space-x-4 mb-6">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-md font-medium ${
                  tab === t.id
                    ? "bg-[#ff863d] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {tab === "module" && <ModuleForm />}
          {tab === "video" && <VideoForm />}
          {tab === "article" && <ArticleForm />}
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

      {view === "manage" && (
        <div className="bg-white shadow-sm rounded-xl p-6">
          <ManageContentPanel />
        </div>
      )}
    </div>
  );
};

export default LearningManagement;
