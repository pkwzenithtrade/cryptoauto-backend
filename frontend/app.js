alert("JS carregado")
const API = "https://cryptoauto-backend.onrender.com"

// ===============================
// LOGIN
// ===============================
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

 if(!data.token){
   alert("Erro no login")
   return
 }

 alert("Login realizado")

}


// ===============================
// OPORTUNIDADES (CORRIGIDO)
// ===============================
async function loadOpportunities(){

 try {

  const response = await fetch(API + "/ai/opportunities-public")

  const json = await response.json()

  console.log("API RESPONSE:", json)

  const results = document.getElementById("results")

  results.innerHTML = ""

  const coins = json.data || []

  // 🔥 MOSTRA MENSAGEM DO BACKEND
  if(json.message){
    const msg = document.createElement("p")
    msg.innerHTML = `<b>${json.message}</b>`
    results.appendChild(msg)
  }

  // 🔥 SE NÃO TEM DADOS
  if(coins.length === 0){
    const empty = document.createElement("p")
    empty.innerText = "Nenhum dado disponível"
    results.appendChild(empty)
    return
  }

  // 🔥 LOOP CORRETO
  coins.forEach(coin => {

    const div = document.createElement("div")

    div.innerHTML = `
      <b>${coin.name} (${coin.coin})</b><br>
      Preço: $${coin.price}<br>
      Sinal: ${coin.signal}<br>
      Confiança: ${coin.confidence}%<br>
      Score: ${coin.score}<br>
      <hr>
    `

    results.appendChild(div)

  })

  // 🔥 UPGRADE
  if(json.upgrade){
    const up = document.createElement("p")
    up.innerHTML = `<b style="color:red">${json.upgrade}</b>`
    results.appendChild(up)
  }

 } catch (error) {

  console.log("ERRO:", error)

  const results = document.getElementById("results")
  results.innerHTML = "<p>Erro ao carregar dados</p>"

 }

}
