import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import { createTransactionService } from "./payment_service";
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

// CREATE KELAS
export const createKelasService = async (data: any) => {
  const { namaKelas, deskripsi, harga, durasi, lokasi } = data;

  const kelas = await prisma.kelasPelatihan.create({
    data: {
      namaKelas,

      deskripsi,

      harga: Number(harga),

      durasi,

      lokasi,
    },
  });

  return {
    success: true,

    message: "Kelas berhasil dibuat",

    kelas,
  };
};

// GET KELAS
export const getKelasService = async () => {
  const kelas = await prisma.kelasPelatihan.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    success: true,

    kelas,
  };
};

// CREATE BOOKING
export const createBookingService = async (data: any) => {
  const {
    userId,
    pengrajinId,
    kelasId,
    namaLengkap,
    noTelpon,
    tanggal,
    jamPelatihan,
    metodeBayar,
  } = data;

  // CEK KELAS
  const kelas = await prisma.kelasPelatihan.findUnique({
    where: {
      id: kelasId,
    },
  });

  if (!kelas) {
    throw new Error("Kelas tidak ditemukan");
  }

  const orderId = `BOOKING-${Date.now()}`;

  const jamMulai = jamPelatihan.split(" - ")[0].replace(".", ":");

  const [hari, bulan, tahun] = tanggal.split("-");

  const tanggalFormat = `${tahun}-${bulan.padStart(2, "0")}-${hari.padStart(2, "0")}`;

  const jadwalPelatihan = new Date(
    `${tanggalFormat}T${jamMulai}:00`
  );

  console.log("TANGGAL:", tanggal);
  console.log("JAM:", jamPelatihan);
  console.log("JADWAL:", jadwalPelatihan);

  // VALIDASI DATETIME
  if (isNaN(jadwalPelatihan.getTime())) {
    throw new Error("Format tanggal atau jam tidak valid");
  }

  // CREATE PAYMENT
  const payment = await createTransactionService(
    orderId,
    kelas.harga,
    metodeBayar,
  );

  // SIMPAN BOOKING
  const booking = await prisma.pelatihanBooking.create({
    data: {
      userId,

      orderId,

      pengrajinId,

      kelasId,

      namaLengkap,

      noTelpon,

      tanggal,

      jamPelatihan,

      jadwalPelatihan,

      lokasi: "Balai Desa Dukuhsembung",

      totalBayar: kelas.harga,

      metodeBayar,

      statusBayar: "menunggu",

      statusKelas: "terjadwal",

      sudahReview: false,
    },

    include: {
      kelas: true,

      pengrajin: {
        select: {
          id: true,
          name: true,
          photo: true,
        },
      },
    },
  });

  return {
    success: true,

    booking,

    payment: {
      token: payment.token,

      redirect_url: payment.redirect_url,

      metodeBayar: payment.metodeBayar,
    },
  };
};

// GET RIWAYAT BOOKING
export const getRiwayatBookingService = async (userId: string) => {
  const bookings = await prisma.pelatihanBooking.findMany({
    where: {
      userId,
    },

    include: {
      kelas: true,
      pengrajin: {
        select: {
          id: true,
          name: true,
          photo: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  const result = bookings.map((item) => ({
    id: item.id,
    orderId: item.orderId,
    namaKelas: item.kelas.namaKelas,
    thumbnail: item.kelas.thumbnail,
    pengrajin: item.pengrajin.name,
    tanggal: item.tanggal,
    jamPelatihan: item.jamPelatihan,
    lokasi: item.lokasi,
    totalBayar: item.totalBayar,
    metodeBayar: item.metodeBayar,
    statusBayar: item.statusBayar,
    createdAt: item.createdAt,
  }));

  console.log("RIWAYAT BOOKING:");
  console.log(JSON.stringify(result, null, 2));
  return {
    success: true,
    bookings: result,
  };
};

// GET JADWAL KELAS
export const getJadwalKelasService = async (userId: string) => {
  await updateStatusOtomatis();

  const jadwal = await prisma.pelatihanBooking.findMany({
    where: {
      userId,
    },

    include: {
      kelas: true,
      pengrajin: {
        select: {
          id: true,
          name: true,
          photo: true,
        },
      },
    },
  });

  return {
    success: true,
    jadwal,
  };
};

// UPDATE STATUS KELAS OTOMATIS
const updateStatusOtomatis = async () => {
  const sekarang = new Date();

  const bookings = await prisma.pelatihanBooking.findMany({
    where: {
      statusKelas: {
        not: "selesai",
      },
    },
  });

  for (const booking of bookings) {
    if (sekarang > booking.jadwalPelatihan) {
      await prisma.pelatihanBooking.update({
        where: {
          id: booking.id,
        },
        data: {
          statusKelas: "selesai",
        },
      });
    }
  }
};


// CREATE REVIEW
export const createReviewService = async (userId: string, data: any) => {
  const { bookingId, pengrajinId, rating, ulasan } = data;

  const review = await prisma.review.create({
    data: {
      userId,
      pengrajinId,
      rating: Number(rating),
      ulasan,
    },
  });

  await prisma.pelatihanBooking.update({
    where: {
      id: bookingId,
    },
    data: {
      sudahReview: true,
    },
  });

  return {
    success: true,
    message: "Review berhasil dikirim",
    review,
  };
};
