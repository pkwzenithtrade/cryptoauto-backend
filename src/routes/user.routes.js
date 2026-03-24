const express = require("express");
const router = express.Router();
const User = require("../models/User");

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
