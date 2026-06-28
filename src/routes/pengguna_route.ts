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
  getSertifikat,
  getProduk,
  getDetailProduk,
  createKeranjang,
  getKeranjang,
  deleteKeranjang,
  updateKeranjangQty,
  checkoutKeranjang,
  getRiwayatPembelian,
  getNotifikasi,
  deleteAkun,
  getAktivitas,
  createAktivitasVideo,
  logout,
} from "../controller/pengguna_controller";

import {
  getKabupaten,
  getKecamatan,
  getOngkir,
} from "../controller/ongkir_controller";

import { authMiddleware } from "../middleware/auth_middleware";

import upload from "../middleware/upload";

const router = express.Router();

// GET PROFILE
router.get("/profile", authMiddleware, getProfile,);

// UPDATE PROFILE
router.put("/profile", authMiddleware, upload.single("photo"), updateProfile,);

// GET VIDEO TUTORIAL
router.get("/tutorial-video", getTutorialVideos);

//LOG VIDEO
router.post("/aktivitas-video",authMiddleware,createAktivitasVideo,);

// GET DAFTAR PENGRAJIN
router.get("/pengrajin", getPengrajin);

// GET KELAS
router.get("/kelas", authMiddleware, getKelas);

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

// GET SERTIFIKAT
router.get("/sertifikat", authMiddleware, getSertifikat,);

// GET PRODUK
router.get("/produk", getProduk);

// GET KABUPATEN
router.get("/kabupaten", getKabupaten);

// GET KECAMATAN
router.get("/kecamatan/:kabupaten", getKecamatan);

// GET ONGKIR
router.get("/ongkir/:kecamatan", getOngkir);

//GET DETAIL
router.get("/produk/:id", getDetailProduk);

// TAMBAH KERANJANG
router.post("/keranjang", authMiddleware, createKeranjang);

// GET KERANJANG
router.get("/keranjang", authMiddleware, getKeranjang);

// HAPUS KERANJANG
router.delete("/keranjang/:id", authMiddleware, deleteKeranjang);

// UPDATE KERANJANG
router.put("/keranjang/:id", authMiddleware, updateKeranjangQty,);

//CHECKOUT
router.post("/checkout", authMiddleware, checkoutKeranjang,);

//RIWAYAT PEMBELIAN
router.get("/riwayat-pembelian",authMiddleware,getRiwayatPembelian,);

//NOTIFIKASI
router.get("/notifikasi",authMiddleware,getNotifikasi,);

//HAPUS AKUN
router.delete("/delete-account",authMiddleware,deleteAkun,);

//LOG AKTIVITAS
router.get("/aktivitas",authMiddleware,getAktivitas,);

router.post("/logout",authMiddleware,logout,);

export default router;
