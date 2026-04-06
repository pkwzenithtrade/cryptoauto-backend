const express = require("express");
const router = express.Router();
const Stripe = require("stripe");

const User = require("../models/User");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// =====================================
// 🔔 WEBHOOK STRIPE (SEGURO E FUNCIONAL)
// =====================================
router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {

    let event;

    try {

      const sig = req.headers["stripe-signature"];

      // 🔥 valida assinatura (ESSENCIAL)
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
      if (event.type === "checkout.session.completed") {

        const session = event.data.object;

        const email = session.metadata?.email;
        const plan = session.metadata?.plan;

        console.log("💳 Pagamento aprovado:", email, plan);

        if (!email) {
          console.log("❌ Email não encontrado no metadata");
          return res.sendStatus(200);
        }

        const user = await User.findOne({ email });

        if (!user) {
          console.log("❌ Usuário não encontrado:", email);
          return res.sendStatus(200);
        }

        // 🔥 LIBERA VIP
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
