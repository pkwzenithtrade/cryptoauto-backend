const express = require("express");
const router = express.Router();
const axios = require("axios");
const User = require("../models/User");

// =====================================
// 🔔 WEBHOOK MERCADO PAGO
// =====================================
router.post("/mercadopago", async (req, res) => {

  try {

    console.log("📩 WEBHOOK RECEBIDO MP:");
    console.log(JSON.stringify(req.body, null, 2));

    const { type, data } = req.body;

    // 🔒 Ignora eventos que não são pagamento
    if (type !== "payment") {
      return res.sendStatus(200);
    }

    const paymentId = data?.id;

    if (!paymentId) {
      console.log("❌ Payment ID não encontrado");
      return res.sendStatus(200);
    }

    console.log("💳 Buscando pagamento:", paymentId);

    // =====================================
    // 🔍 BUSCAR PAGAMENTO NO MERCADO PAGO
    // =====================================
    const response = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
        }
      }
    );

    const payment = response.data;

    console.log("📊 STATUS:", payment.status);

    // =====================================
    // ✅ PAGAMENTO APROVADO
    // =====================================
    if (payment.status === "approved") {

      const email = payment.external_reference;

      console.log("👤 EMAIL:", email);

      if (!email) {
        console.log("❌ external_reference não encontrado");
        return res.sendStatus(200);
      }

      // 🔥 BUSCAR USUÁRIO
      const user = await User.findOne({ email });

      if (!user) {
        console.log("⚠️ Usuário não encontrado:", email);
        return res.sendStatus(200);
      }

      // 🔥 LIBERAR VIP
      user.isVIP = true;
      user.plan = "premium"; // garante plano

      await user.save();

      console.log("🔥 VIP LIBERADO PARA:", email);
    }

    // Sempre responde 200 pro Mercado Pago
    return res.sendStatus(200);

  } catch (error) {

    console.error("❌ ERRO WEBHOOK MP:");
    console.error(error.response?.data || error.message);

    return res.sendStatus(500);
  }

});

module.exports = router;
