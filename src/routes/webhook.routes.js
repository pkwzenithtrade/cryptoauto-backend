const express = require("express");
const router = express.Router();
const User = require("../models/user.model");

// 🔐 TOKEN DO ASAAS (coloque no .env depois)
const ASAAS_WEBHOOK_TOKEN = process.env.ASAAS_WEBHOOK_TOKEN;

// 🔥 WEBHOOK ASAAS
router.post("/asaas", async (req, res) => {

  try {

    // 🔐 VALIDA TOKEN
    const receivedToken = req.headers["asaas-access-token"];

    if (ASAAS_WEBHOOK_TOKEN && receivedToken !== ASAAS_WEBHOOK_TOKEN) {
      console.log("❌ TOKEN INVÁLIDO");
      return res.sendStatus(401);
    }

    const event = req.body;

    console.log("📩 WEBHOOK RECEBIDO:", event);

    // 🔥 PAGAMENTO CONFIRMADO
    
    if (event.event === "PAYMENT_RECEIVED") {

  const payment = event.payment;

  console.log("💰 PAGAMENTO CONFIRMADO:", payment.id);

  // 🔥 BUSCAR CLIENTE NO ASAAS
  const customerId = payment.customer;

  // 🚀 ATUALIZA TODOS (TEMPORÁRIO SIMPLES)
  await User.updateMany({}, { isVIP: true });

  console.log("🔥 VIP LIBERADO");
    }

      
      // 🚀 LIBERAR VIP (por enquanto teste)
      console.log("🔥 LIBERAR VIP PARA USUÁRIO");

    }

    res.sendStatus(200);

  } catch (error) {

    console.error("Erro webhook:", error.message);

    res.sendStatus(500);

  }

});

module.exports = router;
