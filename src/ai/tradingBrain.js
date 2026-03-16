const axios = require("axios")

async function tradingBrain() {

 try {

  const url = "https://api.coingecko.com/api/v3/coins/markets"

  const response = await axios.get(url,{
   params:{
    vs_currency:"usd",
    order:"market_cap_desc",
    per_page:20,
    page:1,
    sparkline:false
   }
  })

  const coins = response.data || []

  let brain = []

  for(const coin of coins){

   const price = coin.current_price || 0
   const change24h = coin.price_change_percentage_24h || 0
   const volume = coin.total_volume || 0

   let decision = "HOLD"
   let score = 20

   if(change24h > 4){
    decision = "BUY"
    score = 40
   }

   if(change24h > 8){
    decision = "STRONG BUY"
    score = 80
   }

   if(change24h < -6){
    decision = "SELL"
    score = 60
   }

   brain.push({
    coin: coin.id,
    name: coin.name,
    price,
    change24h,
    volume,
    score,
    decision
   })

  }

  brain.sort((a,b)=>b.score-a.score)

  return brain

 } catch(error){

  console.log("Erro Trading Brain:", error.message)

  return []

 }

}

module.exports = {
 tradingBrain
     }
