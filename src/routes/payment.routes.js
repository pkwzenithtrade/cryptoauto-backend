const express = require("express");
const router = express.Router();
const axios = require("axios");

const { createCustomer, createPixPayment } = require("../services/asaas.service");

// 🔥 CRIAR PAGAMENTO
router.get("/pix", async (req, res) => {

  const customer = await createCustomer();

  if (!customer) {
    return res.status(500).json({ error: "Erro ao criar cliente" });
  }

  const payment = await createPixPayment(customer.id);

  if (!payment) {
  return res.status(500).json({ error: "Erro ao gerar pagamento (ver logs)" });
  }

  res.json({
    paymentId: payment.id
  });

});


// 🔥 PEGAR QR CODE PIX
router.get("/pix/:id", async (req, res) => {

  try {

    const response = await axios.get(
      `https://api.asaas.com/v3/payments/${req.params.id}/pixQrCode`,
      {
        headers: {
          access_token: process.env.ASAAS_API_KEY
        }
      }
    );

    res.json(response.data);

  } catch (error) {

    console.log("Erro PIX:", error.response?.data || error.message);

    res.status(500).json({ error: "Erro ao buscar QR Code" });

  }

});

module.exports = router;
