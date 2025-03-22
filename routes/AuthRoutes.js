import { Router } from "express";
import multer from "multer";
import { existsSync, mkdirSync } from "fs";
import path from "path";
import {
  checkUser,
  generateToken,
  getAllUsers,
  onBoardUser,
  registerUser,
} from "../controllers/AuthController.js";

// Ensure tmp directories exist
const tmpDir = "/tmp";
const resumesDir = `${tmpDir}/resumes`;

try {
  if (!existsSync(resumesDir)) {
    mkdirSync(resumesDir, { recursive: true });
  }
} catch (error) {
  console.warn("Warning: Could not create tmp directories", error);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, resumesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

const router = Router();

router.post("/check-user", checkUser);
router.post("/onBoardUser", upload.single("resume"), onBoardUser);
router.post("/register", registerUser);
router.get("/get-contacts", getAllUsers);
router.get("/generate-token/:userId", generateToken);

export default router;
