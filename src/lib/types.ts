// ==================== Enums ====================

export type ProjectStage = "STORYLINE" | "SCRIPT" | "KEYFRAME_VIDEO";

export type MuseControlLevel = "OBSERVER" | "ASSISTANT" | "COLLABORATOR";

export type MuseType = "STORY_MUSE" | "VISUAL_MUSE" | "MOTION_MUSE";

export type SceneStatus =
  | "SCRIPT"
  | "KEYFRAME"
  | "DRAFT_QUEUE"
  | "GENERATING"
  | "PENDING_APPROVAL"
  | "FINAL";

export type KeyframeStatus = "DRAFT" | "REFINING" | "APPROVED";

export type KeyframeSource = "UPLOAD" | "VISUAL_MUSE";

export type StorylineSource = "UPLOAD" | "MUSE_GENERATED" | "MANUAL";

export type CharacterImageKind =
  | "FACE"
  | "FULL_BODY"
  | "EXPRESSION"
  | "OUTFIT"
  | "TURNAROUND"
  | "ACTION"
  | "OTHER";

export type CharacterImageSource = "UPLOAD" | "KEYFRAME" | "EXTERNAL";

export type JobType = "image_draft" | "image_refine" | "video" | "story";

export type JobStatus = "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED";

export type SuggestionType =
  | "CONSISTENCY"
  | "ENHANCEMENT"
  | "VISUAL_STYLE"
  | "PACING";

export type LLMProvider = "ollama" | "claude";

export type ComfyWorkflowCategory = "image_draft" | "image_refine" | "video";

// ==================== Domain Types ====================

export interface StorylineContent {
  logline: string;
  plotOutline: string;
  characters: string[];
  themes: string[];
  genre: string;
}

export interface GenerationParams {
  prompt: string;
  negativePrompt?: string;
  denoiseStrength?: number;
  styleStrength?: number;
  aspectRatio?: string;
  referenceWeight?: number;
  seed?: number;
  width?: number;
  height?: number;
}

export interface SuggestionAction {
  label: string;
  type: "apply" | "dismiss" | "view";
  payload?: Record<string, unknown>;
}

export interface FilmClip {
  sceneId: string;
  videoUrl: string;
  durationSeconds: number;
  startFrame: number;
  endFrame: number;
  transition?: "cut" | "crossfade" | "wipe";
  transitionDurationFrames?: number;
}

export interface FilmTimelineProps {
  clips: FilmClip[];
  fps: number;
  totalDurationFrames: number;
  audioTrackUrl?: string;
}

// ==================== API Request/Response Types ====================

export interface CreateProjectInput {
  title: string;
  description?: string;
  genre?: string;
}

export interface UpdateProjectInput {
  title?: string;
  description?: string;
  storyline?: string;
  storylineSource?: StorylineSource;
  storylineConfirmed?: boolean;
  currentStage?: ProjectStage;
  museControlLevel?: MuseControlLevel;
}

export interface CreateSceneInput {
  projectId: string;
  title: string;
  sceneNumber: number;
  heading?: string;
  description?: string;
  dialogue?: string;
  technicalNotes?: string;
}

export interface UpdateSceneInput {
  title?: string;
  heading?: string;
  description?: string;
  dialogue?: string;
  technicalNotes?: string;
  notes?: string;
  status?: SceneStatus;
  videoUrl?: string;
  videoDurationSeconds?: number;
}

export interface CreateCharacterInput {
  projectId: string;
  name: string;
  shortBio?: string;
  designNotes?: string;
  primaryRole?: string;
  promptPositive?: string;
  promptNegative?: string;
  tags?: string[];
}

export interface UpdateCharacterInput {
  name?: string;
  shortBio?: string;
  designNotes?: string;
  primaryRole?: string;
  promptPositive?: string;
  promptNegative?: string;
  tags?: string[];
  sortOrder?: number;
}

export interface GenerateStoryInput {
  projectId: string;
  provider: LLMProvider;
  description: string;
  genre?: string;
  themes?: string[];
  numScenes?: number;
}

export interface GenerateScenesInput {
  projectId: string;
  provider: LLMProvider;
  storyline: string;
  count: number;
  startNumber?: number;
}

export interface GenerateImageInput {
  sceneId: string;
  keyframeId?: string;
  workflowId: string;
  params: GenerationParams;
}

export interface GenerateVideoInput {
  sceneId: string;
  provider: string;
  imageUrl: string;
  prompt: string;
  duration?: number;
}

export interface LLMChatInput {
  provider: LLMProvider;
  messages: { role: "user" | "assistant" | "system"; content: string }[];
  projectContext?: string;
  stream?: boolean;
}

// ==================== Settings Types ====================

export interface InferenceSettings {
  temperature: number;
  maxTokens: number;
  topP: number;
  defaultProvider: LLMProvider;
  defaultModel: string;
}

export interface AppConfig {
  comfyuiBaseUrl: string;
  outputDir: string;
  defaultVideoProvider: string;
}
