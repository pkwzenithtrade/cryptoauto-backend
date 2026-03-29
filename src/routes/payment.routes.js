const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const User = require("../models/User");

const {
  createPixPayment
} = require("../services/mercadopago.service");

// 🔒 ROTA PROTEGIDA
router.get("/pix", authMiddleware, async (req, res) => {
  try {

    const userId = req.userId;

    const plan = req.query.plan || "basic";

    let value = 29;
    if (plan === "pro") value = 59;
    if (plan === "premium") value = 97;

    const user = await User.findById(userId);

    if (!user) {
  return res.status(400).json({
    error: "Usuário não encontrado. Crie uma conta primeiro."
  });
}

    // salva plano escolhido
    user.plan = plan;
    await user.save();

    const payment = await createPixPayment(
      user.email,
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
    res.status(500).json({
      error: "Erro interno",
      details: error.message
    });
  }
});

module.exports = router;
