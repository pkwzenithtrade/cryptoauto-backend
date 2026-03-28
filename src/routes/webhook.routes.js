const express = require("express");
const router = express.Router();
const axios = require("axios");

const User = require("../models/User");

// =====================================
// 🔔 WEBHOOK MERCADO PAGO
// =====================================
router.post("/mercadopago", async (req, res) => {

  try {

    console.log("📩 WEBHOOK:", JSON.stringify(req.body));

    const { type, data } = req.body;

    if (type !== "payment") {
      return res.sendStatus(200);
    }

    const paymentId = data?.id;

    const response = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
        }
      }
    );

    const payment = response.data;

    console.log("STATUS:", payment.status);

    if (payment.status === "approved") {

      const email = payment.external_reference;

      const user = await User.findOne({ email });

      if (!user) return res.sendStatus(200);

      // 🔥 LIBERA VIP + mantém plano escolhido
      user.isVIP = true;

      await user.save();

      console.log("🔥 VIP LIBERADO:", email, "| Plano:", user.plan);
    }

    res.sendStatus(200);

  } catch (error) {
    console.error(error.message);
    res.sendStatus(500);
  }

});

module.exports = router;
