import nodemailer from "nodemailer";

// 1. Cek apakah Render berhasil membaca variabel .env
console.log("--- DEBUG EMAIL ---");
console.log("Status EMAIL_USER :", process.env.EMAIL_USER ? "TERBACA" : "KOSONG/UNDEFINED");
console.log("Status EMAIL_PASS :", process.env.EMAIL_PASS ? "TERBACA" : "KOSONG/UNDEFINED");

// 2. Konfigurasi Transporter dengan pengamanan khusus Cloud
export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    // Agar server cloud (Render) tidak diblokir saat pengecekan sertifikat SSL
    rejectUnauthorized: false,
  }
});

// 3. Test Koneksi Langsung Saat Server Dinyalakan (Bukan saat user daftar)
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ ERROR KONEKSI EMAIL:");
    console.error(error.message);
  } else {
    console.log("✅ KONEKSI EMAIL BERHASIL: Server siap mengirim OTP!");
  }
});