const axios = require("axios");

async function getMarketData() {
  try {

    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd",
      { timeout: 5000 }
    );

    return response.data;

  } catch (error) {

    console.log("Erro ao buscar dados do mercado:", error.message);

    return {
      bitcoin: { usd: 0 },
      ethereum: { usd: 0 },
      solana: { usd: 0 }
    };

  }
}

module.exports = {
  getMarketData
};
