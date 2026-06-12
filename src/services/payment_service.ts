import midtransClient from "midtrans-client";

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});

const coreApi = new midtransClient.CoreApi({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});

export const createTransactionService = async (
  orderId: string,
  amount: number,
  metodeBayar: string,
) => {
  try {
    console.log("METODE BAYAR =", metodeBayar);

    // =====================
    // BCA VIRTUAL ACCOUNT
    // =====================
    if (metodeBayar.toUpperCase() === "BCA_VA") {
      const parameter = {
        transaction_details: {
          order_id: orderId,
          gross_amount: amount,
        },
        enabled_payments: ["bca_va"], // snap handle BCA
      };

      const transaction: any = await snap.createTransaction(parameter);

      return {
        success: true,
        token: transaction.token,
        redirect_url: transaction.redirect_url,
        vaNumber: null, // VA number akan muncul di halaman Snap
        metodeBayar: "BCA_VA",
      };
    }

    // =====================
    // GOPAY
    // =====================
    if (metodeBayar.toUpperCase() === "GOPAY") {
      const parameter = {
        transaction_details: {
          order_id: orderId,
          gross_amount: amount,
        },

        enabled_payments: ["gopay"],
      };

      const transaction: any = await snap.createTransaction(parameter);

      return {
        success: true,
        token: transaction.token,
        redirect_url: transaction.redirect_url,
        vaNumber: null,
        metodeBayar: "GOPAY",
      };
    }

    // =====================
    // INVALID PAYMENT
    // =====================
    throw new Error(`Metode pembayaran tidak didukung: ${metodeBayar}`);
  } catch (error: any) {
    console.error(
      "[MIDTRANS ERROR]",
      error?.ApiResponse ?? error?.message ?? error,
    );

    throw error;
  }
};
