import nodemailer from "nodemailer";

console.log("--- DEBUG EMAIL ---");
console.log("Status EMAIL_USER :", process.env.EMAIL_USER ? "TERBACA" : "KOSONG/UNDEFINED");
console.log("Status EMAIL_PASS :", process.env.EMAIL_PASS ? "TERBACA" : "KOSONG/UNDEFINED");

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, // UBAH PORT DARI 465 MENJADI 587
  secure: false, // WAJIB FALSE UNTUK PORT 587 (Akan di-upgrade ke TLS secara otomatis)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ ERROR KONEKSI EMAIL:", error.message);
  } else {
    console.log("✅ KONEKSI EMAIL BERHASIL: Server siap mengirim OTP!");
  }
});