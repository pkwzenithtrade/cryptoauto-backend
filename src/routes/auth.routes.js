const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// =================================
// REGISTER
// =================================
router.post("/register", async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email e senha são obrigatórios"
      });
    }

    email = email.toLowerCase().trim();

    if (password.length < 6) {
      return res.status(400).json({
        error: "A senha deve ter pelo menos 6 caracteres"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        error: "Email já cadastrado"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
      isVIP: false,
      plan: "free"
    });

    await user.save();

    return res.status(201).json({
      success: true,
      message: "Usuário criado com sucesso"
    });

  } catch (error) {
    console.log("Erro no registro:", error.message);

    res.status(500).json({
      error: "Erro interno no servidor"
    });
  }
});


// =================================
// LOGIN
// =================================
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email e senha são obrigatórios"
      });
    }

    email = email.toLowerCase().trim();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        error: "Usuário não encontrado"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        error: "Senha incorreta"
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      vip: user.isVIP || false,   // 🔥 PADRÃO
      plan: user.plan || "free"
    });

  } catch (error) {
    console.log("Erro no login:", error.message);

    res.status(500).json({
      error: "Erro interno no servidor"
    });
  }
});


// =================================
// 🔥 CHECK VIP PADRÃO
// =================================
router.get("/check-vip", async (req, res) => {
  try {
    let { email } = req.query;

    if (!email) {
      return res.status(400).json({
        error: "Email obrigatório"
      });
    }

    email = email.toLowerCase().trim();

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        vip: false,
        plan: "free"
      });
    }

    return res.json({
      vip: user.isVIP || false,
      plan: user.plan || "free"
    });

  } catch (error) {
    console.log("Erro ao verificar VIP:", error.message);

    res.status(500).json({
      error: "Erro interno"
    });
  }
});

module.exports = router;
