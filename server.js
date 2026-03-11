require("dotenv").config();

console.log("JWT_SECRET:", process.env.JWT_SECRET || "NAO DEFINIDO");
console.log("INICIANDO SERVIDOR...");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { getMarketData } = require("./src/mercado/marketScanner");
const app = express();
let lastOpportunities = []
const { scanOpportunities } = require("./src/ai/opportunityHunter");
const authRoutes = require("./src/routes/auth.routes");
const portfolioRoutes = require("./src/routes/portfolio.routes");
const authMiddleware = require("./src/middleware/auth.middleware");

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/portfolio", portfolioRoutes);

app.get("/dashboard", authMiddleware, (req, res) => {
  res.json({
    message: "Acesso autorizado",
    userId: req.userId
  });
});
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB conectado");

// Scanner de oportunidades IA
    console.log("AI Scanner iniciado")
    lastOpportunities = await scanOpportunities()
setInterval(async () => {
  try {

    lastOpportunities = await scanOpportunities()

    console.log("OPORTUNIDADES IA:", lastOpportunities)

  } catch (error) {

      console.error("Erro no Opportunity Hunter:", error)

  }
}, 20000)
    
// Scanner de mercado
setInterval(async () => {
  try {

    const market = await getMarketData()

    console.log("Mercado atualizado:", market)

  } catch (error) {

    console.error("Erro ao atualizar mercado:", error)

  }
}, 120000)
    
    app.get("/", (req, res) => {
      res.send("Servidor funcionando");
    });
app.get("/ai/opportunities", (req, res) => {
  res.json(lastOpportunities)
});
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });

  } catch (error) {
    console.error("Erro ao conectar no MongoDB:", error);
  }
}

startServer();
