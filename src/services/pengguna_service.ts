import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import { createTransactionService } from "./payment_service";
import { generateSertifikat } from "../utils/generate_sertifikat";
import { createActivity } from "../utils/activity";

// GET PROFILE
export const getProfileService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, name: true, email: true, photo: true, role: true, createdAt: true,
    },
  });

  if (!user) throw new Error("User tidak ditemukan");

  return { success: true, user };
};

// UPDATE PROFILE
export const updateProfileService = async (userId: string, data: any, file: any) => {
  const { name, email, password } = data;
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) throw new Error("User tidak ditemukan");

  if (email && email !== user.email) {
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) throw new Error("Email sudah digunakan");
  }

  let hashedPassword = user.password;
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  let photo = user.photo;
  if (file) {
    photo = file.path; // Langsung mengambil URL Path Cloudinary
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: name || user.name,
      email: email || user.email,
      password: hashedPassword,
      photo,
    },
    select: { id: true, name: true, email: true, photo: true, role: true },
  });

  await createActivity(userId, "Update Profil", "Memperbarui data profil akun");

  return { success: true, message: "Profil berhasil diperbarui", user: updatedUser };
};

// GET VIDEO TUTORIAL
export const getTutorialVideosService = async () => {
  const videos = await prisma.tutorialVideo.findMany({
    orderBy: { createdAt: "desc" },
  });
  return { success: true, videos };
};

//LOG VIDEO
export const createAktivitasVideoService = async (userId: string, videoId: string) => {
    const video = await prisma.tutorialVideo.findUnique({ where: { id: videoId } });
    if (!video) throw new Error("Video tidak ditemukan");
    await createActivity(userId, "Menonton Video", `Menonton video ${video.title}`);
    return { success: true };
};

// GET DAFTAR PENGRAJIN
export const getPengrajinService = async () => {
  const pengrajin = await prisma.user.findMany({
    where: { role: "pengrajin" },
    include: { pengrajinProfile: true, pengrajinReviews: true },
  });

  const result = pengrajin.map((item) => {
    const totalRating = item.pengrajinReviews.reduce((sum, review) => sum + review.rating, 0);
    const rating = item.pengrajinReviews.length > 0 ? totalRating / item.pengrajinReviews.length : 0;

    return {
      id: item.id,
      name: item.name,
      photo: item.photo || null, // Menghilangkan "/uploads/"
      pengalaman: item.pengrajinProfile?.pengalaman ?? "-",
      deskripsi: item.pengrajinProfile?.deskripsi ?? "-",
      noTelpon: item.pengrajinProfile?.noTelpon ?? "-",
      alamat: item.pengrajinProfile?.alamat ?? "-",
      rating: rating.toFixed(1),
    };
  });

  return { success: true, pengrajin: result };
};

// CREATE KELAS
export const createKelasService = async (data: any) => {
  const { namaKelas, deskripsi, harga, durasi, lokasi } = data;
  const kelas = await prisma.kelasPelatihan.create({
    data: { namaKelas, deskripsi, harga: Number(harga), durasi, lokasi },
  });
  return { success: true, message: "Kelas berhasil dibuat", kelas };
};

// GET KELAS
export const getKelasService = async (userId: string) => {
  const riwayat = await prisma.pelatihanBooking.findMany({
    where: { userId, statusKelas: "selesai" },
    include: { kelas: true },
  });

  const pernahPemula = riwayat.some((item) => item.kelas?.namaKelas === "Pemula");
  const pernahMenengah = riwayat.some((item) => item.kelas?.namaKelas === "Menengah");
  const kelas = await prisma.kelasPelatihan.findMany();

  const hasil = kelas.map((item) => {
    let unlocked = false;
    if (item.namaKelas == "Pemula") unlocked = true;
    if (item.namaKelas == "Menengah") unlocked = pernahPemula;
    if (item.namaKelas == "Lanjutan") unlocked = pernahMenengah;
    return { ...item, unlocked };
  });

  const urutan: Record<string, number> = { Pemula: 1, Menengah: 2, Lanjutan: 3 };
  hasil.sort((a, b) => urutan[a.namaKelas] - urutan[b.namaKelas]);

  return { success: true, kelas: hasil };
};

