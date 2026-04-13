"use client";

import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { SceneCard } from "./SceneCard";

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

interface DraggableSceneCardProps {
  scene: Scene;
  onClick: () => void;
}

export function DraggableSceneCard({ scene, onClick }: DraggableSceneCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: scene.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(isDragging && "opacity-30")}
    >
      <SceneCard scene={scene} onClick={onClick} />
    </div>
  );
}
