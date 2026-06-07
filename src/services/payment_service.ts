import Midtrans from "midtrans-client";

const snap = new Midtrans.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});

export const createTransactionService = async (
  orderId: string,
  amount: number,
  name: string,
  email: string
) => {
  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
    customer_details: {
      first_name: name,
      email: email,
    },
  };

  const transaction = await snap.createTransaction(parameter);

  return {
    success: true,
    token: transaction.token,
    redirectUrl: transaction.redirect_url,
  };
};