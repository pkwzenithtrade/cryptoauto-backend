const express = require("express")
const router = express.Router()
const Portfolio = require("../models/Portfolio")
const { getCryptoPrice } = require("../services/crypto.service")

const coinMap = {
 btc: "bitcoin",
 eth: "ethereum",
 sol: "solana"
}

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

router.get("/price/:coin", async (req, res) => {

 try {

  const coinParam = req.params.coin.toLowerCase()

  const coin = coinMap[coinParam] || coinParam

  const data = await getCryptoPrice(coin)

  if (!data || data.error) {

   return res.status(400).json({
    error: "Criptomoeda não encontrada ou erro na API"
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

router.get("/:userId", async (req, res) => {

 try {

  const { userId } = req.params

  const portfolio = await Portfolio.find({ userId })

  res.json(portfolio)

 } catch (error) {

  res.status(500).json({
   error: "Erro ao buscar portfólio"
  })

 }

})

module.exports = router
