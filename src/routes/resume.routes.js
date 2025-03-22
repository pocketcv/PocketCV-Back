import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Ensure tmp directory exists
const tmpDir = "/tmp";
const resumesDir = `${tmpDir}/resumes`;

try {
  if (!fs.existsSync(resumesDir)) {
    fs.mkdirSync(resumesDir, { recursive: true });
  }
} catch (error) {
  console.warn("Warning: Could not create tmp directories", error);
}

// Configure multer for PDF storage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, resumesDir);
//   },
//   filename: (req, file, cb) => {
//     // Generate unique filename with timestamp
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   }
// });

// // File filter for PDFs only
// const fileFilter = (req, file, cb) => {
//   if (file.mimetype === 'application/pdf') {
//     cb(null, true);
//   } else {
//     cb(new Error('Only PDF files are allowed'), false);
//   }
// };

// const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
// });

// Upload resume
router.post('/upload', (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    return res.json({
      success: true,
      filename: req.file.filename
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error uploading file' });
  }
});

// Get list of all resumes
router.get('/list', (req, res) => {
  try {
    if (!fs.existsSync(resumesDir)) {
      return res.json({ files: [] });
    }
    
    const files = fs.readdirSync(resumesDir)
      .filter(file => path.extname(file).toLowerCase() === '.pdf')
      .map(file => ({
        name: file,
        path: path.join(resumesDir, file)
      }));
    
    return res.json({ files });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error listing files' });
  }
});

// Download/read specific resume
router.get('/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(resumesDir, filename);

  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.download(filePath);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error downloading file' });
  }
});

// Delete resume
router.delete('/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(resumesDir, filename);

  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    fs.unlinkSync(filePath);
    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error deleting file' });
  }
});

export default router;
