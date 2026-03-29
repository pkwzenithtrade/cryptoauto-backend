const express = require("express");
const router = express.Router();
const axios = require("axios");

const User = require("../models/User");

// =====================================
// 🔔 WEBHOOK MERCADO PAGO (PRO)
// =====================================
router.post("/mercadopago", async (req, res) => {

  try {

    console.log("📩 WEBHOOK:", JSON.stringify(req.body));

    const { type, data } = req.body;

    if (type !== "payment") {
      return res.sendStatus(200);
    }

    const paymentId = data?.id;

    if (!paymentId) {
      console.log("❌ Payment ID não encontrado");
      return res.sendStatus(200);
    }

    // =====================================
    // 🔍 CONSULTA PAGAMENTO MP
    // =====================================
    const response = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
        }
      }
    );

    const payment = response.data;

    console.log("💰 STATUS:", payment.status);

    // =====================================
    // ✅ PAGAMENTO APROVADO
    // =====================================
    if (payment.status === "approved") {

      const email = payment.external_reference;

      if (!email) {
        console.log("❌ Email não encontrado");
        return res.sendStatus(200);
      }

      const user = await User.findOne({ email });

      if (!user) {
        console.log("⚠️ Usuário não encontrado:", email);
        return res.sendStatus(200);
      }

      // 🔒 EVITA DUPLICIDADE
      if (user.isVIP) {
        console.log("⚠️ Já é VIP:", email);
        return res.sendStatus(200);
      }

      // =====================================
      // 🔥 LIBERA VIP
      // =====================================
      user.isVIP = true;
      await user.save();

      console.log("🔥 VIP LIBERADO:", email, "| Plano:", user.plan);

      // =====================================
      // 📲 TELEGRAM NOTIFICAÇÃO ADMIN
      // =====================================
      try {
        await axios.post(
          `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,
          {
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: `🔥 NOVO VIP\n\n📧 ${email}\n💎 Plano: ${user.plan}`
          }
        );
      } catch (err) {
        console.log("Erro Telegram admin:", err.message);
      }

      // =====================================
      // 🤖 ENVIO LINK VIP AO USUÁRIO
      // =====================================
      try {
        await axios.post(
          `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,
          {
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: `👤 ${email} liberado.\nEnvie este link VIP:\n${process.env.TELEGRAM_GROUP_LINK}`
          }
        );
      } catch (err) {
        console.log("Erro envio link:", err.message);
      }

      // =====================================
      // 🚀 FUTURO: BOT AUTO ADD
      // =====================================
      /*
      🔥 PARA ADICIONAR AUTOMATICAMENTE:

      Você precisa:
      1. Criar um BOT no Telegram
      2. Adicionar o BOT como ADMIN do grupo
      3. Capturar o chat_id do usuário (via login Telegram no app)

      Depois usar:
      await axios.post(
        `https://api.telegram.org/botTOKEN/inviteLink`,
        ...
      );

      ⚠️ Telegram NÃO permite adicionar direto sem interação
      solução real: link privado + bot valida
      */

    }

    res.sendStatus(200);

  } catch (error) {

    console.error("❌ ERRO WEBHOOK:", error.response?.data || error.message);

    res.sendStatus(500);

  }

});

module.exports = router;
