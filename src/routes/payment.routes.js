const express = require("express");
const router = express.Router();

const { createCheckoutSession } = require("../services/stripe.service");

// =====================================
// 💳 CHECKOUT STRIPE
// =====================================
router.get("/checkout", async (req, res) => {

  try {

    const { email, plan } = req.query;

    if (!email) {
      return res.status(400).json({
        error: "Email obrigatório"
      });
    }

    const url = await createCheckoutSession(email, plan || "basic");

    res.json({ url });

  } catch (error) {

    console.log(error.message);

    res.status(500).json({
      error: "Erro ao criar pagamento"
    });

  }

});

module.exports = router;
