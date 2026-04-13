import type { SceneStatus, ProjectStage, MuseControlLevel, MuseType } from "./types";

export const KANBAN_COLUMNS: { id: SceneStatus; label: string; color: string }[] = [
  { id: "SCRIPT", label: "Script of Scenes", color: "bg-blue-500" },
  { id: "KEYFRAME", label: "Keyframe Creation", color: "bg-purple-500" },
  { id: "DRAFT_QUEUE", label: "Video Draft Queue", color: "bg-yellow-500" },
  { id: "GENERATING", label: "Video Generating", color: "bg-orange-500" },
  { id: "PENDING_APPROVAL", label: "Awaiting Approval", color: "bg-cyan-500" },
  { id: "FINAL", label: "Final Scene", color: "bg-green-500" },
];

export const PROJECT_STAGES: { id: ProjectStage; label: string; icon: string }[] = [
  { id: "STORYLINE", label: "Storyline", icon: "BookOpen" },
  { id: "SCRIPT", label: "Script", icon: "FileText" },
  { id: "KEYFRAME_VIDEO", label: "Production", icon: "Film" },
];

export const MUSE_CONTROL_LEVELS: {
  id: MuseControlLevel;
  label: string;
  description: string;
}[] = [
  {
    id: "OBSERVER",
    label: "Observer",
    description: "AI observes and analyzes but does not suggest actions",
  },
  {
    id: "ASSISTANT",
    label: "Assistant",
    description: "AI provides suggestions when asked or at key moments",
  },
  {
    id: "COLLABORATOR",
    label: "Collaborator",
    description: "AI actively co-creates and auto-generates suggestions",
  },
];

export const MUSE_TYPES: { id: MuseType; label: string; description: string }[] = [
  { id: "STORY_MUSE", label: "Story Muse", description: "Storyline and narrative" },
  { id: "VISUAL_MUSE", label: "Visual Muse", description: "Keyframes and imagery" },
  { id: "MOTION_MUSE", label: "Motion Muse", description: "Video and animation" },
];

export const NAV_ITEMS = [
  { href: "/", label: "Projects", icon: "FolderOpen" },
  { href: "/playground", label: "Playground", icon: "Wand2" },
  { href: "/ask-muse", label: "Ask Muse", icon: "MessageCircle" },
  { href: "/mcp-extensions", label: "MCP Tools", icon: "Puzzle" },
  { href: "/settings", label: "Settings", icon: "Settings" },
] as const;

export const CHARACTER_IMAGE_KINDS = [
  { id: "FACE", label: "Face" },
  { id: "FULL_BODY", label: "Full Body" },
  { id: "EXPRESSION", label: "Expression" },
  { id: "OUTFIT", label: "Outfit" },
  { id: "TURNAROUND", label: "Turnaround" },
  { id: "ACTION", label: "Action" },
  { id: "OTHER", label: "Other" },
] as const;

export const DEFAULT_INFERENCE_SETTINGS = {
  temperature: 0.7,
  maxTokens: 4096,
  topP: 1,
  defaultProvider: "ollama" as const,
  defaultModel: "llama3.1",
};
