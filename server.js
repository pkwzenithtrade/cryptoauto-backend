require("dotenv").config();

console.log("🚀 INICIANDO SERVIDOR...");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");

// 🔥 MODELS
const User = require("./src/models/User");
const UserStats = require("./models/UserStats.js");

// 🔥 SERVICES
const { scanOpportunities } = require("./src/ai/opportunityHunter");
const { sendMessage, formatOpportunities } = require("./src/services/telegram.service");

// 🔥 ROUTES
const authRoutes = require("./src/routes/auth.routes");
const portfolioRoutes = require("./src/routes/portfolio.routes");
const aiRoutes = require("./src/routes/ai.routes");
const paymentRoutes = require("./src/routes/payment.routes");
const webhookRoutes = require("./src/routes/webhook.routes");
const userRoutes = require("./src/routes/user.routes");

// 🔐 MIDDLEWARE
const authMiddleware = require("./src/middleware/auth.middleware");

const app = express();

// =====================================
// 🚨 STRIPE WEBHOOK
// =====================================
app.use("/webhook", webhookRoutes);

// =====================================
// 🔥 MIDDLEWARES
// =====================================
app.use(cors());
app.use(express.json());

// =====================================
// 🔥 ROTAS
// =====================================
app.use("/auth", authRoutes);
app.use("/portfolio", portfolioRoutes);
app.use("/ai", aiRoutes);
app.use("/payment", paymentRoutes);
app.use("/user", userRoutes);

let lastOpportunities = [];

// =====================================
// 🔓 FREE
// =====================================
app.get("/ai/opportunities-public", async (req, res) => {

  if (!lastOpportunities || lastOpportunities.length === 0) {

    return res.json({
      data: [
        { name: "Bitcoin", coin: "BTC", price: 65000, signal: "BUY", confidence: 91 },
        { name: "Ethereum", coin: "ETH", price: 3200, signal: "BUY", confidence: 88 }
      ]
    });

  }

  res.json({
    data: lastOpportunities.slice(0, 2)
  });

});

// =====================================
// 🔥 NOVO: USER OPPORTUNITIES (PRO)
// =====================================
app.get("/user/opportunities", async (req, res) => {

  try {

    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Email obrigatório" });
    }

    // usa cache (mais rápido)
    let data = lastOpportunities;

    if (!data || data.length === 0) {
      data = await scanOpportunities();
    }

    const best = data[0];

    if (best) {

      const profit = (best.confidence / 100) * 0.25 * 100;

      let userStats = await UserStats.findOne({ email });

      if (!userStats) {
        userStats = new UserStats({ email });
      }

      userStats.totalProfit += profit;

      userStats.history.unshift({
        coin: best.coin,
        profit: Number(profit.toFixed(2)),
        confidence: best.confidence,
        time: new Date().toLocaleTimeString()
      });

      userStats.history = userStats.history.slice(0, 50);

      await userStats.save();
    }

    res.json({ data });

  } catch (err) {
    console.log("Erro opportunities:", err.message);
    res.status(500).json({ error: "Erro interno" });
  }

});

// =====================================
// 🔥 NOVO: DASHBOARD USER
// =====================================
app.get("/user/stats", async (req, res) => {

  try {

    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Email obrigatório" });
    }

    const stats = await UserStats.findOne({ email });

    if (!stats) {
      return res.json({
        totalProfit: 0,
        history: []
      });
    }

    res.json({
      totalProfit: stats.totalProfit,
      history: stats.history
    });

  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar stats" });
  }

});

// =====================================
// 🔐 CHECK VIP
// =====================================
app.get("/auth/check-vip", async (req, res) => {

  try {

    const user = await User.findOne({ email: req.query.email });

    if (!user) {
      return res.json({ vip: false, plan: "free" });
    }

    res.json({
      vip: user.isVIP || false,
      plan: user.plan || "free"
    });

  } catch {
    res.json({ vip: false, plan: "free" });
  }

});

// =====================================
// 🧪 TESTE
// =====================================
app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
});

// =====================================
// ✅ STRIPE RETURN
// =====================================
app.get("/success", (req, res) => {
  res.send("Pagamento realizado com sucesso! Você já pode voltar para o app.");
});

app.get("/cancel", (req, res) => {
  res.send("Pagamento cancelado.");
});

// =====================================
// 🚀 START
// =====================================
const PORT = process.env.PORT || 3000;

async function startServer() {

  try {

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB conectado");

    // 🔥 PRIMEIRO LOAD
    lastOpportunities = await scanOpportunities();

    // 🔁 LOOP
    setInterval(async () => {

      const newData = await scanOpportunities();

      if (JSON.stringify(newData) !== JSON.stringify(lastOpportunities)) {

        lastOpportunities = newData;

        console.log("🚀 NOVOS SINAIS");

        const msg = formatOpportunities(newData);
        await sendMessage(msg);

      }

    }, 120000);

    app.listen(PORT, () => {
      console.log(`🔥 Servidor rodando na porta ${PORT}`);
    });

  } catch (err) {
    console.log("❌ ERRO:", err.message);
  }

}

startServer();

module.exports = app;
