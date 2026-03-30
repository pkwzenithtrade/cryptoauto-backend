const axios = require("axios");

// =====================================
// 🔥 CRIAR PAGAMENTO PIX (VERSÃO ESTÁVEL)
// =====================================
async function createPixPayment(email, value = 29.9, plan = "basic") {
  try {

    if (!email) {
      return { error: "Email obrigatório" };
    }

    const response = await axios.post(
      "https://api.mercadopago.com/v1/payments",
      {
        transaction_amount: Number(value),
        description: `Plano ${plan} CryptoAuto`,
        payment_method_id: "pix",

        payer: {
          email: email
        },

        // 🔥 IMPORTANTE (webhook)
        external_reference: email,

        // 🔥 expiração (30 min)
        date_of_expiration: new Date(
          Date.now() + 1000 * 60 * 30
        ).toISOString()
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    const data = response.data;

    console.log("✅ PIX criado:", data.id);

    // 🔒 VALIDAÇÃO
    if (
      !data.point_of_interaction ||
      !data.point_of_interaction.transaction_data
    ) {
      return {
        error: "Erro ao gerar QR",
        details: data
      };
    }

    return {
      id: data.id,
      status: data.status,

      qr_code:
        data.point_of_interaction.transaction_data.qr_code,

      qr_code_base64:
        data.point_of_interaction.transaction_data.qr_code_base64
    };

  } catch (error) {

    console.log("❌ ERRO REAL MERCADO PAGO:");

    if (error.response) {
      console.log(JSON.stringify(error.response.data, null, 2));
      return {
        error: "Erro Mercado Pago",
        details: error.response.data
      };
    }

    console.log(error.message);

    return {
      error: "Erro geral",
      details: error.message
    };
  }
}

module.exports = {
  createPixPayment
};
