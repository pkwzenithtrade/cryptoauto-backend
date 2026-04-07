const express = require("express");
const router = express.Router();
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// =====================================
// 💳 COLOQUE AQUI OS PRICE_ID REAIS
// =====================================
const PLANS = {
  basic: "price_UIHjyd10kIT1lM",
  pro: "price_UIHlvn9JgGQmoU",
  premium: "price_UIHn2egRa48BCB"
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

    if (!priceId) {
      return res.status(400).json({ error: "Plano inválido" });
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

    console.log("💳 Checkout OK:", email, plan);

    res.json({ url: session.url });

  } catch (err) {
    console.log("❌ ERRO STRIPE:", err);

    res.status(500).json({
      error: "Erro ao criar assinatura",
      detalhe: err.message // 🔥 AGORA VOCÊ VÊ O ERRO REAL
    });
  }
});

module.exports = router;
