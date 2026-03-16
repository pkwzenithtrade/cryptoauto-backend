const { scanMarket } = require("./marketRadar")
const { scanMarketTrends } = require("./trendScanner")
const { scanOpportunities } = require("./opportunityHunter")

async function runTradingBrain() {

 try {

  const market = await scanMarket(50) || []
  const trends = await scanMarketTrends(50) || []
  const signals = await scanOpportunities() || []

  let brain = []

  for (const coin of market) {

   const trend = trends.find(t => t.coin === coin.coin)
   const signal = signals.find(s => s.coin === coin.coin)

   let score = 0
   let decision = "HOLD"

   const change24h = coin.change24h || 0
   const volume = coin.volume || 0

   if (change24h > 4) score += 20

   if (volume > 100000000) score += 20

   if (trend && trend.signal === "BUY") score += 30

   if (signal && signal.signal === "BUY") score += 30

   if (score >= 60) decision = "STRONG BUY"
   else if (score >= 40) decision = "BUY"

   score = Math.min(score, 100)

   brain.push({
 coin: coin.coin || "",
 name: coin.name || "",
 price: Number(coin.price || 0),
 change24h: Number(change24h),
 volume: Number(volume),
 score: Number(score),
 decision
})

  brain.sort((a,b)=>b.score-a.score)

  return brain.slice(0,20)

 } catch (error) {

  console.log("Erro no Trading Brain:", error.message)

  return []

 }

}

module.exports = {
 runTradingBrain
}
