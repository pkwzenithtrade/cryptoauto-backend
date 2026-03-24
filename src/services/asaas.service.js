const axios = require("axios");

const ASAAS_API_KEY = process.env.ASAAS_API_KEY;

const API = "https://api.asaas.com/v3";

// 🔥 CRIAR CLIENTE
async function createCustomer() {
  try {

    const response = await axios.post(
      API + "/customers",
      {
        name: "Cliente CryptoAuto",
        email: "cliente@email.com",
        cpfCnpj: "12345678901"
      },
      {
        headers: {
          access_token: ASAAS_API_KEY
        }
      }
    );

    return response.data;

  } catch (error) {
    console.log("Erro cliente:", error.response?.data || error.message);
    return null;
  }
}


// 🔥 CRIAR PAGAMENTO PIX
async function createPixPayment(customerId) {
  try {

    const response = await axios.post(
      API + "/payments",
      {
        customer: customerId,
        billingType: "PIX",
        value: 19.90,
        description: "CryptoAuto VIP",
        dueDate: new Date().toISOString().split("T")[0]
      },
      {
        headers: {
          access_token: ASAAS_API_KEY
        }
      }
    );

    return response.data;

  } catch (error) {
    console.log("Erro pagamento:", error.response?.data || error.message);
    return null;
  }
}

module.exports = {
  createCustomer,
  createPixPayment
};
