const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword
    });

    res.json({ message: "Usuário criado com sucesso" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Usuário não encontrado" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Senha inválida" });

    const token = jwt.sign(
      { id: user._id },
      "supersecretkey",
      { expiresIn: "7d" }
    );

    res.json({ token });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
