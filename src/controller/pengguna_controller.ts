import { Request, Response } from "express";

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
    const result = await getKelasService();

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

