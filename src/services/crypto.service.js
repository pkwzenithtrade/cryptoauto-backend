const axios = require("axios")

async function getCryptoPrice(coin) {

 const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`

 const response = await axios.get(url)

 return response.data

}

module.exports = {
 getCryptoPrice
}
