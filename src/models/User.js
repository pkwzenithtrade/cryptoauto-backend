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
    enum: ["free", "basic", "pro", "premium"],
    default: "free"
  },

  asaasCustomerId: {
    type: String,
    default: null
  }

}, { timestamps: true });

// 🔥 evita erro do mongoose
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
