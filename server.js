require("dotenv").config();

console.log("🚀 INICIANDO SERVIDOR...");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// 🔥 MODELS
const User = require("./src/models/User");
const UserStats = require("./src/models/UserStats");

// 🔥 SERVICES
const { scanOpportunities } = require("./src/ai/opportunityHunter");
const { sendMessage, formatOpportunities } = require("./src/services/telegram.service");

// ✅ NOVO (BINANCE REAL)
const { buyMarket, sellMarket } = require("./src/services/exchange.service");

// 🔥 ROUTES
const authRoutes = require("./src/routes/auth.routes");
const portfolioRoutes = require("./src/routes/portfolio.routes");
const aiRoutes = require("./src/routes/ai.routes");
const paymentRoutes = require("./src/routes/payment.routes");
const webhookRoutes = require("./src/routes/webhook.routes");
const userRoutes = require("./src/routes/user.routes");

const app = express();

// =====================================
app.use("/webhook", webhookRoutes);

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/portfolio", portfolioRoutes);
app.use("/ai", aiRoutes);
app.use("/payment", paymentRoutes);
app.use("/user", userRoutes);

let lastOpportunities = [];

// =====================================
// FREE
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
// USER OPPORTUNITIES
// =====================================
app.get("/user/opportunities", async (req, res) => {

  try {

    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Email obrigatório" });
    }

    let data = lastOpportunities;

    if (!data || data.length === 0) {
      data = await scanOpportunities();
    }

    res.json({ data });

  } catch (err) {
    console.log("Erro opportunities:", err.message);
    res.status(500).json({ error: "Erro interno" });
  }

});

// =====================================
// BALANCE
// =====================================
app.get("/user/balance", async (req, res) => {

  try {
    const { email } = req.query;

    let stats = await UserStats.findOne({ email });

    if (!stats) {
      stats = new UserStats({ email, balance: 100 });
      await stats.save();
    }

    res.json({
      balance: stats.balance || 100
    });

  } catch {
    res.status(500).json({ error: "Erro saldo" });
  }

});

// =====================================
// 🚀 TRADE REAL COM BINANCE
// =====================================
app.post("/trade/execute", async (req, res) => {

  try {

    const { email, coin, action, amount } = req.body;

    if (!email || !coin || !action || !amount) {
      return res.status(400).json({ error: "Dados incompletos" });
    }

    let stats = await UserStats.findOne({ email });

    if (!stats) {
      stats = new UserStats({ email, balance: 100 });
    }

    if (stats.balance < amount) {
      return res.status(400).json({ error: "Saldo insuficiente" });
    }

    const symbol = coin + "USDT";

    let order;

    if (action === "BUY") {
      order = await buyMarket(symbol, amount);
    } else {
      // ⚠️ Aqui simplificado (você precisará guardar quantidade real depois)
      order = await sellMarket(symbol, amount);
    }

    // 🔥 lucro estimado simples (depois melhoramos)
    const profit = (Math.random() * 2 - 0.5) * amount;

    stats.balance += profit;

    stats.history.unshift({
      coin,
      profit: Number(profit.toFixed(2)),
      confidence: 90,
      time: new Date().toLocaleTimeString()
    });

    stats.history = stats.history.slice(0, 50);

    await stats.save();

    res.json({
      success: true,
      order,
      profit,
      newBalance: stats.balance
    });

  } catch (err) {
    console.log("Erro trade real:", err.message);

    res.status(500).json({
      error: "Erro ao executar trade real"
    });
  }

});

// =====================================
// CHECK VIP
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
app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
});

// =====================================
const PORT = process.env.PORT || 3000;

async function startServer() {

  try {

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB conectado");

    lastOpportunities = await scanOpportunities();

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
