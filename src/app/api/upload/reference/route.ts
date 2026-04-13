import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const ext = path.extname(file.name) || ".png";
  const filename = `${uuidv4()}${ext}`;
  const outputDir = path.resolve(process.cwd(), "outputs", "images");

  await mkdir(outputDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = path.join(outputDir, filename);
  await writeFile(filePath, buffer);

  return NextResponse.json({
    url: `/api/outputs/images/${filename}`,
    filename,
    size: buffer.length,
  });
}
