import { Request, Response } from "express";

import {
  getDashboardPengrajinService,
  getKelasSayaService,
  getProfilePengrajinService,
  updateProfilePengrajinService,
  getNotifikasiPengrajinService
} from "../services/pengrajin_service";

//DASHBOARD
export const getDashboardPengrajin = async (
  req: any,
  res: Response,
) => {
  try {
    const result =
      await getDashboardPengrajinService(
        req.user.id,
      );

    return res.status(200).json(
      result,
    );
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//GET KELAS SAYA
export const getKelasSaya = async (
  req: any,
  res: Response,
) => {
  try {
    const result =
      await getKelasSayaService(
        req.user.id,
      );

    return res.status(200).json(
      result,
    );
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//GET PROFILE PENGRAJIN
export const getProfilePengrajin = async (
  req: any,
  res: Response,
) => {
  try {
    const result =
      await getProfilePengrajinService(
        req.user.id,
      );

    return res.status(200).json(
      result,
    );
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//UPDATE PROFIL PENGRAJIN
export const updateProfilePengrajin = async (
  req: any,
  res: Response,
) => {
  try {
    const result =
      await updateProfilePengrajinService(
        req.user.id,
        req.body,
      );

    return res.status(200).json(
      result,
    );
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//GET NOTIFIKASI
export const getNotifikasiPengrajin =
  async (
    req: any,
    res: Response,
  ) => {
    try {

      const result =
        await getNotifikasiPengrajinService(
          req.user.id,
        );

      return res.json(
        result,
      );

    } catch (error: any) {

      return res.status(500).json({
        success: false,
        message:
          error.message,
      });

    }
  };