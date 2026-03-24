const express = require("express");
const router = express.Router();
const axios = require("axios");

const { createCustomer, createPixPayment } = require("../services/asaas.service");

// =====================================
// 🔥 CRIAR PIX
// =====================================

router.get("/pix", async (req, res) => {

  const customer = await createCustomer();

  if (!customer || customer.error) {
    return res.status(500).json({
      error: "Erro ao criar cliente",
      details: customer
    });
  }

  const payment = await createPixPayment(customer.id);

  if (!payment || payment.error) {
    return res.status(500).json({
      error: "Erro ao gerar pagamento",
      details: payment
    });
  }

  res.json({
    paymentId: payment.id
  });

});


// =====================================
// 🔥 QR CODE
// =====================================

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

    res.status(500).json({
      error: "Erro ao buscar QR Code",
      details: error.response?.data || error.message
    });

  }

});

module.exports = router;