// CREATE BOOKING
export const createBookingService = async (data: any) => {
  const { userId, pengrajinId, kelasId, namaLengkap, noTelpon, tanggal, jamPelatihan, metodeBayar } = data;

  const kelas = await prisma.kelasPelatihan.findUnique({ where: { id: kelasId } });
  if (!kelas) throw new Error("Kelas tidak ditemukan");

  const orderId = `BOOKING-${Date.now()}`;
  const jamMulai = jamPelatihan.split(" - ")[0].replace(".", ":");
  const [hari, bulan, tahun] = tanggal.split("-");
  const tanggalFormat = `${tahun}-${bulan.padStart(2, "0")}-${hari.padStart(2, "0")}`;
  const jadwalPelatihan = new Date(`${tanggalFormat}T${jamMulai}:00`);

  if (isNaN(jadwalPelatihan.getTime())) throw new Error("Format tanggal atau jam tidak valid");

  const payment = await createTransactionService(orderId, kelas.harga);

  const booking = await prisma.pelatihanBooking.create({
      data: {
        userId, orderId, pengrajinId, kelasId, namaLengkap, noTelpon, tanggal, jamPelatihan,
        jadwalPelatihan, lokasi: "Balai Desa Dukuhsembung", totalBayar: kelas.harga,
        metodeBayar: metodeBayar ?? "MIDTRANS", statusBayar: "menunggu", statusKelas: "terjadwal", sudahReview: false,
      },
      include: {
        kelas: true,
        pengrajin: { select: { id: true, name: true, photo: true } },
      },
    });

  await createActivity(userId, "Booking Pelatihan", `${kelas.namaKelas} pada ${tanggal} jam ${jamPelatihan}`);

  return { success: true, booking, payment: { token: payment.token, redirect_url: payment.redirect_url } };
};

