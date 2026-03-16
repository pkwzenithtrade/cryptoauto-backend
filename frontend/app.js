const API = "https://cryptoauto-backend.onrender.com"

let token = null

async function login(){

 const email = document.getElementById("email").value
 const password = document.getElementById("password").value

 const response = await fetch(API + "/auth/login",{

  method:"POST",
  headers:{
   "Content-Type":"application/json"
  },

  body:JSON.stringify({
   email,
   password
  })

 })

 const data = await response.json()

 token = data.token

 alert("Login realizado")

}

async function loadOpportunities(){

 const response = await fetch(API + "/ai/opportunities")

 const data = await response.json()

 const results = document.getElementById("results")

 results.innerHTML = ""

 data.forEach(coin => {

  const div = document.createElement("div")

  div.innerHTML = `
   <b>${coin.name}</b>
   Preço: $${coin.price}
   Sinal: ${coin.signal}
   Score: ${coin.score}
   <hr>
  `

  results.appendChild(div)

 })

}
