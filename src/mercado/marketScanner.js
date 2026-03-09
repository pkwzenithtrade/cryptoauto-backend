const axios = require("axios");

let history = {
  bitcoin: [],
  ethereum: [],
  solana: []
};

function calculateTrend(prices) {
  if (prices.length < 3) return "neutral";

  const last = prices[prices.length - 1];
  const prev = prices[prices.length - 2];

  if (last > prev) return "bullish";
  if (last < prev) return "bearish";

  return "neutral";
}

async function getMarketData() {
  try {

    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd",
      { timeout: 5000 }
    );

    const data = response.data;

    Object.keys(data).forEach((coin) => {
      history[coin].push(data[coin].usd);

      if (history[coin].length > 20) {
        history[coin].shift();
      }
    });

    const signals = {};

    Object.keys(history).forEach((coin) => {
      signals[coin] = {
        price: data[coin].usd,
        trend: calculateTrend(history[coin])
      };
    });

    return signals;

  } catch (error) {

    console.log("Erro ao buscar dados do mercado:", error.message);

    return {
      bitcoin: { price: 0, trend: "unknown" },
      ethereum: { price: 0, trend: "unknown" },
      solana: { price: 0, trend: "unknown" }
    };

  }
}

module.exports = {
  getMarketData
};
