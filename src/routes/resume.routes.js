import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for PDF storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/resumes';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for PDFs only
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'));
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Upload resume
router.post('/upload', upload.single('resume'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.status(200).json({
      message: 'Resume uploaded successfully',
      file: {
        filename: req.file.filename,
        path: req.file.path
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error uploading file' });
  }
});

// Get list of all resumes
router.get('/list', (req, res) => {
  const uploadDir = 'uploads/resumes';
  
  try {
    if (!fs.existsSync(uploadDir)) {
      return res.status(200).json({ resumes: [] });
    }

    const files = fs.readdirSync(uploadDir)
      .filter(file => path.extname(file).toLowerCase() === '.pdf')
      .map(file => ({
        filename: file,
        path: `${uploadDir}/${file}`,
        uploadedAt: fs.statSync(`${uploadDir}/${file}`).mtime
      }));

    res.status(200).json({ resumes: files });
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving resumes' });
  }
});

// Download/read specific resume
router.get('/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join('uploads/resumes', filename);

  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    res.download(filePath);
  } catch (error) {
    res.status(500).json({ error: 'Error downloading resume' });
  }
});

// Delete resume
router.delete('/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join('uploads/resumes', filename);

  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    fs.unlinkSync(filePath);
    res.status(200).json({ message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting resume' });
  }
});

export default router;
