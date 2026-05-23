let client = null;

try {

  const { RestClientV5 } = require("bybit-api");

  // =====================================
  // 🔥 BYBIT REAL
  // =====================================
  if (
    process.env.BYBIT_API_KEY &&
    process.env.BYBIT_API_SECRET
  ) {

    client = new RestClientV5({

      key: process.env.BYBIT_API_KEY,

      secret: process.env.BYBIT_API_SECRET,

      testnet: false

    });

    console.log("💰 BYBIT conectada");

  } else {

    console.log(
      "⚠️ BYBIT NÃO configurada"
    );

  }

} catch (err) {

  console.log(
    "⚠️ Bybit lib não instalada:",
    err.message
  );

}


// =====================================
// 💰 TESTE COMPLETO BYBIT
// =====================================
async function getBalance() {

  if (!client) {
    return 0;
  }

  try {

    console.log("📡 Buscando saldo Bybit...");

    // =====================================
    // INFO DA CONTA
    // =====================================
    const response =
      await client.getWalletBalance({

        accountType: "UNIFIED"

      });

    console.log(
      "✅ WALLET RECEBIDA"
    );

    const wallet =
      response.result.list[0];

    const coins = wallet.coin;

    console.log(
      "📊 COINS:",
      JSON.stringify(coins)
    );

    // =====================================
    // PROCURA USDT
    // =====================================
    const usdt = coins.find(
      (c) => c.coin === "USDT"
    );

    if (!usdt) {

      console.log(
        "❌ USDT NÃO ENCONTRADO"
      );

      return 0;

    }

    const balance = parseFloat(
      usdt.walletBalance || 0
    );

    console.log(
      "💰 USDT BALANCE:",
      balance
    );

    return balance;

  } catch (err) {

    console.log(
      "❌ ERRO COMPLETO BYBIT:"
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

    const response =
      await client.getTickers({

        category: "spot",

        symbol

      });

    const ticker =
      response.result.list[0];

    return parseFloat(
      ticker.lastPrice
    );

  } catch (err) {

    console.log(
      "❌ Erro Bybit price:",
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

      message: "Bybit não configurada"

    };

  }

  try {

    // 🔗 PAR
    const symbol = `${coin}USDT`;

    // 🔎 PREÇO
    const price =
      await getPrice(symbol);

    if (!price) {

      return {

        success: false,

        error: "Preço inválido"

      };

    }

    // 💰 QUANTIDADE
    const rawQuantity =
      amount / price;

    const quantity =
      adjustQuantity(rawQuantity);

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
    const order =
      await client.submitOrder({

        category: "spot",

        symbol,

        side:
          action === "BUY"
            ? "Buy"
            : "Sell",

        orderType: "Market",

        qty: quantity.toString(),

        marketUnit: "baseCoin"

      });

    console.log(
      "✅ ORDEM EXECUTADA"
    );

    return {

      success: true,

      mode: "SPOT",

      symbol,

      side: action,

      quantity,

      price,

      order

    };

  } catch (err) {

    console.log(
      "❌ Erro Bybit trade:",
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
