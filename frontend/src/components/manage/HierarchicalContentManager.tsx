import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { learningAPI } from "../../services/learningApi";
import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  Plus,
  Video,
  FileText,
  BookOpen,
  CheckSquare,
  FolderOpen,
  Folder,
  GripVertical,
} from "lucide-react";
import EditModal from "./EditModal";
import ModuleForm from "../forms/ModuleForm";
import ChapterForm from "../forms/ChapterForm";
import VideoForm from "../forms/VideoForm";
import ArticleForm from "../forms/ArticleForm";
import TaskForm from "../forms/TaskForm";

interface ModuleData {
  id: number;
  title: string;
  category: { id: number; name: string };
  is_public: boolean;
  chapters?: ChapterData[];
  articles?: ArticleData[]; // Optional since articles are now in chapters
}

interface ChapterData {
  id: number;
  title: string;
  order: number;
  contents?: ContentData[];
  tasks?: TaskData[];
  articles?: ArticleData[];
}

interface ContentData {
  id: number;
  title: string;
  description?: string;
  video_url?: string;
  url?: string;
  order: number;
}

interface TaskData {
  id: number;
  title: string;
  description?: string;
  difficulty: string;
  order: number;
  completed?: boolean;
}

interface ArticleData {
  id: number;
  title: string;
  url?: string;
  order?: number;
}

interface ExpandedState {
  modules: Set<number>;
  chapters: Set<number>;
  contents: Set<number>;
  tasks: Set<number>;
}

