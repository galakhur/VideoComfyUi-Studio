export interface PluginDefinition {
  name: string;
  version: string;
  description?: string;
  author?: string;
  hooks?: PluginHookDef[];
  endpoints?: PluginEndpointDef[];
  uiExtensions?: PluginUiDef[];
}

export interface PluginHookDef {
  event: PluginEvent;
  handler: (context: HookContext) => Promise<void>;
  priority?: number;
}

export interface PluginEndpointDef {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  handler: (req: EndpointRequest) => Promise<EndpointResponse>;
}

export interface PluginUiDef {
  slot: "scene_card_extra" | "toolbar" | "settings_tab";
  component: string;
}

export type PluginEvent =
  | "pre_generate_story"
  | "post_generate_story"
  | "pre_generate_image"
  | "post_generate_image"
  | "pre_generate_video"
  | "post_generate_video"
  | "scene_created"
  | "scene_updated"
  | "scene_deleted"
  | "project_created"
  | "project_updated";

export interface HookContext {
  event: PluginEvent;
  data: Record<string, unknown>;
  projectId?: string;
  sceneId?: string;
}

export interface EndpointRequest {
  method: string;
  path: string;
  body: unknown;
  query: Record<string, string>;
}

export interface EndpointResponse {
  status: number;
  body: unknown;
}
