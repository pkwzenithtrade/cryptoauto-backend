const express = require("express");
const router = express.Router();
const Stripe = require("stripe");

const User = require("../models/User");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// =====================================
// 🔔 WEBHOOK STRIPE
// =====================================
router.post("/webhook", async (req, res) => {

  try {

    const event = req.body;

    if (event.type === "checkout.session.completed") {

      const session = event.data.object;

      const email = session.metadata.email;
      const plan = session.metadata.plan;

      const user = await User.findOne({ email });

      if (!user) return res.sendStatus(200);

      user.isVIP = true;
      user.plan = plan;

      await user.save();

      console.log("🔥 VIP LIBERADO:", email);

    }

    res.sendStatus(200);

  } catch (err) {

    console.log(err.message);
    res.sendStatus(500);

  }

});

module.exports = router;
