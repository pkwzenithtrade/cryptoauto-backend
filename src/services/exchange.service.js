let client = null;

try {

  const Binance = require("binance-api-node").default;

  // =====================================
  // 🔥 BINANCE REAL / TESTNET
  // =====================================
  if (process.env.BINANCE_API_KEY && process.env.BINANCE_API_SECRET) {

    client = Binance({
      apiKey: process.env.BINANCE_API_KEY,
      apiSecret: process.env.BINANCE_API_SECRET,

      futures: true,

      httpFutures:
        process.env.BINANCE_TESTNET === "true"
          ? "https://testnet.binancefuture.com"
          : undefined
    });

    console.log(
      process.env.BINANCE_TESTNET === "true"
        ? "🧪 Binance TESTNET conectado"
        : "💰 Binance REAL conectado"
    );

  } else {

    console.log("⚠️ Binance NÃO configurado (modo simulação)");

  }

} catch (err) {

  console.log("⚠️ Binance lib não instalada:", err.message);

}

// =====================================
// 💰 SALDO FUTURES
// =====================================
async function getBalance() {

  if (!client) {
    return 100;
  }

  try {

    const balances = await client.futuresBalance();

    const usdt = balances.find(
      (b) => b.asset === "USDT"
    );

    return usdt ? parseFloat(usdt.balance) : 0;

  } catch (err) {

    console.log("Erro Binance balance:", err.message);

    return 0;
  }
}

// =====================================
// 🔎 PREÇO REAL
// =====================================
async function getPrice(symbol) {

  if (!client) {
    return 0;
  }

  try {

    const prices = await client.futuresPrices({
      symbol
    });

    return parseFloat(prices[symbol]);

  } catch (err) {

    console.log("Erro Binance price:", err.message);

    return 0;
  }
}

// =====================================
// 📏 AJUSTAR QUANTIDADE
// =====================================
function adjustQuantity(quantity) {

  return Number(quantity).toFixed(3);

}

// =====================================
// 🤖 EXECUTAR TRADE REAL
// =====================================
async function executeTrade({

  coin,
  action,
  amount

}) {

  if (!client) {

    return {
      success: false,
      message: "Binance não configurado"
    };

  }

  try {

    // 🔗 PAR
    const symbol = `${coin}USDT`;

    // 🔎 PREÇO
    const price = await getPrice(symbol);

    if (!price) {

      return {
        success: false,
        error: "Preço inválido"
      };

    }

    // 💰 QUANTIDADE BASEADA EM USDT
    const rawQuantity = amount / price;

    const quantity = adjustQuantity(rawQuantity);

    // =====================================
    // 🚨 ORDEM REAL FUTURES
    // =====================================
    const order = await client.futuresOrder({

      symbol,

      side: action, // BUY / SELL

      type: "MARKET",

      quantity

    });

    console.log("✅ ORDEM EXECUTADA:", order.orderId);

    return {

      success: true,

      mode:
        process.env.BINANCE_TESTNET === "true"
          ? "TESTNET"
          : "REAL",

      symbol,

      side: action,

      quantity,

      price,

      orderId: order.orderId,

      order

    };

  } catch (err) {

    console.log("❌ Erro Binance trade:", err.message);

    return {

      success: false,

      error: err.message

    };

  }

}

module.exports = {

  getBalance,

  getPrice,

  executeTrade

};
