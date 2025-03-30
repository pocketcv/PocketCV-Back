import express from 'express';
import multer from 'multer';
import { uploadResume, getResume, downloadResume, getFinalUrl } from '../controllers/ResumeController.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
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
router.get("/get-secured", getFinalUrl)
router.post('/download', downloadResume);

export default router;
