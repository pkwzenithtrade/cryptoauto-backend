const { getCryptoPrice } = require("../services/crypto.service");

async function scanOpportunities() {

 try {

  const coins = [
   "bitcoin",
   "ethereum",
   "solana",
   "avalanche",
   "chainlink",
   "polygon",
   "polkadot"
  ];

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

   if (coin === "avalanche") {

 if (price < 20) {
  signal = "BUY";
  confidence = 60;
 }

 if (price > 80) {
  signal = "SELL";
  confidence = 60;
}

}

if (coin === "chainlink") {

 if (price < 10) {
  signal = "BUY";
  confidence = 65;
 }

 if (price > 35) {
  signal = "SELL";
  confidence = 65;
}

}

if (coin === "polygon") {

 if (price < 0.50) {
  signal = "BUY";
  confidence = 60;
 }

 if (price > 2) {
  signal = "SELL";
  confidence = 60;
}

}

if (coin === "polkadot") {

 if (price < 5) {
  signal = "BUY";
  confidence = 60;
 }

 if (price > 25) {
  signal = "SELL";
  confidence = 60;
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
