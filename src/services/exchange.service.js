
const Binance = require("binance-api-node").default;

const apiKey = process.env.BINANCE_API_KEY;
const apiSecret = process.env.BINANCE_API_SECRET;

const testnet = process.env.BINANCE_TESTNET === "true";

const client = Binance({
  ...(apiKey ? { apiKey } : {}),
  ...(apiSecret ? { apiSecret } : {}),
  ...(testnet
    ? { httpBase: "https://testnet.binance.vision" }
    : {})
});

console.log(
  `📡 Binance Spot inicializada | Modo: ${
    testnet ? "TESTNET" : "PRODUÇÃO - ORDENS BLOQUEADAS"
  }`
);

// =====================================
// VALIDAR SÍMBOLO
// =====================================
function validateSymbol(symbol) {
  if (
    typeof symbol !== "string" ||
    !/^[A-Z0-9]{5,20}$/.test(symbol)
  ) {
    throw new Error("Símbolo de mercado inválido.");
  }

  return symbol;
}

// =====================================
// TESTAR CONECTIVIDADE
// =====================================
async function testConnection() {
  try {
    await client.ping();

    return {
      success: true,
      exchange: "Binance",
      mode: testnet ? "TESTNET" : "PRODUCTION",
      message: "API pública acessível."
    };
  } catch (err) {
    console.error(
      "❌ Falha de conexão Binance:",
      err.message
    );

    throw new Error(
      `Não foi possível acessar a API da Binance: ${err.message}`
    );
  }
}

// =====================================
// CONSULTAR SALDO USDT
// =====================================
async function getBalance() {
  if (!apiKey || !apiSecret) {
    throw new Error(
      "Credenciais Binance ausentes. Configure BINANCE_API_KEY e BINANCE_API_SECRET."
    );
  }

  try {
    console.log("📡 Consultando saldo Binance...");

    const account = await client.accountInfo();

    if (
      !account ||
      !Array.isArray(account.balances)
    ) {
      throw new Error(
        "Resposta de saldo da Binance inválida."
      );
    }

    const usdt = account.balances.find(
      (item) => item.asset === "USDT"
    );

    if (!usdt) {
      throw new Error(
        "Ativo USDT não encontrado na resposta da conta."
      );
    }

    const free = Number(usdt.free);

    if (!Number.isFinite(free) || free < 0) {
      throw new Error(
        "A Binance retornou um saldo USDT inválido."
      );
    }

    console.log("✅ Consulta de saldo concluída.");

    // Retorna o saldo livre, sem registrar chaves
    // ou imprimir os dados completos da conta.
    return free;
  } catch (err) {
    console.error(
      "❌ Falha ao consultar saldo Binance:",
      err.message
    );

    throw new Error(
      `Falha na consulta de saldo Binance: ${err.message}`
    );
  }
}

// =====================================
// CONSULTAR PREÇO SPOT
// =====================================
async function getPrice(symbol) {
  validateSymbol(symbol);

  try {
    const prices = await client.prices({
      symbol
    });

    const price = Number(prices[symbol]);

    if (!Number.isFinite(price) || price <= 0) {
      throw new Error(
        `Preço indisponível para ${symbol}.`
      );
    }

    return price;
  } catch (err) {
    console.error(
      `❌ Falha ao consultar ${symbol}:`,
      err.message
    );

    throw new Error(
      `Falha ao consultar preço de ${symbol}: ${err.message}`
    );
  }
}

// =====================================
// ORDENS REAIS DESABILITADAS
// =====================================
async function executeTrade({ coin, action, amount }) {
  return {
    success: false,
    tradingEnabled: false,
    mode: testnet ? "TESTNET" : "PRODUCTION",
    error:
      "Ordens bloqueadas durante a validação. " +
      "Nenhuma ordem foi enviada à Binance."
  };
}

module.exports = {
  testConnection,
  getBalance,
  getPrice,
  executeTrade
};
    
