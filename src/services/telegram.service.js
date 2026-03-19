const axios = require("axios");

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// =====================================
// ENVIAR MENSAGEM
// =====================================
async function sendMessage(message) {
  try {

    // 🔒 proteção (evita erro se .env não estiver ok)
    if (!TELEGRAM_TOKEN || !CHAT_ID) {
      console.log("Telegram não configurado");
      return;
    }

    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

    await axios.post(url, {
      chat_id: CHAT_ID,
      text: message,
      parse_mode: "HTML"
    });

  } catch (error) {

    console.log("Erro ao enviar Telegram:", error.response?.data || error.message);

  }
}

// =====================================
// FORMATAR OPORTUNIDADES
// =====================================
function formatOpportunities(opportunities) {

  if (!opportunities || opportunities.length === 0) {
    return "⚠️ Nenhuma oportunidade encontrada";
  }

  let message = "🚀 <b>SINAIS DO MERCADO</b>\n\n";

  opportunities.forEach((op) => {
    message += 
`💰 <b>${op.name} (${op.coin})</b>
Preço: $${op.price}
Sinal: ${op.signal}
Confiança: ${op.confidence}%
Score: ${op.score}

`;
  });

  return message;
}

module.exports = {
  sendMessage,
  formatOpportunities
};
