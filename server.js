require("dotenv").config();

console.log("INICIANDO SERVIDOR...");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");

const { scanOpportunities } = require("./src/ai/opportunityHunter");

const authRoutes = require("./src/routes/auth.routes");
const portfolioRoutes = require("./src/routes/portfolio.routes");
const aiRoutes = require("./src/routes/ai.routes");

const authMiddleware = require("./src/middleware/auth.middleware");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/portfolio", portfolioRoutes);
app.use("/ai", aiRoutes);

let lastOpportunities = [];

// =====================================
// CONFIG TELEGRAM
// =====================================

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegramMessage(message) {
  try {
    if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) return;

    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        chat_id: TELEGRAM_CHAT_ID,
        text: message
      }
    );

  } catch (error) {
    console.log("Erro Telegram:", error.message);
  }
}

// =====================================
// ROTA PÚBLICA
// =====================================

app.get("/ai/opportunities-public", (req, res) => {
  res.json(lastOpportunities);
});

// =====================================
// ROTAS BÁSICAS
// =====================================

app.get("/", (req, res) => {
  res.send("Servidor funcionando");
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
// TESTE DE MERCADO
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
// ROTA PROTEGIDA
// =====================================

app.get("/ai/opportunities", authMiddleware, (req, res) => {
  res.json(lastOpportunities);
});

// =====================================
// INICIALIZAÇÃO
// =====================================

const PORT = process.env.PORT || 3000;

async function startServer() {

  try {

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB conectado");

    console.log("AI Scanner iniciado");

    lastOpportunities = await scanOpportunities();

    setInterval(async () => {

      try {

        const newData = await scanOpportunities();

        // 🔥 DETECTA MUDANÇA
        if (JSON.stringify(newData) !== JSON.stringify(lastOpportunities)) {

          console.log("NOVA OPORTUNIDADE DETECTADA");

          // 🔥 ENVIA PRO TELEGRAM
          for (const op of newData) {

            const message = `
🚀 NOVA OPORTUNIDADE

Moeda: ${op.name} (${op.coin})
Preço: $${op.price}
Sinal: ${op.signal}
Confiança: ${op.confidence}%
Score: ${op.score}
            `;

            await sendTelegramMessage(message);
          }

        }

        lastOpportunities = newData;

        console.log("OPORTUNIDADES IA:", lastOpportunities);

      } catch (error) {

        console.error("Erro no Opportunity Hunter:", error.message);

      }

    }, 120000);

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });

  } catch (error) {

    console.error("Erro ao conectar MongoDB:", error.message);

  }

}

startServer();
