const axios = require("axios");

async function getMarketData() {
  try {

    const response = await axios.get(
      "https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT"
    );

    const data = {
      price: parseFloat(response.data.lastPrice),
      volume: parseFloat(response.data.volume),
      change: parseFloat(response.data.priceChangePercent)
    };

    console.log("DADOS DO MERCADO:", data);

    return data;

  } catch (error) {

    console.error("Erro ao buscar dados do mercado:", error.message);

  }
}

module.exports = { getMarketData };
