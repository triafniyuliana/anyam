import express from "express";

import {
  getPengrajin,
  getProfile,
  getTutorialVideos,
  updateProfile,
  getKelas,
  createKelas,
  createBooking,
  getRiwayatBooking,
  getJadwalKelas,
  createReview,
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

// GET KELAS
router.get("/kelas", getKelas);

// CREATE KELAS
router.post("/kelas", createKelas);

// CREATE BOOKING
router.post("/booking", createBooking);

// GET RIWAYAT BOOKING
router.get("/riwayat-booking", authMiddleware, getRiwayatBooking);

// GET JADWAL KELAS
router.get("/jadwal-kelas", authMiddleware, getJadwalKelas);

// CREATE REVIEW
router.post("/review", authMiddleware, createReview);

export default router;
