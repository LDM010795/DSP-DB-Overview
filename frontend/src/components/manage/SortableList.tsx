import React from "react";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DragEndEvent } from "@dnd-kit/core";

interface Item {
  id: number;
  title: string;
  description?: string;
  video_url?: string;
  url?: string;
}

interface SortableListProps {
  items: Item[];
  onOrderChange: (items: Item[]) => void;
  onEdit?: (item: Item) => void;
  onDelete?: (item: Item) => void;
  groupId?: string; // Optional group ID to restrict drag & drop to same group
}

const SortableItem: React.FC<{
  item: Item;
  order: number;
  onEdit?: (item: Item) => void;
  onDelete?: (item: Item) => void;
  groupId?: string;
}> = ({ item, order, onEdit, onDelete, groupId }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between py-1 cursor-grab hover:bg-gray-100 px-2 rounded"
      data-group-id={groupId}
      data-item-id={item.id}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center space-x-2">
        <span className="w-6 text-right text-xs text-gray-500">{order}</span>
        <span>{item.title}</span>
      </div>
      <div className="flex items-center space-x-1">
        {onEdit && (
          <button
            className="text-sm text-gray-600 hover:text-gray-900"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(item);
            }}
            aria-label="Bearbeiten"
          >
            ✏️
          </button>
        )}
        {onDelete && (
          <button
            className="text-sm text-red-600 hover:text-red-900"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item);
            }}
            aria-label="Löschen"
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
};

const SortableList: React.FC<SortableListProps> = ({
  items,
  onOrderChange,
  onEdit,
  onDelete,
  groupId,
}) => {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Ensure drag & drop only works within the same group
    if (groupId) {
      const activeElement = document.querySelector(
        `[data-group-id="${groupId}"][data-item-id="${active.id}"]`
      );
      const overElement = document.querySelector(
        `[data-group-id="${groupId}"][data-item-id="${over.id}"]`
      );

      if (!activeElement || !overElement) {
        console.log("Drag & Drop blocked: Items must be in the same chapter");
        return;
      }
    }

    const activeId = Number(active.id);
    const overId = Number(over.id);
    const oldIndex = items.findIndex((i) => i.id === activeId);
    const newIndex = items.findIndex((i) => i.id === overId);
    const newItems = arrayMove(items, oldIndex, newIndex);
    onOrderChange(newItems);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        {items.map((it, idx) => (
          <SortableItem
            key={it.id}
            item={it}
            order={idx + 1}
            onEdit={onEdit}
            onDelete={onDelete}
            groupId={groupId}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
};

export default SortableList;
