import { Request, Response } from "express";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

/**
 * POST /api/upload — accepts a single audio/video file (multipart
 * field name: "file") and returns a URL.
 *
 * Production: uploads to AWS S3 (AWS_S3_BUCKET + credentials).
 * Local dev without S3 configured: saves under backend/uploads/
 * (git-ignored) and returns a /uploads/... URL served statically.
 * Either way the response shape is { url, key, filename }.
 */

const MAX_BYTES = 100 * 1024 * 1024; // 100 MB (speaking/DET recordings)
const ALLOWED_PREFIXES = ["audio/", "video/"];

function isAllowedMime(mimetype: string): boolean {
  return ALLOWED_PREFIXES.some((p) => mimetype.startsWith(p));
}

function getS3Client(): S3Client | null {
  const bucket = process.env.AWS_S3_BUCKET;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!bucket || !accessKeyId || !secretAccessKey || accessKeyId === "xxx") {
    return null; // not configured → local fallback
  }
  return new S3Client({
    region: process.env.AWS_REGION ?? "us-east-1",
    credentials: { accessKeyId, secretAccessKey },
  });
}

export async function uploadFile(req: Request, res: Response): Promise<void> {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: 'No file provided. Send multipart form field "file".' });
    return;
  }
  if (!isAllowedMime(file.mimetype)) {
    res.status(400).json({ error: `Unsupported file type: ${file.mimetype}. Audio/video only.` });
    return;
  }
  if (file.size > MAX_BYTES) {
    res.status(400).json({ error: "File too large (max 100 MB)." });
    return;
  }

  const ext = path.extname(file.originalname) || ".bin";
  const key = `${randomUUID()}${ext}`;
  const bucket = process.env.AWS_S3_BUCKET;
  const s3 = getS3Client();

  if (s3 && bucket) {
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );
    const region = process.env.AWS_REGION ?? "us-east-1";
    res.status(201).json({
      url: `https://${bucket}.s3.${region}.amazonaws.com/${key}`,
      key,
      filename: file.originalname,
    });
    return;
  }

  // Local fallback (dev only).
  const uploadsDir = path.resolve(process.cwd(), "uploads");
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, key), file.buffer);
  res.status(201).json({
    url: `/uploads/${key}`,
    key,
    filename: file.originalname,
    storage: "local-fallback (set AWS_S3_BUCKET + credentials for S3)",
  });
}
