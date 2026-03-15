const axios = require("axios");

async function scanMarket(limit = 100) {

  try {

    const response = await axios.get(
      "https://api.coingecko.com/api/v3/coins/markets",
      {
        params: {
          vs_currency: "usd",
          order: "market_cap_desc",
          per_page: limit,
          page: 1,
          sparkline: false
        }
      }
    );

    const coins = response.data || [];

    let opportunities = [];

    for (const coin of coins) {

      const price = coin.current_price || 0;
      const change24h = coin.price_change_percentage_24h || 0;
      const volume = coin.total_volume || 0;
      const marketCap = coin.market_cap || 0;

      let signal = "HOLD";
      let confidence = 50;
      let score = 0;

      // DETECÇÃO DE POSSÍVEL PUMP
      if (change24h > 4 && volume > 50000000) {

        signal = "BUY";
        confidence = 80;

        score = change24h + (volume / 1000000000);

      }

      // DETECÇÃO DE QUEDA FORTE
      if (change24h < -6) {

        signal = "SELL";
        confidence = 75;

        score = Math.abs(change24h);

      }

      score = Math.min(score, 100);

      opportunities.push({
        coin: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        price,
        marketCap,
        volume,
        change24h,
        signal,
        confidence,
        score: Number(score.toFixed(2))
      });

    }

    // RANKING DAS MELHORES OPORTUNIDADES
    opportunities.sort((a, b) => b.score - a.score);

    return opportunities;

  } catch (error) {

    console.log("Erro no Market Radar:", error.message);

    return [];

  }

}

module.exports = {
  scanMarket
};
