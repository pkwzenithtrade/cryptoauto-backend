let client = null;

try {

  const Binance = require("binance-api-node").default;

  // =====================================
  // 🔥 BINANCE SPOT REAL
  // =====================================
  if (
    process.env.BINANCE_API_KEY &&
    process.env.BINANCE_API_SECRET
  ) {

    client = Binance({

      apiKey: process.env.BINANCE_API_KEY,

      apiSecret: process.env.BINANCE_API_SECRET

    });

    console.log("💰 Binance SPOT conectado");

  } else {

    console.log(
      "⚠️ Binance NÃO configurado"
    );

  }

} catch (err) {

  console.log(
    "⚠️ Binance lib não instalada:",
    err.message
  );

}


// =====================================
// 💰 TESTE COMPLETO BINANCE
// =====================================
async function getBalance() {

  if (!client) {
    return 0;
  }

  try {

    console.log("📡 Buscando saldo Binance...");

    // =====================================
    // INFO DA CONTA
    // =====================================
    const account = await client.accountInfo();

    console.log(
      "✅ ACCOUNT INFO RECEBIDA"
    );

    console.log(
      "📊 BALANCES COMPLETO:",
      JSON.stringify(account.balances)
    );

    // =====================================
    // MOSTRA SOMENTE SALDOS > 0
    // =====================================
    const positiveBalances = account.balances.filter(
      (b) =>
        parseFloat(b.free) > 0 ||
        parseFloat(b.locked) > 0
    );

    console.log(
      "💰 SALDOS ENCONTRADOS:",
      positiveBalances
    );

    // =====================================
    // PROCURA USDT
    // =====================================
    const usdt = account.balances.find(
      (b) => b.asset === "USDT"
    );

    if (!usdt) {

      console.log("❌ USDT NÃO ENCONTRADO");

      return 0;

    }

    const balance = parseFloat(usdt.free);

    console.log("💰 USDT FREE:", balance);

    return balance;

  } catch (err) {

    console.log(
      "❌ ERRO COMPLETO BINANCE:"
    );

    console.log(err);

    return 0;
  }
}


// =====================================
// 🔎 PREÇO REAL SPOT
// =====================================
async function getPrice(symbol) {

  if (!client) {
    return 0;
  }

  try {

    const prices = await client.prices();

    return parseFloat(prices[symbol]);

  } catch (err) {

    console.log(
      "❌ Erro Binance price:",
      err.message
    );

    return 0;
  }
}

// =====================================
// 📏 AJUSTAR QUANTIDADE
// =====================================
function adjustQuantity(quantity) {

  return parseFloat(
    Number(quantity).toFixed(5)
  );

}

// =====================================
// 🤖 EXECUTAR TRADE REAL SPOT
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

    // 💰 QUANTIDADE
    const rawQuantity = amount / price;

    const quantity = adjustQuantity(rawQuantity);

    if (quantity <= 0) {

      return {

        success: false,

        error: "Quantidade inválida"

      };

    }

    console.log(
      `🚀 EXECUTANDO ${action} ${symbol} | Qty: ${quantity}`
    );

    // =====================================
    // 🚨 ORDEM REAL SPOT
    // =====================================
    const order = await client.order({

      symbol,

      side: action,

      type: "MARKET",

      quantity

    });

    console.log(
      "✅ ORDEM EXECUTADA:",
      order.orderId
    );

    return {

      success: true,

      mode: "SPOT",

      symbol,

      side: action,

      quantity,

      price,

      orderId: order.orderId,

      order

    };

  } catch (err) {

    console.log(
      "❌ Erro Binance trade:",
      err.message
    );

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
