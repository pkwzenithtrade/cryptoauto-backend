const express = require("express");
const router = express.Router();
const User = require("../models/User");

const ASAAS_WEBHOOK_TOKEN = process.env.ASAAS_WEBHOOK_TOKEN;

// =====================================
// 🔥 WEBHOOK ASAAS
// =====================================
router.post("/asaas", async (req, res) => {

  try {

    // 🔐 VALIDA TOKEN
    const receivedToken = req.headers["asaas-access-token"];

    if (ASAAS_WEBHOOK_TOKEN && receivedToken !== ASAAS_WEBHOOK_TOKEN) {
      console.log("❌ TOKEN INVÁLIDO");
      return res.sendStatus(401);
    }

    const event = req.body;

    console.log("📩 EVENTO RECEBIDO:", event?.event);

    // =====================================
    // 💰 PAGAMENTO CONFIRMADO
    // =====================================
    if (event?.event === "PAYMENT_RECEIVED") {

      const payment = event.payment;

      if (!payment) {
        console.log("❌ Payment não encontrado no webhook");
        return res.sendStatus(200);
      }

      console.log("💰 PAGAMENTO CONFIRMADO:", payment.id);
      console.log("👤 CUSTOMER ASAAS:", payment.customer);

      // 🔥 BUSCAR USUÁRIO PELO ID DO ASAAS
      const user = await User.findOne({
        asaasCustomerId: payment.customer
      });

      if (!user) {
        console.log("⚠️ Usuário não encontrado no banco");
        return res.sendStatus(200);
      }

      // =====================================
      // 🔥 LIBERAR VIP
      // =====================================
      user.isVIP = true;

      // 🔥 DEFINIR PLANO (ajustável depois)
      user.plan = "premium";

      await user.save();

      console.log("🔥 VIP LIBERADO PARA:", user.email);

    }

    // Sempre responder 200 pro Asaas
    res.sendStatus(200);

  } catch (error) {

    console.error("❌ ERRO WEBHOOK:", error.message);
    res.sendStatus(500);

  }

});

module.exports = router;
