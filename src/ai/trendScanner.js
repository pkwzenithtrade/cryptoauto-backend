const axios = require("axios");

async function scanMarketTrends(limit = 30) {

 try {

  const url = "https://api.coingecko.com/api/v3/coins/markets";

  const response = await axios.get(url, {
   params: {
    vs_currency: "usd",
    order: "market_cap_desc",
    per_page: limit,
    page: 1,
    sparkline: false
   }
  });

  const coins = response.data;

  let opportunities = [];

  for (const coin of coins) {

   const change24h = coin.price_change_percentage_24h || 0;
   const volume = coin.total_volume || 0;

   let signal = "HOLD";
   let confidence = 50;
   let score = 0;

   // DETECÇÃO DE SUBIDA
   if (change24h > 3 && volume > 100000000) {

    signal = "BUY";
    confidence = 75;
    score = change24h;

   }

   // DETECÇÃO DE QUEDA
   if (change24h < -5) {

    signal = "SELL";
    confidence = 70;
    score = Math.abs(change24h);

   }

   opportunities.push({
    coin: coin.id,
    name: coin.name,
    symbol: coin.symbol,
    price: coin.current_price,
    change24h,
    volume,
    signal,
    confidence,
    score: Number(score.toFixed(2))
   });

  }

  // RANKING DAS MELHORES OPORTUNIDADES
  opportunities.sort((a, b) => b.score - a.score);

  return opportunities;

 } catch (error) {

  console.log("Erro no Trend Scanner:", error.message);

  return [];

 }

}

module.exports = {
 scanMarketTrends
};
