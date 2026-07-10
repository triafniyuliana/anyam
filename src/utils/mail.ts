import nodemailer from "nodemailer";

console.log("--- DEBUG EMAIL ---");
console.log("Status EMAIL_USER :", process.env.EMAIL_USER ? "TERBACA" : "KOSONG/UNDEFINED");
console.log("Status EMAIL_PASS :", process.env.EMAIL_PASS ? "TERBACA" : "KOSONG/UNDEFINED");

export const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com", // Menggunakan jalur khusus Brevo
  port: 587,
  secure: false, // Wajib false untuk port 587
  auth: {
    user: process.env.EMAIL_USER, // Otomatis mengambil login Brevo dari Render
    pass: process.env.EMAIL_PASS, // Otomatis mengambil password Brevo dari Render
  },
  tls: {
    rejectUnauthorized: false,
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ ERROR KONEKSI EMAIL:", error.message);
  } else {
    console.log("✅ KONEKSI EMAIL BREVO BERHASIL: Server siap mengirim OTP!");
  }
});