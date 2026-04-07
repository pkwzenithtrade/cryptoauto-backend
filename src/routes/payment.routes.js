const express = require("express");
const router = express.Router();
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// =====================================
// 💳 PLANOS (VIA ENV - PROFISSIONAL)
// =====================================
const PLANS = {
  basic: process.env.STRIPE_PRICE_BASIC,
  pro: process.env.STRIPE_PRICE_PRO,
  premium: process.env.STRIPE_PRICE_PREMIUM
};

// =====================================
// 🚀 CHECKOUT ASSINATURA
// =====================================
router.get("/checkout", async (req, res) => {
  try {
    let { email, plan } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Email obrigatório" });
    }

    email = email.toLowerCase().trim();
    plan = plan || "basic";

    const priceId = PLANS[plan];

    // 🔥 LOG PRA DEBUG REAL
    console.log("Plano solicitado:", plan);
    console.log("Price ID usado:", priceId);

    if (!priceId) {
      return res.status(400).json({
        error: "Plano inválido ou não configurado",
        planRecebido: plan
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",

      payment_method_types: ["card"],

      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],

      success_url: "https://cryptoauto-app.vercel.app?success=true",
      cancel_url: "https://cryptoauto-app.vercel.app?cancel=true",

      customer_email: email,

      metadata: {
        email: email,
        plan: plan
      }
    });

    console.log("💳 Checkout criado com sucesso:", email, plan);

    res.json({ url: session.url });

  } catch (err) {

    console.log("❌ ERRO STRIPE COMPLETO:");
    console.log(err);

    res.status(500).json({
      error: "Erro ao criar assinatura",
      detalhe: err.message
    });
  }
});

module.exports = router;
