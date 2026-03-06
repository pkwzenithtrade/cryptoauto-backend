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

  const coinMap = {
   btc: "bitcoin",
   eth: "ethereum",
   sol: "solana"
  }

  const coinParam = req.params.coin.toLowerCase()

  const coin = coinMap[coinParam] || coinParam

  console.log("MOEDA RECEBIDA:", coinParam)
  console.log("MOEDA ENVIADA PARA API:", coin)

  const data = await getCryptoPrice(coin)

  if (!data[coin]) {
   return res.status(404).json({
    error: "Criptomoeda não encontrada"
   })
  }

  const price = data[coin].usd

  res.json({
   coin,
   price
  })

 } catch (error) {

  console.log("ERRO NA ROTA:", error.message)

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
   error: "Erro ao buscar portfolio"
  })

 }

})

module.exports = router
