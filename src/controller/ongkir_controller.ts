// import { Request, Response } from "express";
// import {
//   getKabupatenService,
//   getKecamatanService,
//   getOngkirService,
// } from "../services/ongkir_service";

// export const getKabupaten = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const data = await getKabupatenService();

//     res.status(200).json({
//       success: true,
//       data,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Gagal mengambil data kabupaten",
//     });
//   }
// };

// export const getKecamatan = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const { kabupaten } = req.params;

// const data = await getKecamatanService(kabupaten as string);
//     res.status(200).json({
//       success: true,
//       data,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Gagal mengambil data kecamatan",
//     });
//   }
// };

// export const getOngkir = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const { kecamatan } = req.params;

// const data = await getOngkirService(kecamatan as string);
//     if (!data) {
//       res.status(404).json({
//         success: false,
//         message: "Ongkir tidak ditemukan",
//       });
//       return;
//     }

//     res.status(200).json({
//       success: true,
//       data,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Gagal mengambil ongkir",
//     });
//   }
// };