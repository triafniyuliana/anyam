import { prisma } from "../lib/prisma";

export const createActivity = async (
  userId: string,
  judul: string,
  deskripsi: string,
) => {
  const now = new Date();

  const tanggal = now.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const jam = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  await prisma.aktivitas.create({
    data: {
      userId,
      judul,
      deskripsi,
      tanggal,
      jam,
    },
  });
};