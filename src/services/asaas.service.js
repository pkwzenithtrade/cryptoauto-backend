const axios = require("axios");

const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const API = "https://api.asaas.com/v3";

// =====================================
// 🔥 CRIAR CLIENTE
// =====================================

async function createCustomer(email) {
  try {

    const response = await axios.post(
      API + "/customers",
      {
        name: email,
        email: email,
        cpfCnpj: "12345678909"
      },
      {
        headers: {
          access_token: ASAAS_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Cliente criado:", response.data.id);

    return response.data;

  } catch (error) {

    console.log("❌ ERRO CLIENTE:", error.response?.data || error.message);

    return null;
  }
}

// =====================================
// 🔥 CRIAR PAGAMENTO BOLETO
// =====================================

async function createBoletoPayment(customerId) {
  try {

    const response = await axios.post(
      API + "/payments",
      {
        customer: customerId,
        billingType: "BOLETO",
        value: 19.9,
        description: "CryptoAuto VIP",
        dueDate: new Date().toISOString().split("T")[0]
      },
      {
        headers: {
          access_token: ASAAS_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Boleto criado:", response.data.id);

    return response.data;

  } catch (error) {

    console.log("❌ ERRO BOLETO:", error.response?.data || error.message);

    return { error: error.response?.data || error.message };
  }
}

// =====================================
// 🔥 CRIAR PAGAMENTO PIX
// =====================================

async function createPixPayment(customerId) {
  try {

    const response = await axios.post(
      API + "/payments",
      {
        customer: customerId,
        billingType: "PIX",
        value: 19.9,
        description: "CryptoAuto VIP",
        dueDate: new Date().toISOString().split("T")[0]
      },
      {
        headers: {
          access_token: ASAAS_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Pagamento criado:", response.data.id);

    return response.data;

  } catch (error) {

    console.log("❌ ERRO PAGAMENTO ASAAS:");
    console.log(error.response?.data);
    console.log(error.message);

    return { error: error.response?.data || error.message };
  }
}

module.exports = {
  createCustomer,
  createPixPayment,
  createBoletoPayment
};
