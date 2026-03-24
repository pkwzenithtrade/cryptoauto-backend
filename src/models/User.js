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
  }

}, { timestamps: true });

// 🔥 CORREÇÃO DO ERRO DO MONGOOSE
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
