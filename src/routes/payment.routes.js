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

    // =====================================
    // 🔥 VALIDAR EMAIL
    // =====================================
    let email = req.query.email;

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        error: "Email obrigatório"
      });
    }

    email = email.toLowerCase().trim();

    // valida formato simples
    if (!email.includes("@")) {
      return res.status(400).json({
        error: "Email inválido"
      });
    }

    // =====================================
    // 💰 PLANO
    // =====================================
    const plan = req.query.plan || "basic";

    let value = 29;

    if (plan === "pro") value = 59;
    if (plan === "premium") value = 97;

    // =====================================
    // 👤 BUSCAR OU CRIAR USUÁRIO
    // =====================================
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        plan: plan,
        isVIP: false
      });

      console.log("👤 Novo usuário criado:", email);
    } else {
      // atualiza plano escolhido
      user.plan = plan;
      await user.save();
    }

    // =====================================
    // 🔥 GERAR PIX
    // =====================================
    const payment = await createPixPayment(
      email,
      value,
      plan
    );

    if (!payment || payment.error) {
      console.log("❌ ERRO AO GERAR PIX:", payment);

      return res.status(500).json({
        error: "Erro ao gerar PIX",
        details: payment
      });
    }

    console.log("✅ PIX GERADO:", email, "| Plano:", plan);

    // =====================================
    // 🚀 RESPOSTA LIMPA
    // =====================================
    res.json({
      success: true,
      plan,
      value,
      ...payment
    });

  } catch (error) {

    console.error("❌ ERRO PIX:", error.message);

    res.status(500).json({
      error: "Erro interno",
      details: error.message
    });

  }
});

module.exports = router;
