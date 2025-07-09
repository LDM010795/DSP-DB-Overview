import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { learningAPI } from "../../services/learningApi";
import { Pencil, ChevronDown, ChevronRight } from "lucide-react";
import EditModal from "./EditModal";
import ModuleForm from "../forms/ModuleForm";
import VideoForm from "../forms/VideoForm";
import ArticleForm from "../forms/ArticleForm";
import SortableList from "./SortableList";
import { useEffect } from "react";

interface ModuleDetail {
  id: number;
  title: string;
  category: string;
  is_public: boolean;
  contents: {
    id: number;
    title: string;
    description?: string;
    video_url?: string;
  }[];
  articles: { id: number; title: string; url?: string }[];
}

const ManageContentPanel: React.FC = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["modules-all"],
    queryFn: async () => {
      const res = await learningAPI.getModulesAll();
      return res.data as { id: number; title: string; is_public: boolean }[];
    },
  });

  const [expanded, setExpanded] = useState<number | null>(null);
  const [selected, setSelected] = useState<{
    type: "module" | "video" | "article";
    id: number;
    moduleId?: number;
    initialData?: any;
  } | null>(null);

  const { data: detailData } = useQuery<ModuleDetail | undefined>({
    queryKey: ["module-detail", expanded],
    queryFn: async () => {
      if (!expanded) return undefined;
      const res = await learningAPI.getModule(expanded);
      return res.data as ModuleDetail;
    },
    enabled: !!expanded,
  });

  const [videoList, setVideoList] = useState<ModuleDetail["contents"]>([]);
  const [articleList, setArticleList] = useState<ModuleDetail["articles"]>([]);

  useEffect(() => {
    if (detailData) {
      setVideoList(detailData.contents);
      setArticleList(detailData.articles);
    }
  }, [detailData]);

  const [filter, setFilter] = useState<"all" | "public" | "private">("all");

  if (isLoading) return <p>Lade Module…</p>;
  if (error) return <p className="text-red-600">Fehler beim Laden</p>;
  if (!data || data.length === 0) return <p>Keine Module gefunden.</p>;

  const filteredModules = data.filter((m) => {
    if (filter === "public") return m.is_public;
    if (filter === "private") return !m.is_public;
    return true;
  });

  const handleCloseModal = () => {
    setSelected(null);
    refetch();
  };

  return (
    <div className="space-y-4">
      {/* Filter-Leiste */}
      <div className="flex space-x-4 mb-4">
        {[
          { id: "all", label: "Alle" },
          { id: "public", label: "Öffentlich" },
          { id: "private", label: "Nicht öffentlich" },
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setFilter(btn.id as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === btn.id
                ? "bg-[#ff863d] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {filteredModules.map((mod) => {
        const isOpen = expanded === mod.id;
        return (
          <div
            key={mod.id}
            className="bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm"
          >
            <div
              className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-t-2xl"
              onClick={() => setExpanded(isOpen ? null : mod.id)}
            >
              <div className="flex items-center space-x-2">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <h3 className="font-semibold text-gray-900">{mod.title}</h3>
              </div>
              {/* Right group */}
              <div className="flex items-center space-x-3">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    mod.is_public
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {mod.is_public ? "Öffentlich" : "Privat"}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected({
                      type: "module",
                      id: mod.id,
                      initialData: { title: mod.title },
                    });
                  }}
                  className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
                  aria-label="Modul bearbeiten"
                >
                  <Pencil className="h-4 w-4 mr-1" /> Bearbeiten
                </button>
              </div>
            </div>
            {/* Details wiederverwenden */}
            {isOpen && detailData && (
              <div className="border-t border-gray-100 p-6 space-y-6 bg-gray-50 rounded-b-2xl">
                {/* Videos */}
                <div>
                  <h4 className="font-semibold mb-3 text-gray-700">
                    Lernvideos
                  </h4>
                  {videoList?.length === 0 && (
                    <p className="text-sm text-gray-500">Keine Videos.</p>
                  )}
                  {videoList && (
                    <SortableList
                      items={videoList}
                      onOrderChange={async (newList) => {
                        setVideoList(newList);
                        newList.forEach((item, idx) => {
                          learningAPI.updateVideo(item.id, { order: idx + 1 });
                        });
                      }}
                      onEdit={(item) =>
                        setSelected({
                          type: "video",
                          id: item.id,
                          moduleId: mod.id,
                          initialData: {
                            title: item.title,
                            description: item.description,
                            video_url: item.video_url,
                            moduleId: mod.id.toString(),
                          },
                        })
                      }
                    />
                  )}
                </div>
                {/* Articles */}
                <div>
                  <h4 className="font-semibold mb-3 text-gray-700">
                    Lernbeiträge
                  </h4>
                  {articleList?.length === 0 && (
                    <p className="text-sm text-gray-500">Keine Beiträge.</p>
                  )}
                  {articleList && (
                    <SortableList
                      items={articleList}
                      onOrderChange={async (newList) => {
                        setArticleList(newList);
                        newList.forEach((item, idx) => {
                          learningAPI.updateArticle(item.id, {
                            order: idx + 1,
                          });
                        });
                      }}
                      onEdit={(item) =>
                        setSelected({
                          type: "article",
                          id: item.id,
                          moduleId: mod.id,
                          initialData: {
                            title: item.title,
                            url: item.url,
                            moduleId: mod.id.toString(),
                          },
                        })
                      }
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
      {/* Modal */}
      <EditModal
        isOpen={!!selected}
        onClose={handleCloseModal}
        title="Bearbeiten"
      >
        {selected?.type === "module" && selected.id && (
          <ModuleForm
            mode="edit"
            id={selected.id}
            initialData={selected.initialData}
            onSuccess={handleCloseModal}
          />
        )}
        {selected?.type === "video" && selected.id && selected.moduleId && (
          <VideoForm
            mode="edit"
            id={selected.id}
            initialData={selected.initialData}
            onSuccess={(upd) => {
              if (upd) {
                setVideoList((list) =>
                  list.map((v: any) =>
                    v.id === upd!.id ? { ...v, ...(upd as any) } : v
                  )
                );
              }
              handleCloseModal();
            }}
          />
        )}
        {selected?.type === "article" && selected.id && selected.moduleId && (
          <ArticleForm
            mode="edit"
            id={selected.id}
            initialData={selected.initialData}
            onSuccess={(upd) => {
              if (upd) {
                setArticleList((list) =>
                  list.map((a: any) =>
                    a.id === upd!.id ? { ...a, ...(upd as any) } : a
                  )
                );
              }
              handleCloseModal();
            }}
          />
        )}
      </EditModal>
    </div>
  );
};

export default ManageContentPanel;
