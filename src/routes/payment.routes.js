const express = require("express");
const router = express.Router();

const User = require("../models/User");

const {
  createPixPayment
} = require("../services/mercadopago.service");

// =====================================
// 💰 GERAR PIX POR PLANO
// =====================================
router.get("/pix", async (req, res) => {
  try {

    const email = req.query.email;
    const plan = req.query.plan || "basic";

    if (!email) {
      return res.status(400).json({ error: "Email obrigatório" });
    }

    // 💸 PLANOS
    let value = 29;
    if (plan === "pro") value = 59;
    if (plan === "premium") value = 97;

    // 🔍 BUSCAR OU CRIAR USUÁRIO
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ email });
    }

    // 🔥 SALVAR PLANO (ANTES DO PAGAMENTO)
    user.plan = plan;
    await user.save();

    // 💰 GERAR PIX
    const payment = await createPixPayment(email, value, plan);

    if (!payment || payment.error) {
      return res.status(500).json({
        error: "Erro ao gerar PIX",
        details: payment
      });
    }

    res.json({
      success: true,
      plan,
      value,
      ...payment
    });

  } catch (error) {

    res.status(500).json({
      error: "Erro interno",
      details: error.message
    });

  }
});

module.exports = router;
