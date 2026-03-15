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

    const { email, password } = req.body;

    // Validação básica
    if (!email || !password) {
      return res.status(400).json({
        error: "Email e senha são obrigatórios"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "A senha deve ter pelo menos 6 caracteres"
      });
    }

    // Verifica se usuário já existe
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        error: "Email já cadastrado"
      });
    }

    // Criptografa senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria usuário
    const user = new User({
      email,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({
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

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email e senha são obrigatórios"
      });
    }

    // Busca usuário
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        error: "Usuário não encontrado"
      });
    }

    // Verifica senha
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        error: "Senha incorreta"
      });
    }

    // Gera token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      userId: user._id
    });

  } catch (error) {

    console.log("Erro no login:", error.message);

    res.status(500).json({
      error: "Erro interno no servidor"
    });

  }

});

module.exports = router;
