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

// BUSCAR PREÇOS
async function getMarketPrices() {
  try {

    const response = await axios.get(
      "https://api.kraken.com/0/public/Ticker?pair=BTCUSD,ETHUSD,SOLUSD,LINKUSD,AVAXUSD,MATICUSD,DOTUSD",
      { timeout: 5000 }
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
    return null;

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

// SCANNER
async function scanOpportunities() {

  try {

    const prices = await getMarketPrices();

    if (!prices) {
      return [{
        coin: "BTC",
        name: "Bitcoin",
        price: 70000,
        signal: "HOLD",
        confidence: 50,
        score: 0
      }];
    }

    const opportunities = [];

    const btcPrice = prices.BTC;
    const btcRules = COINS_CONFIG.BTC;

    let btcTrend = "HOLD";

    if (btcPrice > btcRules.sellAbove) btcTrend = "SELL";
    else if (btcPrice < btcRules.buyBelow) btcTrend = "BUY";

    // 🔥 LOOP CORRETO
    for (const coin in COINS_CONFIG) {

      const rules = COINS_CONFIG[coin];
      const price = prices[coin];

      if (!price || isNaN(price)) continue;

      let signal = "HOLD";

      if (price < rules.buyBelow) signal = "BUY";
      else if (price > rules.sellAbove) signal = "SELL";

      if (btcTrend === "SELL" && signal === "BUY" && coin !== "BTC") {
        signal = "HOLD";
      }

      const score = calculateScore(price, rules.buyBelow, rules.sellAbove);

      let confidence = Math.min(score + 50, 95);

      if (btcTrend === "SELL" && coin !== "BTC") {
        confidence *= 0.7;
      }

      if (btcTrend === "BUY" && coin !== "BTC") {
        confidence *= 1.1;
      }

      confidence = Number(confidence.toFixed(2));

      opportunities.push({
        coin: String(coin),
        name: String(rules.name),
        price: Number(price) || 0,
        signal: String(signal).replace(/[^A-Z]/g, ""),
        confidence: Number(confidence) || 0,
        score: Number(score.toFixed(2)) || 0
      });
    }

    if (opportunities.length === 0) {
      return [{
        coin: "BTC",
        name: "Bitcoin",
        price: btcPrice || 70000,
        signal: "HOLD",
        confidence: 50,
        score: 0
      }];
    }

    // 🔥 ORDENA
    opportunities.sort((a, b) => b.score - a.score);

    // 🔥 FILTRA DADOS QUEBRADOS
    const safeData = opportunities.filter(item =>
      item &&
      item.coin &&
      item.name &&
      typeof item.price === "number" &&
      item.signal &&
      !isNaN(item.confidence)
    );

    return safeData;

  } catch (error) {

    console.log("Erro no Opportunity Hunter:", error.message);

    return [{
      coin: "BTC",
      name: "Bitcoin",
      price: 70000,
      signal: "HOLD",
      confidence: 50,
      score: 0
    }];
  }
}

module.exports = {
  scanOpportunities
};
