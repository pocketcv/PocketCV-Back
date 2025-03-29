import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
const prisma = new PrismaClient();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadResume = async (req, res) => {
  try {
    console.log('File uploaded:', req.file);
    console.log('Body:', req.body);
    
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('File uploaded:', req.file);

    const file = req.file;
    
    // Create a unique filename
    const timestamp = Date.now();
    const fileName = `resumes/${userId}_${timestamp}_${path.basename(file.originalname)}`;

    // Convert buffer to base64
    const base64File = file.buffer.toString('base64');
    const dataURI = `data:${file.mimetype};base64,${base64File}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'raw',
      public_id: fileName,
      format: 'pdf'
    });

    // Update user's resume URL in the database
    await prisma.user.update({
      where: { id: Number(userId) },
      data: { resume: result.secure_url }
    });

    res.status(200).json({
      message: 'Resume uploaded successfully',
      fileUrl: result.secure_url,
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ 
      error: 'Failed to upload resume',
      message: error.message 
    });
  }
};


export const getResume = async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { resume: true }
    });

    if (!user?.resume) {
      return res.status(404).json({ error: 'No resume found' });
    }

    res.status(200).json({ resumeUrl: user.resume });
  } catch (error) {
    console.error('Error fetching resume:', error);
    res.status(500).json({ error: 'Failed to fetch resume' });
  }
};

export const downloadResume = async (req, res) => {
  try {
    const userId = req.body?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { resume: true }
    });

    if (!user?.resume) {
      return res.status(404).json({ error: 'No resume found' });
    }

    // Fetch the file from Cloudinary and stream it to the response
    const response = await fetch(user.resume);
    const buffer = await response.arrayBuffer();

    // Set appropriate headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=resume.pdf');
    
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Error downloading resume:', error);
    res.status(500).json({ error: 'Failed to download resume' });
  }
};
