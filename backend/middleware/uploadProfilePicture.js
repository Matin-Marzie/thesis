import multer from 'multer';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PROFILE_PICTURE_UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads', 'profile_pictures');
export const MAX_PROFILE_PICTURE_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
  // Grouped under a per-user folder (keyed by the immutable userId), same
  // layout as uploadReelVideo.js, so a user's uploads can be bulk-deleted
  // without scanning the whole profile_pictures directory.
  destination: (req, file, cb) => {
    const userDir = path.join(PROFILE_PICTURE_UPLOAD_DIR, String(req.user.id));
    fs.mkdir(userDir, { recursive: true }, (err) => cb(err, userDir));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${Date.now()}-${crypto.randomUUID()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed for the profile_picture field'));
  }
  cb(null, true);
};

const multerUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_PROFILE_PICTURE_FILE_SIZE_BYTES },
});

// Wraps multer's single-file upload so file-too-large / wrong-mimetype
// errors come back as 400s instead of falling through to the global error
// handler's 500 default. This is the middleware routes should mount.
const uploadProfilePicture = (req, res, next) => {
  multerUpload.single('profile_picture')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    }
    if (err) {
      return res.status(400).json({ message: err.message || 'Invalid profile picture upload' });
    }
    next();
  });
};

export default uploadProfilePicture;
