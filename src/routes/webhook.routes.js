const express = require("express");
const router = express.Router();
const Stripe = require("stripe");

const User = require("../models/User");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// =====================================
// 🔔 WEBHOOK STRIPE (VERSÃO FINAL PROFISSIONAL)
// =====================================
router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {

    let event;

    try {
      const sig = req.headers["stripe-signature"];

      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

    } catch (err) {
      console.log("❌ ERRO ASSINATURA:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {

      console.log("📩 Evento:", event.type);

      // =====================================
      // 💰 CHECKOUT CONCLUÍDO
      // =====================================
      if (event.type === "checkout.session.completed") {

        const session = event.data.object;

        let email =
          session.metadata?.email ||
          session.customer_email ||
          session.customer_details?.email;

        let plan = session.metadata?.plan || "premium";

        if (email) email = email.toLowerCase().trim();

        if (!email) return res.sendStatus(200);

        const user = await User.findOne({ email });

        if (!user) {
          console.log("❌ Usuário não encontrado:", email);
          return res.sendStatus(200);
        }

        // 🔥 GARANTE CUSTOMER ID
        let customerId = session.customer;

        if (!customerId && session.customer_details?.email) {
          const customers = await stripe.customers.list({
            email: session.customer_details.email,
            limit: 1
          });

          if (customers.data.length > 0) {
            customerId = customers.data[0].id;
          }
        }

        if (customerId) {
          user.stripeCustomerId = customerId;
        }

        user.isVIP = true;
        user.plan = plan;

        await user.save();

        console.log("🔥 VIP ATIVADO:", email, plan);
      }

      // =====================================
      // 🔁 RENOVAÇÃO
      // =====================================
      if (event.type === "invoice.payment_succeeded") {

        const invoice = event.data.object;
        const customerId = invoice.customer;

        if (!customerId) return res.sendStatus(200);

        const user = await User.findOne({
          stripeCustomerId: customerId
        });

        if (!user) {
          console.log("❌ Cliente não encontrado:", customerId);
          return res.sendStatus(200);
        }

        user.isVIP = true;

        await user.save();

        console.log("🔁 Renovado:", user.email);
      }

      // =====================================
      // ❌ CANCELAMENTO
      // =====================================
      if (event.type === "customer.subscription.deleted") {

        const subscription = event.data.object;
        const customerId = subscription.customer;

        if (!customerId) return res.sendStatus(200);

        const user = await User.findOne({
          stripeCustomerId: customerId
        });

        if (!user) return res.sendStatus(200);

        user.isVIP = false;
        user.plan = "free";

        await user.save();

        console.log("❌ Cancelado:", user.email);
      }

      res.sendStatus(200);

    } catch (err) {
      console.log("❌ ERRO PROCESSAMENTO:", err.message);
      res.sendStatus(500);
    }
  }
);

module.exports = router;
