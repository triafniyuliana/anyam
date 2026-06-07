import { Request, Response } from "express";

import {
  getProfileService,
  getTutorialVideosService,
  updateProfileService,
  getPengrajinService,
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
export const getPengrajin =
  async (
    req: Request,
    res: Response,
  ) => {

    try {

      const result =
        await getPengrajinService();

      return res.status(200).json(
        result,
      );

    } catch (error: any) {

      return res.status(400).json({

        success: false,

        message:
          error.message,
      });
    }
  };
