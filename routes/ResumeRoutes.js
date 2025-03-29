import express from 'express';
import multer from 'multer';
import { uploadResume, getResume, downloadResume } from '../controllers/ResumeController.js';
import { verifyToken } from '../middlewares/AuthMiddleware.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept PDF files only
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Routes
router.post('/upload', upload.single('resume'), uploadResume);
router.get('/', getResume);
router.post('/download', downloadResume);

export default router;
