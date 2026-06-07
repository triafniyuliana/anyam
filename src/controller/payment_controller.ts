import { Request, Response } from "express";
import { createTransactionService } from "../services/payment_service";

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const { orderId, amount, name, email } = req.body;

    if (!orderId || !amount || !name || !email) {
      return res.status(400).json({
        success: false,
        message: "orderId, amount, name, email wajib diisi",
      });
    }

    const result = await createTransactionService(orderId, amount, name, email);

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};