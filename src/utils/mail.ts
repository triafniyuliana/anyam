// src/utils/mail.ts

export const sendEmailViaBrevo = async (toEmail: string, subject: string, textContent: string) => {
  const apiKey = process.env.BREVO_API_KEY;
  
  if (!apiKey) {
    console.error("❌ BREVO_API_KEY tidak ditemukan di .env");
    throw new Error("Konfigurasi API Email belum di-set");
  }

  const url = "https://api.brevo.com/v3/smtp/email";
  
  const payload = {
    sender: {
      name: "Anyam",
      email: "yuliiaan28@gmail.com" // WAJIB email pengirim yang sama dengan yang sudah diverifikasi di Brevo
    },
    to: [
      {
        email: toEmail
      }
    ],
    subject: subject,
    textContent: textContent
  };

  try {
    // Menggunakan native fetch bawaan Node.js versi 18+ ke atas
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Brevo API Error:", errorData);
      throw new Error("Brevo menolak pengiriman email");
    }

    console.log(`✅ Email OTP berhasil dikirim ke: ${toEmail} via Brevo API`);
    return true;

  } catch (error: any) {
    console.error("❌ Gagal mengeksekusi request email:", error.message);
    throw new Error("Gagal mengirim kode OTP ke email. Coba beberapa saat lagi.");
  }
};