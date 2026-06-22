import { Request, Response } from "express";
import { createTransactionService } from "../services/payment_service";
import { prisma } from "../lib/prisma";


//TAMBAH TRANSAKSI
export const createTransaction = async (req: Request, res: Response) => {
  try {
    const { orderId, amount } = req.body;

    const result = await createTransactionService(orderId, amount);

    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//HANDLEWEBHOOK
export const handleWebhook = async (
  req: Request,
  res: Response,
) => {
  try {
    const notif = req.body;

    console.log(
      "WEBHOOK MIDTRANS:",
      JSON.stringify(notif, null, 2),
    );

    const orderId =
      notif.order_id as string;

    const transactionStatus =
      notif.transaction_status;

    const fraudStatus =
      notif.fraud_status;

    let statusBayar =
      "menunggu";

    if (
      transactionStatus === "settlement" ||
      transactionStatus === "capture"
    ) {
      if (
        fraudStatus === "accept" ||
        !fraudStatus
      ) {
        statusBayar = "lunas";
      }
    } else if (
      transactionStatus === "pending"
    ) {
      statusBayar = "menunggu";
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      statusBayar = "gagal";
    }

    // BOOKING PELATIHAN
    if (
      orderId.startsWith(
        "BOOKING-",
      )
    ) {

      await prisma.pelatihanBooking.updateMany({
        where: {
          orderId,
        },

        data: {
          statusBayar,
        },
      });

      if (statusBayar === "lunas") {

        const booking =
          await prisma.pelatihanBooking.findFirst({
            where: {
              orderId,
            },
          });

        if (booking) {

          await prisma.notifikasi.create({
            data: {
              userId:
                booking.pengrajinId,

              judul:
                "Booking Baru",

              pesan:
                `${booking.namaLengkap} telah melakukan pembayaran pelatihan`,
            },
          });

        }
      }

      console.log(
        "BOOKING UPDATED:",
        orderId,
      );
    }

    // PESANAN PRODUK
    if (
      orderId.startsWith(
        "ORDER-",
      )
    ) {
      await prisma.pesanan.updateMany({
        where: {
          orderId,
        },

        data: {
          statusBayar,
        },
      });

      console.log(
        "PESANAN UPDATED:",
        orderId,
      );
    }

    return res.status(200).json({
      success: true,
      status: "ok",
    });
  } catch (error: any) {
    console.error(
      "WEBHOOK ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        error.message,
    });
  }
};

//CHECK STATUS
export const checkStatus = async (
  req: Request,
  res: Response,
) => {
  try {
    const orderId =
      req.params.orderId as string;

    // BOOKING PELATIHAN
    if (
      orderId.startsWith(
        "BOOKING-",
      )
    ) {
      const booking =
        await prisma.pelatihanBooking.findFirst({
          where: {
            orderId,
          },
        });

      return res.json({
        success: true,
        statusBayar:
          booking?.statusBayar,
      });
    }

    // PESANAN PRODUK
    if (
      orderId.startsWith(
        "ORDER-",
      )
    ) {
      const pesanan =
        await prisma.pesanan.findFirst({
          where: {
            orderId,
          },
        });

      return res.json({
        success: true,
        statusBayar:
          pesanan?.statusBayar,
      });
    }

    return res.status(404).json({
      success: false,
      message:
        "Order tidak ditemukan",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message:
        error.message,
    });
  }
};