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

    // 🔥 PADRONIZA EMAIL (CRÍTICO)
    email = email.toLowerCase().trim();

    let price = 2900;

    if (plan === "pro") price = 5900;
    if (plan === "premium") price = 9700;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],

      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: `Plano ${plan || "basic"} CryptoAuto AI`
            },
            unit_amount: price
          },
          quantity: 1
        }
      ],

      mode: "payment",

      success_url: "https://cryptoauto-backend.onrender.com",
cancel_url: "https://cryptoauto-backend.onrender.com",

      customer_email: email,

      // 🔥 METADATA CORRETO
      metadata: {
        email: email,
        plan: plan || "basic"
      }
    });

    console.log("💳 Checkout criado:", email);

    res.json({ url: session.url });

  } catch (err) {

    console.log("❌ ERRO STRIPE:", err.message);

    res.status(500).json({
      error: "Erro ao criar pagamento"
    });
  }

});

module.exports = router;
