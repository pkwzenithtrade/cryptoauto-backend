const axios = require("axios");

// CONFIGURAÇÃO DAS MOEDAS
const COINS_CONFIG = {
  BTC: { name: "Bitcoin", buyBelow: 30000, sellAbove: 70000 },
  ETH: { name: "Ethereum", buyBelow: 1500, sellAbove: 4000 },
  SOL: { name: "Solana", buyBelow: 80, sellAbove: 250 },
  LINK: { name: "Chainlink", buyBelow: 10, sellAbove: 35 },
  AVAX: { name: "Avalanche", buyBelow: 20, sellAbove: 80 },
  MATIC: { name: "Polygon", buyBelow: 0.5, sellAbove: 2 },
  DOT: { name: "Polkadot", buyBelow: 5, sellAbove: 25 }
};


// BUSCAR PREÇOS DA KRAKEN
async function getMarketPrices() {

  const response = await axios.get(
    "https://api.kraken.com/0/public/Ticker?pair=BTCUSD,ETHUSD"
  );

  const data = response.data.result;

  return {
    BTC: parseFloat(data.XXBTZUSD.c[0]),
    ETH: parseFloat(data.XETHZUSD.c[0])
  };

}


// CALCULAR SCORE
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

    const prices = await getMarketPrices();

    const opportunities = [];

    for (const coin in COINS_CONFIG) {

      const rules = COINS_CONFIG[coin];

      const price = prices[coin];

      if (!price) continue;

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
