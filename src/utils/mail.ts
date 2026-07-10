import nodemailer from "nodemailer";

console.log("--- DEBUG EMAIL ---");
console.log("Status EMAIL_USER :", process.env.EMAIL_USER ? "TERBACA" : "KOSONG/UNDEFINED");
console.log("Status EMAIL_PASS :", process.env.EMAIL_PASS ? "TERBACA" : "KOSONG/UNDEFINED");

export const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 2525, // GANTI: Gunakan port 2525 untuk menembus firewall Cloud Provider
  secure: false, // Tetap false untuk port 2525
  pool: true,    // TAMBAHKAN: Mengaktifkan connection pool agar stabil di Render
  maxConnections: 3, 
  maxMessages: 10,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 10000, // Maksimal 10 detik menunggu koneksi
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ ERROR KONEKSI EMAIL:", error.message);
  } else {
    console.log("✅ KONEKSI EMAIL BREVO BERHASIL: Server siap mengirim OTP!");
  }
});