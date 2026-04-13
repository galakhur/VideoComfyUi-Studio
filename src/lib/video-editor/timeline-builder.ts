import type { FilmClip, FilmTimelineProps } from "@/lib/types";

interface SceneInput {
  id: string;
  videoUrl: string;
  videoDurationSeconds: number;
  transition?: "cut" | "crossfade" | "wipe";
  transitionDurationFrames?: number;
}

const DEFAULT_FPS = 30;
const DEFAULT_TRANSITION_FRAMES = 15; // 0.5s at 30fps

export function buildTimeline(
  scenes: SceneInput[],
  fps: number = DEFAULT_FPS,
  audioTrackUrl?: string
): FilmTimelineProps {
  const clips: FilmClip[] = [];
  let currentFrame = 0;

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const durationFrames = Math.round(scene.videoDurationSeconds * fps);
    const transition = scene.transition || (i > 0 ? "crossfade" : "cut");
    const transitionFrames =
      transition !== "cut"
        ? scene.transitionDurationFrames || DEFAULT_TRANSITION_FRAMES
        : 0;

    // Overlap with previous clip for transitions
    if (i > 0 && transitionFrames > 0) {
      currentFrame -= transitionFrames;
    }

    clips.push({
      sceneId: scene.id,
      videoUrl: scene.videoUrl,
      durationSeconds: scene.videoDurationSeconds,
      startFrame: currentFrame,
      endFrame: currentFrame + durationFrames,
      transition,
      transitionDurationFrames: transitionFrames,
    });

    currentFrame += durationFrames;
  }

  return {
    clips,
    fps,
    totalDurationFrames: currentFrame,
    audioTrackUrl,
  };
}

export function computeFilmDuration(
  scenes: { videoDurationSeconds: number }[],
  fps: number = DEFAULT_FPS,
  transitionDurationFrames: number = DEFAULT_TRANSITION_FRAMES
): { totalFrames: number; totalSeconds: number } {
  if (scenes.length === 0) return { totalFrames: 0, totalSeconds: 0 };

  let totalFrames = 0;
  for (const scene of scenes) {
    totalFrames += Math.round(scene.videoDurationSeconds * fps);
  }

  // Subtract transition overlaps
  const overlaps = Math.max(0, scenes.length - 1) * transitionDurationFrames;
  totalFrames -= overlaps;

  return {
    totalFrames,
    totalSeconds: totalFrames / fps,
  };
}
