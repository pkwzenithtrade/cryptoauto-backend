const express = require("express");
const router = express.Router();
const Stripe = require("stripe");

const User = require("../models/User");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// =====================================
// 🔔 WEBHOOK STRIPE (VERSÃO PROFISSIONAL)
// =====================================
router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {

    let event;

    try {
      const sig = req.headers["stripe-signature"];

      // 🔐 valida assinatura Stripe
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

    } catch (err) {
      console.log("❌ ERRO ASSINATURA STRIPE:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {

      console.log("📩 Evento recebido:", event.type);

      // =====================================
      // 💰 PAGAMENTO / ASSINATURA CONFIRMADA
      // =====================================
      if (
        event.type === "checkout.session.completed" ||
        event.type === "invoice.payment_succeeded"
      ) {

        const data = event.data.object;

        // 🔥 PEGA EMAIL EM TODOS OS CASOS (checkout + assinatura)
        let email =
          data.metadata?.email ||
          data.customer_email ||
          data.customer_details?.email;

        // 🔥 PEGA PLANO COM FALLBACK
        let plan = data.metadata?.plan || "premium";

        // 🔐 NORMALIZA EMAIL
        if (email) {
          email = email.toLowerCase().trim();
        }

        console.log("💳 Pagamento confirmado:", email, plan);

        if (!email) {
          console.log("❌ Email não encontrado");
          return res.sendStatus(200);
        }

        const user = await User.findOne({ email });

        if (!user) {
          console.log("❌ Usuário não encontrado:", email);
          return res.sendStatus(200);
        }

        // =====================================
        // 🔥 ATUALIZA VIP (SEM BUG)
        // =====================================
        user.isVIP = true;
        user.plan = plan;

        await user.save();

        console.log("🔥 VIP ATUALIZADO COM SUCESSO:", email, plan);
      }

      // =====================================
      // ❌ CANCELAMENTO DE ASSINATURA (IMPORTANTE)
      // =====================================
      if (event.type === "customer.subscription.deleted") {

        const subscription = event.data.object;

        const email = subscription.customer_email;

        if (!email) return res.sendStatus(200);

        const user = await User.findOne({ email });

        if (user) {
          user.isVIP = false;
          user.plan = "free";

          await user.save();

          console.log("❌ VIP CANCELADO:", email);
        }
      }

      res.sendStatus(200);

    } catch (err) {

      console.log("❌ ERRO PROCESSAMENTO:", err.message);
      res.sendStatus(500);
    }
  }
);

module.exports = router;
