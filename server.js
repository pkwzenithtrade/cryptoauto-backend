require("dotenv").config();

console.log("INICIANDO SERVIDOR...");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const { scanOpportunities } = require("./src/ai/opportunityHunter");
const { getMarketData } = require("./src/mercado/marketScanner");

const authRoutes = require("./src/routes/auth.routes");
const portfolioRoutes = require("./src/routes/portfolio.routes");
const authMiddleware = require("./src/middleware/auth.middleware");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/portfolio", portfolioRoutes);

let lastOpportunities = [];

app.get("/dashboard", authMiddleware, (req, res) => {
  res.json({
    message: "Acesso autorizado",
    userId: req.userId
  });
});

app.get("/health", (req,res)=>{
 res.json({status:"ok"})
})

const PORT = process.env.PORT || 3000;


// =====================================
// INICIALIZAÇÃO
// =====================================

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
    // ROTAS
    // =============================

    app.get("/", (req, res) => {
      res.send("Servidor funcionando");
    });

    app.get("/ai/opportunities", authMiddleware, (req, res) => {
      res.json(lastOpportunities);
    });



    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });

  } catch (error) {

    console.error("Erro ao conectar MongoDB:", error.message);

  }

}

startServer();
