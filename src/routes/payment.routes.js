const express = require("express");
const router = express.Router();

// ⚠️ GARANTE QUE O CAMINHO ESTÁ CERTO
const User = require("../models/User");

// ⚠️ GARANTE QUE A PASTA É /services (SEM ACENTO)
const {
  createPixPayment
} = require("../services/mercadopago.service");

// =====================================
// 🔥 PIX MERCADO PAGO
// =====================================
router.get("/pix", async (req, res) => {
  try {

    const email = req.query.email;
    const plan = req.query.plan || "basic";

    // ===============================
    // 🔒 VALIDAÇÃO
    // ===============================
    if (!email) {
      return res.status(400).json({ error: "Email obrigatório" });
    }

    // ===============================
    // 💰 PLANOS
    // ===============================
    let value = 29;

    if (plan === "pro") value = 59;
    if (plan === "premium") value = 97;

    // ===============================
    // 👤 USUÁRIO
    // ===============================
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        isVIP: false,
        plan: "free"
      });
    }

    // Atualiza plano escolhido
    user.plan = plan;
    await user.save();

    // ===============================
    // 💸 PAGAMENTO PIX
    // ===============================
    const payment = await createPixPayment(email, value, plan);

    if (!payment || payment.error) {
      console.log("❌ ERRO AO GERAR PIX:", payment);

      return res.status(500).json({
        error: "Erro ao gerar PIX",
        details: payment
      });
    }

    // ===============================
    // 🚀 RESPOSTA
    // ===============================
    res.json({
      success: true,
      plan,
      value,
      ...payment
    });

  } catch (error) {

    console.log("❌ ERRO GERAL:", error.message);

    res.status(500).json({
      error: "Erro interno",
      details: error.message
    });

  }
});

module.exports = router;
