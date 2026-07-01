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
  getProduk,
  getDetailProduk,
  createProduk,
  updateProduk,
  deleteProduk,
  getPesananAdmin,
  kirimPesanan,
  getDashboardSummary,
  getBigdataSummary,
  updateStatusPesanan,
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
  upload.fields([
    {
      name: "thumbnail",
      maxCount: 1,
    },
    {
      name: "video",
      maxCount: 1,
    },
  ]),
  createTutorialVideo,
);

// UPDATE VIDEO
router.put(
  "/update-tutorial-video/:id",
  upload.single("video"),
  updateTutorialVideo,
);

// DELETE VIDEO
router.delete("/delete-tutorial-video/:id", deleteTutorialVideo);

// GET PRODUK
router.get("/produk", getProduk,);

// GET DETAIL PRODUK
router.get("/produk/:id", getDetailProduk,);

// CREATE PRODUK
router.post("/create-produk", upload.single("foto"), createProduk,);

// UPDATE PRODUK
router.put("/update-produk/:id", upload.single("foto"), updateProduk,);

// DELETE PRODUK
router.delete("/delete-produk/:id", deleteProduk,);

//PESANAN
router.get("/pesanan", getPesananAdmin,);

//kIRIM PESANAN
router.put("/pesanan/:pesananId/kirim", kirimPesanan,);

//UPDATE STATUS PESANAN
router.put("/pesanan/:pesananId/status", updateStatusPesanan);

//DASHBOARD
router.get("/dashboard/summary", getDashboardSummary);
router.get("/dashboard/bigdata", getBigdataSummary);

export default router;
