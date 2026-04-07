const express = require("express");
const router = express.Router();
const Stripe = require("stripe");

const User = require("../models/User");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// =====================================
// 🔔 WEBHOOK STRIPE (100% FUNCIONAL)
// =====================================
router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {

    let event;

    try {

      const sig = req.headers["stripe-signature"];

      // 🔐 valida assinatura
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
      // 💰 PAGAMENTO CONFIRMADO
      // =====================================
      if (
  event.type === "checkout.session.completed" ||
  event.type === "invoice.payment_succeeded"
) {

        const session = event.data.object;

        // 🔥 pega email com fallback (CRÍTICO)
        let email =
          session.metadata?.email ||
          session.customer_email ||
          session.customer_details?.email;

        const plan = session.metadata?.plan;

        // 🔥 padroniza email
        if (email) {
          email = email.toLowerCase().trim();
        }

        console.log("💳 Pagamento aprovado:", email, plan);

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
        // 🔥 LIBERA VIP
        // =====================================
        user.isVIP = true;
        user.plan = plan || "premium";

        await user.save();

        console.log("🔥 VIP LIBERADO COM SUCESSO:", email);
      }

      res.sendStatus(200);

    } catch (err) {

      console.log("❌ ERRO PROCESSAMENTO:", err.message);
      res.sendStatus(500);
    }
  }
);

module.exports = router;
