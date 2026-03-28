const mercadopago = require("mercadopago");

// 🔑 CONFIGURA TOKEN
mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
});

// =====================================
// 🔥 CRIAR PAGAMENTO PIX
// =====================================
async function createPixPayment(email, value = 29.9, plan = "basic") {
  try {

    if (!email) {
      return { error: "Email obrigatório" };
    }

    const payment_data = {
      transaction_amount: Number(value),
      description: "Plano " + plan + " MarketInsight AI",
      payment_method_id: "pix",

      payer: {
        email: email
      },

      // 🔥 IDENTIFICA USUÁRIO (ESSENCIAL PRO WEBHOOK)
      external_reference: email,

      // 🔥 GARANTE QUE PIX EXPIRA (evita lixo no sistema)
      date_of_expiration: new Date(Date.now() + 1000 * 60 * 30) // 30 min
    };

    const response = await mercadopago.payment.create(payment_data);

    const data = response.body;

    console.log("✅ PIX criado:", data.id);

    // 🔒 VALIDAÇÃO SEGURA
    if (!data.point_of_interaction || !data.point_of_interaction.transaction_data) {
      return {
        error: "Erro ao gerar QR Code",
        details: data
      };
    }

    return {
      id: data.id,
      status: data.status,

      // 🔥 PIX copia e cola
      qr_code: data.point_of_interaction.transaction_data.qr_code,

      // 🔥 imagem base64
      qr_code_base64: data.point_of_interaction.transaction_data.qr_code_base64
    };

  } catch (error) {

    console.log("❌ ERRO MERCADO PAGO:");
    console.log(error.response?.data || error.message);

    return {
      error: error.response?.data || error.message
    };
  }
}

module.exports = {
  createPixPayment
};
