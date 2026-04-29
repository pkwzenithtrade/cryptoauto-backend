let client = null;

try {
  const Binance = require("binance-api-node").default;

  if (process.env.BINANCE_KEY && process.env.BINANCE_SECRET) {
    client = Binance({
      apiKey: process.env.BINANCE_KEY,
      apiSecret: process.env.BINANCE_SECRET,
    });

    console.log("✅ Binance conectado");
  } else {
    console.log("⚠️ Binance NÃO configurado (modo simulação)");
  }

} catch (err) {
  console.log("⚠️ Binance lib não instalada (modo simulação)");
}

// =====================================
// 💰 SALDO REAL
// =====================================
async function getBalance() {

  if (!client) {
    return 100; // fallback seguro
  }

  try {
    const account = await client.accountInfo();

    const usdt = account.balances.find(b => b.asset === "USDT");

    return usdt ? parseFloat(usdt.free) : 0;

  } catch (err) {
    console.log("Erro Binance balance:", err.message);
    return 0;
  }
}

// =====================================
// 🤖 EXECUTAR TRADE REAL
// =====================================
async function executeTrade({ coin, action, amount }) {

  if (!client) {
    return {
      success: false,
      message: "Binance não configurado"
    };
  }

  try {

    const symbol = coin + "USDT";

    const order = await client.order({
      symbol,
      side: action,
      type: "MARKET",
      quantity: amount,
    });

    return {
      success: true,
      order
    };

  } catch (err) {
    console.log("Erro Binance trade:", err.message);

    return {
      success: false,
      error: err.message
    };
  }
}

module.exports = {
  getBalance,
  executeTrade
};
