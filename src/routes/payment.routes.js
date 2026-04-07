const express = require("express");
const router = express.Router();
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// =====================================
// 💰 CRIAR CHECKOUT STRIPE
// =====================================
router.get("/checkout", async (req, res) => {

  try {

    let { email, plan } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Email obrigatório" });
    }

    // 🔥 NORMALIZA EMAIL
    email = email.toLowerCase().trim();

    // 🔥 DEFINE PLANO PADRÃO
    plan = plan || "basic";

    // 💰 PREÇOS
    let price = 2900; // R$29

    if (plan === "pro") price = 5900;
    if (plan === "premium") price = 9700;

    // =====================================
    // 🔥 CRIA SESSÃO STRIPE
    // =====================================
    const session = await stripe.checkout.sessions.create({

      payment_method_types: ["card"],

      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: `Plano ${plan.toUpperCase()} CryptoAuto AI`
            },
            unit_amount: price
          },
          quantity: 1
        }
      ],

      mode: "payment",

      // 🔥 URLs CORRETAS (ESSENCIAL)
      success_url: "https://cryptoauto-app.vercel.app?success=true",
      cancel_url: "https://cryptoauto-app.vercel.app?cancel=true",

      customer_email: email,

      // 🔥 METADATA (USADO NO WEBHOOK)
      metadata: {
        email: email,
        plan: plan
      }

    });

    console.log("💳 Checkout criado:", email, plan);

    res.json({ url: session.url });

  } catch (err) {

    console.log("❌ ERRO STRIPE:", err.message);

    res.status(500).json({
      error: "Erro ao criar pagamento"
    });

  }

});

module.exports = router;
