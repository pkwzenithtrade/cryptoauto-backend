const express = require("express")
const router = express.Router()
const Portfolio = require("../models/Portfolio")
const { getCryptoPrice } = require("../services/crypto.service")

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

  res.status(500).json({
   error: "Erro ao salvar cripto"
  })

 }

})

router.get("/price/:coin", async (req, res) => {

 try {

  const coin = req.params.coin.toLowerCase()

  const data = await getCryptoPrice(coin)

  if (!data || !data[coin]) {
   return res.status(404).json({
    error: "Criptomoeda não encontrada ou erro na API"
   })
  }

  const price = data[coin].usd

  res.json({
   coin,
   price
  })

 } catch (error) {

  console.log(error)

  res.status(500).json({
   error: "Erro ao buscar preço da cripto"
  })

 }

})

router.get("/:userId", async (req, res) => {

 const { userId } = req.params

 const portfolio = await Portfolio.find({ userId })

 res.json(portfolio)

})

module.exports = router
