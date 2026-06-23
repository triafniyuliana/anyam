import bcrypt from "bcryptjs";

import { prisma } from "../lib/prisma";

import { generateToken } from "../utils/jwt";

import { generateOTP } from "../utils/otp";

import { transporter } from "../utils/mail";

import { OAuth2Client } from "google-auth-library";

import { createActivity } from "../utils/activity";

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

//LOGIN GOOGLE
export const googleLoginService = async (idToken: string) => {
  console.log("=== GOOGLE LOGIN DEBUG ===");
  console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload?.email) {
    throw new Error("Email Google tidak ditemukan");
  }

  let user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: payload.name || "User Google",
        email: payload.email,
        googleId: payload.sub,
        authProvider: "google",
        role: "pengguna",
      },
    });
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  await createActivity(
    user.id,
    "Login Google",
    "Berhasil masuk menggunakan akun Google",
  );

  return {
    success: true,
    message: "Login Google berhasil",
    token,

    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

// REGISTER
export const registerService = async ({ name, email, password }: any) => {
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
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new Error("Email sudah digunakan");
  }

  // HASH PASSWORD
  const hashedPassword = await bcrypt.hash(password, 10);

  // CREATE USER
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "pengguna",
    },
  });

  await createActivity(
    user.id,
    "Registrasi",
    "Berhasil membuat akun baru",
  );

  return {
    success: true,
    message: "Register berhasil",

    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

// REGISTER ADMIN
export const registerAdminService = async ({ name, email, password }: any) => {
  // VALIDASI
  if (!name || !email || !password) {
    throw new Error("Semua field wajib diisi");
  }

  // CHECK EMAIL
  const existingAdmin = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingAdmin) {
    throw new Error("Email sudah digunakan");
  }

  // HASH PASSWORD
  const hashedPassword = await bcrypt.hash(password, 10);

  // CREATE ADMIN
  const admin = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "admin",
    },
  });

  return {
    success: true,
    message: "Register admin berhasil",

    user: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  };
};

// LOGIN ADMIN
export const loginAdminService = async ({ email, password }: any) => {
  // VALIDASI
  if (!email || !password) {
    throw new Error("Email dan password wajib diisi");
  }

  // CHECK ADMIN
  const admin = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!admin) {
    throw new Error("Email atau password salah");
  }

  // VALIDASI ROLE
  if (admin.role !== "admin") {
    throw new Error("Akses ditolak");
  }

  // CHECK PASSWORD NULL
  if (!admin.password) {
    throw new Error("Password tidak tersedia");
  }

  // CHECK PASSWORD
  const isMatch = await bcrypt.compare(password, admin.password);

  if (!isMatch) {
    throw new Error("Email atau password salah");
  }

  // GENERATE TOKEN
  const token = generateToken({
    id: admin.id,
    email: admin.email,
    role: admin.role,
  });

  return {
    success: true,
    message: "Login admin berhasil",
    token,

    user: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  };
};

// LOGIN USER
export const loginService = async ({ email, password }: any) => {
  // VALIDASI
  if (!email || !password) {
    throw new Error("Email dan password wajib diisi");
  }

  // CHECK USER
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error("Email atau password salah");
  }

  // CEGAH ADMIN LOGIN USER
  if (user.role === "admin") {
    throw new Error("Gunakan login admin");
  }

  // CHECK PASSWORD NULL
  if (!user.password) {
    throw new Error("Password tidak tersedia");
  }

  // CHECK PASSWORD
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Email atau password salah");
  }

  // GENERATE OTP
  const otp = generateOTP();

  // SIMPAN OTP
  await prisma.user.update({
    where: {
      id: user.id,
    },

    data: {
      otpCode: otp,

      otpExpired: new Date(Date.now() + 5 * 60 * 1000),
    },
  });

  // KIRIM OTP
  await transporter.sendMail({
    from: process.env.EMAIL_USER,

    to: user.email,

    subject: "Kode OTP Login",

    text: `Kode OTP Anda ${otp}`,
  });

  return {
    success: true,
    message: "OTP berhasil dikirim",
    email: user.email,
  };
};

