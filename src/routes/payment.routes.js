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
    const plan = req.query.plan || "basic";

    if (!email) {
      return res.status(400).json({ error: "Email obrigatório" });
    }

    // 💰 DEFINIÇÃO DE PREÇOS
    let value = 29;

    if (plan === "pro") value = 59;
    if (plan === "premium") value = 97;

    // 🔥 CRIAR OU BUSCAR USUÁRIO
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ email });
    }

    // 🔥 CRIAR CLIENTE ASAAS
    const customer = await createCustomer(email);

    if (!customer || customer.error) {
      return res.status(500).json({ error: "Erro cliente", details: customer });
    }

    // 🔥 SALVAR NO BANCO
    user.asaasCustomerId = customer.id;
    user.plan = plan; // 🔥 guarda o plano escolhido
    await user.save();

    // 🔥 CRIAR BOLETO
    const payment = await createBoletoPayment(customer.id, value, plan);

    if (!payment || payment.error) {
      return res.status(500).json({
        error: "Erro pagamento",
        details: payment
      });
    }

    res.json({
      paymentId: payment.id,
      boletoUrl: payment.invoiceUrl,
      plan: plan,
      value: value
    });

  } catch (error) {

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
