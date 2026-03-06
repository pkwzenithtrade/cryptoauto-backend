const express = require("express")
const router = express.Router()
const Portfolio = require("../models/Portfolio")
const { getCryptoPrice } = require("../services/crypto.service")

router.post("/add", async (req, res) => {

 const { userId, coin, amount } = req.body

 const newPortfolio = new Portfolio({
  userId,
  coin,
  amount
 })

 await newPortfolio.save()

 res.json({
  message:"Cripto adicionada"
 })

})

router.get("/price/:coin", async (req, res) => {

 const coin = req.params.coin

 const price = await getCryptoPrice(coin)

 res.json(price)

})

router.get("/:userId", async (req, res) => {

 const { userId } = req.params

 const portfolio = await Portfolio.find({ userId })

 res.json(portfolio)

})

module.exports = router