// VERIFY OTP
export const verifyOtpService = async ({ email, otp }: any) => {
  // VALIDASI
  if (!email || !otp) {
    throw new Error("Email dan OTP wajib diisi");
  }

  // CHECK USER
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  // CHECK OTP
  if (user.otpCode !== otp) {
    throw new Error("OTP salah");
  }

  // CHECK OTP EXPIRED
  if (user.otpExpired && user.otpExpired < new Date()) {
    throw new Error("OTP expired");
  }

  // HAPUS OTP
  await prisma.user.update({
    where: {
      id: user.id,
    },

    data: {
      otpCode: null,
      otpExpired: null,
    },
  });

  // GENERATE TOKEN
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  await createActivity(
    user.id,
    "Login",
    "Berhasil masuk ke aplikasi",
  );

  return {
    success: true,
    message: "Login berhasil",
    token,

    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

// REQUEST RESET PASSWORD
export const requestResetPasswordService = async ({ email }: any) => {
  // VALIDASI
  if (!email) {
    throw new Error("Email wajib diisi");
  }

  // CHECK USER
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  // GENERATE OTP
  const otp = generateOTP();

  // SIMPAN OTP
  await prisma.user.update({
    where: {
      id: user.id,
    },

    data: {
      otpCode: otp,

      otpExpired: new Date(Date.now() + 5 * 60 * 1000),
    },
  });

  // KIRIM OTP
  await transporter.sendMail({
    from: process.env.EMAIL_USER,

    to: user.email,

    subject: "Reset Password OTP",

    text: `Kode OTP Reset Password ${otp}`,
  });

  await createActivity(
    user.id,
    "Lupa Password",
    "Meminta OTP reset password",
  );

  return {
    success: true,
    message: "OTP reset password berhasil dikirim",
  };
};

// RESEND OTP
export const resendOtpService = async ({ email }: any) => {
  // VALIDASI
  if (!email) {
    throw new Error("Email wajib diisi");
  }

  // CHECK USER
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  // GENERATE OTP BARU
  const otp = generateOTP();

  // UPDATE OTP
  await prisma.user.update({
    where: {
      id: user.id,
    },

    data: {
      otpCode: otp,

      otpExpired: new Date(Date.now() + 5 * 60 * 1000),
    },
  });

  // KIRIM OTP
  await transporter.sendMail({
    from: process.env.EMAIL_USER,

    to: user.email,

    subject: "Kode OTP Baru",

    text: `Kode OTP Anda ${otp}`,
  });

  await createActivity(
    user.id,
    "Kirim Ulang OTP",
    "Mengirim ulang kode OTP",
  );

  return {
    success: true,
    message: "OTP berhasil dikirim ulang",
  };
};

// RESET PASSWORD
export const resetPasswordService = async ({
  email,
  otp,
  newPassword,
}: any) => {
  // VALIDASI
  if (!email || !otp || !newPassword) {
    throw new Error("Semua field wajib diisi");
  }

  // VALIDASI PASSWORD
  if (newPassword.length < 6) {
    throw new Error("Password minimal 6 karakter");
  }

  // CHECK USER
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  console.log("OTP INPUT:", otp);

  console.log("OTP DB:", user?.otpCode);

  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  // CHECK OTP
  if (user.otpCode !== otp) {
    throw new Error("OTP salah");
  }

  // CHECK OTP EXPIRED
  if (user.otpExpired && user.otpExpired < new Date()) {
    throw new Error("OTP expired");
  }

  // HASH PASSWORD BARU
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // UPDATE PASSWORD
  await prisma.user.update({
    where: {
      id: user.id,
    },

    data: {
      password: hashedPassword,
      otpCode: null,
      otpExpired: null,
    },
  });

  await createActivity(
    user.id,
    "Reset Password",
    "Berhasil mengubah password akun",
  );

  return {
    success: true,
    message: "Password berhasil diubah",
  };
};
