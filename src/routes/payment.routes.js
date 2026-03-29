const express = require("express");
const router = express.Router();

const User = require("../models/User");

const {
  createPixPayment
} = require("../services/mercadopago.service");

// =====================================
// 💰 GERAR PIX
// =====================================
router.get("/pix", async (req, res) => {
  try {

    // 🔥 PEGA EMAIL CORRETO
    let email = req.query.email;

    if (!email) {
      return res.status(400).json({
        error: "Email obrigatório"
      });
    }

    email = email.toLowerCase().trim();

    const plan = req.query.plan || "basic";

    let value = 29;
    if (plan === "pro") value = 59;
    if (plan === "premium") value = 97;

    // 🔥 BUSCA OU CRIA USUÁRIO
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ email });
    }

    // 🔥 SALVA PLANO ESCOLHIDO
    user.plan = plan;
    await user.save();

    // 🔥 CRIA PAGAMENTO PIX
    const payment = await createPixPayment(
      email,
      value,
      plan
    );

    if (!payment || payment.error) {
      return res.status(500).json({
        error: "Erro ao gerar PIX",
        details: payment
      });
    }

    res.json(payment);

  } catch (error) {

    console.error("Erro PIX:", error.message);

    res.status(500).json({
      error: "Erro interno",
      details: error.message
    });

  }
});

module.exports = router;
