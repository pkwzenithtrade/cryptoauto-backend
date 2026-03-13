const axios = require("axios")

const CACHE_TIME = 120000 // 2 minutos

let cache = {}
let lastFetch = 0

async function getMultiplePrices() {

 try {

  const url = "https://api.coingecko.com/api/v3/simple/price"

  const response = await axios.get(url, {
   params: {
    ids: "bitcoin,ethereum,solana,avalanche-2,chainlink,matic-network,polkadot",
    vs_currencies: "usd"
   }
  })

  return response.data

 } catch (error) {

  console.log("ERRO API MULTI:", error.message)

  return {}

 }

}

 try {

  if (!coin) {
   throw new Error("Coin não definida")
  }

  coin = coin.toLowerCase()

  const now = Date.now()

  // se já existe no cache e ainda é válido
  if (cache[coin] && now - lastFetch < CACHE_TIME) {
   console.log("USANDO CACHE:", coin)
   return { [coin]: cache[coin] }
  }

  const url = "https://api.coingecko.com/api/v3/simple/price"

  const response = await axios.get(url, {
   timeout: 5000,
   headers: {
    "User-Agent": "cryptoauto-ai"
   },
   params: {
    ids: coin,
    vs_currencies: "usd"
   }
  })

  const price = response.data[coin]

  if (!price) {
   throw new Error("Preço não encontrado")
  }

  cache[coin] = price
  lastFetch = now

  return {
   [coin]: price
  }

 } catch (error) {

  console.log("ERRO API:", error.message)

  // fallback para cache
  if (cache[coin]) {

   console.log("RETORNANDO CACHE:", coin)

   return {
    [coin]: cache[coin]
   }

  }

  return {
   [coin]: {
    usd: 0
   }
  }

 }

}

module.exports = {
 getCryptoPrice,
 getMultiplePrices
}
