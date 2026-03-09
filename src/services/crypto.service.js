const axios = require("axios")

let cache = {}
let cacheTime = {}

async function getCryptoPrice(coin) {

 try {

  if (!coin) {
   throw new Error("Coin não definida")
  }
coin = coin.toLowerCase()
  const now = Date.now()

  // cache de 2 minutos
  if (cache[coin] && (now - cacheTime[coin] < 120000)) {
   console.log("USANDO CACHE")
   return cache[coin]
  }

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`

  const response = await axios.get(url, {
    timeout: 5000,
    headers: {
      "User-Agent": "cryptoauto-bot"
    }
  })

  cache[coin] = response.data
  cacheTime[coin] = now

  return response.data

 } catch (error) {

  console.log("ERRO API:", error.message)

  if (cache[coin]) {
   console.log("RETORNANDO PREÇO DO CACHE")
   return cache[coin]
  }

  return {
   [coin]: {
    usd: 0
   }
  }

 }

}

module.exports = {
 getCryptoPrice
}
