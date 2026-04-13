import { generateText } from "./provider-registry";
import { AGENT_SUGGESTION_PROMPT } from "./prompt-templates";
import type { LLMProvider, MuseControlLevel, SuggestionType, MuseType } from "@/lib/types";

export interface Suggestion {
  type: SuggestionType;
  muse: MuseType;
  message: string;
  sceneId?: string;
  actions: { label: string; type: "apply" | "dismiss" | "view" }[];
}

interface ProjectContext {
  title: string;
  storyline: string | null;
  currentStage: string;
  museControlLevel: MuseControlLevel;
  scenes: {
    id: string;
    title: string;
    status: string;
    description: string;
    hasKeyframes: boolean;
    hasVideo: boolean;
  }[];
  characterCount: number;
}

export async function generateSuggestions(
  project: ProjectContext,
  provider: LLMProvider = "openai"
): Promise<Suggestion[]> {
  if (project.museControlLevel === "OBSERVER") {
    return [];
  }

  const contextDescription = buildContextDescription(project);

  const result = await generateText(
    provider,
    [
      { role: "system", content: AGENT_SUGGESTION_PROMPT },
      { role: "user", content: contextDescription },
    ],
    { temperature: 0.6, maxTokens: 2048 }
  );

  try {
    const jsonMatch = result.content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const raw = JSON.parse(jsonMatch[0]);
      return raw.map((s: Record<string, unknown>) => ({
        type: (s.type as SuggestionType) || "ENHANCEMENT",
        muse: deriveMuseFromStage(project.currentStage),
        message: String(s.message || ""),
        sceneId: s.sceneId ? String(s.sceneId) : undefined,
        actions: Array.isArray(s.actions)
          ? s.actions.map((a: unknown) =>
              typeof a === "string"
                ? { label: a, type: "apply" as const }
                : (a as { label: string; type: "apply" | "dismiss" | "view" })
            )
          : [{ label: "Apply", type: "apply" as const }],
      }));
    }
  } catch {
    // ignore parse errors
  }

  return [];
}

function buildContextDescription(project: ProjectContext): string {
  const parts = [
    `Project: "${project.title}"`,
    `Stage: ${project.currentStage}`,
    `Control Level: ${project.museControlLevel}`,
    `Storyline: ${project.storyline ? "Present" : "Not yet created"}`,
    `Scenes: ${project.scenes.length} total`,
    `Characters: ${project.characterCount}`,
  ];

  if (project.scenes.length > 0) {
    parts.push("\nScene breakdown:");
    for (const scene of project.scenes) {
      parts.push(
        `  - "${scene.title}" [${scene.status}] keyframes:${scene.hasKeyframes} video:${scene.hasVideo}`
      );
    }
  }

  const incompleteScenes = project.scenes.filter((s) => s.status !== "FINAL");
  if (incompleteScenes.length > 0) {
    parts.push(`\n${incompleteScenes.length} scenes not yet finalized.`);
  }

  parts.push(
    `\nGenerate ${project.museControlLevel === "COLLABORATOR" ? "3-5" : "1-3"} suggestions.`
  );

  return parts.join("\n");
}

function deriveMuseFromStage(stage: string): MuseType {
  switch (stage) {
    case "STORYLINE":
      return "STORY_MUSE";
    case "SCRIPT":
      return "STORY_MUSE";
    case "KEYFRAME_VIDEO":
      return "VISUAL_MUSE";
    default:
      return "STORY_MUSE";
  }
}

export function deriveActiveMuse(
  stage: string,
  scenes: { status: string }[]
): MuseType {
  const hasGenerating = scenes.some(
    (s) => s.status === "GENERATING" || s.status === "DRAFT_QUEUE"
  );
  if (hasGenerating) return "MOTION_MUSE";

  const hasKeyframe = scenes.some((s) => s.status === "KEYFRAME");
  if (hasKeyframe) return "VISUAL_MUSE";

  return deriveMuseFromStage(stage);
}

export function deriveProjectStage(
  scenes: { status: string }[]
): string {
  if (scenes.length === 0) return "STORYLINE";

  const allScript = scenes.every((s) => s.status === "SCRIPT");
  if (allScript) return "SCRIPT";

  const hasVisual = scenes.some(
    (s) => s.status !== "SCRIPT"
  );
  if (hasVisual) return "KEYFRAME_VIDEO";

  return "SCRIPT";
}
