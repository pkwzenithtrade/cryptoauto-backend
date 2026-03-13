const axios = require("axios")

const CACHE_TIME = 120000 // 2 minutos

let cache = {}
let lastFetch = 0


// ========================================
// BUSCA VÁRIAS MOEDAS DE UMA VEZ
// ========================================
async function getMultiplePrices() {

 try {

  const now = Date.now()

  // usar cache global
  if (cache.multiple && now - lastFetch < CACHE_TIME) {
   console.log("USANDO CACHE GLOBAL")
   return cache.multiple
  }

  const url = "https://api.coingecko.com/api/v3/simple/price"

  const response = await axios.get(url, {
   timeout: 5000,
   headers: {
    "User-Agent": "cryptoauto-ai"
   },
   params: {
    ids: "bitcoin,ethereum,solana,avalanche-2,chainlink,matic-network,polkadot",
    vs_currencies: "usd"
   }
  })

  cache.multiple = response.data
  lastFetch = now

  return response.data

 } catch (error) {

  console.log("ERRO API MULTI:", error.message)

  if (cache.multiple) {
   console.log("RETORNANDO CACHE GLOBAL")
   return cache.multiple
  }

  return {}

 }

}


// ========================================
// BUSCA UMA MOEDA ESPECÍFICA
// ========================================
async function getMultiplePrices() {

 try {

  const now = Date.now()

  if (cache.multiple && now - lastFetch < CACHE_TIME) {
   console.log("USANDO CACHE GLOBAL")
   return cache.multiple
  }

  const url = "https://api.coingecko.com/api/v3/simple/price"

  const response = await axios.get(url, {
   timeout: 5000,
   headers: {
    "User-Agent": "cryptoauto-ai"
   },
   params: {
    ids: "bitcoin,ethereum,solana,avalanche-2,chainlink,matic-network,polkadot",
    vs_currencies: "usd"
   }
  })

  cache.multiple = response.data
  lastFetch = now

  return response.data

 } catch (error) {

  console.log("ERRO API MULTI:", error.message)

  // se for bloqueio 429 espera 5 segundos
  if (error.response && error.response.status === 429) {

    console.log("RATE LIMIT - esperando 5s")

    await new Promise(resolve => setTimeout(resolve, 5000))

    return cache.multiple || {}

  }

  if (cache.multiple) {
    console.log("RETORNANDO CACHE GLOBAL")
    return cache.multiple
  }

  return {}

 }

}

  // usar cache
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
