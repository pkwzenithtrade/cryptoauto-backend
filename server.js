require("dotenv").config();

console.log("JWT_SECRET:", process.env.JWT_SECRET || "NAO DEFINIDO");
console.log("INICIANDO SERVIDOR...");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("./src/routes/auth.routes");
app.use("/auth", authRoutes);
const authMiddleware = require("./src/middleware/auth.middleware");

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

    app.get("/", (req, res) => {
      res.send("Servidor funcionando");
    });

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });

  } catch (error) {
    console.error("Erro ao conectar no MongoDB:", error);
  }
}

startServer();
