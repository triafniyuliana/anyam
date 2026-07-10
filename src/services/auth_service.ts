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

// LOGIN GOOGLE
export const googleLoginService = async (
  idToken: string,
  role: "pengguna" | "pengrajin" = "pengguna"
) => {
  console.log("=== GOOGLE LOGIN DEBUG ===");
  console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);

  if (!["pengguna", "pengrajin"].includes(role)) {
    throw new Error("Role tidak valid");
  }

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
        role: role, 
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
    `Berhasil masuk menggunakan akun Google sebagai ${user.role}`,
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
  if (!name || !email || !password) {
    throw new Error("Semua field wajib diisi");
  }

  if (!email.includes("@")) {
    throw new Error("Format email tidak valid");
  }

  if (password.length < 6) {
    throw new Error("Password minimal 6 karakter");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  // KALAU EMAIL SUDAH TERDAFTAR DAN SUDAH VERIFIKASI -> TOLAK
  if (existingUser && existingUser.isVerified) {
    throw new Error("Email sudah digunakan");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = generateOTP();
  const otpExpired = new Date(Date.now() + 5 * 60 * 1000);

  let user;

  if (existingUser && !existingUser.isVerified) {
    // EMAIL PERNAH DAFTAR TAPI BELUM VERIFIKASI OTP -> TIMPA DATA LAMA
    user = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name,
        password: hashedPassword,
        otpCode: otp,
        otpExpired,
      },
    });
  } else {
    // BELUM PERNAH DAFTAR SAMA SEKALI
    user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "pengguna",
        otpCode: otp,
        otpExpired,
        isVerified: false,
      },
    });
  }

  // FIRE AND FORGET (Tanpa await)
  transporter.sendMail({
    from: "yuliiaan28@gmail.com",
    to: user.email,
    subject: "Kode OTP Register",
    text: `Kode OTP Register Anda ${otp}`,
  }).catch((err) => {
    console.error("Gagal mengirim email OTP:", err.message);
  });

  await createActivity(
    user.id,
    "Registrasi",
    "Berhasil membuat akun baru dan mengirim OTP",
  );

  return {
    success: true,
    message: "Register berhasil, OTP dikirim ke email",
    email: user.email,
  };
};

// REGISTER ADMIN
export const registerAdminService = async ({ name, email, password }: any) => {
  if (!name || !email || !password) {
    throw new Error("Semua field wajib diisi");
  }

  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    throw new Error("Email sudah digunakan");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

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
  if (!email || !password) {
    throw new Error("Email dan password wajib diisi");
  }

  const admin = await prisma.user.findUnique({
    where: { email },
  });

  if (!admin) {
    throw new Error("Email atau password salah");
  }

  if (admin.role !== "admin") {
    throw new Error("Akses ditolak");
  }

  if (!admin.password) {
    throw new Error("Password tidak tersedia");
  }

  const isMatch = await bcrypt.compare(password, admin.password);

  if (!isMatch) {
    throw new Error("Email atau password salah");
  }

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
  if (!email || !password) {
    throw new Error("Email dan password wajib diisi");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Email atau password salah");
  }

  if (user.role === "admin") {
    throw new Error("Gunakan login admin");
  }

  if (!user.password) {
    throw new Error("Password tidak tersedia");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Email atau password salah");
  }

  // VALIDASI KEBOCORAN LOGIKA OTP
  if (!user.isVerified) {
    throw new Error("Akun belum diverifikasi. Silakan masukkan kode OTP yang telah dikirim ke email Anda.");
  }

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

// VERIFY OTP
export const verifyOtpService = async ({ email, otp }: any) => {
  if (!email || !otp) {
    throw new Error("Email dan OTP wajib diisi");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  if (user.otpCode !== otp) {
    throw new Error("OTP salah");
  }

  if (user.otpExpired && user.otpExpired < new Date()) {
    throw new Error("OTP expired");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      otpCode: null,
      otpExpired: null,
      isVerified: true,
    },
  });

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
  if (!email) {
    throw new Error("Email wajib diisi");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  const otp = generateOTP();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      otpCode: otp,
      otpExpired: new Date(Date.now() + 5 * 60 * 1000),
    },
  });

  // FIRE AND FORGET
  transporter.sendMail({
    from: "yuliiaan28@gmail.com",
    to: user.email,
    subject: "Reset Password OTP",
    text: `Kode OTP Reset Password ${otp}`,
  }).catch((err) => {
    console.error("Gagal mengirim email OTP:", err.message);
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
  if (!email) {
    throw new Error("Email wajib diisi");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  const otp = generateOTP();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      otpCode: otp,
      otpExpired: new Date(Date.now() + 5 * 60 * 1000),
    },
  });

  // FIRE AND FORGET
  transporter.sendMail({
    from: "yuliiaan28@gmail.com",
    to: user.email,
    subject: "Kode OTP Baru",
    text: `Kode OTP Anda ${otp}`,
  }).catch((err) => {
    console.error("Gagal mengirim ulang email OTP:", err.message);
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
export const resetPasswordService = async ({ email, otp, newPassword }: any) => {
  if (!email || !otp || !newPassword) {
    throw new Error("Semua field wajib diisi");
  }

  if (newPassword.length < 6) {
    throw new Error("Password minimal 6 karakter");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  if (user.otpCode !== otp) {
    throw new Error("OTP salah");
  }

  if (user.otpExpired && user.otpExpired < new Date()) {
    throw new Error("OTP expired");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
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