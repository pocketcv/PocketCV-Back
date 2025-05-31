import { Router } from "express";
// import multer from "multer";
import { existsSync, mkdirSync } from "fs";
// import path from "path";
import {
  checkUser,
  generateToken,
  getAllUsers,
  onBoardUser,
  registerUser,
  updateProfile,
  userInformation,
} from "../controllers/AuthController.js";

const router = Router();

router.post("/check-user", checkUser);
router.post("/onBoardUser", onBoardUser);
router.post("/register", registerUser);
router.get("/get-contacts", getAllUsers);
router.get("/generate-token/:userId", generateToken);
router.get("/user-info/:id", userInformation);
router.post("/update-profile", updateProfile);

export default router;
