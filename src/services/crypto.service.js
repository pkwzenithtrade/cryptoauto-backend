const axios = require("axios")

let cache = {}
let lastFetch = 0

async function getCryptoPrice(coin) {

 const now = Date.now()

 // cache de 30 segundos
 if (cache[coin] && now - lastFetch < 30000) {
  console.log("USANDO CACHE")
  return cache[coin]
 }

 try {

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`

  const response = await axios.get(url)

  cache[coin] = response.data
  lastFetch = now

  return response.data

 } catch (error) {

  console.log("ERRO API:", error.message)

  if (cache[coin]) {
   console.log("RETORNANDO CACHE ANTIGO")
   return cache[coin]
  }

  throw new Error("Erro ao buscar preço da cripto")
 }

}

module.exports = {
 getCryptoPrice
    }
