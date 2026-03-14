const { getMultiplePrices } = require("../services/crypto.service");

// CONFIGURAÇÃO DAS MOEDAS
const COINS_CONFIG = {
  bitcoin: { name: "Bitcoin", buyBelow: 30000, sellAbove: 70000 },
  ethereum: { name: "Ethereum", buyBelow: 1500, sellAbove: 4000 },
  solana: { name: "Solana", buyBelow: 80, sellAbove: 250 },
  "avalanche-2": { name: "Avalanche", buyBelow: 20, sellAbove: 80 },
  chainlink: { name: "Chainlink", buyBelow: 10, sellAbove: 35 },
  "matic-network": { name: "Polygon", buyBelow: 0.5, sellAbove: 2 },
  polkadot: { name: "Polkadot", buyBelow: 5, sellAbove: 25 }
};


// CALCULA SCORE
function calculateScore(price, buyBelow, sellAbove) {

  if (price < buyBelow) {
    return ((buyBelow - price) / buyBelow) * 100;
  }

  if (price > sellAbove) {
    return ((price - sellAbove) / sellAbove) * 100;
  }

  return 0;

}


// SCANNER DE OPORTUNIDADES
async function scanOpportunities() {

  try {

    const opportunities = [];

    const prices = await getMultiplePrices();

    const coins = Object.keys(COINS_CONFIG);

    for (const coin of coins) {

      try {

        const price = prices?.[coin]?.usd;

        if (!price) continue;

        const rules = COINS_CONFIG[coin];

        let signal = "HOLD";

        if (price < rules.buyBelow) signal = "BUY";
        if (price > rules.sellAbove) signal = "SELL";

        const score = calculateScore(
          price,
          rules.buyBelow,
          rules.sellAbove
        );

        if (score > 0) {

          opportunities.push({
            coin,
            name: rules.name,
            price,
            signal,
            confidence: Math.min(score + 50, 95),
            score: Number(score.toFixed(2))
          });

        }

      } catch (coinError) {

        console.log(`Erro ao analisar ${coin}:`, coinError.message);

      }

    }

    opportunities.sort((a, b) => b.score - a.score);

    return opportunities;

  } catch (error) {

    console.log("Erro no Opportunity Hunter:", error.message);

    return [];

  }

}

module.exports = {
  scanOpportunities
};
