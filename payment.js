const midtransClient = require('midtrans-client');

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

module.exports = async (req, res) => {
  const { orderId, amount, name, email } = req.body;

  try {
    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: name,
        email: email,
      },
    });

    res.json({
      success: true,
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};