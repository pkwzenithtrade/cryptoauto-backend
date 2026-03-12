const { getCryptoPrice } = require("../services/crypto.service");

// CONFIGURAÇÃO DAS MOEDAS E REGRAS
const COINS_CONFIG = {
  bitcoin: {
    label: "Bitcoin",
    buyBelow: 30000,
    sellAbove: 70000,
    confidenceBuy: 80,
    confidenceSell: 75
  },

  ethereum: {
    label: "Ethereum",
    buyBelow: 1500,
    sellAbove: 4000,
    confidenceBuy: 70,
    confidenceSell: 70
  },

  solana: {
    label: "Solana",
    buyBelow: 80,
    sellAbove: 250,
    confidenceBuy: 65,
    confidenceSell: 65
  },

  "avalanche-2": {
    label: "Avalanche",
    buyBelow: 20,
    sellAbove: 80,
    confidenceBuy: 60,
    confidenceSell: 60
  },

  chainlink: {
    label: "Chainlink",
    buyBelow: 10,
    sellAbove: 35,
    confidenceBuy: 65,
    confidenceSell: 65
  },

  "matic-network": {
    label: "Polygon",
    buyBelow: 0.5,
    sellAbove: 2,
    confidenceBuy: 60,
    confidenceSell: 60
  },

  polkadot: {
    label: "Polkadot",
    buyBelow: 5,
    sellAbove: 25,
    confidenceBuy: 60,
    confidenceSell: 60
  }
};

// FUNÇÃO PRINCIPAL
async function scanOpportunities() {

  try {

    const coins = Object.keys(COINS_CONFIG);
    let opportunities = [];

    for (const coin of coins) {

      const data = await getCryptoPrice(coin);

      if (!data || !data[coin]) continue;

      const price = data[coin]?.usd || 0;

      if (!price) continue;

      const rules = COINS_CONFIG[coin];

      let signal = "HOLD";
      let confidence = 50;
      let score = 0;

      // LÓGICA DE SINAL
      if (price < rules.buyBelow) {
        signal = "BUY";
        confidence = rules.confidenceBuy;

        score = ((rules.buyBelow - price) / rules.buyBelow) * 100;
      }

      if (price > rules.sellAbove) {
        signal = "SELL";
        confidence = rules.confidenceSell;

        score = ((price - rules.sellAbove) / rules.sellAbove) * 100;
      }

      opportunities.push({
        coin,
        name: rules.label,
        price,
        signal,
        confidence,
        score: Number(score.toFixed(2))
      });

    }

    // ORDENA AS MELHORES OPORTUNIDADES
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
