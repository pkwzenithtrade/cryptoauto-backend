const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { scanOpportunities } = require("../ai/opportunityHunter");

// 🔥 OPORTUNIDADES POR PLANO
router.get("/opportunities", async (req, res) => {

  try {

    const email = req.query.email;

    let limit = 2; // free padrão
    let plan = "free";

    if (email) {

      const user = await User.findOne({ email });

      if (user) {
        plan = user.plan;

        if (plan === "basic") limit = 4;
        if (plan === "pro") limit = 7;
        if (plan === "premium") limit = 100;
      }

    }

    const data = await scanOpportunities();

    res.json({
      plan,
      data: data.slice(0, limit)
    });

  } catch (error) {

    res.status(500).json({
      error: "Erro ao buscar oportunidades"
    });

  }

});

// 🔥 VERIFICAR STATUS VIP
router.get("/status", async (req, res) => {

  try {

    const email = req.query.email;

    if (!email) {
      return res.status(400).json({ error: "Email obrigatório" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        isVIP: false,
        plan: "free"
      });
    }

    res.json({
      isVIP: user.isVIP,
      plan: user.plan
    });

  } catch (error) {

    res.status(500).json({
      error: "Erro ao verificar usuário"
    });

  }

});

module.exports = router;
