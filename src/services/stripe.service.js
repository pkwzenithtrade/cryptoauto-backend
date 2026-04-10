const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// =====================================
// 💳 PLANOS VIA ENV (IGUAL AO BACKEND)
// =====================================
const PLANS = {
  basic: process.env.STRIPE_PRICE_BASIC,
  pro: process.env.STRIPE_PRICE_PRO,
  premium: process.env.STRIPE_PRICE_PREMIUM
};

// =====================================
// 🔥 CRIAR CHECKOUT (CORRIGIDO)
// =====================================
async function createCheckoutSession(email, plan = "basic") {

  const priceId = PLANS[plan];

  if (!priceId) {
    throw new Error("Plano inválido ou não configurado");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",

    payment_method_types: ["card"],

    customer_email: email,

    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],

    metadata: {
      email,
      plan
    },

    // 🔥 teste temporário (depois volta pro Vercel)
    success_url: "https://google.com",
    cancel_url: "https://google.com"
  }); // ✅ FECHAMENTO QUE FALTAVA

  return session.url;
}

module.exports = { createCheckoutSession };
