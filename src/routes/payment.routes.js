const express = require("express");
const router = express.Router();

// ✅ CAMINHO CORRETO (confere sua pasta: modelos)
const User = require("../modelos/User");

// ✅ NOVO SERVICE (Mercado Pago)
const {
  createPixPayment
} = require("../servicos/mercadopago.service");


// =====================================
// 💰 PAGAMENTO PIX (PRINCIPAL)
// =====================================
router.get("/pix", async (req, res) => {

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

    // 🔥 SALVAR PLANO ESCOLHIDO (ANTES DO PAGAMENTO)
    user.plan = plan;
    await user.save();

    // 🔥 CRIAR PAGAMENTO PIX (SEM CUSTOMER)
    const payment = await createPixPayment(email, value, plan);

    if (!payment || payment.error) {
      return res.status(500).json({
        error: "Erro ao gerar PIX",
        details: payment
      });
    }

    // 🔥 RETORNO PARA O FRONT
    res.json({
      paymentId: payment.id,
      qr_code: payment.qr_code,
      qr_code_base64: payment.qr_code_base64,
      plan: plan,
      value: value
    });

  } catch (error) {

    console.error("❌ ERRO PAYMENT:", error.message);

    res.status(500).json({
      error: "Erro interno",
      details: error.message
    });

  }

});

module.exports = router;
