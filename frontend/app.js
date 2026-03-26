const API = "https://cryptoauto-backend.onrender.com";

let userEmail = localStorage.getItem("email") || null;
let isVIP = false;

// ===============================
// 👤 DEFINIR EMAIL
// ===============================
function definirEmail() {

  const email = prompt("Digite seu email:");

  if (!email) {
    alert("Email obrigatório");
    return;
  }

  localStorage.setItem("email", email);
  userEmail = email;

  verificarVIP();
}

// ===============================
// 🔒 VERIFICAR VIP
// ===============================
async function verificarVIP() {

  if (!userEmail) return;

  try {

    const res = await fetch(
      API + "/auth/check-vip?email=" + encodeURIComponent(userEmail)
    );

    const data = await res.json();

    isVIP = data.isVIP || false;

    console.log("VIP:", isVIP);

  } catch (error) {
    console.log("Erro ao verificar VIP");
  }

}

// ===============================
// 📊 BUSCAR OPORTUNIDADES
// ===============================
async function loadOpportunities() {

  try {

    const response = await fetch(API + "/ai/opportunities-public");
    const data = await response.json();

    const results = document.getElementById("results");
    results.innerHTML = "";

    const coins = data.data || [];

    if (coins.length === 0) {
      results.innerHTML = "Nenhum dado disponível";
      return;
    }

    coins.forEach(coin => {

      const div = document.createElement("div");

      div.innerHTML = `
        <b>${coin.name} (${coin.coin})</b><br>
        Preço: $${coin.price}<br>
        Sinal: ${coin.signal}<br>
        Confiança: ${coin.confidence}%<br>
        <hr>
      `;

      results.appendChild(div);

    });

    // 🔒 BLOQUEIO VIP
    if (!isVIP) {

      const div = document.createElement("div");

      div.innerHTML = `
        <h3 style="color:red;">🔒 Conteúdo VIP</h3>
        <button onclick="virarVIP()">🔥 Desbloquear agora</button>
      `;

      results.appendChild(div);
    }

  } catch (error) {
    document.getElementById("results").innerHTML = "Erro ao carregar";
  }

}

// ===============================
// 💰 PAGAMENTO VIP
// ===============================
async function virarVIP() {

  if (!userEmail) {
    alert("Defina seu email primeiro");
    return;
  }

  try {

    const res = await fetch(
      API + "/payment/boleto?email=" + encodeURIComponent(userEmail)
    );

    const data = await res.json();

    if (data.boletoUrl) {

      alert("Gerando pagamento...");

      window.open(data.boletoUrl, "_blank");

    } else {

      alert("Erro ao gerar pagamento");

    }

  } catch (error) {
    alert("Erro ao conectar");
  }

}

// 🔥 AUTO LOGIN
if (userEmail) {
  verificarVIP();
}
