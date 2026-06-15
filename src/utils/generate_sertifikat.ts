import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateSertifikat = (
  nama: string,
  namaKelas: string,
  bookingId: string,
) => {
  return new Promise<string>((resolve, reject) => {
    const namaFile = `sertifikat-${bookingId}.pdf`;
    const folder = path.join(__dirname, "../../uploads/sertifikat");

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    const filePath = path.join(folder, namaFile);

    // ── SETUP DOC ─────────────────────────────────────────────────────
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 0,
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const W = doc.page.width;   // 841.89
    const H = doc.page.height;  // 595.28

    // ── WARNA ─────────────────────────────────────────────────────────
    const COKLAT_TUA  = "#3E2723";
    const COKLAT_MID  = "#5A3116";
    const COKLAT_MUDA = "#8B5E3C";
    const KREM        = "#FDF8F3";
    const EMAS        = "#C8972A";
    const EMAS_MUDA   = "#F5D78E";

    // ── BACKGROUND KREM ───────────────────────────────────────────────
    doc.rect(0, 0, W, H).fill(KREM);

    // ── BORDER LUAR (tebal) ───────────────────────────────────────────
    const bOuter = 18;
    doc
      .rect(bOuter, bOuter, W - bOuter * 2, H - bOuter * 2)
      .lineWidth(6)
      .stroke(EMAS);

    // ── BORDER DALAM (tipis) ──────────────────────────────────────────
    const bInner = 28;
    doc
      .rect(bInner, bInner, W - bInner * 2, H - bInner * 2)
      .lineWidth(1.5)
      .stroke(COKLAT_MUDA);

    // ── HEADER STRIP ──────────────────────────────────────────────────
    doc.rect(0, 0, W, 110).fill(COKLAT_TUA);

    // garis emas bawah strip
    doc.rect(0, 106, W, 4).fill(EMAS);

    // ── LOGO / ICON ANYAMAN (lingkaran emas) ──────────────────────────
    const cx = W / 2;
    doc
      .circle(cx, 110, 38)
      .lineWidth(3)
      .fillAndStroke(KREM, EMAS);

    // teks inisial di dalam lingkaran
    doc
      .fillColor(COKLAT_TUA)
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("AN", cx - 16, 97, { width: 32, align: "center" });

    // ── JUDUL APLIKASI (di strip) ─────────────────────────────────────
    doc
      .fillColor(EMAS_MUDA)
      .fontSize(11)
      .font("Helvetica")
      .text("PLATFORM PELATIHAN ANYAMAN BAMBU", 0, 22, {
        align: "center",
        width: W,
        characterSpacing: 2,
      });

    doc
      .fillColor("#FFFFFF")
      .fontSize(26)
      .font("Helvetica-Bold")
      .text("ANYAMAN", 0, 42, {
        align: "center",
        width: W,
        characterSpacing: 4,
      });

    // ── JUDUL SERTIFIKAT ──────────────────────────────────────────────
    doc
      .fillColor(COKLAT_MID)
      .fontSize(11)
      .font("Helvetica")
      .text("S E R T I F I K A T", 0, 165, {
        align: "center",
        width: W,
        characterSpacing: 6,
      });

    doc
      .fillColor(COKLAT_TUA)
      .fontSize(30)
      .font("Helvetica-Bold")
      .text("PENYELESAIAN PELATIHAN", 0, 185, {
        align: "center",
        width: W,
      });

    // garis dekoratif bawah judul
    const lineY = 228;
    const lineW = 180;
    doc
      .moveTo(cx - lineW / 2, lineY)
      .lineTo(cx - 14, lineY)
      .lineWidth(1)
      .stroke(EMAS);
    doc
      .circle(cx, lineY, 4)
      .fillAndStroke(EMAS, EMAS);
    doc
      .moveTo(cx + 14, lineY)
      .lineTo(cx + lineW / 2, lineY)
      .lineWidth(1)
      .stroke(EMAS);

    // ── TEKS DIBERIKAN KEPADA ─────────────────────────────────────────
    doc
      .fillColor(COKLAT_MUDA)
      .fontSize(12)
      .font("Helvetica")
      .text("Dengan bangga diberikan kepada", 0, 248, {
        align: "center",
        width: W,
      });

    // ── NAMA PESERTA ──────────────────────────────────────────────────
    doc
      .fillColor(COKLAT_TUA)
      .fontSize(36)
      .font("Helvetica-BoldOblique")
      .text(nama.toUpperCase(), 0, 268, {
        align: "center",
        width: W,
      });

    // garis bawah nama
    const namaLineY = 318;
    doc
      .moveTo(cx - 200, namaLineY)
      .lineTo(cx + 200, namaLineY)
      .lineWidth(1)
      .stroke(COKLAT_MUDA);

    // ── TEKS KELAS ────────────────────────────────────────────────────
    doc
      .fillColor(COKLAT_MUDA)
      .fontSize(12)
      .font("Helvetica")
      .text("Telah berhasil menyelesaikan pelatihan", 0, 332, {
        align: "center",
        width: W,
      });

    doc
      .fillColor(COKLAT_MID)
      .fontSize(20)
      .font("Helvetica-Bold")
      .text(`"${namaKelas}"`, 0, 354, {
        align: "center",
        width: W,
      });

    // ── TANGGAL ───────────────────────────────────────────────────────
    const tgl = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    doc
      .fillColor(COKLAT_MUDA)
      .fontSize(11)
      .font("Helvetica")
      .text(`Diterbitkan pada ${tgl}`, 0, 390, {
        align: "center",
        width: W,
      });

    // ── ID SERTIFIKAT ─────────────────────────────────────────────────
    doc
      .fillColor(COKLAT_MUDA)
      .fontSize(9)
      .font("Helvetica")
      .text(`ID: ${bookingId}`, 0, 408, {
        align: "center",
        width: W,
      });

    // ── FOOTER STRIP ──────────────────────────────────────────────────
    doc.rect(0, H - 72, W, 72).fill(COKLAT_TUA);
    doc.rect(0, H - 72, W, 3).fill(EMAS);

    // kolom kiri - TTD
    doc
      .fillColor(EMAS_MUDA)
      .fontSize(9)
      .font("Helvetica")
      .text("Dikeluarkan oleh", 60, H - 60, { width: 160, align: "center" });

    doc
      .moveTo(60, H - 34)
      .lineTo(220, H - 34)
      .lineWidth(0.8)
      .stroke(EMAS_MUDA);

    doc
      .fillColor("#FFFFFF")
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("Platform Anyaman", 60, H - 28, { width: 160, align: "center" });

    // kolom kanan - verifikasi
    doc
      .fillColor(EMAS_MUDA)
      .fontSize(9)
      .font("Helvetica")
      .text("Nomor Sertifikat", W - 220, H - 60, {
        width: 160,
        align: "center",
      });

    doc
      .moveTo(W - 220, H - 34)
      .lineTo(W - 60, H - 34)
      .lineWidth(0.8)
      .stroke(EMAS_MUDA);

    doc
      .fillColor("#FFFFFF")
      .fontSize(9)
      .font("Helvetica-Bold")
      .text(bookingId.toUpperCase(), W - 220, H - 28, {
        width: 160,
        align: "center",
      });

    // ── ORNAMEN POJOK ─────────────────────────────────────────────────
    _cornerOrnament(doc, 38, 38, EMAS);
    _cornerOrnament(doc, W - 38, 38, EMAS);
    _cornerOrnament(doc, 38, H - 38, EMAS);
    _cornerOrnament(doc, W - 38, H - 38, EMAS);

    // ── SELESAI ───────────────────────────────────────────────────────
    doc.end();
    stream.on("finish", () => resolve(`/uploads/sertifikat/${namaFile}`));
    stream.on("error", reject);
  });
};

// ── HELPER: ORNAMEN SUDUT ─────────────────────────────────────────────────────
function _cornerOrnament(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  color: string,
) {
  const size = 10;
  doc.circle(x, y, 3).fill(color);
  doc
    .moveTo(x - size, y)
    .lineTo(x + size, y)
    .moveTo(x, y - size)
    .lineTo(x, y + size)
    .lineWidth(1)
    .stroke(color);
}