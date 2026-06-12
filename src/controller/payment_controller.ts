import { Request, Response } from "express";
import { createTransactionService } from "../services/payment_service";
import { prisma } from "../lib/prisma";

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const { orderId, amount, metodeBayar } = req.body;

    const result = await createTransactionService(orderId, amount, metodeBayar);

    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const notif = req.body;
    console.log("WEBHOOK MIDTRANS:", notif);

    const orderId = notif.order_id;
    const transactionStatus = notif.transaction_status;
    const fraudStatus = notif.fraud_status;

    console.log("ORDER ID:", orderId); // tambah ini
    console.log("STATUS:", transactionStatus); // tambah ini

    let statusBayar = "menunggu";

    if (transactionStatus === "settlement" || transactionStatus === "capture") {
      if (fraudStatus === "accept" || !fraudStatus) {
        statusBayar = "lunas";
      }
    } else if (transactionStatus === "pending") {
      statusBayar = "menunggu";
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      statusBayar = "gagal";
    }

    // Ganti where id → orderId (field yang simpan order_id Midtrans)
    const updated = await prisma.pelatihanBooking.updateMany({
      where: { orderId: orderId }, // ✅ ganti ke field orderId
      data: { statusBayar },
    });

    console.log("UPDATED:", updated); // tambah ini

    return res.status(200).json({ status: "ok" });
  } catch (error: any) {
    console.error("Webhook error detail:", error); // lihat error lengkap
    return res.status(500).json({ message: error.message });
  }
};

export const checkStatus = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.orderId as string; // ✅ tambah as string
    const booking = await prisma.pelatihanBooking.findFirst({
      where: { orderId: orderId },
    });
    return res.json({ 
      success: true, 
      statusBayar: booking?.statusBayar 
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};