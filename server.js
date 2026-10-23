
require("dotenv").config();

console.log("🚀 INICIANDO SERVIDOR CRYPTOAUTO AI...");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const User = require("./src/models/User");
const UserStats = require("./src/models/UserStats");

const { scanOpportunities } = require("./src/ai/opportunityHunter");
const {
  sendMessage,
  formatOpportunities
} = require("./src/services/telegram.service");

const {
  getBalance
} = require("./src/services/exchange.service");

const authRoutes = require("./src/routes/auth.routes");
const portfolioRoutes = require("./src/routes/portfolio.routes");
const aiRoutes = require("./src/routes/ai.routes");
const paymentRoutes = require("./src/routes/payment.routes");
const webhookRoutes = require("./src/routes/webhook.routes");
const userRoutes = require("./src/routes/user.routes");

const app = express();

app.use("/webhook", webhookRoutes);

app.use(cors());
app.use(express.json({ limit: "100kb" }));

app.use("/auth", authRoutes);
app.use("/portfolio", portfolioRoutes);
app.use("/ai", aiRoutes);
app.use("/payment", paymentRoutes);
app.use("/user", userRoutes);

let lastOpportunities = [];
let scannerReady = false;

// Negociação real permanece bloqueada nesta etapa.
const REAL_TRADING_ENABLED = false;

// =====================================
// NORMALIZAR O RESULTADO DOS SINAIS
// =====================================
function normalizeOpportunities(data) {
  if (!Array.isArray(data)) {
    return [];
  }

  // Não inventar oportunidades quando o scanner não encontra sinais.
  return data.filter((item) => {
    return (
      item &&
      typeof item === "object" &&
      typeof item.coin === "string" &&
      item.coin.trim().length > 0 &&
      Number.isFinite(Number(item.price)) &&
      Number(item.price) > 0 &&
      ["BUY", "SELL"].includes(
        String(item.signal || "").toUpperCase()
      )
    );
  });
}

// =====================================
// STATUS DO SERVIDOR
// =====================================
app.get("/", (req, res) => {
  res.json({
    service: "CryptoAuto AI",
    status: "online",
    tradingEnabled: REAL_TRADING_ENABLED,
    scannerReady,
    timestamp: new Date().toISOString()
  });
});

// =====================================
// OPORTUNIDADES PÚBLICAS
// Sem sinais inventados ou preços fixos.
// =====================================
app.get("/ai/opportunities-public", (req, res) => {
  res.json({
    data: lastOpportunities.slice(0, 2),
    scannerReady,
    message: lastOpportunities.length
      ? undefined
      : "Nenhuma oportunidade validada disponível."
  });
});

// =====================================
// OPORTUNIDADES DO USUÁRIO
// =====================================
app.get("/user/opportunities", async (req, res) => {
  try {
    if (!req.query.email) {
      return res.status(400).json({
        success: false,
        error: "Email obrigatório"
      });
    }

    res.json({
      data: lastOpportunities,
      scannerReady,
      message: lastOpportunities.length
        ? undefined
        : "Nenhuma oportunidade validada disponível."
    });
  } catch (err) {
    console.error("Erro opportunities:", err.message);

    return res.status(500).json({
      success: false,
      error: "Não foi possível consultar as oportunidades."
    });
  }
});

// =====================================
// SALDO DA CORRETORA
// =====================================
app.get("/user/balance", async (req, res) => {
  try {
    console.log("📡 Consultando saldo da corretora...");

    const balance = await getBalance();

    // Não apresentar valores inválidos como saldo confiável.
    if (
      typeof balance !== "number" ||
      !Number.isFinite(balance) ||
      balance < 0
    ) {
      return res.status(502).json({
        success: false,
        error: "A corretora não retornou um saldo válido."
      });
    }

    return res.json({
      success: true,
      balance,
      currency: "USDT",
      source: "exchange_service"
    });
  } catch (err) {
    console.error("Erro ao consultar saldo:", err.message);

    return res.status(502).json({
      success: false,
      error: "Não foi possível confirmar o saldo na corretora."
    });
  }
});

// =====================================
// EXECUÇÃO DE ORDENS
// BLOQUEADA ATÉ A VALIDAÇÃO COMPLETA
// =====================================
app.post("/trade/execute", async (req, res) => {
  if (!REAL_TRADING_ENABLED) {
    return res.status(503).json({
      success: false,
      tradingEnabled: false,
      error:
        "Negociação real temporariamente bloqueada. " +
        "Aguarde a validação da corretora, autenticação, " +
        "saldo e controles de risco."
    });
  }

  // Não habilitar esta rota apenas alterando a constante.
  // Antes disso, implementar autenticação obrigatória,
  // validação do mercado, saldo disponível, regras do par,
  // idempotência e confirmação da ordem na corretora.

  return res.status(503).json({
    success: false,
    error: "Execução ainda não implementada para produção."
  });
});

// =====================================
// VERIFICAR PLANO VIP
// Mantido para compatibilidade.
// =====================================
app.get("/auth/check-vip", async (req, res) => {
  try {
    const email = req.query.email;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email obrigatório"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        vip: false,
        plan: "free"
      });
    }

    return res.json({
      vip: Boolean(user.isVIP),
      plan: user.plan || "free"
    });
  } catch (err) {
    console.error("Erro ao verificar VIP:", err.message);

    return res.status(500).json({
      success: false,
      error: "Não foi possível verificar o plano."
    });
  }
});

// =====================================
// ATUALIZAR SINAIS
// =====================================
async function refreshOpportunities() {
  try {
    const result = await scanOpportunities();
    const newData = normalizeOpportunities(result);

    const changed =
      JSON.stringify(newData) !==
      JSON.stringify(lastOpportunities);

    lastOpportunities = newData;
    scannerReady = true;

    if (changed && newData.length > 0) {
      console.log("📊 Oportunidades atualizadas:", newData.length);

      try {
        const message = formatOpportunities(newData);
        await sendMessage(message);
      } catch (telegramError) {
        console.error(
          "Aviso Telegram:",
          telegramError.message
        );
      }
    }

    console.log(
      `🔎 Scanner concluído: ${newData.length} oportunidade(s).`
    );
  } catch (err) {
    scannerReady = false;

    // Não fabricar sinais quando a consulta falhar.
    lastOpportunities = [];

    console.error(
      "Erro ao atualizar oportunidades:",
      err.message
    );
  }
}

// =====================================
// INICIALIZAÇÃO
// =====================================
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI não configurada.");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB conectado");

    await refreshOpportunities();

    setInterval(() => {
      refreshOpportunities().catch((err) => {
        console.error("Erro no ciclo do scanner:", err.message);
      });
    }, 120000);

    app.listen(PORT, () => {
      console.log(`🔥 Servidor rodando na porta ${PORT}`);
      console.log("🛡️ Negociação real: BLOQUEADA");
    });
  } catch (err) {
    console.error("❌ Falha ao iniciar servidor:", err.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
