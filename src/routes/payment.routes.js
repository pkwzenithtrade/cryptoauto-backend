const express = require("express");
const router = express.Router();
const axios = require("axios");

const {
  createCustomer,
  createPixPayment,
  createBoletoPayment
} = require("../services/asaas.service");


// =====================================
// 🔥 PIX (quando liberar)
// =====================================

router.get("/pix", async (req, res) => {

  const customer = await createCustomer();

  if (!customer || customer.error) {
    return res.status(500).json({ error: "Erro cliente", details: customer });
  }

  const payment = await createPixPayment(customer.id);

  if (!payment || payment.error) {
    return res.status(500).json({ error: "Erro pagamento PIX", details: payment });
  }

  res.json({ paymentId: payment.id });

});


// =====================================
// 🔥 BOLETO (FUNCIONA AGORA)
// =====================================

router.get("/boleto", async (req, res) => {

  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ error: "Email obrigatório" });
  }

  const customer = await createCustomer(email);

  if (!customer) {
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

    res.status(500).json({
      error: "Erro QR Code",
      details: error.response?.data || error.message
    });

  }

});

module.exports = router;
