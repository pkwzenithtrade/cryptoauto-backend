const axios = require("axios")

let cache = {}
let lastFetch = {}

async function getCryptoPrice(coin) {

 const now = Date.now()

 // cache por 30 segundos
 if (cache[coin] && (now - lastFetch[coin] < 30000)) {
  console.log("USANDO CACHE:", coin)
  return cache[coin]
 }

 try {

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`

  console.log("BUSCANDO API:", url)

  const response = await axios.get(url)

  cache[coin] = response.data
  lastFetch[coin] = now

  return response.data

 } catch (error) {

  if (error.response && error.response.status === 429) {

   console.log("LIMITE COINGECKO ATINGIDO")

   if (cache[coin]) {
    return cache[coin]
   }

   return {
    [coin]: { usd: 0 }
   }

  }

  console.log("ERRO:", error.message)

  throw new Error("Erro ao buscar preço da cripto")

 }

}

module.exports = {
 getCryptoPrice
}
