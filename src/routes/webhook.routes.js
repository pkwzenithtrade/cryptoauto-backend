const express = require("express");
const router = express.Router();
const User = require("../models/User");

const ASAAS_WEBHOOK_TOKEN = process.env.ASAAS_WEBHOOK_TOKEN;

router.post("/asaas", async (req, res) => {

  try {

    const receivedToken = req.headers["asaas-access-token"];

    if (ASAAS_WEBHOOK_TOKEN && receivedToken !== ASAAS_WEBHOOK_TOKEN) {
      return res.sendStatus(401);
    }

    const event = req.body;

    console.log("📩 WEBHOOK:", event.event);

    if (event.event === "PAYMENT_RECEIVED") {

      const payment = event.payment;

      console.log("💰 PAGAMENTO:", payment.id);

      // 🔥 BUSCA USUÁRIO PELO ID DO ASAAS
      const user = await User.findOne({
        asaasCustomerId: payment.customer
      });

      if (user) {

        user.isVIP = true;
        await user.save();

        console.log("🔥 VIP LIBERADO PARA:", user.email);

      } else {

        console.log("⚠️ Usuário não encontrado");

      }

    }

    res.sendStatus(200);

  } catch (error) {

    console.error("Erro webhook:", error.message);
    res.sendStatus(500);

  }

});

module.exports = router;
