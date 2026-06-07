import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

// GET PROFILE
export const getProfileService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },

    select: {
      id: true,
      name: true,
      email: true,
      photo: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  return {
    success: true,
    user,
  };
};
// UPDATE PROFILE
export const updateProfileService = async (
  userId: string,
  data: any,
  file: any,
) => {
  const { name, email, password } = data;

  // CHECK USER
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  // CHECK EMAIL
  if (email && email !== user.email) {
    const existingEmail = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingEmail) {
      throw new Error("Email sudah digunakan");
    }
  }

  // HASH PASSWORD
  let hashedPassword = user.password;

  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  // PHOTO
  let photo = user.photo;

  if (file) {
    photo = `/uploads/${file.filename}`;
  }

  // UPDATE
  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },

    data: {
      name: name || user.name,

      email: email || user.email,

      password: hashedPassword,

      photo,
    },

    select: {
      id: true,
      name: true,
      email: true,
      photo: true,
      role: true,
    },
  });

  return {
    success: true,
    message: "Profil berhasil diperbarui",

    user: updatedUser,
  };
};

// GET VIDEO TUTORIAL
export const getTutorialVideosService = async () => {
  const videos = await prisma.tutorialVideo.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    success: true,
    videos,
  };
};

// GET DAFTAR PENGRAJIN
export const getPengrajinService = async () => {
  const pengrajin = await prisma.user.findMany({
    where: {
      role: "pengrajin",
    },

    include: {
      pengrajinProfile: true,

      pengrajinReviews: true,
    },
  });

  // FORMAT DATA
  const result = pengrajin.map((item) => {
    // HITUNG RATING
    const totalRating = item.pengrajinReviews.reduce(
      (sum, review) => sum + review.rating,
      0,
    );

    const rating =
      item.pengrajinReviews.length > 0
        ? totalRating / item.pengrajinReviews.length
        : 0;

    return {
      id: item.id,

      name: item.name,

      photo: item.photo,

      pengalaman: item.pengrajinProfile?.pengalaman ?? "-",

      deskripsi: item.pengrajinProfile?.deskripsi ?? "-",

      noTelpon: item.pengrajinProfile?.noTelpon ?? "-",

      alamat: item.pengrajinProfile?.alamat ?? "-",

      rating: rating.toFixed(1),
    };
  });

  return {
    success: true,

    pengrajin: result,
  };
};
