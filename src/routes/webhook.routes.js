const express = require("express");
const router = express.Router();

// 🔥 WEBHOOK ASAAS
router.post("/asaas", async (req, res) => {

  try {

    const event = req.body;

    console.log("📩 WEBHOOK RECEBIDO:", event);

    // 🔥 VERIFICA SE PAGAMENTO FOI CONFIRMADO
    if (event.event === "PAYMENT_RECEIVED") {

      const payment = event.payment;

      console.log("💰 PAGAMENTO CONFIRMADO:", payment.id);

      // 🚀 AQUI VAMOS LIBERAR VIP
      // (por enquanto só log, depois vamos salvar no banco)

      console.log("🔥 LIBERAR VIP PARA USUÁRIO");

    }

    res.sendStatus(200);

  } catch (error) {

    console.error("Erro webhook:", error.message);

    res.sendStatus(500);

  }

});

module.exports = router;
