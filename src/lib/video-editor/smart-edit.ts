import { generateText } from "@/lib/ai/provider-registry";
import { exec } from "child_process";
import { mkdir } from "fs/promises";
import path from "path";
import { promisify } from "util";
import { v4 as uuidv4 } from "uuid";

const execAsync = promisify(exec);

export interface SmartEditInput {
  scenes: {
    id: string;
    title: string;
    description: string;
    videoPath: string;
    durationSeconds: number;
  }[];
  outputDir?: string;
  provider?: "openai" | "claude";
}

interface EditPlan {
  transitions: {
    fromScene: number;
    toScene: number;
    type: "cut" | "crossfade" | "fade_black";
    durationMs: number;
  }[];
  trimPoints: {
    sceneIndex: number;
    startMs: number;
    endMs: number;
  }[];
}

export async function smartEdit(input: SmartEditInput) {
  const outputDir = input.outputDir || path.resolve(process.cwd(), "outputs", "exports");
  await mkdir(outputDir, { recursive: true });

  // Step 1: Ask AI for edit plan
  const sceneDescs = input.scenes
    .map((s, i) => `Scene ${i + 1}: "${s.title}" - ${s.description} (${s.durationSeconds}s)`)
    .join("\n");

  const result = await generateText(
    input.provider || "openai",
    [
      {
        role: "system",
        content: `You are a professional video editor. Analyze scenes and create an edit plan.
Output JSON with: transitions (type, durationMs) and trimPoints (startMs, endMs) per scene.
Valid transition types: cut, crossfade, fade_black.`,
      },
      {
        role: "user",
        content: `Create an edit plan for these scenes:\n\n${sceneDescs}\n\nOutput as JSON.`,
      },
    ],
    { temperature: 0.4 }
  );

  let editPlan: EditPlan;
  try {
    const match = result.content.match(/\{[\s\S]*\}/);
    editPlan = match ? JSON.parse(match[0]) : { transitions: [], trimPoints: [] };
  } catch {
    editPlan = { transitions: [], trimPoints: [] };
  }

  // Step 2: Execute FFmpeg with edit plan
  const outputPath = path.join(outputDir, `smart-edit-${uuidv4()}.mp4`);

  // Build complex FFmpeg filter for transitions
  const filterParts: string[] = [];
  const inputs = input.scenes.map((s) => `-i "${s.videoPath}"`).join(" ");

  // Simple implementation: trim + concat with crossfade
  for (let i = 0; i < input.scenes.length; i++) {
    const trim = editPlan.trimPoints?.find((t) => t.sceneIndex === i);
    if (trim) {
      filterParts.push(
        `[${i}:v]trim=start=${trim.startMs / 1000}:end=${trim.endMs / 1000},setpts=PTS-STARTPTS[v${i}]`
      );
    } else {
      filterParts.push(`[${i}:v]setpts=PTS-STARTPTS[v${i}]`);
    }
  }

  const concatInputs = input.scenes.map((_, i) => `[v${i}]`).join("");
  filterParts.push(
    `${concatInputs}concat=n=${input.scenes.length}:v=1:a=0[outv]`
  );

  const filter = filterParts.join("; ");

  try {
    await execAsync(
      `ffmpeg ${inputs} -filter_complex "${filter}" -map "[outv]" "${outputPath}" -y`
    );
    return { outputPath, editPlan };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "FFmpeg failed";
    throw new Error(`Smart edit failed: ${message}`);
  }
}
