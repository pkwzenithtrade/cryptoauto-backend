const axios = require("axios")

async function getCryptoPrice(coin) {

 try {

  const response = await axios.get(
   `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`
  )

  return response.data

 } catch (error) {

  return {
   error: "Erro ao buscar preço"
  }

 }

}

module.exports = {
 getCryptoPrice
}
