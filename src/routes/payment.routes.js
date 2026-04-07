const express = require("express");
const router = express.Router();
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// =====================================
// 💳 PLANOS (IDs REAIS DO STRIPE)
// =====================================
// ⚠️ IMPORTANTE:
// Aqui precisa ser PRICE ID do Stripe (price_xxx)
// NÃO pode ser product_id

const PLANS = {
  basic: process.env.STRIPE_PRICE_BASIC,
  pro: process.env.STRIPE_PRICE_PRO,
  premium: process.env.STRIPE_PRICE_PREMIUM
};

// =====================================
// 🚀 CHECKOUT ASSINATURA (RECORRENTE)
// =====================================
router.get("/checkout", async (req, res) => {

  try {

    let { email, plan } = req.query;

    // =========================
    // VALIDAÇÃO
    // =========================
    if (!email) {
      return res.status(400).json({ error: "Email obrigatório" });
    }

    email = email.toLowerCase().trim();
    plan = plan || "basic";

    const priceId = PLANS[plan];

    if (!priceId) {
      console.log("❌ Plano inválido:", plan);
      return res.status(400).json({ error: "Plano inválido" });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.log("❌ STRIPE_SECRET_KEY não definida");
      return res.status(500).json({ error: "Erro interno Stripe" });
    }

    // =========================
    // CRIAR CHECKOUT
    // =========================
    const session = await stripe.checkout.sessions.create({

      mode: "subscription", // 🔥 recorrente

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
        email,
        plan
      }

    });

    console.log("💳 Checkout criado com sucesso:");
    console.log("Email:", email);
    console.log("Plano:", plan);
    console.log("PriceID:", priceId);

    return res.json({ url: session.url });

  } catch (err) {

    console.log("❌ ERRO STRIPE COMPLETO:");
    console.log(err);

    return res.status(500).json({
      error: "Erro ao criar assinatura",
      detalhe: err.message // 🔥 isso te ajuda a debugar
    });
  }
});

module.exports = router;
