const express = require("express");
const router = express.Router();
const axios = require("axios");

const { createCustomer, createPixPayment } = require("../services/asaas.service");

// =====================================
// 🔥 CRIAR PAGAMENTO PIX
// =====================================

router.get("/pix", async (req, res) => {

  try {

    console.log("🔄 Iniciando criação de pagamento...");

    // 🔥 CRIA CLIENTE
    const customer = await createCustomer();

    if (!customer || !customer.id) {
      console.log("❌ Erro cliente:", customer);
      return res.status(500).json({
        error: "Erro ao criar cliente",
        details: customer
      });
    }

    console.log("✅ Cliente criado:", customer.id);

    // 🔥 CRIA PAGAMENTO
    const payment = await createPixPayment(customer.id);

    if (!payment || !payment.id) {
      console.log("❌ Erro pagamento:", payment);
      return res.status(500).json({
        error: "Erro ao gerar pagamento",
        details: payment
      });
    }

    console.log("✅ Pagamento criado:", payment.id);

    res.json({
      paymentId: payment.id
    });

  } catch (error) {

    console.log("❌ ERRO GERAL PIX:", error.response?.data || error.message);

    res.status(500).json({
      error: "Erro interno",
      details: error.response?.data || error.message
    });

  }

});


// =====================================
// 🔥 BUSCAR QR CODE PIX
// =====================================

router.get("/pix/:id", async (req, res) => {

  try {

    console.log("🔎 Buscando QR Code:", req.params.id);

    const response = await axios.get(
      `https://api.asaas.com/v3/payments/${req.params.id}/pixQrCode`,
      {
        headers: {
          access_token: process.env.ASAAS_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ QR Code gerado");

    res.json(response.data);

  } catch (error) {

    console.log("❌ Erro PIX:", error.response?.data || error.message);

    res.status(500).json({
      error: "Erro ao buscar QR Code",
      details: error.response?.data || error.message
    });

  }

});

module.exports = router;
