const { getMultiplePrices } = require("../services/crypto.service");

// CONFIGURAÇÃO DAS MOEDAS
const COINS_CONFIG = {
  bitcoin: {
    name: "Bitcoin",
    buyBelow: 30000,
    sellAbove: 70000
  },

  ethereum: {
    name: "Ethereum",
    buyBelow: 1500,
    sellAbove: 4000
  },

  solana: {
    name: "Solana",
    buyBelow: 80,
    sellAbove: 250
  },

  "avalanche-2": {
    name: "Avalanche",
    buyBelow: 20,
    sellAbove: 80
  },

  chainlink: {
    name: "Chainlink",
    buyBelow: 10,
    sellAbove: 35
  },

  "matic-network": {
    name: "Polygon",
    buyBelow: 0.5,
    sellAbove: 2
  },

  polkadot: {
    name: "Polkadot",
    buyBelow: 5,
    sellAbove: 25
  }
};

// CALCULA SCORE DE OPORTUNIDADE
function calculateScore(price, buyBelow, sellAbove) {

  if (price < buyBelow) {
    return ((buyBelow - price) / buyBelow) * 100;
  }

  if (price > sellAbove) {
    return ((price - sellAbove) / sellAbove) * 100;
  }

  return 0;

}

// FUNÇÃO PRINCIPAL
async function scanOpportunities() {

  try {

    const opportunities = [];

    // BUSCA TODAS AS MOEDAS EM UMA ÚNICA CHAMADA
    const prices = await getMultiplePrices();

    const coins = Object.keys(COINS_CONFIG);

    for (const coin of coins) {

      try {

        const price = prices?.[coin]?.usd || 0;

        if (!price) continue;

        const rules = COINS_CONFIG[coin];

        let signal = "HOLD";
        let confidence = 50;

        if (price < rules.buyBelow) {
          signal = "BUY";
          confidence = 70;
        }

        if (price > rules.sellAbove) {
          signal = "SELL";
          confidence = 70;
        }

        const score = calculateScore(
          price,
          rules.buyBelow,
          rules.sellAbove
        );

        opportunities.push({
          coin,
          name: rules.name,
          price,
          signal,
          confidence,
          score: Number(score.toFixed(2))
        });

      } catch (coinError) {

        console.log(`Erro ao analisar ${coin}:`, coinError.message);

      }

    }

    // ORDENA MELHORES OPORTUNIDADES
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
