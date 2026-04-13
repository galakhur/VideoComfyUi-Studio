export type ComfyInputKind = "text" | "textarea" | "number" | "image" | "image_url" | "audio";
export type ComfyOutputKind = "image" | "video" | "other";

export interface ComfyInput {
  nodeId: string;
  title: string;
  kind: ComfyInputKind;
  classType: string;
  defaultValue?: string | number;
  fieldName: string;
}

export interface ComfyOutput {
  nodeId: string;
  title: string;
  kind: ComfyOutputKind;
  classType: string;
}

export interface ComfyParseResult {
  inputs: ComfyInput[];
  outputs: ComfyOutput[];
  nodeCount: number;
  isValid: boolean;
  errors: string[];
}

const INPUT_CLASS_MAP: Record<string, ComfyInputKind> = {
  CLIPTextEncode: "text",
  PrimitiveText: "text",
  "String Literal": "text",
  StringInput: "text",
  TextMultiline: "textarea",
  LoadImage: "image",
  LoadImageFromUrl: "image_url",
  ImageInput: "image",
  LoadAudio: "audio",
  PrimitiveNumber: "number",
  IntInput: "number",
  FloatInput: "number",
  "Int Literal": "number",
  "Float Literal": "number",
  KSampler: "number",
};

const OUTPUT_CLASS_MAP: Record<string, ComfyOutputKind> = {
  SaveImage: "image",
  PreviewImage: "image",
  ImageOutput: "image",
  SaveVideo: "video",
  VHS_VideoCombine: "video",
  VideoOutput: "video",
  SaveAnimatedWEBP: "video",
};

function getInputKind(classType: string): ComfyInputKind {
  return INPUT_CLASS_MAP[classType] || "text";
}

function getOutputKind(classType: string): ComfyOutputKind {
  return OUTPUT_CLASS_MAP[classType] || "other";
}

function extractDefaultValue(
  inputs: Record<string, unknown>,
  kind: ComfyInputKind
): { value?: string | number; fieldName: string } {
  if (kind === "text" || kind === "textarea") {
    if (typeof inputs.text === "string") return { value: inputs.text, fieldName: "text" };
    if (typeof inputs.value === "string") return { value: inputs.value, fieldName: "value" };
    if (typeof inputs.string === "string") return { value: inputs.string, fieldName: "string" };
    return { fieldName: "text" };
  }
  if (kind === "number") {
    for (const key of ["seed", "value", "number", "int", "float", "steps", "cfg", "denoise"]) {
      if (typeof inputs[key] === "number") return { value: inputs[key] as number, fieldName: key };
    }
    return { fieldName: "value" };
  }
  if (kind === "image" || kind === "image_url") {
    if (typeof inputs.image === "string") return { value: inputs.image, fieldName: "image" };
    if (typeof inputs.url === "string") return { value: inputs.url, fieldName: "url" };
    return { fieldName: "image" };
  }
  return { fieldName: "value" };
}

export function parseComfyWorkflow(workflowJson: Record<string, unknown>): ComfyParseResult {
  const inputs: ComfyInput[] = [];
  const outputs: ComfyOutput[] = [];
  const errors: string[] = [];
  let nodeCount = 0;

  for (const [nodeId, nodeData] of Object.entries(workflowJson)) {
    if (!nodeData || typeof nodeData !== "object") continue;
    const node = nodeData as Record<string, unknown>;
    const classType = node.class_type as string;
    if (!classType) continue;

    nodeCount++;

    const meta = node._meta as Record<string, unknown> | undefined;
    const title = (meta?.title as string) || classType;

    // Detect Input nodes
    if (title.includes("(Input)")) {
      const kind = getInputKind(classType);
      const nodeInputs = (node.inputs || {}) as Record<string, unknown>;
      const { value, fieldName } = extractDefaultValue(nodeInputs, kind);

      inputs.push({
        nodeId,
        title: title.replace("(Input)", "").trim(),
        kind,
        classType,
        defaultValue: value,
        fieldName,
      });
    }

    // Detect Output nodes
    if (title.includes("(Output)")) {
      const kind = getOutputKind(classType);
      outputs.push({
        nodeId,
        title: title.replace("(Output)", "").trim(),
        kind,
        classType,
      });
    }
  }

  // Auto-detect outputs even without (Output) marker
  if (outputs.length === 0) {
    for (const [nodeId, nodeData] of Object.entries(workflowJson)) {
      if (!nodeData || typeof nodeData !== "object") continue;
      const node = nodeData as Record<string, unknown>;
      const classType = node.class_type as string;
      if (OUTPUT_CLASS_MAP[classType]) {
        const meta = node._meta as Record<string, unknown> | undefined;
        outputs.push({
          nodeId,
          title: (meta?.title as string) || classType,
          kind: getOutputKind(classType),
          classType,
        });
      }
    }
  }

  if (nodeCount === 0) errors.push("No nodes found in workflow");
  if (outputs.length === 0) errors.push("No output nodes detected");

  return {
    inputs,
    outputs,
    nodeCount,
    isValid: nodeCount > 0 && outputs.length > 0 && errors.length === 0,
    errors,
  };
}