// GET RIWAYAT BOOKING
export const getRiwayatBookingService = async (userId: string) => {
  const bookings = await prisma.pelatihanBooking.findMany({
    where: { userId },
    include: {
      kelas: true,
      pengrajin: { select: { id: true, name: true, photo: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = bookings.map((item) => ({
    id: item.id,
    orderId: item.orderId,
    namaKelas: item.kelas.namaKelas,
    thumbnail: item.kelas.thumbnail,
    pengrajinId: item.pengrajin.id,
    pengrajinNama: item.pengrajin.name,
    pengrajinPhoto: item.pengrajin.photo || null, // Menghilangkan "/uploads/"
    tanggal: item.tanggal,
    jamPelatihan: item.jamPelatihan,
    lokasi: item.lokasi,
    totalBayar: item.totalBayar,
    metodeBayar: item.metodeBayar,
    statusBayar: item.statusBayar,
    statusKelas: item.statusKelas,
    sudahReview: item.sudahReview,
    createdAt: item.createdAt,
  }));

  return { success: true, bookings: result };
};

// GET JADWAL KELAS
export const getJadwalKelasService = async (userId: string) => {
  await updateStatusOtomatis();

  const jadwal = await prisma.pelatihanBooking.findMany({
    where: { userId },
    include: {
      kelas: true,
      pengrajin: { select: { id: true, name: true, photo: true } },
    },
  });

  const result = jadwal.map((item) => ({
    ...item,
    pengrajin: {
      ...item.pengrajin,
      photo: item.pengrajin?.photo || null, // Menghilangkan "/uploads/"
    },
  }));

  return { success: true, jadwal: result };
};

const updateStatusOtomatis = async () => {
  const sekarang = new Date();
  const bookings = await prisma.pelatihanBooking.findMany({
    where: { statusKelas: { not: "selesai" } },
  });

  for (const booking of bookings) {
    if (sekarang > booking.jadwalPelatihan) {
      await prisma.pelatihanBooking.update({
        where: { id: booking.id },
        data: { statusKelas: "selesai" },
      });
    }
  }
};

// CREATE REVIEW
export const createReviewService = async (userId: string, data: any) => {
  const { bookingId, pengrajinId, rating, ulasan } = data;

  const review = await prisma.review.create({
    data: { userId, pengrajinId, rating: Number(rating), ulasan },
  });

  const booking = await prisma.pelatihanBooking.findUnique({
    where: { id: bookingId },
    include: { user: true, kelas: true },
  });

  if (!booking) throw new Error("Booking tidak ditemukan");

  const sertifikatUrl = await generateSertifikat(booking.user.name, booking.kelas.namaKelas, booking.id);

  await prisma.pelatihanBooking.update({
    where: { id: bookingId },
    data: { sudahReview: true, sertifikatUrl },
  });

  await createActivity(userId, "Memberi Review", `Memberikan rating ${rating} bintang pada kelas ${booking.kelas.namaKelas}`);

  return { success: true, message: "Review berhasil dikirim", review, sertifikatUrl };
};

//GET SERTIFIKAT
export const getSertifikatService = async (userId: string) => {
  const sertifikat = await prisma.pelatihanBooking.findMany({
    where: { userId, sertifikatUrl: { not: null } },
    include: {
      kelas: true,
      pengrajin: { select: { id: true, name: true, photo: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
  return { success: true, sertifikat };
};

//GET PRODUK
export const getProdukUserService = async () => {
    const produk = await prisma.produk.findMany({ orderBy: { createdAt: "desc" } });
    const result = produk.map((item) => ({
      ...item,
      foto: item.foto || null, // Menghilangkan "/uploads/"
    }));
    return { success: true, produk: result };
};

// GET DETAIL PRODUK
export const getDetailProdukUserService = async (id: string) => {
  const produk = await prisma.produk.findUnique({ where: { id } });
  if (!produk) throw new Error("Produk tidak ditemukan");

  await prisma.produk.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });

  return {
    success: true,
    produk: {
      ...produk,
      foto: produk.foto || null, // Menghilangkan "/uploads/"
    },
  };
};

//TAMBAH KERANJANG
export const createKeranjangService = async (userId: string, produkId: string, qty: number) => {
    const produk = await prisma.produk.findUnique({ where: { id: produkId } });
    const check = await prisma.keranjang.findFirst({ where: { userId, produkId } });

    if (check) {
      const result = await prisma.keranjang.update({
          where: { id: check.id },
          data: { qty: check.qty + qty },
      });
      await createActivity(userId, "Tambah Keranjang", `Menambahkan ${produk?.namaProduk ?? "produk"} ke keranjang`);
      return result;
    }

    const result = await prisma.keranjang.create({
        data: { userId, produkId, qty },
    });
    await createActivity(userId, "Tambah Keranjang", `Menambahkan ${produk?.namaProduk ?? "produk"} ke keranjang`);
    return result;
};

//GET KERANJANG
export const getKeranjangService = async (userId: string) => {
    const keranjang = await prisma.keranjang.findMany({
        where: { userId },
        include: { produk: true },
    });

    const result = keranjang.map((item) => ({
        ...item,
        produk: {
          ...item.produk,
          foto: item.produk?.foto || null, // Menghilangkan "/uploads/"
        },
    }));

    return { success: true, keranjang: result };
};

//HAPUS KERANJANG
export const deleteKeranjangService = async (id: string) => {
    const keranjang = await prisma.keranjang.findUnique({ where: { id }, include: { produk: true } });
    if (!keranjang) throw new Error("Keranjang tidak ditemukan");

    await prisma.keranjang.delete({ where: { id } });
    await createActivity(keranjang.userId, "Hapus Keranjang", `Menghapus ${keranjang.produk.namaProduk} dari keranjang`);
    return true;
};

// UPDATE QTY KERANJANG
export const updateKeranjangQtyService = async (id: string, qty: number) => {
    const keranjang = await prisma.keranjang.findUnique({ where: { id }, include: { produk: true } });
    if (!keranjang) throw new Error("Keranjang tidak ditemukan");

    const result = await prisma.keranjang.update({
        where: { id }, data: { qty },
    });
    await createActivity(keranjang.userId, "Update Keranjang", `Mengubah jumlah ${keranjang.produk.namaProduk} menjadi ${qty}`);
    return { success: true, keranjang: result };
};

//CHECKOUT
export const checkoutKeranjangService = async (userId: string, data: any) => {
  const keranjang = await prisma.keranjang.findMany({ where: { userId }, include: { produk: true } });
  if (keranjang.length === 0) throw new Error("Keranjang kosong");

  let subtotal = 0;
  keranjang.forEach((item) => { subtotal += item.qty * item.produk.harga; });

  const dataOngkir = await prisma.ongkir.findFirst({ where: { kabupaten: data.kabupaten, kecamatan: data.kecamatan } });
  if (!dataOngkir) throw new Error("Ongkir tidak ditemukan");

  const totalBayar = subtotal + dataOngkir.ongkir;
  const orderId = `ORDER-${Date.now()}`;
  const payment = await createTransactionService(orderId, totalBayar);

  const pesanan = await prisma.pesanan.create({
    data: {
      userId, orderId, namaPenerima: data.namaPenerima, noTelpon: data.noTelpon, alamat: data.alamat,
      kabupaten: data.kabupaten, kecamatan: data.kecamatan, ongkir: dataOngkir.ongkir, totalBayar,
      metodeBayar: data.metodeBayar, statusBayar: "menunggu", statusPesanan: "diproses",
    },
  });

  for (const item of keranjang) {
    await prisma.detailPesanan.create({
      data: { pesananId: pesanan.id, produkId: item.produkId, qty: item.qty, harga: item.produk.harga, subtotal: item.qty * item.produk.harga },
    });
    await prisma.produk.update({ where: { id: item.produkId }, data: { stok: { decrement: item.qty } } });
  }

  await prisma.keranjang.deleteMany({ where: { userId } });
  await createActivity(userId, "Checkout Produk", `Berhasil checkout pesanan ${orderId} dengan total Rp${totalBayar}`);

  return { success: true, payment: { token: payment.token, redirect_url: payment.redirect_url }, pesanan };
};

//CHECKOUT LANGSUNG
export const checkoutLangsungService = async (userId: string, produkId: string, qty: number, data: any) => {
  const produk = await prisma.produk.findUnique({ where: { id: produkId } });
  if (!produk) throw new Error("Produk tidak ditemukan");
  if (produk.stok < qty) throw new Error("Stok tidak mencukupi");

  const subtotal = qty * produk.harga;
  const dataOngkir = await prisma.ongkir.findFirst({ where: { kabupaten: data.kabupaten, kecamatan: data.kecamatan } });
  if (!dataOngkir) throw new Error("Ongkir tidak ditemukan");

  const totalBayar = subtotal + dataOngkir.ongkir;
  const orderId = `ORDER-${Date.now()}`;
  const payment = await createTransactionService(orderId, totalBayar);

  const pesanan = await prisma.pesanan.create({
    data: {
      userId, orderId, namaPenerima: data.namaPenerima, noTelpon: data.noTelpon, alamat: data.alamat,
      kabupaten: data.kabupaten, kecamatan: data.kecamatan, ongkir: dataOngkir.ongkir, totalBayar,
      metodeBayar: data.metodeBayar, statusBayar: "menunggu", statusPesanan: "diproses",
    },
  });

  await prisma.detailPesanan.create({
    data: { pesananId: pesanan.id, produkId: produk.id, qty, harga: produk.harga, subtotal },
  });

  await prisma.produk.update({ where: { id: produk.id }, data: { stok: { decrement: qty } } });
  await createActivity(userId, "Checkout Produk", `Berhasil checkout pesanan ${orderId} dengan total Rp${totalBayar}`);

  return { success: true, payment: { token: payment.token, redirect_url: payment.redirect_url }, pesanan };
};

export const getKabupatenService = async () => {
  const data = await prisma.ongkir.findMany({ orderBy: { kabupaten: "asc" } });
  const kabupaten = [...new Set(data.map((item) => item.kabupaten))];
  return { success: true, kabupaten };
};

export const getKecamatanService = async (kabupaten: string) => {
  const data = await prisma.ongkir.findMany({ where: { kabupaten }, orderBy: { kecamatan: "asc" } });
  return { success: true, kecamatan: data.map((item) => item.kecamatan) };
};

export const getOngkirService = async (kecamatan: string) => {
  const ongkir = await prisma.ongkir.findFirst({ where: { kecamatan } });
  if (!ongkir) throw new Error("Ongkir tidak ditemukan");
  return { success: true, ongkir };
};

export const getRiwayatPembelianService = async (userId: string) => {
    const pesanan = await prisma.pesanan.findMany({
        where: { userId },
        include: { detailPesanan: { include: { produk: true } } },
        orderBy: { createdAt: "desc" },
    });

    const result = pesanan.map((item) => ({
      ...item,
      detailPesanan: item.detailPesanan.map((detail) => ({
        ...detail,
        produk: {
          ...detail.produk,
          foto: detail.produk?.foto || null, // Menghilangkan "/uploads/"
        },
      })),
    }));

    return { success: true, pesanan: result };
};

export const getNotifikasiService = async (userId: string) => {
    const data = await prisma.notifikasi.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
    return { success: true, data };
};

export const deleteAkunService = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User tidak ditemukan");

  const pesanan = await prisma.pesanan.findMany({ where: { userId }, select: { id: true } });
  const pesananIds = pesanan.map((item) => item.id);

  if (pesananIds.length > 0) {
    await prisma.detailPesanan.deleteMany({ where: { pesananId: { in: pesananIds } } });
  }

  await prisma.pesanan.deleteMany({ where: { userId } });
  await prisma.keranjang.deleteMany({ where: { userId } });
  await prisma.pelatihanBooking.deleteMany({ where: { userId } });
  await prisma.review.deleteMany({ where: { userId } });
  await prisma.review.deleteMany({ where: { pengrajinId: userId } });
  await prisma.notifikasi.deleteMany({ where: { userId } });
  await prisma.aktivitas.deleteMany({ where: { userId } });
  await prisma.pengrajinProfile.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });

  return { success: true, message: "Akun berhasil dihapus" };
};

export const getAktivitasService = async (userId: string) => {
  return await prisma.aktivitas.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
};

export const getTopProdukDicariService = async () => {
  const data = await prisma.analyticsProduct.findMany({ orderBy: { ranking: "asc" }, take: 3 });

  const result = await Promise.all(
    data.map(async (item) => {
      let produk = null;
      if (item.produkId) produk = await prisma.produk.findUnique({ where: { id: item.produkId } });

      return {
        id: item.id, ranking: item.ranking, produkId: item.produkId, namaProduk: item.namaProduk,
        keyword: item.namaProduk, kategori: item.kategori, jumlahDicari: item.jumlahDicari,
        persentase: item.persentase, rataMinatTrends: item.rataMinatTrends, maxMinatTrends: item.maxMinatTrends,
        produk: produk ? { ...produk, foto: produk.foto || null } : null, // Menghilangkan "/uploads/"
      };
    }),
  );

  return { success: true, top3Produk: result };
};

export const getTopViewProdukService = async () => {
  const produk = await prisma.produk.findMany({ orderBy: { viewCount: "desc" }, take: 3 });
  return {
    success: true,
    produk: produk.map((item) => ({
      ...item, foto: item.foto || null, // Menghilangkan "/uploads/"
    })),
  };
};

export const logoutService = async (userId: string) => {
  await createActivity(userId, "Logout", "Keluar dari aplikasi");
  return { success: true, message: "Logout berhasil" };
};