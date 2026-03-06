const express = require("express")
const router = express.Router()
const Portfolio = require("../models/Portfolio")
const { getCryptoPrice } = require("../services/crypto.service")

// Mapeamento das moedas
const coinMap = {
 btc: "bitcoin",
 eth: "ethereum",
 sol: "solana"
}

// ===============================
// ADICIONAR CRIPTO NO PORTFOLIO
// ===============================
router.post("/add", async (req, res) => {

 try {

  const { userId, coin, amount } = req.body

  const newPortfolio = new Portfolio({
   userId,
   coin,
   amount
  })

  await newPortfolio.save()

  res.json({
   message: "Cripto adicionada"
  })

 } catch (error) {

  console.log(error)

  res.status(500).json({
   error: "Erro ao salvar cripto"
  })

 }

})


// ===============================
// BUSCAR PREÇO DA CRIPTO
// ===============================
router.get("/price/:coin", async (req, res) => {

 try {

  const symbol = req.params.coin.toLowerCase()

  const coin = coinMap[symbol] || symbol

  console.log("Moeda recebida:", symbol)
  console.log("Moeda enviada para API:", coin)

  const data = await getCryptoPrice(coin)

  console.log("Resposta API:", data)

  if (!data || !data[coin]) {
   return res.status(404).json({
    error: "Criptomoeda não encontrada"
   })
  }

  res.json(data)

 } catch (error) {

  console.log("ERRO:", error.message)

  res.status(500).json({
   error: "Erro ao buscar preço da cripto"
  })

 }

})


// ===============================
// BUSCAR PORTFOLIO DO USUÁRIO
// ===============================
router.get("/:userId", async (req, res) => {

 try {

  const { userId } = req.params

  const portfolio = await Portfolio.find({ userId })

  res.json(portfolio)

 } catch (error) {

  res.status(500).json({
   error: "Erro ao buscar portfolio"
  })

 }

})

module.exports = router
