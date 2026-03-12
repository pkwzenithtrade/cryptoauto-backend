const axios = require("axios");

async function getTopCoins(limit = 20) {

 try {

  const url = `https://api.coingecko.com/api/v3/coins/markets`;

  const response = await axios.get(url, {
   params: {
    vs_currency: "usd",
    order: "market_cap_desc",
    per_page: limit,
    page: 1
   }
  });

  return response.data.map(coin => ({
   id: coin.id,
   name: coin.name,
   symbol: coin.symbol,
   price: coin.current_price,
   change24h: coin.price_change_percentage_24h
  }));

 } catch (error) {

  console.log("Erro ao buscar mercado:", error.message);

  return [];

 }

}

module.exports = {
 getTopCoins
};
