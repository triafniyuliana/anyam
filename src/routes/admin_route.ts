import { Router } from "express";

import upload from "../middleware/upload";

import {
  getUsersProfile,
  getPengrajin,
  getDetailPengrajin,
  createPengrajin,
  updatePengrajin,
  deletePengrajin,
  getTutorialVideo,
  getDetailTutorialVideo,
  createTutorialVideo,
  updateTutorialVideo,
  deleteTutorialVideo,
} from "../controller/admin_controller";

const router = Router();

// GET PROFILE USERS
router.get("/users-profile", getUsersProfile);

// GET PENGRAJIN
router.get("/pengrajin", getPengrajin);

// GET DETAIL PENGRAJIN
router.get("/pengrajin/:id", getDetailPengrajin);

// CREATE PENGRAJIN
router.post("/create-pengrajin", upload.single("photo"), createPengrajin);

// UPDATE PENGRAJIN
router.put("/update-pengrajin/:id", upload.single("photo"), updatePengrajin);

// DELETE PENGRAJIN
router.delete("/delete-pengrajin/:id", deletePengrajin);

// GET VIDEO
router.get("/tutorial-video", getTutorialVideo);

// GET DETAIL VIDEO
router.get("/tutorial-video/:id", getDetailTutorialVideo);

// CREATE VIDEO
router.post(
  "/create-tutorial-video",
  upload.single("thumbnail"),
  createTutorialVideo,
);

// UPDATE VIDEO
router.put(
  "/update-tutorial-video/:id",
  upload.single("thumbnail"),
  updateTutorialVideo,
);

// DELETE VIDEO
router.delete("/delete-tutorial-video/:id", deleteTutorialVideo);

export default router;
