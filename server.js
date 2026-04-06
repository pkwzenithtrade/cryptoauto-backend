require("dotenv").config();

console.log("🚀 INICIANDO SERVIDOR...");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");

// 🔥 MODELS
const User = require("./src/models/User");

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
// 🚨 STRIPE WEBHOOK (ANTES DO JSON)
// =====================================
app.use("/webhook", express.raw({ type: "application/json" }));
app.use("/webhook", webhookRoutes);

// =====================================
// 🔥 MIDDLEWARES NORMAIS
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
// 🔓 FREE (GARANTE QUE SEMPRE TEM DADO)
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
// 🔐 CHECK VIP (PADRÃO DO APP)
// =====================================
app.get("/auth/check-vip", async (req, res) => {

  try {

    const user = await User.findOne({ email: req.query.email });

    if (!user) {
      return res.json({ isVIP: false, plan: "free" });
    }

    res.json({
      isVIP: user.isVIP || false,
      plan: user.plan || "free"
    });

  } catch {
    res.json({ isVIP: false });
  }

});

// =====================================
// 🧪 TESTE
// =====================================
app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
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
