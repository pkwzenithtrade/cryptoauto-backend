const axios = require("axios");

async function analyzeMarket(limit = 50) {

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

  const coins = response.data;

  let opportunities = [];

  for (const coin of coins) {

   const price = coin.current_price || 0;
   const change24h = coin.price_change_percentage_24h || 0;
   const volume = coin.total_volume || 0;
   const marketCap = coin.market_cap || 0;

   let score = 0;
   let decision = "WAIT";
   let risk = "LOW";

   // MOMENTUM
   if (change24h > 4) score += 30;

   // VOLUME FORTE
   if (volume > 50000000) score += 20;

   // MARKET CAP SAUDÁVEL
   if (marketCap > 1000000000) score += 10;

   // QUEDA FORTE
   if (change24h < -6) score -= 20;

   if (score >= 50) {
    decision = "BUY";
    risk = "MEDIUM";
   }

   if (score >= 70) {
    decision = "STRONG BUY";
    risk = "HIGH";
   }

   if (score < 10) {
    decision = "WAIT";
   }

   opportunities.push({
    coin: coin.id,
    name: coin.name,
    symbol: coin.symbol,
    price,
    change24h,
    volume,
    marketCap,
    score,
    decision,
    risk
   });

  }

  opportunities.sort((a, b) => b.score - a.score);

  return opportunities;

 } catch (error) {

  console.log("Erro no Market Brain:", error.message);

  return [];

 }

}

module.exports = {
 analyzeMarket
};
