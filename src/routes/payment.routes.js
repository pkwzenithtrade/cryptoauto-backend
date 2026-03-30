const express = require("express");
const router = express.Router();

const User = require("../models/User");

const {
  createPixPayment
} = require("../services/mercadopago.service");

// =====================================
// 💰 GERAR PIX
// =====================================
router.get("/pix", async (req, res) => {
  try {

    // =====================================
    // 🔥 VALIDAR EMAIL
    // =====================================
    let email = req.query.email;

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        error: "Email obrigatório"
      });
    }

    email = email.toLowerCase().trim();

    // valida formato simples
    if (!email.includes("@")) {
      return res.status(400).json({
        error: "Email inválido"
      });
    }

    // =====================================
    // 💰 PLANO
    // =====================================
    const plan = req.query.plan || "basic";

    let value = 29;

    if (plan === "pro") value = 59;
    if (plan === "premium") value = 97;

    // =====================================
    // 👤 BUSCAR OU CRIAR USUÁRIO
    // =====================================
    let user = await User.findOne({ email });

    if (!user) {
      user =
