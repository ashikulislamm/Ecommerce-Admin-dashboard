import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import crypto from 'crypto';
import { AppError } from '../../shared/errors/app-error.js';
import { MediaType } from '@prisma/client';
import type { ProcessedMediaFile } from './media.types.js';

export const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
export const THUMB_DIR = path.join(UPLOAD_DIR, 'thumbnails');

// Ensure upload directories exist
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
if (!fs.existsSync(THUMB_DIR)) {
  fs.mkdirSync(THUMB_DIR, { recursive: true });
}

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'video/mp4',
];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const memoryStorage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage: memoryStorage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(
        AppError.badRequest(
          `Invalid file type "${file.mimetype}". Allowed types: JPEG, PNG, WEBP, GIF, PDF, MP4`,
        ),
      );
      return;
    }
    cb(null, true);
  },
});

export async function processAndSaveFile(
  file: Express.Multer.File,
): Promise<ProcessedMediaFile> {
  const fileHash = crypto.randomUUID();
  const ext = path.extname(file.originalname).toLowerCase() || '.bin';
  const fileName = `${fileHash}${ext}`;
  const filePath = path.join(UPLOAD_DIR, fileName);

  let mediaType: MediaType = MediaType.DOCUMENT;
  if (file.mimetype.startsWith('image/')) {
    mediaType = MediaType.IMAGE;
  } else if (file.mimetype.startsWith('video/')) {
    mediaType = MediaType.VIDEO;
  }

  let width: number | null = null;
  let height: number | null = null;
  let thumbnailUrl: string | null = null;

  if (mediaType === MediaType.IMAGE) {
    try {
      const imagePipeline = sharp(file.buffer);
      const metadata = await imagePipeline.metadata();
      width = metadata.width || null;
      height = metadata.height || null;

      // Save main image
      await imagePipeline.toFile(filePath);

      // Generate 200x200 thumbnail
      const thumbFileName = `thumb_${fileHash}.webp`;
      const thumbPath = path.join(THUMB_DIR, thumbFileName);

      await sharp(file.buffer)
        .resize(200, 200, { fit: 'cover' })
        .toFormat('webp', { quality: 80 })
        .toFile(thumbPath);

      thumbnailUrl = `/uploads/thumbnails/${thumbFileName}`;
    } catch (err) {
      // Fallback: save buffer directly if Sharp processing fails
      fs.writeFileSync(filePath, file.buffer);
    }
  } else {
    // Write non-image files directly
    fs.writeFileSync(filePath, file.buffer);
  }

  const url = `/uploads/${fileName}`;

  return {
    originalName: file.originalname,
    fileName,
    storageKey: fileName,
    url,
    thumbnailUrl,
    mimeType: file.mimetype,
    fileSize: file.size,
    width,
    height,
    mediaType,
  };
}
