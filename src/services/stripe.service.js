const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// =====================================
// 💳 PLANOS VIA ENV
// =====================================
const PLANS = {
  basic: process.env.STRIPE_PRICE_BASIC,
  pro: process.env.STRIPE_PRICE_PRO,
  premium: process.env.STRIPE_PRICE_PREMIUM
};

// =====================================
// 🔥 CRIAR CHECKOUT
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

    success_url: "https://cryptoauto-backend.vercel.app/success",
    cancel_url: "https://cryptoauto-backend.vercel.app/cancel"
  });

  return session.url;
}

module.exports = { createCheckoutSession };
