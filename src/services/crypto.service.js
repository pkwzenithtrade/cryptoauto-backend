const axios = require("axios")

async function getCryptoPrice(coin) {

 try {

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`

  console.log("URL COINGECKO:", url)

  const response = await axios.get(url)

  console.log("RESPOSTA API:", response.data)

  return response.data

 } catch (error) {

  console.log("ERRO COMPLETO:", error.message)

  if (error.response) {
   console.log("STATUS:", error.response.status)
   console.log("DATA:", error.response.data)
  }

  throw new Error("Erro ao buscar preço da cripto")

 }

}

module.exports = {
 getCryptoPrice
}
