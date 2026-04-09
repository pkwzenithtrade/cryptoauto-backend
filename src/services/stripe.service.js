const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// =====================================
// 🔥 CRIAR CHECKOUT
// =====================================
async function createCheckoutSession(email, plan) {

  let price = 2900; // centavos
  let name = "Plano Basic";

  if (plan === "pro") {
    price = 5900;
    name = "Plano Pro";
  }

  if (plan === "premium") {
    price = 9700;
    name = "Plano Premium";
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",

    customer_email: email,

    line_items: [
      {
        price_data: {
          currency: "brl",
          product_data: {
            name
          },
          unit_amount: price
        },
        quantity: 1
      }
    ],

    metadata: {
      email,
      plan
    },

    // ✅ CORREÇÃO REAL DO 404
    success_url: "https://cryptoauto-app.vercel.app?success=true",
    cancel_url: "https://cryptoauto-app.vercel.app?cancel=true"
  });

  return session.url;
}

module.exports = { createCheckoutSession };
