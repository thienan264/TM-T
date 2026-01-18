import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

// Ensure a directory exists (recursive)
function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

// Build a multer storage for a given subfolder under /public/uploads
function buildStorage(subfolder) {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            const uploadRoot = path.resolve(__dirname, '..', '..', 'public', 'uploads');
            const target = path.join(uploadRoot, subfolder);
            ensureDir(target);
            cb(null, target);
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname || '').toLowerCase();
            const base = Date.now() + '-' + Math.random().toString(36).slice(2, 8);
            cb(null, base + ext);
        }
    });
}

function fileFilterImageOnly(req, file, cb) {
    const accept = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (accept.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Only image files are allowed'));
}

// 10 MB limit by default
const DEFAULT_LIMIT = 10 * 1024 * 1024;

export const uploadProductImage = multer({
    storage: buildStorage('products'),
    fileFilter: fileFilterImageOnly,
    limits: { fileSize: DEFAULT_LIMIT },
});

export const uploadUserAvatar = multer({
    storage: buildStorage('users'),
    fileFilter: fileFilterImageOnly,
    limits: { fileSize: DEFAULT_LIMIT },
});

export const uploadBannerImage = multer({
    storage: buildStorage('banners'),
    fileFilter: fileFilterImageOnly,
    limits: { fileSize: DEFAULT_LIMIT },
});

// Helper: get the public URL/path stored in DB (relative to /public)
export function publicPathFor(file, subfolder) {
    if (!file) return null;
    // Store path relative to static root, e.g., "uploads/products/abc.jpg"
    return path.posix.join('uploads', subfolder, file.filename);
}
