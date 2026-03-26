const express = require("express");
const router = express.Router();
const User = require("../models/User");

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

    // 🔥 CRIA OU BUSCA USUÁRIO
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ email });
    }

    // 🔥 CRIA CLIENTE NO ASAAS
    const customer = await createCustomer(email);

    if (!customer || customer.error) {
      return res.status(500).json({
        error: "Erro ao criar cliente",
        details: customer
      });
    }

    // 🔥 SALVA ID DO ASAAS NO USUÁRIO
    user.asaasCustomerId = customer.id;
    await user.save();

    console.log("👤 Cliente vinculado:", email, customer.id);

    // 🔥 CRIA PAGAMENTO
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

  } catch (error) {

    console.error("❌ ERRO BOLETO:", error.message);

    res.status(500).json({
      error: "Erro interno",
      details: error.message
    });

  }

});


// =====================================
// 🔥 PIX (quando liberar)
// =====================================

router.get("/pix", async (req, res) => {

  try {

    const email = req.query.email;

    if (!email) {
      return res.status(400).json({ error: "Email obrigatório" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ email });
    }

    const customer = await createCustomer(email);

    if (!customer || customer.error) {
      return res.status(500).json({
        error: "Erro cliente",
        details: customer
      });
    }

    user.asaasCustomerId = customer.id;
    await user.save();

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

module.exports = router;
