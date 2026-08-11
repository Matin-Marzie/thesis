import multer from 'multer';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const REEL_UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads', 'reels');
export const MAX_REEL_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100MB

const DEFAULT_EXTENSION_BY_FIELD = {
  video: '.mp4',
  thumbnail: '.jpg',
};

const storage = multer.diskStorage({
  // Reels are grouped under a per-user folder (keyed by the immutable userId) so a user's uploads can be bulk-deleted/inspected
  // without scanning the whole reels directory. multer doesn't create destination dirs itself, so it's made here on demand.
  destination: (req, file, cb) => {
    const userDir = path.join(REEL_UPLOAD_DIR, String(req.user.id));
    fs.mkdir(userDir, { recursive: true }, (err) => cb(err, userDir));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || DEFAULT_EXTENSION_BY_FIELD[file.fieldname] || '';
    cb(null, `${Date.now()}-${crypto.randomUUID()}${ext}`);
  },
});

// 'thumbnail' is optional - when the client doesn't send one, reelController
// generates it server-side from the video's first frame instead.
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'video' && !file.mimetype.startsWith('video/')) {
    return cb(new Error('Only video files are allowed for the video field'));
  }
  if (file.fieldname === 'thumbnail' && !file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed for the thumbnail field'));
  }
  cb(null, true);
};

const multerUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_REEL_FILE_SIZE_BYTES },
});

// Wraps multer's multi-field upload so file-too-large / wrong-mimetype
// errors come back as 400s instead of falling through to the global error
// handler's 500 default. This is the middleware routes should mount.
const uploadReelVideo = (req, res, next) => {
  multerUpload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ])(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    }
    if (err) {
      return res.status(400).json({ message: err.message || 'Invalid video upload' });
    }
    next();
  });
};

export default uploadReelVideo;
