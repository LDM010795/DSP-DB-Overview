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
}

interface SortableListProps {
  items: Item[];
  onOrderChange: (items: Item[]) => void;
  onEdit?: (item: Item) => void;
}

const SortableItem: React.FC<{item: Item; order: number; onEdit?: (item: Item)=>void}> = ({item, order, onEdit}) => {
  const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id: item.id});
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
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center space-x-2">
        <span className="w-6 text-right text-xs text-gray-500">{order}</span>
        <span>{item.title}</span>
      </div>
      {onEdit && (
        <button
          className="text-sm text-gray-600 hover:text-gray-900"
          onClick={(e)=>{e.stopPropagation(); onEdit(item);}}
          aria-label="Bearbeiten"
        >✏️</button>
      )}
    </div>
  );
};

const SortableList: React.FC<SortableListProps> = ({items, onOrderChange, onEdit}) => {
  const sensors = useSensors(
    useSensor(MouseSensor, {activationConstraint: {distance:5}}),
    useSensor(TouchSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
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
          <SortableItem key={it.id} item={it} order={idx+1} onEdit={onEdit} />
        ))}
      </SortableContext>
    </DndContext>
  );
};

export default SortableList;
