import { Router } from "express";

import { authMiddleware } from "../middleware/auth_middleware";
import upload from "../middleware/upload";

import {
  getDashboardPengrajin,
  getKelasSaya,
  getProfilePengrajin,
  updateProfilePengrajin,
  getNotifikasiPengrajin
} from "../controller/pengrajin_controller";

const router = Router();

//DASHBOARD
router.get("/dashboard", authMiddleware, getDashboardPengrajin,);

//KELAS SAYA
router.get("/kelas-saya", authMiddleware, getKelasSaya,);

//PROFIL
router.get("/profile", authMiddleware, getProfilePengrajin,);

//UPDATE PROFIL
router.put("/profile", authMiddleware, updateProfilePengrajin,);

//NOTIFIKASI
router.get("/notifikasi", authMiddleware, upload.single("photo"), getNotifikasiPengrajin,);

export default router;