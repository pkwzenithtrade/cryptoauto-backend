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


// BUSCAR PREÇOS DA KRAKEN (COM PROTEÇÃO)
async function getMarketPrices() {
  try {
    const response = await axios.get(
      "https://api.kraken.com/0/public/Ticker?pair=BTCUSD,ETHUSD,SOLUSD,LINKUSD,AVAXUSD,MATICUSD,DOTUSD"
    );

    const data = response.data?.result || {};

    return {
      BTC: Number(data.XXBTZUSD?.c?.[0]) || 0,
      ETH: Number(data.XETHZUSD?.c?.[0]) || 0,
      SOL: Number(data.SOLUSD?.c?.[0]) || 0,
      LINK: Number(data.LINKUSD?.c?.[0]) || 0,
      AVAX: Number(data.AVAXUSD?.c?.[0]) || 0,
      MATIC: Number(data.MATICUSD?.c?.[0]) || 0,
      DOT: Number(data.DOTUSD?.c?.[0]) || 0
    };

  } catch (error) {
    console.log("Erro ao buscar preços:", error.message);

    return {
      BTC: 0,
      ETH: 0,
      SOL: 0,
      LINK: 0,
      AVAX: 0,
      MATIC: 0,
      DOT: 0
    };
  }
}


// CALCULAR SCORE
function calculateScore(price, buyBelow, sellAbove) {

  if (!price || isNaN(price)) return 0;

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

    // 🔥 DETECTAR TENDÊNCIA DO BTC
    const btcPrice = prices.BTC;
    const btcRules = COINS_CONFIG.BTC;

    let btcTrend = "HOLD";

    if (btcPrice > btcRules.sellAbove) btcTrend = "SELL";
    else if (btcPrice < btcRules.buyBelow) btcTrend = "BUY";

    for (const coin in COINS_CONFIG) {

      const rules = COINS_CONFIG[coin];
      const price = prices[coin];

      if (!price || isNaN(price)) continue;

      let signal = "HOLD";

      if (price < rules.buyBelow) signal = "BUY";
      else if (price > rules.sellAbove) signal = "SELL";

      // 🚨 BLOQUEIO INTELIGENTE (ANTI-PREJUÍZO)
      if (btcTrend === "SELL" && signal === "BUY" && coin !== "BTC") {
        signal = "HOLD";
      }

      const score = calculateScore(
        price,
        rules.buyBelow,
        rules.sellAbove
      );

      if (score > 1) {

        let confidence = Math.min(score + 50, 95);

        if (btcTrend === "SELL" && coin !== "BTC") {
          confidence *= 0.7;
        }

        if (btcTrend === "BUY" && coin !== "BTC") {
          confidence *= 1.1;
        }

        confidence = Number(confidence.toFixed(2));

        opportunities.push({
          coin: coin,
          name: rules.name,
          price: Number(price),
          signal: signal,
          confidence: confidence,
          score: Number(score.toFixed(2))
        });

      }

    }

    const cleanOpportunities = opportunities.filter(
      o =>
        o &&
        o.coin &&
        typeof o.price === "number" &&
        !isNaN(o.price)
    );

    cleanOpportunities.sort((a, b) => b.score - a.score);

    return cleanOpportunities.slice(0, 5);

  } catch (error) {

    console.log("Erro no Opportunity Hunter:", error.message);

    return [];

  }

}

module.exports = {
  scanOpportunities
};
