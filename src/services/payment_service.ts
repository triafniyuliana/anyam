import midtransClient from "midtrans-client";

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});

export const createTransactionService = async (
  orderId: string,
  amount: number,
) => {
  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
  };

  const transaction: any =
    await snap.createTransaction(
      parameter
    );

  return {
    success: true,
    token: transaction.token,
    redirect_url:
      transaction.redirect_url,
  };
};


