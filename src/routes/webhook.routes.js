const express = require("express");
const router = express.Router();
const axios = require("axios");
const User = require("../models/User");

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

// =====================================
// 🔔 WEBHOOK MERCADO PAGO
// =====================================
router.post("/mercadopago", async (req, res) => {

  try {

    console.log("📩 WEBHOOK RECEBIDO MP:", req.body);

    const type = req.body.type;
    const data = req.body.data;

    // Só processa pagamento
    if (type !== "payment") {
      return res.sendStatus(200);
    }

    const paymentId = data.id;

    if (!paymentId) {
      console.log("❌ Payment ID não encontrado");
      return res.sendStatus(200);
    }

    // =====================================
    // 🔍 BUSCAR PAGAMENTO NA API MP
    // =====================================
    const response = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${MP_ACCESS_TOKEN}`
        }
      }
    );

    const payment = response.data;

    console.log("💰 STATUS PAGAMENTO:", payment.status);

    // =====================================
    // ✅ PAGAMENTO APROVADO
    // =====================================
    if (payment.status === "approved") {

      const email = payment.external_reference;

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
      await user.save();

      console.log("🔥 VIP LIBERADO:", email);
    }

    res.sendStatus(200);

  } catch (error) {

    console.error("❌ ERRO WEBHOOK MP:", error.response?.data || error.message);
    res.sendStatus(500);

  }

});

module.exports = router;
