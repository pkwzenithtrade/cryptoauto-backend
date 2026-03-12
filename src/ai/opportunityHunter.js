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

   // lógica de sinais
if (coin === "bitcoin") {

 if (price < 30000) {
  signal = "BUY";
  confidence = 80;
 }

 if (price > 70000) {
  signal = "SELL";
  confidence = 75;
 }

}

if (coin === "ethereum") {

 if (price < 1500) {
  signal = "BUY";
  confidence = 70;
 }

 if (price > 4000) {
  signal = "SELL";
  confidence = 70;
 }

}

if (coin === "solana") {

 if (price < 80) {
  signal = "BUY";
  confidence = 65;
 }

 if (price > 250) {
  signal = "SELL";
  confidence = 65;
 }

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
