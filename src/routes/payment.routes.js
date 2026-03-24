const express = require("express");
const router = express.Router();

const { createCustomer, createPixPayment } = require("../services/asaas.service");

router.get("/pix", async (req, res) => {

  const customer = await createCustomer();

  if (!customer) {
    return res.status(500).json({ error: "Erro ao criar cliente" });
  }

  const payment = await createPixPayment(customer.id);

  if (!payment) {
    return res.status(500).json({ error: "Erro ao gerar pagamento" });
  }

  res.json({
    pixQrCode: payment.payload,
    pixCopiaECola: payment.pixQrCode
  });

});

module.exports = router;
