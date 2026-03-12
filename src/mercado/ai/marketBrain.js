function analyzeMarket(marketData) {

 const decisions = {};

 Object.keys(marketData).forEach((coin) => {

  const trend = marketData[coin].trend;

  let action = "hold";
  let bot = "none";

  if (trend === "bullish") {
   action = "buy";
   bot = "trendBot";
  }

  if (trend === "bearish") {
   action = "sell";
   bot = "trendBot";
  }

  decisions[coin] = {
   trend,
   bot,
   action
  };

 });

 return decisions;
}

module.exports = {
 analyzeMarket
};
