const axios = require("axios")

let cache = {}
let lastFetch = {}

async function getCryptoPrice(coin) {

 const now = Date.now()

 // cache de 30 segundos
 if (cache[coin] && (now - lastFetch[coin] < 30000)) {
  return cache[coin]
 }

 const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`

 const response = await axios.get(url)

 cache[coin] = response.data
 lastFetch[coin] = now

 return response.data

}

module.exports = {
 getCryptoPrice
}
