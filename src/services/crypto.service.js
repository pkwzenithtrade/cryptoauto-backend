const axios = require("axios")

async function getCryptoPrice(coin) {

 try {

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`

  const response = await axios.get(url)

  return response.data

 } catch (error) {

  if (error.response && error.response.status === 429) {

   console.log("Limite da API CoinGecko atingido")

   return {
    error: "Limite de requisições da API atingido. Tente novamente em alguns segundos."
   }

  }

  console.log("Erro ao buscar preço:", error.message)

  throw new Error("Erro ao buscar preço da cripto")

 }

}

module.exports = {
 getCryptoPrice
}
