const Binance = require("binance-api-node").default;

const client = Binance({
  apiKey: process.env.BINANCE_KEY,
  apiSecret: process.env.BINANCE_SECRET,
});

async function buyMarket(symbol, amountUSDT) {
  try {

    const price = await client.prices({ symbol });

    const quantity = (amountUSDT / price[symbol]).toFixed(5);

    const order = await client.order({
      symbol,
      side: "BUY",
      type: "MARKET",
      quantity
    });

    return order;

  } catch (err) {
    console.log("Erro BUY:", err.message);
    throw err;
  }
}

async function sellMarket(symbol, quantity) {
  try {

    const order = await client.order({
      symbol,
      side: "SELL",
      type: "MARKET",
      quantity
    });

    return order;

  } catch (err) {
    console.log("Erro SELL:", err.message);
    throw err;
  }
}

module.exports = {
  buyMarket,
  sellMarket
};
