import { prisma } from "../lib/prisma";

export const getKabupatenService = async () => {
  const data = await prisma.ongkir.findMany({
    orderBy: {
      kabupaten: "asc",
    },
  });

  const kabupaten = [...new Set(data.map((item) => item.kabupaten))];

  return kabupaten;
};

export const getKecamatanService = async (kabupaten: string) => {
  const data = await prisma.ongkir.findMany({
    where: {
      kabupaten,
    },
    orderBy: {
      kecamatan: "asc",
    },
  });

  return data.map((item) => item.kecamatan);
};

export const getOngkirService = async (kecamatan: string) => {
  return await prisma.ongkir.findFirst({
    where: {
      kecamatan,
    },
  });
};