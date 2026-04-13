"use client";

import { Film, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

interface SceneCardProps {
  scene: Scene;
  onClick: () => void;
}

export function SceneCard({ scene, onClick }: SceneCardProps) {
  const thumbnail =
    scene.keyframes?.[0]?.finalImageUrl || scene.keyframes?.[0]?.draftImageUrl;

  return (
    <Card
      className="cursor-pointer transition-all hover:border-purple-500/50 hover:shadow-md"
      onClick={onClick}
    >
      {thumbnail && (
        <div className="relative h-28 w-full overflow-hidden rounded-t-lg">
          <img
            src={thumbnail}
            alt={scene.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">
              Scene {scene.sceneNumber}
            </p>
            <h4 className="truncate text-sm font-medium text-foreground">
              {scene.title}
            </h4>
            {scene.heading && (
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {scene.heading}
              </p>
            )}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          {scene.keyframes.length > 0 && (
            <Badge variant="outline" className="gap-1 text-xs">
              <ImageIcon className="h-3 w-3" />
              {scene.keyframes.length}
            </Badge>
          )}
          {scene.videoUrl && (
            <Badge variant="outline" className="gap-1 text-xs text-green-400">
              <Film className="h-3 w-3" />
              Video
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
