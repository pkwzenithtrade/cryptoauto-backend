require("dotenv").config();

console.log("INICIANDO SERVIDOR...");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");

const { scanOpportunities } = require("./src/ai/opportunityHunter");
const { getMarketData } = require("./src/mercado/marketScanner");

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
// ROTA PÚBLICA (SEM TOKEN)
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
// TESTE DE API DO MERCADO
// =====================================

app.get("/test-market", async (req, res) => {

  try {

    const axios = require("axios");

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
// ROTA DE OPORTUNIDADES IA
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


    // =============================
    // IA SCANNER
    // =============================

    console.log("AI Scanner iniciado");

    lastOpportunities = await scanOpportunities();

    setInterval(async () => {

      try {

        lastOpportunities = await scanOpportunities();

        console.log("OPORTUNIDADES IA:", lastOpportunities);

      } catch (error) {

        console.error("Erro no Opportunity Hunter:", error.message);

      }

    }, 120000);


    // =============================
    // MARKET SCANNER
    // =============================

    setInterval(async () => {

      try {

        const market = await getMarketData();

        console.log("Mercado atualizado:", market);

      } catch (error) {

        console.error("Erro ao atualizar mercado:", error.message);

      }

    }, 180000);


    // =============================
    // START SERVIDOR
    // =============================

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });

  } catch (error) {

    console.error("Erro ao conectar MongoDB:", error.message);

  }

}

startServer();
