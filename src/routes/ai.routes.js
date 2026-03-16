const express = require("express")
const router = express.Router()

const { tradingBrain } = require("../ai/tradingBrain")

// =================================
// TRADING BRAIN
// =================================
router.get("/trading-brain", async (req, res) => {

 try {

  const data = await tradingBrain()

  res.json(data)

 } catch (error) {

  console.log("Erro rota trading brain:", error.message)

  res.status(500).json({
   error: "Erro ao executar Trading Brain"
  })

 }

})

module.exports = router
