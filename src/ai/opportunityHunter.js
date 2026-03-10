const { getCryptoPrice } = require("../services/crypto.service");

async function scanOpportunities() {

 try {

  const coins = ["bitcoin","ethereum","solana"];

  let opportunities = [];

  for (const coin of coins) {

   const data = await getCryptoPrice(coin);

   const price = data[coin]?.usd || 0;

   if (!price) continue;

   let signal = "HOLD";
   let confidence = 50;

   // lógica simples inicial
   if (price < 30000 && coin === "bitcoin") {
    signal = "BUY";
    confidence = 80;
   }

   if (price > 70000 && coin === "bitcoin") {
    signal = "SELL";
    confidence = 75;
   }

   opportunities.push({
    coin,
    price,
    signal,
    confidence
   });

  }

  return opportunities;

 } catch (error) {

  console.log("Erro no Opportunity Hunter:", error.message);

  return [];

 }

}

module.exports = {
 scanOpportunities
};
