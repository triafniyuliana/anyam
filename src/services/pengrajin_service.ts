import { prisma } from "../lib/prisma";

//DASHBOARD
export const getDashboardPengrajinService =
  async (
    pengrajinId: string,
  ) => {

    const pengrajin =
      await prisma.user.findUnique({
        where: {
          id: pengrajinId,
        },

        include: {
          pengrajinProfile: true,
        },
      });

    const totalPeserta =
      await prisma.pelatihanBooking.count({
        where: {
          pengrajinId,
          statusBayar: "lunas",
        },
      });

    const ratingData =
      await prisma.review.aggregate({
        where: {
          pengrajinId,
        },

        _avg: {
          rating: true,
        },
      });

    const today = new Date();

    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      0,
      0,
      0,
    );

    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
    );

    const jadwalHariIni =
      await prisma.pelatihanBooking.findMany({
        where: {
          pengrajinId,

          statusBayar: "lunas",

          jadwalPelatihan: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },

        include: {
          kelas: true,
          user: true,
        },

        orderBy: {
          jadwalPelatihan: "asc",
        },
      });

    return {
      success: true,

      pengrajin,

      totalPeserta,

      rating:
        ratingData._avg.rating ?? 0,

      jadwalHariIni,
    };
  };


//GET KELAS
export const getKelasSayaService =
  async (
    pengrajinId: string,
  ) => {

    const kelas =
      await prisma.pelatihanBooking.findMany({
        where: {
          pengrajinId,
          statusBayar: "lunas",
        },

        include: {
          user: true,
          kelas: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    return {
      success: true,
      data: kelas,
    };
  };

//GET PROFIL PENGRAJIN
export const getProfilePengrajinService =
  async (
    userId: string,
  ) => {

    const profile =
      await prisma.user.findUnique({
        where: {
          id: userId,
        },

        include: {
          pengrajinProfile: true,
        },
      });

    return {
      success: true,
      data: profile,
    };
  };

//UPDATE PROFIL 
export const updateProfilePengrajinService =
  async (
    userId: string,
    body: any,
    file?: any,
  ) => {

    const {
      name,
      alamat,
      noTelpon,
      pengalaman,
      deskripsi,
    } = body;

    const user =
      await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

    if (!user) {
      throw new Error(
        "User tidak ditemukan",
      );
    }

    let photo = user.photo;

    if (file) {
      photo =
        `/uploads/${file.filename}`;
    }

    await prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        name,
        photo,
      },
    });

    await prisma.pengrajinProfile.update({
      where: {
        userId,
      },

      data: {
        alamat,
        noTelpon,
        pengalaman,
        deskripsi,
      },
    });

    return {
      success: true,
      message:
        "Profil berhasil diperbarui",
    };
  };

//NOTIFIKASI
export const getNotifikasiPengrajinService =
  async (
    userId: string,
  ) => {

    const data =
      await prisma.notifikasi.findMany({
        where: {
          userId,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    return {
      success: true,
      data,
    };
  };

