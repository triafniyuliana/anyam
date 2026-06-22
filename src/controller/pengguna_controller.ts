import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

import {
  getProfileService,
  getTutorialVideosService,
  updateProfileService,
  getPengrajinService,
  getKelasService,
  createKelasService,
  createBookingService,
  getRiwayatBookingService,
  getJadwalKelasService,
  createReviewService,
  getSertifikatService,
  getProdukUserService,
  getDetailProdukUserService,
  createKeranjangService,
  getKeranjangService,
  deleteKeranjangService,
  updateKeranjangQtyService,
  checkoutKeranjangService,
  getRiwayatPembelianService,
  getNotifikasiService,
  deleteAkunService,
} from "../services/pengguna_service";

// GET PROFILE
export const getProfile = async (req: any, res: Response) => {
  try {
    const result = await getProfileService(req.user.id);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error(error.message);

    return res.status(400).json({
      success: false,
      message: error.message ? error.message : "Gagal mengambil profile",
    });
  }
};

// UPDATE PROFILE
export const updateProfile = async (req: any, res: Response) => {
  try {
    const result = await updateProfileService(req.user.id, req.body, req.file);

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// GET VIDEO TUTORIAL
export const getTutorialVideos = async (req: Request, res: Response) => {
  try {
    const result = await getTutorialVideosService();

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// GET DAFTAR PENGRAJIN
export const getPengrajin = async (req: Request, res: Response) => {
  try {
    const result = await getPengrajinService();

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(400).json({
      success: false,

      message: error.message,
    });
  }
};

// GET KELAS
export const getKelas = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const result = await getKelasService(userId);

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// CREATE KELAS
export const createKelas = async (req: Request, res: Response) => {
  try {
    const result = await createKelasService(req.body);

    return res.status(201).json(result);
  } catch (error: any) {
    return res.status(400).json({
      success: false,

      message: error.message,
    });
  }
};
// CREATE BOOKING
export const createBooking = async (req: Request, res: Response) => {
  try {
    const result = await createBookingService(req.body);

    return res.status(201).json(result);
  } catch (error: any) {
    return res.status(400).json({
      success: false,

      message: error.message,
    });
  }
};

// GET RIWAYAT BOOKING
export const getRiwayatBooking = async (req: any, res: any) => {
  try {
    const result = await getRiwayatBookingService(req.user.id);

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET JADWAL KELAS
export const getJadwalKelas = async (req: any, res: any) => {
  try {
    const result = await getJadwalKelasService(req.user.id);

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//TAMBAH REVIEW
export const createReview = async (
  req: any,
  res: any,
) => {
  try {
    const result = await createReviewService(
      req.user.id,
      req.body,
    );

    return res.status(201).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//GET SERTIFIKAT
export const getSertifikat = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = (req as any).user.id;

    const result =
      await getSertifikatService(userId);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//GET PRODUK
export const getProduk = async (
  req: Request,
  res: Response
) => {
  try {
    const result =
      await getProdukUserService();

    return res.status(200).json(
      result
    );
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//GET DETAIL PRODUK
export const getDetailProduk = async (
  req: Request,
  res: Response
) => {
  try {
    const id =
      req.params.id as string;

    const result =
      await getDetailProdukUserService(
        id
      );

    return res.status(200).json(
      result
    );
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//TAMBAH KERANJANG
export const createKeranjang = async (
  req: any,
  res: Response
) => {
  try {
    const userId = req.user.id;

    const {
      produkId,
      qty,
    } = req.body;

    const result =
      await createKeranjangService(
        userId,
        produkId,
        Number(qty),
      );

    return res.status(201).json({
      success: true,
      message:
        "Produk berhasil ditambahkan ke keranjang",
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//GET KERANJANG
export const getKeranjang = async (
  req: any,
  res: Response
) => {
  try {
    const userId = req.user.id;

    const result =
      await getKeranjangService(
        userId,
      );

    return res.status(200).json(
      result
    );
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//HAPUS KERANJANG
export const deleteKeranjang = async (
  req: Request,
  res: Response
) => {
  try {
    const id =
      req.params.id as string;

    await deleteKeranjangService(
      id
    );

    return res.status(200).json({
      success: true,
      message:
        "Produk berhasil dihapus dari keranjang",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//UPDATE KERANJANG QTY
export const updateKeranjangQty = async (
  req: any,
  res: Response,
) => {
  try {
    const { id } = req.params;

    const { qty } = req.body;

    const result =
      await updateKeranjangQtyService(
        id,
        Number(qty),
      );

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//CHECKOUT KERANJANG
export const checkoutKeranjang = async (
  req: any,
  res: Response,
) => {
  try {
    const result =
      await checkoutKeranjangService(
        req.user.id,
        req.body,
      );

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//GET RIWAYAT PEMBELIAN
export const getRiwayatPembelian = async (
  req: any,
  res: Response,
) => {
  try {

    const userId = req.user.id;

    const result =
      await getRiwayatPembelianService(
        userId,
      );

    return res.json(result);

  } catch (error: any) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//GET NOTIFIKASI
export const getNotifikasi = async (
  req: any,
  res: Response,
) => {
  try {

    const result =
      await getNotifikasiService(
        req.user.id,
      );

    return res.json(result);

  } catch (error: any) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//HAPUS AKUN
export const deleteAkun = async (
  req: any,
  res: any,
) => {
  try {
    const result =
        await deleteAkunService(
      req.user.id,
    );

    return res.status(200).json(
      result,
    );
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};