const axios = require("axios")

async function getCryptoPrice(coin) {

 try {

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`

  const response = await axios.get(url)

  if (!response.data || Object.keys(response.data).length === 0) {
   throw new Error("Criptomoeda não encontrada")
  }

  return response.data

 } catch (error) {

  console.log("ERRO API:", error.message)

  throw new Error("Erro ao buscar preço da cripto")

 }

}

module.exports = {
 getCryptoPrice
}
