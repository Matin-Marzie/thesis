import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const REEL_UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads', 'reels');
export const MAX_REEL_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, REEL_UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.mp4';
    cb(null, `${req.user.id}-${Date.now()}-${crypto.randomUUID()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('video/')) {
    return cb(new Error('Only video files are allowed'));
  }
  cb(null, true);
};

const uploadReelVideo = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_REEL_FILE_SIZE_BYTES },
});

export default uploadReelVideo;
