import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { learningAPI } from "../../services/learningApi";
import { Pencil, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import EditModal from "./EditModal";
import ModuleForm from "../forms/ModuleForm";
import VideoForm from "../forms/VideoForm";
import ArticleForm from "../forms/ArticleForm";
import SortableList from "./SortableList";
import ChapterContentList from "./ChapterContentList";
import { useEffect } from "react";

interface ModuleDetail {
  id: number;
  title: string;
  category: { id: number; name: string };
  is_public: boolean;
  chapters?: {
    id: number;
    title: string;
    order: number;
    contents: {
      id: number;
      title: string;
      description?: string;
      video_url?: string;
      order: number;
    }[];
  }[];
  contents?: {
    id: number;
    title: string;
    description?: string;
    video_url?: string;
    order?: number;
  }[];
  articles: { id: number; title: string; url?: string }[];
}

const ManageContentPanel: React.FC = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["modules-all"],
    queryFn: async () => {
      const res = await learningAPI.getModulesAll();
      return res.data as {
        id: number;
        title: string;
        is_public: boolean;
        category: { id: number; name: string };
      }[];
    },
  });

  const [expanded, setExpanded] = useState<number | null>(null);
  const [selected, setSelected] = useState<{
    type: "module" | "video" | "article";
    id: number;
    moduleId?: number;
    initialData?: Record<string, unknown>;
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

  const [videoList, setVideoList] = useState<
    {
      id: number;
      title: string;
      description?: string;
      video_url?: string;
      order?: number;
    }[]
  >([]);
  const [articleList, setArticleList] = useState<ModuleDetail["articles"]>([]);

  useEffect(() => {
    if (detailData) {
      // Prüfen ob chapters existieren, sonst contents verwenden (Fallback)
      if (detailData.chapters && detailData.chapters.length > 0) {
        // Alle Videos aus allen Kapiteln sammeln
        const allVideos = detailData.chapters.flatMap(
          (chapter) => chapter.contents
        );
        setVideoList(allVideos);
      } else if (detailData.contents) {
        // Fallback für alte Struktur
        setVideoList(detailData.contents);
      } else {
        setVideoList([]);
      }
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
    // Cache invalidieren statt refetch für bessere Performance
    queryClient.invalidateQueries({ queryKey: ["modules-all"] });
    queryClient.invalidateQueries({ queryKey: ["module-detail", expanded] });
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
            onClick={() => setFilter(btn.id as "all" | "public" | "private")}
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

                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected({
                        type: "module",
                        id: mod.id,
                        initialData: {
                          title: mod.title,
                          category: mod.category?.id?.toString() || "",
                          is_public: mod.is_public,
                        },
                      });
                    }}
                    className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
                    aria-label="Modul bearbeiten"
                  >
                    <Pencil className="h-4 w-4 mr-1" /> Bearbeiten
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        confirm(
                          `Möchtest du das Modul "${mod.title}" wirklich löschen?`
                        )
                      ) {
                        learningAPI.deleteModule(mod.id);
                        // Cache invalidieren für UI-Update
                        queryClient.invalidateQueries({
                          queryKey: ["modules-all"],
                        });
                        queryClient.invalidateQueries({
                          queryKey: ["modules"],
                        });
                        queryClient.invalidateQueries({
                          queryKey: ["modules-accessible"],
                        });
                      }
                    }}
                    className="inline-flex items-center px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-md"
                    aria-label="Modul löschen"
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Löschen
                  </button>
                </div>
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
                  {detailData?.chapters && detailData.chapters.length > 0 ? (
                    <ChapterContentList
                      chapters={detailData.chapters}
                      onVideoOrderChange={(chapterId, newList) => {
                        // Sofort lokalen State aktualisieren für sofortige UI-Feedback
                        if (detailData?.chapters) {
                          const updatedChapters = detailData.chapters.map(
                            (chapter) => {
                              if (chapter.id === chapterId) {
                                return {
                                  ...chapter,
                                  contents: newList,
                                };
                              }
                              return chapter;
                            }
                          );

                          // React Query Cache sofort aktualisieren
                          queryClient.setQueryData(
                            ["module-detail", expanded],
                            {
                              ...detailData,
                              chapters: updatedChapters,
                            }
                          );
                        }

                        newList.forEach((item, idx) => {
                          // Nur order aktualisieren - chapter bleibt unverändert
                          learningAPI.updateVideo(item.id, {
                            order: idx + 1,
                          });
                        });
                        // Cache invalidieren für UI-Update
                        queryClient.invalidateQueries({
                          queryKey: ["modules-all"],
                        });
                        queryClient.invalidateQueries({
                          queryKey: ["module-detail", expanded],
                        });
                      }}
                      onVideoEdit={(item) =>
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
                      onVideoDelete={(item) => {
                        if (
                          confirm(
                            `Möchtest du das Video "${item.title}" wirklich löschen?`
                          )
                        ) {
                          // Sofort lokalen State aktualisieren für sofortige UI-Feedback
                          if (detailData?.chapters) {
                            const updatedChapters = detailData.chapters.map(
                              (chapter) => {
                                return {
                                  ...chapter,
                                  contents: chapter.contents.filter(
                                    (content) => content.id !== item.id
                                  ),
                                };
                              }
                            );

                            // React Query Cache sofort aktualisieren
                            queryClient.setQueryData(
                              ["module-detail", expanded],
                              {
                                ...detailData,
                                chapters: updatedChapters,
                              }
                            );
                          }

                          learningAPI.deleteVideo(item.id);
                          // Cache invalidieren für UI-Update
                          queryClient.invalidateQueries({
                            queryKey: ["modules-all"],
                          });
                          queryClient.invalidateQueries({
                            queryKey: ["module-detail", expanded],
                          });
                        }
                      }}
                      onChapterDelete={(chapter) => {
                        if (
                          confirm(
                            `Möchtest du das Kapitel "${chapter.title}" mit allen Videos wirklich löschen?`
                          )
                        ) {
                          // Sofort lokalen State aktualisieren für sofortige UI-Feedback
                          if (detailData?.chapters) {
                            const updatedChapters = detailData.chapters.filter(
                              (c) => c.id !== chapter.id
                            );

                            // React Query Cache sofort aktualisieren
                            queryClient.setQueryData(
                              ["module-detail", expanded],
                              {
                                ...detailData,
                                chapters: updatedChapters,
                              }
                            );

                            // Auch videoList sofort aktualisieren für Fallback-Anzeige
                            if (updatedChapters.length === 0) {
                              // Wenn alle Kapitel gelöscht wurden, videoList leeren
                              setVideoList([]);
                            } else {
                              // Ansonsten videoList aus den verbleibenden Kapiteln neu berechnen
                              const remainingVideos = updatedChapters.flatMap(
                                (chapter) => chapter.contents
                              );
                              setVideoList(remainingVideos);
                            }
                          }

                          learningAPI.deleteChapter(chapter.id);
                          // Cache invalidieren für UI-Update
                          queryClient.invalidateQueries({
                            queryKey: ["modules-all"],
                          });
                          queryClient.invalidateQueries({
                            queryKey: ["module-detail", expanded],
                          });
                        }
                      }}
                    />
                  ) : videoList && videoList.length > 0 ? (
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
                      onDelete={(item) => {
                        if (
                          confirm(
                            `Möchtest du das Video "${item.title}" wirklich löschen?`
                          )
                        ) {
                          learningAPI.deleteVideo(item.id);
                          setVideoList((prev) =>
                            prev.filter((v) => v.id !== item.id)
                          );
                        }
                      }}
                    />
                  ) : (
                    <p className="text-sm text-gray-500">Keine Videos.</p>
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
                          const payload = {
                            order: idx + 1,
                            title: item.title,
                            url: item.url,
                            module_id: mod.id,
                          };
                          console.log(
                            `[DEBUG] Updating article ${item.id} with payload:`,
                            payload
                          );
                          learningAPI.updateArticle(item.id, payload);
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
                      onDelete={(item) => {
                        if (
                          confirm(
                            `Möchtest du den Artikel "${item.title}" wirklich löschen?`
                          )
                        ) {
                          learningAPI.deleteArticle(item.id);
                          setArticleList((prev) =>
                            prev.filter((a) => a.id !== item.id)
                          );
                          // Cache invalidieren für UI-Update
                          queryClient.invalidateQueries({
                            queryKey: ["modules-all"],
                          });
                          queryClient.invalidateQueries({
                            queryKey: ["module-detail", expanded],
                          });
                        }
                      }}
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
            onSuccess={() => {
              handleCloseModal();
            }}
          />
        )}
        {selected?.type === "article" && selected.id && selected.moduleId && (
          <ArticleForm
            mode="edit"
            initialData={
              selected.initialData as {
                id: number;
                moduleId: string;
                cloudUrl: string;
              }
            }
            onSuccess={() => {
              handleCloseModal();
            }}
          />
        )}
      </EditModal>
    </div>
  );
};

export default ManageContentPanel;
