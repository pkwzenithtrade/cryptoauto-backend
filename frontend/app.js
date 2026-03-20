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

// 🔥 FUNÇÃO CORRIGIDA
async function loadOpportunities(){

 try {

  const response = await fetch(API + "/ai/opportunities-public")

  const data = await response.json()

  const results = document.getElementById("results")

  results.innerHTML = ""

  // 🔥 AGORA PEGAMOS data.data (array correto)
  const coins = data.data || []

  if(coins.length === 0){
    results.innerHTML = "<p>Nenhum dado disponível</p>"
    return
  }

  coins.forEach(coin => {

    const div = document.createElement("div")

    div.innerHTML = `
      <b>${coin.name}</b><br>
      Preço: $${coin.price}<br>
      Sinal: ${coin.signal}<br>
      Confiança: ${coin.confidence}%<br>
      Score: ${coin.score}
      <hr>
    `

    results.appendChild(div)

  })

 } catch (error) {

  console.log("Erro ao carregar:", error)

 }

}