const HierarchicalContentManager: React.FC = () => {
  const queryClient = useQueryClient();

  // Expanded state management
  const [expanded, setExpanded] = useState<ExpandedState>({
    modules: new Set(),
    chapters: new Set(),
    contents: new Set(),
    tasks: new Set(),
  });

  // Edit modal state
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    type: "module" | "chapter" | "video" | "article" | "task";
    data?: any;
    moduleId?: number;
    chapterId?: number;
  }>({
    isOpen: false,
    type: "module",
  });

  // Drag & Drop state
  const [draggedItem, setDraggedItem] = useState<{
    type: "module" | "chapter" | "video" | "article" | "task";
    id: number;
    moduleId?: number;
    chapterId?: number;
  } | null>(null);

  // Fetch all modules
  const { data: modules, isLoading } = useQuery({
    queryKey: ["modules-all"],
    queryFn: async () => {
      const res = await learningAPI.getModulesAll();
      return res.data as ModuleData[];
    },
  });

  // Fetch detailed module data when expanded
  const { data: moduleDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ["module-details", Array.from(expanded.modules)],
    queryFn: async () => {
      const details = await Promise.all(
        Array.from(expanded.modules).map(async (moduleId) => {
          const res = await learningAPI.getModule(moduleId);
          return res.data as ModuleData;
        })
      );
      return details;
    },
    enabled: expanded.modules.size > 0,
  });

  // Toggle expanded state
  const toggleExpanded = (type: keyof ExpandedState, id: number) => {
    setExpanded((prev) => ({
      ...prev,
      [type]: new Set(
        prev[type].has(id)
          ? Array.from(prev[type]).filter((item) => item !== id)
          : [...Array.from(prev[type]), id]
      ),
    }));
  };

  // Get module detail data
  const getModuleDetail = (moduleId: number) => {
    const detail = moduleDetails?.find((module) => module.id === moduleId);
    console.log(
      `🔍 [HierarchicalContentManager] Module ${moduleId} detail:`,
      detail
    );
    return detail;
  };

  // Handle edit
  const handleEdit = (
    type: "module" | "chapter" | "video" | "article" | "task",
    data: any,
    moduleId?: number,
    chapterId?: number
  ) => {
    setEditModal({
      isOpen: true,
      type,
      data,
      moduleId,
      chapterId,
    });
  };

  // Handle delete
  const handleDelete = async (
    type: "module" | "chapter" | "video" | "article" | "task",
    id: number
  ) => {
    if (!confirm(`Möchten Sie dieses ${type} wirklich löschen?`)) return;

    try {
      switch (type) {
        case "module":
          await learningAPI.deleteModule(id);
          break;
        case "chapter":
          await learningAPI.deleteChapter(id);
          break;
        case "video":
          await learningAPI.deleteContent(id);
          break;
        case "article":
          await learningAPI.deleteArticle(id);
          break;
        case "task":
          await learningAPI.deleteTask(id);
          break;
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["modules-all"] });
      queryClient.invalidateQueries({ queryKey: ["module-details"] });
    } catch (error) {
      console.error(`Fehler beim Löschen von ${type}:`, error);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setEditModal({ isOpen: false, type: "module" });
    queryClient.invalidateQueries({ queryKey: ["modules-all"] });
    queryClient.invalidateQueries({ queryKey: ["module-details"] });
  };

  // Drag & Drop handlers
  const handleDragStart = (
    e: React.DragEvent,
    type: "module" | "chapter" | "video" | "article" | "task",
    id: number,
    moduleId?: number,
    chapterId?: number
  ) => {
    setDraggedItem({ type, id, moduleId, chapterId });
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.style.opacity = "0.5";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.style.opacity = "1";
    setDraggedItem(null);
  };

  const handleDrop = async (
    e: React.DragEvent,
    targetType: "module" | "chapter" | "video" | "article" | "task",
    targetId: number,
    targetModuleId?: number,
    targetChapterId?: number
  ) => {
    e.preventDefault();
    e.currentTarget.style.opacity = "1";

    if (!draggedItem || draggedItem.id === targetId) {
      setDraggedItem(null);
      return;
    }

    try {
      console.log("🔄 [Drag & Drop] Starting reorder:", {
        draggedItem,
        targetType,
        targetId,
        targetModuleId,
        targetChapterId,
      });

      // Handle different reordering scenarios
      if (draggedItem.type === targetType) {
        // Same type reordering within the same container
        switch (draggedItem.type) {
          case "chapter":
            if (draggedItem.moduleId === targetModuleId) {
              // Get current chapters to calculate new order
              const moduleDetail = getModuleDetail(draggedItem.moduleId!);
              const chapters = moduleDetail?.chapters || [];
              const draggedIndex = chapters.findIndex(
                (c) => c.id === draggedItem.id
              );
              const targetIndex = chapters.findIndex((c) => c.id === targetId);

              if (draggedIndex !== -1 && targetIndex !== -1) {
                // Calculate new order based on target position
                let newOrder = targetIndex + 1;
                if (draggedIndex < targetIndex) {
                  newOrder = targetIndex;
                }

                console.log(
                  `🔄 [Drag & Drop] Reordering chapter ${draggedItem.id} to order ${newOrder}`
                );
                await learningAPI.updateChapter(draggedItem.id, {
                  module_id: draggedItem.moduleId!,
                  title: chapters[draggedIndex].title,
                  order: newOrder,
                });
              }
            }
            break;

          case "video":
            if (draggedItem.chapterId === targetChapterId) {
              // Get current videos to calculate new order
              const moduleDetail = getModuleDetail(draggedItem.moduleId!);
              const chapter = moduleDetail?.chapters?.find(
                (c) => c.id === draggedItem.chapterId
              );
              const videos = chapter?.contents || [];
              const draggedIndex = videos.findIndex(
                (v) => v.id === draggedItem.id
              );
              const targetIndex = videos.findIndex((v) => v.id === targetId);

              if (draggedIndex !== -1 && targetIndex !== -1) {
                let newOrder = targetIndex + 1;
                if (draggedIndex < targetIndex) {
                  newOrder = targetIndex;
                }

                console.log(
                  `🔄 [Drag & Drop] Reordering video ${draggedItem.id} to order ${newOrder}`
                );
                await learningAPI.updateContent(draggedItem.id, {
                  moduleId: draggedItem.moduleId!,
                  title: videos[draggedIndex].title,
                  url:
                    videos[draggedIndex].video_url ||
                    videos[draggedIndex].url ||
                    "",
                  order: newOrder,
                });
              }
            }
            break;

          case "task":
            if (draggedItem.chapterId === targetChapterId) {
              // Get current tasks to calculate new order
              const moduleDetail = getModuleDetail(draggedItem.moduleId!);
              const chapter = moduleDetail?.chapters?.find(
                (c) => c.id === draggedItem.chapterId
              );
              const tasks = chapter?.tasks || [];
              const draggedIndex = tasks.findIndex(
                (t) => t.id === draggedItem.id
              );
              const targetIndex = tasks.findIndex((t) => t.id === targetId);

              if (draggedIndex !== -1 && targetIndex !== -1) {
                let newOrder = targetIndex + 1;
                if (draggedIndex < targetIndex) {
                  newOrder = targetIndex;
                }

                console.log(
                  `🔄 [Drag & Drop] Reordering task ${draggedItem.id} to order ${newOrder}`
                );
                await learningAPI.updateTask(draggedItem.id, {
                  chapter: draggedItem.chapterId!,
                  title: tasks[draggedIndex].title,
                  description: tasks[draggedIndex].description || "",
                  difficulty: tasks[draggedIndex].difficulty,
                  order: newOrder,
                });
              }
            }
            break;

          case "article":
            if (draggedItem.chapterId === targetChapterId) {
              // Get current articles to calculate new order
              const moduleDetail = getModuleDetail(draggedItem.moduleId!);
              const chapter = moduleDetail?.chapters?.find(
                (c) => c.id === draggedItem.chapterId
              );
              const articles = chapter?.articles || [];
              const draggedIndex = articles.findIndex(
                (a) => a.id === draggedItem.id
              );
              const targetIndex = articles.findIndex((a) => a.id === targetId);

              if (draggedIndex !== -1 && targetIndex !== -1) {
                let newOrder = targetIndex + 1;
                if (draggedIndex < targetIndex) {
                  newOrder = targetIndex;
                }

                console.log(
                  `🔄 [Drag & Drop] Reordering article ${draggedItem.id} to order ${newOrder}`
                );
                await learningAPI.updateArticle(draggedItem.id, {
                  module_id: draggedItem.moduleId!,
                  chapter_id: draggedItem.chapterId!,
                  title: articles[draggedIndex].title,
                  url: articles[draggedIndex].url || "",
                  order: newOrder,
                });
              }
            }
            break;
        }
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["modules-all"] });
      queryClient.invalidateQueries({ queryKey: ["module-details"] });

      console.log("✅ [Drag & Drop] Reorder completed successfully");
    } catch (error) {
      console.error("❌ [Drag & Drop] Fehler beim Neuanordnen:", error);
    } finally {
      setDraggedItem(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff863d]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Hierarchische Inhaltsverwaltung
        </h2>
        <button
          onClick={() => handleEdit("module", undefined)}
          className="flex items-center gap-2 px-4 py-2 bg-[#ff863d] text-white rounded-lg hover:bg-[#ed7c34] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Neues Modul
        </button>
      </div>

      {/* Module List */}
      <div className="space-y-2">
        {modules?.map((module) => {
          const isModuleExpanded = expanded.modules.has(module.id);
          const moduleDetail = getModuleDetail(module.id);

          return (
            <div
              key={module.id}
              className="border border-gray-200 rounded-lg"
              draggable
              onDragStart={(e) => handleDragStart(e, "module", module.id)}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDrop(e, "module", module.id, module.id)}
            >
              {/* Module Header */}
              <div className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                  <button
                    onClick={() => toggleExpanded("modules", module.id)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    {isModuleExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  <FolderOpen className="w-5 h-5 text-[#ff863d]" />
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {module.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Kategorie: {module.category.name} •
                      {module.is_public ? " Öffentlich" : " Privat"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit("module", module)}
                    className="p-2 text-gray-600 hover:text-[#ff863d] hover:bg-gray-100 rounded"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete("module", module.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Module Content */}
              {isModuleExpanded && (
                <>
                  {detailsLoading ? (
                    <div className="p-4 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#ff863d]"></div>
                    </div>
                  ) : moduleDetail ? (
                    <div className="p-4 space-y-4">
                      {/* Chapters Section */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-700 flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            Kapitel ({moduleDetail.chapters?.length || 0})
                          </h4>
                          <button
                            onClick={() =>
                              handleEdit("chapter", undefined, module.id)
                            }
                            className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            <Plus className="w-3 h-3" />
                            Kapitel hinzufügen
                          </button>
                        </div>

                        {moduleDetail.chapters?.map((chapter) => {
                          const isChapterExpanded = expanded.chapters.has(
                            chapter.id
                          );

                          // Sicherheitsprüfung für chapter-Daten
                          if (!chapter) return null;

                          return (
                            <div
                              key={chapter.id}
                              className="ml-4 border-l-2 border-gray-200 pl-4"
                              draggable
                              onDragStart={(e) =>
                                handleDragStart(
                                  e,
                                  "chapter",
                                  chapter.id,
                                  module.id
                                )
                              }
                              onDragOver={handleDragOver}
                              onDragEnd={handleDragEnd}
                              onDrop={(e) =>
                                handleDrop(e, "chapter", chapter.id, module.id)
                              }
                            >
                              {/* Chapter Header */}
                              <div className="flex items-center justify-between p-3 bg-white hover:bg-gray-50 rounded border">
                                <div className="flex items-center gap-3">
                                  <GripVertical className="w-3 h-3 text-gray-400 cursor-move" />
                                  <button
                                    onClick={() =>
                                      toggleExpanded("chapters", chapter.id)
                                    }
                                    className="p-1 hover:bg-gray-200 rounded"
                                  >
                                    {isChapterExpanded ? (
                                      <ChevronDown className="w-4 h-4" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4" />
                                    )}
                                  </button>
                                  <Folder className="w-4 h-4 text-blue-600" />
                                  <div>
                                    <h5 className="font-medium text-gray-900">
                                      {chapter.title}
                                    </h5>
                                    <p className="text-sm text-gray-500">
                                      Reihenfolge: {chapter.order}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() =>
                                      handleEdit("chapter", chapter, module.id)
                                    }
                                    className="p-1 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded"
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDelete("chapter", chapter.id)
                                    }
                                    className="p-1 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              {/* Chapter Content */}
                              {isChapterExpanded && (
                                <div className="ml-4 mt-2 space-y-3">
                                  {/* Videos Section */}
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <h6 className="font-medium text-gray-600 flex items-center gap-2">
                                        <Video className="w-4 h-4" />
                                        Lernvideos (
                                        {chapter.contents?.length || 0})
                                      </h6>
                                      <button
                                        onClick={() =>
                                          handleEdit(
                                            "video",
                                            undefined,
                                            module.id,
                                            chapter.id
                                          )
                                        }
                                        className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                                      >
                                        <Plus className="w-3 h-3" />
                                        Video hinzufügen
                                      </button>
                                    </div>

                                    {chapter.contents?.map((content) => (
                                      <div
                                        key={content.id}
                                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                        draggable
                                        onDragStart={(e) =>
                                          handleDragStart(
                                            e,
                                            "video",
                                            content.id,
                                            module.id,
                                            chapter.id
                                          )
                                        }
                                        onDragOver={handleDragOver}
                                        onDragEnd={handleDragEnd}
                                        onDrop={(e) =>
                                          handleDrop(
                                            e,
                                            "video",
                                            content.id,
                                            module.id,
                                            chapter.id
                                          )
                                        }
                                      >
                                        <div className="flex items-center gap-2">
                                          <GripVertical className="w-3 h-3 text-gray-400 cursor-move" />
                                          <Video className="w-4 h-4 text-green-600" />
                                          <span className="text-sm">
                                            {content.title}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={() =>
                                              handleEdit(
                                                "video",
                                                content,
                                                module.id,
                                                chapter.id
                                              )
                                            }
                                            className="p-1 text-gray-600 hover:text-green-600 hover:bg-gray-100 rounded"
                                          >
                                            <Pencil className="w-3 h-3" />
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleDelete("video", content.id)
                                            }
                                            className="p-1 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Tasks Section */}
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <h6 className="font-medium text-gray-600 flex items-center gap-2">
                                        <CheckSquare className="w-4 h-4" />
                                        Aufgaben ({chapter.tasks?.length || 0})
                                      </h6>
                                      <button
                                        onClick={() =>
                                          handleEdit(
                                            "task",
                                            undefined,
                                            module.id,
                                            chapter.id
                                          )
                                        }
                                        className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                                      >
                                        <Plus className="w-3 h-3" />
                                        Aufgabe hinzufügen
                                      </button>
                                    </div>

                                    {chapter.tasks?.map((task) => (
                                      <div
                                        key={task.id}
                                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                        draggable
                                        onDragStart={(e) =>
                                          handleDragStart(
                                            e,
                                            "task",
                                            task.id,
                                            module.id,
                                            chapter.id
                                          )
                                        }
                                        onDragOver={handleDragOver}
                                        onDragEnd={handleDragEnd}
                                        onDrop={(e) =>
                                          handleDrop(
                                            e,
                                            "task",
                                            task.id,
                                            module.id,
                                            chapter.id
                                          )
                                        }
                                      >
                                        <div className="flex items-center gap-2">
                                          <GripVertical className="w-3 h-3 text-gray-400 cursor-move" />
                                          <CheckSquare className="w-4 h-4 text-purple-600" />
                                          <span className="text-sm">
                                            {task.title}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            ({task.difficulty})
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={() =>
                                              handleEdit(
                                                "task",
                                                task,
                                                module.id,
                                                chapter.id
                                              )
                                            }
                                            className="p-1 text-gray-600 hover:text-purple-600 hover:bg-gray-100 rounded"
                                          >
                                            <Pencil className="w-3 h-3" />
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleDelete("task", task.id)
                                            }
                                            className="p-1 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Articles Section */}
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <h6 className="font-medium text-gray-600 flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Lernbeiträge (
                                        {chapter.articles?.length || 0})
                                      </h6>
                                      <button
                                        onClick={() =>
                                          handleEdit(
                                            "article",
                                            undefined,
                                            module.id,
                                            chapter.id
                                          )
                                        }
                                        className="flex items-center gap-1 px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
                                      >
                                        <Plus className="w-3 h-3" />
                                        Artikel hinzufügen
                                      </button>
                                    </div>

                                    {chapter.articles?.map((article) => (
                                      <div
                                        key={article.id}
                                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                        draggable
                                        onDragStart={(e) =>
                                          handleDragStart(
                                            e,
                                            "article",
                                            article.id,
                                            module.id,
                                            chapter.id
                                          )
                                        }
                                        onDragOver={handleDragOver}
                                        onDragEnd={handleDragEnd}
                                        onDrop={(e) =>
                                          handleDrop(
                                            e,
                                            "article",
                                            article.id,
                                            module.id,
                                            chapter.id
                                          )
                                        }
                                      >
                                        <div className="flex items-center gap-2">
                                          <GripVertical className="w-3 h-3 text-gray-400 cursor-move" />
                                          <FileText className="w-4 h-4 text-orange-600" />
                                          <span className="text-sm">
                                            {article.title}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={() =>
                                              handleEdit(
                                                "article",
                                                article,
                                                module.id,
                                                chapter.id
                                              )
                                            }
                                            className="p-1 text-gray-600 hover:text-orange-600 hover:bg-gray-100 rounded"
                                          >
                                            <Pencil className="w-3 h-3" />
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleDelete(
                                                "article",
                                                article.id
                                              )
                                            }
                                            className="p-1 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      Keine Daten verfügbar
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editModal.isOpen && (
        <EditModal
          isOpen={editModal.isOpen}
          onClose={handleModalClose}
          title={`${
            editModal.type === "module"
              ? "Modul"
              : editModal.type === "chapter"
              ? "Kapitel"
              : editModal.type === "video"
              ? "Lernvideo"
              : editModal.type === "article"
              ? "Lernbeitrag"
              : "Aufgabe"
          } ${editModal.data ? "bearbeiten" : "erstellen"}`}
        >
          {editModal.type === "module" && (
            <ModuleForm
              initialData={editModal.data}
              onSuccess={handleModalClose}
            />
          )}
          {editModal.type === "chapter" && (
            <ChapterForm
              initialData={editModal.data}
              moduleId={editModal.moduleId}
              onSuccess={handleModalClose}
            />
          )}
          {editModal.type === "video" && (
            <VideoForm
              initialData={editModal.data}
              moduleId={editModal.moduleId}
              chapterId={editModal.chapterId}
              onSuccess={handleModalClose}
            />
          )}
          {editModal.type === "article" && (
            <ArticleForm
              initialData={editModal.data}
              moduleId={editModal.moduleId}
              chapterId={editModal.chapterId}
              onSuccess={handleModalClose}
            />
          )}
          {editModal.type === "task" && (
            <TaskForm
              mode={editModal.data ? "edit" : "create"}
              initialData={editModal.data}
              moduleId={editModal.moduleId}
              chapterId={editModal.chapterId}
              onSuccess={handleModalClose}
            />
          )}
        </EditModal>
      )}
    </div>
  );
};

export default HierarchicalContentManager;
