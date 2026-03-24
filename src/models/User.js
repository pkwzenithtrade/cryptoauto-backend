const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Email inválido"]
  },

  password: {
    type: String,
    default: null
  },

  isVIP: {
    type: Boolean,
    default: false
  },

  plan: {
    type: String,
    enum: ["free", "pro", "premium"],
    default: "free"
  },

  // 🔥 ESSENCIAL PARA LIGAR COM ASAAS
  asaasCustomerId: {
    type: String,
    default: null
  }

}, { timestamps: true });

// 🔥 EVITA ERRO DE DUPLICAÇÃO DO MONGOOSE
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
