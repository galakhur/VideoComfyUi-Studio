"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { KANBAN_COLUMNS } from "@/lib/constants";
import { KanbanColumn } from "./KanbanColumn";
import { SceneCard } from "./SceneCard";
import { DraggableSceneCard } from "./DraggableSceneCard";

interface Scene {
  id: string;
  sceneNumber: number;
  title: string;
  heading: string;
  description: string;
  status: string;
  videoUrl: string | null;
  keyframes: { id: string; draftImageUrl: string | null; finalImageUrl: string | null }[];
}

interface KanbanBoardProps {
  scenes: Scene[];
  onSceneClick: (sceneId: string) => void;
  onStatusChange: (sceneId: string, newStatus: string) => void;
}

export function KanbanBoard({ scenes, onSceneClick, onStatusChange }: KanbanBoardProps) {
  const [activeScene, setActiveScene] = useState<Scene | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const scene = scenes.find((s) => s.id === event.active.id);
    if (scene) setActiveScene(scene);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveScene(null);
    const { active, over } = event;
    if (!over) return;

    const sceneId = active.id as string;
    const overId = over.id as string;

    // Check if dropped over a column
    const targetColumn = KANBAN_COLUMNS.find((c) => c.id === overId);
    if (targetColumn) {
      const scene = scenes.find((s) => s.id === sceneId);
      if (scene && scene.status !== targetColumn.id) {
        onStatusChange(sceneId, targetColumn.id);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto p-4 h-full">
        {KANBAN_COLUMNS.map((column) => {
          const columnScenes = scenes.filter((s) => s.status === column.id);
          return (
            <KanbanColumn
              key={column.id}
              id={column.id}
              label={column.label}
              color={column.color}
              count={columnScenes.length}
            >
              {columnScenes.map((scene) => (
                <DraggableSceneCard
                  key={scene.id}
                  scene={scene}
                  onClick={() => onSceneClick(scene.id)}
                />
              ))}
            </KanbanColumn>
          );
        })}
      </div>

      <DragOverlay>
        {activeScene && (
          <div className="opacity-80 rotate-3">
            <SceneCard scene={activeScene} onClick={() => {}} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
