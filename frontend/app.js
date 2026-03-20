const API = "https://cryptoauto-backend.onrender.com"

let token = null

// ===============================
// LOGIN
// ===============================
async function login(){

  const email = document.getElementById("email").value
  const password = document.getElementById("password").value

  try {

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

    token = data.token

    alert("Login realizado com sucesso")

  } catch (error) {
    console.log(error)
    alert("Erro ao fazer login")
  }

}


// ===============================
// CARREGAR OPORTUNIDADES (CORRIGIDO)
// ===============================
async function loadOpportunities(){

  try {

    // 🔥 AGORA USA ROTA PÚBLICA
    const response = await fetch(API + "/ai/opportunities-public")

    const json = await response.json()

    // 🔥 PEGA O ARRAY CORRETO
    const data = json.data || []

    const results = document.getElementById("results")

    results.innerHTML = ""

    // 🔥 SE NÃO TEM DADOS
    if(data.length === 0){
      results.innerHTML = "<p>Nenhuma oportunidade encontrada</p>"
      return
    }

    // 🔥 MOSTRA MENSAGEM FREE (SE EXISTIR)
    if(json.message){
      const msg = document.createElement("p")
      msg.innerHTML = `<b>${json.message}</b>`
      results.appendChild(msg)
    }

    // 🔥 LISTA AS MOEDAS
    data.forEach(coin => {

      const div = document.createElement("div")

      div.innerHTML = `
        <b>${coin.name} (${coin.coin})</b><br>
        Preço: $${coin.price}<br>
        Sinal: ${coin.signal}<br>
        Score: ${coin.score}<br>
        Confiança: ${coin.confidence}%<br>
        <hr>
      `

      results.appendChild(div)

    })

    // 🔥 BOTÃO DE UPGRADE
    if(json.upgrade){
      const upgrade = document.createElement("p")
      upgrade.innerHTML = `<b style="color:red">${json.upgrade}</b>`
      results.appendChild(upgrade)
    }

  } catch (error) {

    console.log(error)

    const results = document.getElementById("results")
    results.innerHTML = "<p>Erro ao carregar dados</p>"

  }

}
