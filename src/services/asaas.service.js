const axios = require("axios");

const ASAAS_API_KEY = process.env.ASAAS_API_KEY;

const API = "https://api.asaas.com/v3";

// =====================================
// 🔥 CRIAR CLIENTE
// =====================================

async function createCustomer() {
  try {

    const response = await axios.post(
      API + "/customers",
      {
        name: "Cliente CryptoAuto",
        email: "cliente@cryptoauto.com",
        cpfCnpj: "11144477735"
      },
      {
        headers: {
          access_token: ASAAS_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Cliente criado:", response.data);

    return response.data;

  } catch (error) {

    console.log("❌ ERRO CLIENTE ASAAS:", error.response?.data || error.message);

    return null;
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
        value: 19.9, // 🔥 número simples (evita bug)
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

    console.log("✅ Pagamento criado:", response.data);

    return response.data;

  } catch (error) {

    console.log("❌ ERRO PAGAMENTO ASAAS:", error.response?.data || error.message);

    return null;

  }
}

module.exports = {
  createCustomer,
  createPixPayment
};
