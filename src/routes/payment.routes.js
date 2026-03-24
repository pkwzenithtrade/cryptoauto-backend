const express = require("express");
const router = express.Router();
const axios = require("axios");

const User = require("../models/User");

const {
  createCustomer,
  createPixPayment,
  createBoletoPayment
} = require("../services/asaas.service");

// =====================================
// 🔥 PIX (quando liberar)
// =====================================
router.get("/pix", async (req, res) => {

  try {

    const email = req.query.email;

    if (!email) {
      return res.status(400).json({ error: "Email obrigatório" });
    }

    // 🔥 SALVA USUÁRIO
    await User.findOneAndUpdate(
      { email },
      { email },
      { upsert: true, new: true }
    );

    const customer = await createCustomer(email);

    if (!customer || customer.error) {
      return res.status(500).json({
        error: "Erro cliente",
        details: customer?.error || null
      });
    }

    const payment = await createPixPayment(customer.id);

    if (!payment || payment.error) {
      return res.status(500).json({
        error: "Erro pagamento PIX",
        details: payment?.error || null
      });
    }

    res.json({
      paymentId: payment.id,
      email: email
    });

  } catch (error) {

    console.error("❌ ERRO PIX:", error.message);

    res.status(500).json({ error: "Erro interno" });

  }

});

// =====================================
// 🔥 BOLETO (FUNCIONA AGORA)
// =====================================
router.get("/boleto", async (req, res) => {

  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ error: "Email obrigatório" });
  }

  // 🔥 SALVA USUÁRIO NO BANCO (AQUI É O PASSO 2)
  await User.findOneAndUpdate(
    { email: email },
    { email: email },
    { upsert: true, new: true }
  );

  const customer = await createCustomer(email);

  if (!customer || customer.error) {
    return res.status(500).json({ error: "Erro ao criar cliente" });
  }

  const payment = await createBoletoPayment(customer.id);

  if (!payment || payment.error) {
    return res.status(500).json({
      error: "Erro ao gerar pagamento",
      details: payment?.error || null
    });
  }

  res.json({
    paymentId: payment.id,
    boletoUrl: payment.invoiceUrl,
    email: email
  });

});

// =====================================
// 🔥 QR PIX
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

    console.error("❌ ERRO QR PIX:", error.response?.data || error.message);

    res.status(500).json({
      error: "Erro QR Code",
      details: error.response?.data || error.message
    });

  }

});

module.exports = router;
