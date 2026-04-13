import { exec } from "child_process";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { promisify } from "util";
import { v4 as uuidv4 } from "uuid";

const execAsync = promisify(exec);

export interface StitchInput {
  videoPaths: string[];
  outputDir?: string;
  outputFilename?: string;
}

export interface StitchResult {
  outputPath: string;
  duration: number;
}

export async function simpleStitch(input: StitchInput): Promise<StitchResult> {
  const outputDir = input.outputDir || path.resolve(process.cwd(), "outputs", "exports");
  await mkdir(outputDir, { recursive: true });

  const outputFilename = input.outputFilename || `stitch-${uuidv4()}.mp4`;
  const outputPath = path.join(outputDir, outputFilename);

  // Create concat list file
  const concatListPath = path.join(outputDir, `concat-${uuidv4()}.txt`);
  const concatContent = input.videoPaths
    .map((p) => `file '${p.replace(/'/g, "'\\''")}'`)
    .join("\n");
  await writeFile(concatListPath, concatContent);

  try {
    await execAsync(
      `ffmpeg -f concat -safe 0 -i "${concatListPath}" -c copy "${outputPath}" -y`
    );

    // Get duration
    const { stdout } = await execAsync(
      `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${outputPath}"`
    );
    const duration = parseFloat(stdout.trim()) || 0;

    return { outputPath, duration };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "FFmpeg failed";
    throw new Error(`Simple stitch failed: ${message}`);
  }
}
