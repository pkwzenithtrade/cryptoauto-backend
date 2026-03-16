const express = require("express")
const router = express.Router()

const { runTradingBrain } = require("../ai/tradingBrain")

// =============================
// TRADING BRAIN
// =============================
router.get("/trading-brain", async (req, res) => {

 try {

  const brain = await runTradingBrain()

  res.json(brain)

 } catch (error) {

  console.log("Erro rota trading brain:", error.message)

  res.status(500).json({
   error: "Erro ao executar Trading Brain"
  })

 }

})

module.exports = router
