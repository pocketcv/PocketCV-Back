import { Router } from "express";
import {
  addMessage,
  getMessages,
  addImageMessage,
  addAudioMessage,
  getInitialContactsWithMessages,
  // markMessageAsRead,
} from "../controllers/MessageController.js";
import multer from "multer";
import { existsSync, mkdirSync } from "fs";

// Ensure tmp directories exist
// const tmpDir = "/tmp";
// const recordingsDir = `${tmpDir}/recordings`;
// const imagesDir = `${tmpDir}/images`;

// try {
//   if (!existsSync(recordingsDir)) {
//     mkdirSync(recordingsDir, { recursive: true });
//   }
//   if (!existsSync(imagesDir)) {
//     mkdirSync(imagesDir, { recursive: true });
//   }
// } catch (error) {
//   console.warn("Warning: Could not create tmp directories", error);
// }

// const upload = multer({ dest: recordingsDir });
// const uploadImage = multer({ dest: imagesDir });

const router = Router();

router.post("/add-message", addMessage);
router.get("/get-messages/:from/:to", getMessages);
router.post("/add-image-message", addImageMessage);
router.post("/add-audio-message", addAudioMessage);
router.get("/get-initial-contacts/:from", getInitialContactsWithMessages);
// router.post("/mark-message-as-read", markMessageAsRead);

export default router;
