const express = require("express");
const router = express.Router();
const Stripe = require("stripe");

const User = require("../models/User");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// =====================================
// 🔔 WEBHOOK STRIPE (SEGURO)
// =====================================
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {

      const sig = req.headers["stripe-signature"];

      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      // ✅ PAGAMENTO CONFIRMADO
      if (event.type === "checkout.session.completed") {

        const session = event.data.object;

        const email = session.metadata?.email;
        const plan = session.metadata?.plan;

        if (!email) return res.sendStatus(200);

        const user = await User.findOne({ email });

        if (!user) return res.sendStatus(200);

        user.isVIP = true;
        user.plan = plan || "premium";

        await user.save();

        console.log("🔥 VIP LIBERADO:", email);
      }

      res.sendStatus(200);

    } catch (err) {

      console.log("❌ ERRO WEBHOOK:", err.message);
      res.sendStatus(400);

    }
  }
);

module.exports = router;
