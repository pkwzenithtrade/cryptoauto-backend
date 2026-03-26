const express = require("express");
const router = express.Router();
const User = require("../models/User");
const axios = require("axios");

const {
  createCustomer,
  createPixPayment,
  createBoletoPayment
} = require("../services/asaas.service");

// =====================================
// 🔥 BOLETO (PRINCIPAL AGORA)
// =====================================

router.get("/boleto", async (req, res) => {

  try {

    const email = req.query.email;

    if (!email) {
      return res.status(400).json({ error: "Email obrigatório" });
    }

    // 🔥 1. CRIAR CLIENTE NO ASAAS
    const customer = await createCustomer(email);

    if (!customer || customer.error) {
      return res.status(500).json({
        error: "Erro ao criar cliente",
        details: customer
      });
    }

    // 🔥 2. SALVAR NO BANCO (AQUI ESTÁ O OURO)
    const user = await User.findOneAndUpdate(
      { email: email },
      {
        email: email,
        asaasCustomerId: customer.id
      },
      { upsert: true, new: true }
    );

    console.log("👤 Usuário salvo:", user.email);

    // 🔥 3. CRIAR BOLETO
    const payment = await createBoletoPayment(customer.id);

    if (!payment || payment.error) {
      return res.status(500).json({
        error: "Erro ao gerar pagamento",
        details: payment?.error || null
      });
    }

    // 🔥 4. RETORNAR PARA O FRONT
    res.json({
      paymentId: payment.id,
      boletoUrl: payment.invoiceUrl,
      email: email
    });

  } catch (error) {

    console.error("Erro geral:", error.message);

    res.status(500).json({
      error: "Erro interno",
      details: error.message
    });

  }

});


// =====================================
// 🔥 PIX (FUTURO)
// =====================================

router.get("/pix", async (req, res) => {

  try {

    const email = req.query.email;

    if (!email) {
      return res.status(400).json({ error: "Email obrigatório" });
    }

    const customer = await createCustomer(email);

    if (!customer || customer.error) {
      return res.status(500).json({
        error: "Erro cliente",
        details: customer
      });
    }

    // 🔥 SALVA USUÁRIO
    await User.findOneAndUpdate(
      { email: email },
      {
        email: email,
        asaasCustomerId: customer.id
      },
      { upsert: true, new: true }
    );

    const payment = await createPixPayment(customer.id);

    if (!payment || payment.error) {
      return res.status(500).json({
        error: "Erro pagamento PIX",
        details: payment
      });
    }

    res.json({
      paymentId: payment.id
    });

  } catch (error) {

    res.status(500).json({
      error: "Erro interno",
      details: error.message
    });

  }

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

    res.status(500).json({
      error: "Erro QR Code",
      details: error.response?.data || error.message
    });

  }

});

module.exports = router;
