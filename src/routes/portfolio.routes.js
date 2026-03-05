const express = require("express")
const router = express.Router()
const Portfolio = require("../models/Portfolio")

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
router.get("/:userId", async (req, res) => {

 const { userId } = req.params

 const portfolio = await Portfolio.find({ userId })

 res.json(portfolio)

})
module.exports = router
