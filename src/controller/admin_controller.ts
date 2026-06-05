import { Request, Response } from "express";

import {
  getUsersProfileService,
  getPengrajinService,
  createPengrajinService,
  getDetailPengrajinService,
  updatePengrajinService,
  deletePengrajinService,
  getTutorialVideoService,
  getDetailTutorialVideoService,
  createTutorialVideoService,
  updateTutorialVideoService,
  deleteTutorialVideoService,
} from "../services/admin_service";

// GET PROFILE USERS
export const getUsersProfile = async (req: Request, res: Response) => {
  try {
    const result = await getUsersProfileService();

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil data pengguna",
      data: result,
    });
  } catch (error: any) {
    return res.status(error.status ? error.status : 500).json({
      success: false,
      message: error.message ? error.message : "Gagal mengambil data pengguna",
    });
  }
};

// GET PENGRAJIN
export const getPengrajin = async (req: Request, res: Response) => {
  try {
    const result = await getPengrajinService();

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil data pengrajin",
      data: result,
    });
  } catch (error: any) {
    return res.status(error.status ? error.status : 500).json({
      success: false,
      message: error.message ? error.message : "Gagal mengambil data pengrajin",
    });
  }
};

// CREATE PENGRAJIN
export const createPengrajin = async (req: Request, res: Response) => {
  try {
    const data = {
      name: req.body.name,

      email: req.body.email,

      password: req.body.password,

      phone: req.body.phone,

      address: req.body.address,

      experience: req.body.experience,

      description: req.body.description,

      photo: req.file ? req.file.filename : null,
    };

    const result = await createPengrajinService(data);

    return res.status(201).json({
      success: true,
      message: "Pengrajin berhasil ditambahkan",
      data: result,
    });
  } catch (error: any) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET DETAIL PENGRAJIN
export const getDetailPengrajin = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const result = await getDetailPengrajinService(id);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE PENGRAJIN
export const updatePengrajin = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const data = {
      name: req.body.name,

      email: req.body.email,

      phone: req.body.phone,

      address: req.body.address,

      experience: req.body.experience,

      description: req.body.description,

      photo: req.file ? req.file.filename : undefined,
    };

    const result = await updatePengrajinService(id, data);

    return res.status(200).json({
      success: true,

      message: "Pengrajin berhasil diupdate",

      data: result,
    });
  } catch (error: any) {
    console.log(error);

    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// DELETE PENGRAJIN
export const deletePengrajin = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Id wajib diisi",
      });
    }

    await deletePengrajinService(id);

    return res.status(200).json({
      success: true,
      message: "Pengrajin berhasil dihapus",
    });
  } catch (error: any) {
    return res.status(error.status ? error.status : 500).json({
      success: false,
      message: error.message ? error.message : "Gagal menghapus pengrajin",
    });
  }
};

// GET VIDEO
export const getTutorialVideo =
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const result =
        await getTutorialVideoService();

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

// GET DETAIL VIDEO
export const getDetailTutorialVideo =
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const id =
        req.params.id as string;

      const result =
        await getDetailTutorialVideoService(
          id,
        );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

// CREATE VIDEO
export const createTutorialVideo =
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const data = {
        title:
          req.body.title,

        videoUrl:
          req.body.videoUrl,

        thumbnail:
          req.file
            ? req.file.filename
            : "",
      };

      const result =
        await createTutorialVideoService(
          data,
        );

      return res.status(201).json({
        success: true,
        message:
          "Video berhasil ditambahkan",
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

// UPDATE VIDEO
export const updateTutorialVideo =
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const id =
        req.params.id as string;

      const data = {
        title:
          req.body.title,

        videoUrl:
          req.body.videoUrl,

        thumbnail:
          req.file
            ? req.file.filename
            : undefined,
      };

      const result =
        await updateTutorialVideoService(
          id,
          data,
        );

      return res.status(200).json({
        success: true,
        message:
          "Video berhasil diupdate",
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

// DELETE VIDEO
export const deleteTutorialVideo =
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const id =
        req.params.id as string;

      await deleteTutorialVideoService(
        id,
      );

      return res.status(200).json({
        success: true,
        message:
          "Video berhasil dihapus",
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };
