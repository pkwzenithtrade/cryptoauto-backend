const express = require("express");
const router = express.Router();
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// =====================================
// 💳 PLANOS (CRIAR NO STRIPE DASHBOARD)
// =====================================
// Você precisa criar esses preços no Stripe:
// basic, pro, premium (recorrente mensal)

const PLANS = {
  basic: "price_BASIC_ID_AQUI",
  pro: "price_PRO_ID_AQUI",
  premium: "price_PREMIUM_ID_AQUI"
};

// =====================================
// 🚀 CHECKOUT ASSINATURA (RECORRENTE)
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

    if (!priceId) {
      return res.status(400).json({ error: "Plano inválido" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription", // 🔥 AGORA É RECORRENTE

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

    console.log("💳 Assinatura criada:", email, plan);

    res.json({ url: session.url });

  } catch (err) {
    console.log("❌ ERRO STRIPE:", err.message);

    res.status(500).json({
      error: "Erro ao criar assinatura"
    });
  }
});

module.exports = router;
