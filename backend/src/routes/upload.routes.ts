import { Router } from "express";
import multer from "multer";
import { uploadFile } from "../controllers/upload.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Memory storage — file.buffer is passed to S3 or written locally.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
});

// POST /api/upload  (auth required, multipart field: "file")
router.post("/", authMiddleware, upload.single("file"), uploadFile);

export default router;
