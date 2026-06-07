import express from "express";

import {
  getPengrajin,
  getProfile,
  getTutorialVideos,
  updateProfile,
} from "../controller/pengguna_controller";

import { authMiddleware } from "../middleware/auth_middleware";

import upload from "../middleware/upload";

const router = express.Router();

// GET PROFILE
router.get(
  "/profile",

  authMiddleware,

  getProfile,
);

// UPDATE PROFILE
router.put(
  "/profile",

  authMiddleware,

  upload.single("photo"),

  updateProfile,
);

// GET VIDEO TUTORIAL
router.get("/tutorial-video", getTutorialVideos);

// GET DAFTAR PENGRAJIN
router.get("/pengrajin", getPengrajin);

export default router;
