const axios = require("axios")

async function getCryptoPrice(coin) {

 try {

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`

  const response = await axios.get(url)

  return response.data

 } catch (error) {

  console.log("ERRO COINGECKO:", error.message)

  return null

 }

}

module.exports = {
 getCryptoPrice
}
