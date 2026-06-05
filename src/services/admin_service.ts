import bcrypt from "bcryptjs";

import { prisma } from "../lib/prisma";

// GET USERS PROFILE
export const getUsersProfileService = async () => {
  const users = await prisma.user.findMany({
    where: {
      role: "pengguna",
    },

    select: {
      id: true,
      photo: true,
      name: true,
      email: true,
      createdAt: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return users;
};

// GET PENGRAJIN
export const getPengrajinService = async () => {
  const pengrajin = await prisma.user.findMany({
    where: {
      role: "pengrajin",
    },

    include: {
      pengrajinProfile: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return pengrajin.map((item) => ({
    id: item.id,

    photo: item.photo,

    name: item.name,

    email: item.email,

    phone: item.pengrajinProfile?.noTelpon || "",

    address: item.pengrajinProfile?.alamat || "",

    experience: item.pengrajinProfile?.pengalaman || "",

    description: item.pengrajinProfile?.deskripsi || "",

    createdAt: item.createdAt,
  }));
};

// CREATE PENGRAJIN
export const createPengrajinService = async (data: any) => {
  const {
    name,
    email,
    password,
    photo,
    phone,
    address,
    experience,
    description,
  } = data;

  // VALIDASI
  if (!name || !email || !password) {
    throw new Error("Semua field wajib diisi");
  }

  // VALIDASI EMAIL
  if (!email.includes("@")) {
    throw new Error("Format email tidak valid");
  }

  // VALIDASI PASSWORD
  if (password.length < 6) {
    throw new Error("Password minimal 6 karakter");
  }

  // CHECK EMAIL
  const checkEmail = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (checkEmail) {
    throw new Error("Email sudah digunakan");
  }

  // HASH PASSWORD
  const hashedPassword = await bcrypt.hash(password, 10);

  // CREATE USER + PROFILE
  const pengrajin = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,

      photo,

      role: "pengrajin",

      pengrajinProfile: {
        create: {
          alamat: address || "",

          noTelpon: phone || "",

          pengalaman: experience || "",

          deskripsi: description || "",
        },
      },
    },

    include: {
      pengrajinProfile: true,
    },
  });

  return {
    id: pengrajin.id,

    photo: pengrajin.photo,

    name: pengrajin.name,

    email: pengrajin.email,

    phone: pengrajin.pengrajinProfile?.noTelpon,

    address: pengrajin.pengrajinProfile?.alamat,

    experience: pengrajin.pengrajinProfile?.pengalaman,

    description: pengrajin.pengrajinProfile?.deskripsi,

    role: pengrajin.role,

    createdAt: pengrajin.createdAt,
  };
};
// GET DETAIL PENGRAJIN
export const getDetailPengrajinService = async (id: string) => {
  const pengrajin = await prisma.user.findUnique({
    where: {
      id,
    },

    include: {
      pengrajinProfile: true,
    },
  });

  if (!pengrajin) {
    throw new Error("Pengrajin tidak ditemukan");
  }

  return {
    id: pengrajin.id,

    photo: pengrajin.photo,

    name: pengrajin.name,

    email: pengrajin.email,

    phone: pengrajin.pengrajinProfile?.noTelpon || "",

    address: pengrajin.pengrajinProfile?.alamat || "",

    experience: pengrajin.pengrajinProfile?.pengalaman || "",

    description: pengrajin.pengrajinProfile?.deskripsi || "",

    createdAt: pengrajin.createdAt,
  };
};

// UPDATE PENGRAJIN
export const updatePengrajinService = async (id: string, data: any) => {
  const { name, email, phone, address, experience, description, photo } = data;

  // CHECK PENGRAJIN
  const checkPengrajin = await prisma.user.findUnique({
    where: {
      id,
    },

    include: {
      pengrajinProfile: true,
    },
  });

  if (!checkPengrajin) {
    throw new Error("Pengrajin tidak ditemukan");
  }

  // CHECK EMAIL
  if (email && email !== checkPengrajin.email) {
    const checkEmail = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (checkEmail) {
      throw new Error("Email sudah digunakan");
    }
  }

  // UPDATE USER
  const pengrajin = await prisma.user.update({
    where: {
      id,
    },

    data: {
      name,

      email,

      ...(photo && {
        photo,
      }),

      pengrajinProfile: {
        update: {
          alamat: address,

          noTelpon: phone,

          pengalaman: experience,

          deskripsi: description,
        },
      },
    },

    include: {
      pengrajinProfile: true,
    },
  });

  return {
    id: pengrajin.id,

    photo: pengrajin.photo,

    name: pengrajin.name,

    email: pengrajin.email,

    phone: pengrajin.pengrajinProfile?.noTelpon,

    address: pengrajin.pengrajinProfile?.alamat,

    experience: pengrajin.pengrajinProfile?.pengalaman,

    description: pengrajin.pengrajinProfile?.deskripsi,

    createdAt: pengrajin.createdAt,
  };
};

// DELETE PENGRAJIN
export const deletePengrajinService = async (id: string) => {
  // CHECK PENGRAJIN
  const checkPengrajin = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!checkPengrajin) {
    throw new Error("Pengrajin tidak ditemukan");
  }

  // DELETE
  const pengrajin = await prisma.user.delete({
    where: {
      id,
    },
  });

  return {
    id: pengrajin.id,
    photo: pengrajin.photo,
    name: pengrajin.name,
    email: pengrajin.email,
    role: pengrajin.role,
    createdAt: pengrajin.createdAt,
  };
};

// GET VIDEO
export const getTutorialVideoService =
  async () => {
    const videos =
      await prisma.tutorialVideo.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

    return videos;
  };

// GET DETAIL VIDEO
export const getDetailTutorialVideoService =
  async (id: string) => {
    const video =
      await prisma.tutorialVideo.findUnique({
        where: {
          id,
        },
      });

    if (!video) {
      throw new Error(
        "Video tidak ditemukan",
      );
    }

    return video;
  };

// CREATE VIDEO
export const createTutorialVideoService =
  async (data: any) => {
    const {
      title,
      videoUrl,
      thumbnail,
    } = data;

    if (
      !title ||
      !videoUrl
    ) {
      throw new Error(
        "Semua field wajib diisi",
      );
    }

    const video =
      await prisma.tutorialVideo.create({
        data: {
          title,
          videoUrl,
          thumbnail,
        },
      });

    return video;
  };

// UPDATE VIDEO
export const updateTutorialVideoService =
  async (
    id: string,
    data: any,
  ) => {
    const {
      title,
      videoUrl,
      thumbnail,
    } = data;

    const checkVideo =
      await prisma.tutorialVideo.findUnique({
        where: {
          id,
        },
      });

    if (!checkVideo) {
      throw new Error(
        "Video tidak ditemukan",
      );
    }

    const video =
      await prisma.tutorialVideo.update({
        where: {
          id,
        },

        data: {
          title,
          videoUrl,

          thumbnail:
            thumbnail ||
            checkVideo.thumbnail,
        },
      });

    return video;
  };

// DELETE VIDEO
export const deleteTutorialVideoService =
  async (id: string) => {
    const checkVideo =
      await prisma.tutorialVideo.findUnique({
        where: {
          id,
        },
      });

    if (!checkVideo) {
      throw new Error(
        "Video tidak ditemukan",
      );
    }

    await prisma.tutorialVideo.delete({
      where: {
        id,
      },
    });

    return true;
  };