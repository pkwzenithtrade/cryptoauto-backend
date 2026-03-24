require("dotenv").config();

console.log("🚀 INICIANDO SERVIDOR...");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");

// 🔥 MODELS
const User = require("./src/models/user.model");

// 🔥 SERVICES
const { scanOpportunities } = require("./src/ai/opportunityHunter");
const { sendMessage, formatOpportunities } = require("./src/services/telegram.service");

// 🔥 ROUTES
const authRoutes = require("./src/routes/auth.routes");
const portfolioRoutes = require("./src/routes/portfolio.routes");
const aiRoutes = require("./src/routes/ai.routes");
const paymentRoutes = require("./src/routes/payment.routes");
const webhookRoutes = require("./src/routes/webhook.routes");

// 🔐 MIDDLEWARE
const authMiddleware = require("./src/middleware/auth.middleware");

const app = express();

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
app.use("/webhook", webhookRoutes);

let lastOpportunities = [];

// =====================================
// 🔓 ROTA PÚBLICA (FREE)
// =====================================
app.get("/ai/opportunities-public", (req, res) => {

  const limited = lastOpportunities.slice(0, 2);

  res.json({
    message: "🔒 Versão gratuita limitada",
    data: limited,
    upgrade: "Acesse o VIP para sinais completos"
  });

});

// =====================================
// 🔐 VERIFICAR VIP
// =====================================
app.get("/user/vip", async (req, res) => {

  try {

    const email = req.query.email;

    if (!email) {
      return res.status(400).json({ error: "Email obrigatório" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ vip: false });
    }

    res.json({ vip: user.isVIP });

  } catch (error) {

    console.error("Erro ao verificar VIP:", error.message);

    res.status(500).json({ error: "Erro interno" });

  }

});

// =====================================
// 🧪 ROTAS BÁSICAS
// =====================================
app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/dashboard", authMiddleware, (req, res) => {
  res.json({
    message: "Acesso autorizado",
    userId: req.userId
  });
});

// =====================================
// 📊 TESTE MERCADO (KRAKEN)
// =====================================
app.get("/test-market", async (req, res) => {

  try {

    const response = await axios.get(
      "https://api.kraken.com/0/public/Ticker?pair=BTCUSD,ETHUSD"
    );

    const data = response.data.result;

    const market = [
      {
        coin: "BTC",
        price: parseFloat(data.XXBTZUSD.c[0])
      },
      {
        coin: "ETH",
        price: parseFloat(data.XETHZUSD.c[0])
      }
    ];

    res.json(market);

  } catch (error) {

    console.log("ERRO TEST MARKET:", error.message);

    res.status(500).json({
      error: "Erro ao acessar API Kraken",
      message: error.message
    });

  }

});

// =====================================
// 🔐 ROTA PRIVADA (VIP FUTURO)
// =====================================
app.get("/ai/opportunities", authMiddleware, (req, res) => {
  res.json(lastOpportunities);
});

// =====================================
// 🚀 START SERVER
// =====================================
const PORT = process.env.PORT || 3000;

async function startServer() {

  try {

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB conectado");

    console.log("🤖 AI Scanner iniciado");

    // PRIMEIRA EXECUÇÃO
    lastOpportunities = await scanOpportunities();

    // LOOP AUTOMÁTICO
    setInterval(async () => {

      try {

        const newData = await scanOpportunities();

        if (JSON.stringify(newData) !== JSON.stringify(lastOpportunities)) {

          lastOpportunities = newData;

          console.log("🚀 NOVAS OPORTUNIDADES:", newData);

          const message = formatOpportunities(newData);
          await sendMessage(message);

        }

      } catch (error) {

        console.error("Erro no scanner:", error.message);

      }

    }, 120000);

    app.listen(PORT, () => {
      console.log(`🔥 Servidor rodando na porta ${PORT}`);
    });

  } catch (error) {

    console.error("❌ Erro ao conectar MongoDB:", error.message);

  }

}

startServer();
