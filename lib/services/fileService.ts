import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "./uploads";

/**
 * Local-disk storage for dev. Vercel's filesystem is read-only/ephemeral at runtime,
 * so this cannot survive to production — swap the body of this function for a
 * Vercel Blob / Azure Blob upload in Phase 7. Callers only depend on the signature.
 */
export async function storeResume(file: File): Promise<string> {
  await mkdir(UPLOAD_DIR, { recursive: true });

  const ext = path.extname(file.name) || ".pdf";
  const filename = `${randomUUID()}${ext}`;
  const filePath = path.join(/* turbopackIgnore: true */ UPLOAD_DIR, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return filePath;
}
