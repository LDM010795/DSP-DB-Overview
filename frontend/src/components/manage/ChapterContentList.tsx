import React from "react";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import SortableList from "./SortableList";

interface Chapter {
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
}

interface ChapterContentListProps {
  chapters: Chapter[];
  onVideoOrderChange: (chapterId: number, newList: any[]) => void;
  onVideoEdit: (item: any) => void;
  onVideoDelete: (item: any) => void;
  onChapterDelete?: (chapter: Chapter) => void;
}

const ChapterContentList: React.FC<ChapterContentListProps> = ({
  chapters,
  onVideoOrderChange,
  onVideoEdit,
  onVideoDelete,
  onChapterDelete,
}) => {
  const [expandedChapters, setExpandedChapters] = React.useState<Set<number>>(
    new Set()
  );

  const toggleChapter = (chapterId: number) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  return (
    <div className="space-y-4">
      {chapters.map((chapter) => {
        const isExpanded = expandedChapters.has(chapter.id);
        return (
          <div
            key={chapter.id}
            className="bg-white rounded-lg border border-gray-200"
          >
            <div className="px-4 py-3 flex items-center justify-between">
              <div
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 rounded px-2 py-1"
                onClick={() => toggleChapter(chapter.id)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
                <h5 className="font-medium text-gray-900">
                  Kapitel {chapter.order}: {chapter.title}
                </h5>
                <span className="text-xs text-gray-500">
                  ({chapter.contents.length} Videos)
                </span>
              </div>
              {onChapterDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onChapterDelete(chapter);
                  }}
                  className="text-sm text-red-600 hover:text-red-900 p-1"
                  aria-label="Kapitel löschen"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            {isExpanded && (
              <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-lg border-l-4 border-l-blue-200">
                {chapter.contents.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Keine Videos in diesem Kapitel.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500 font-medium">
                      Videos in diesem Kapitel (Drag & Drop nur innerhalb des
                      Kapitels möglich)
                    </div>
                    <SortableList
                      items={chapter.contents}
                      onOrderChange={(newList) =>
                        onVideoOrderChange(chapter.id, newList)
                      }
                      onEdit={onVideoEdit}
                      onDelete={onVideoDelete}
                      groupId={`chapter-${chapter.id}`}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ChapterContentList;
