console.log("INICIANDO SERVIDOR...");
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Servidor funcionando");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
