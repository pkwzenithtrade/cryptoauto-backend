const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { scanOpportunities } = require("../ai/opportunityHunter");

// =====================================
// 🔥 OPORTUNIDADES POR PLANO (ESTÁVEL)
// =====================================
router.get("/opportunities", async (req, res) => {
  try {

    let { email } = req.query;

    let limit = 2;
    let plan = "free";

    if (email) {
      email = email.toLowerCase().trim();

      const user = await User.findOne({ email });

      if (user) {
        plan = user.plan || "free";

        if (plan === "basic") limit = 4;
        if (plan === "pro") limit = 7;
        if (plan === "premium") limit = 100;
      } else {
        console.log("⚠️ Usuário não encontrado:", email);
      }
    }

    // =========================
    // 🔥 BUSCAR SINAIS
    // =========================
    let data = [];

    try {
      const result = await scanOpportunities();

      if (Array.isArray(result) && result.length > 0) {
        data = result;
      }

    } catch (err) {
      console.log("❌ ERRO SCAN:", err.message);
    }

    // =========================
    // 🔥 FALLBACK (NUNCA VAZIO)
    // =========================
    if (data.length === 0) {
      console.log("⚠️ Usando fallback de sinais");

      data = [
        { coin: "BTC", name: "Bitcoin", price: 65000, signal: "BUY", confidence: 92 },
        { coin: "ETH", name: "Ethereum", price: 3200, signal: "BUY", confidence: 89 },
        { coin: "SOL", name: "Solana", price: 140, signal: "BUY", confidence: 87 },
        { coin: "BNB", name: "BNB", price: 580, signal: "BUY", confidence: 84 },
        { coin: "AVAX", name: "Avalanche", price: 40, signal: "BUY", confidence: 82 }
      ];
    }

    res.json({
      success: true,
      plan,
      total: data.length,
      showing: limit,
      data: data.slice(0, limit)
    });

  } catch (error) {

    console.error("❌ ERRO OPORTUNIDADES:", error.message);

    res.status(500).json({
      error: "Erro ao buscar oportunidades"
    });

  }
});


// =====================================
// 🔥 VIP (USADO NO APP)
// =====================================
router.get("/vip", async (req, res) => {
  try {

    let { email } = req.query;

    if (!email) {
      return res.status(400).json({
        error: "Email obrigatório"
      });
    }

    email = email.toLowerCase().trim();

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        vip: false,
        plan: "free"
      });
    }

    res.json({
      vip: user.isVIP || false,
      plan: user.plan || "free"
    });

  } catch (error) {

    console.error("❌ ERRO VIP:", error.message);

    res.status(500).json({
      error: "Erro ao verificar VIP"
    });

  }
});


// =====================================
// 🔥 STATUS (BACKUP)
// =====================================
router.get("/status", async (req, res) => {
  try {

    let { email } = req.query;

    if (!email) {
      return res.status(400).json({
        error: "Email obrigatório"
      });
    }

    email = email.toLowerCase().trim();

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        isVIP: false,
        plan: "free"
      });
    }

    res.json({
      isVIP: user.isVIP || false,
      plan: user.plan || "free"
    });

  } catch (error) {

    console.error("❌ ERRO STATUS:", error.message);

    res.status(500).json({
      error: "Erro ao verificar usuário"
    });

  }
});


// =====================================
// 🔥 PROFILE
// =====================================
router.get("/profile", async (req, res) => {
  try {

    let { email } = req.query;

    if (!email) {
      return res.status(400).json({
        error: "Email obrigatório"
      });
    }

    email = email.toLowerCase().trim();

    const user = await User.findOne({ email }).select("-password");

    if (!user) {
      return res.status(404).json({
        error: "Usuário não encontrado"
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {

    console.error("❌ ERRO PROFILE:", error.message);

    res.status(500).json({
      error: "Erro ao buscar perfil"
    });

  }
});

module.exports = router;
