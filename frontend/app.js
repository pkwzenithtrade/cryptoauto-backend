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

  localStorage.setItem("email", email.toLowerCase());
  userEmail = email.toLowerCase();

  verificarVIP();
}

// ===============================
// 🔒 VERIFICAR VIP (CORRIGIDO)
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

    await verificarVIP(); // 🔥 sempre atualiza VIP

    const url = isVIP
      ? API + "/user/opportunities?email=" + encodeURIComponent(userEmail)
      : API + "/ai/opportunities-public";

    const response = await fetch(url);
    const data = await response.json();

    const results = document.getElementById("results");
    results.innerHTML = "";

    const coins = data.data || data;

    if (!coins || coins.length === 0) {
      results.innerHTML = "Nenhum dado disponível";
      return;
    }

    coins.forEach((coin, index) => {

      const locked = !isVIP && index > 0; // 🔥 trava mais cedo

      const div = document.createElement("div");

      div.style.background = "#111";
      div.style.padding = "15px";
      div.style.marginTop = "10px";
      div.style.borderRadius = "10px";
      div.style.color = "white";

      if (locked) {

        div.innerHTML = `
          <b>${coin.name} (${coin.coin})</b><br><br>
          <span style="color:red;">🔒 Sinal VIP</span>
        `;

      } else {

        div.innerHTML = `
          <b>${coin.name} (${coin.coin})</b><br>
          💰 Preço: $${coin.price}<br>
          📊 Sinal: ${coin.signal}<br>
          🔥 Confiança: ${coin.confidence}%<br>
        `;
      }

      results.appendChild(div);

    });

    // ===============================
    // 🔥 BLOCO DE VENDA (MELHORADO)
    // ===============================
    if (!isVIP) {

      const div = document.createElement("div");

      div.innerHTML = `
        <h2 style="color:#22c55e;">🔥 LIBERE TODOS OS SINAIS</h2>
        <p>+2.134 usuários lucrando hoje</p>

        <button onclick="comprarPlano('basic')">Plano Basic R$29</button><br><br>
        <button onclick="comprarPlano('pro')">Plano Pro R$59</button><br><br>
        <button onclick="comprarPlano('premium')" style="background:#22c55e;color:white;padding:10px;">
          🔓 Premium R$97 (Recomendado)
        </button>
      `;

      results.appendChild(div);
    }

  } catch (error) {
    document.getElementById("results").innerHTML = "Erro ao carregar";
  }

}

// ===============================
// 💳 STRIPE CHECKOUT (CORRIGIDO)
// ===============================
async function comprarPlano(plano) {

  if (!userEmail) {
    alert("Defina seu email primeiro");
    return;
  }

  try {

    const res = await fetch(
      API + "/payment/checkout?email=" + encodeURIComponent(userEmail) + "&plan=" + plano
    );

    const data = await res.json();

    if (data.url) {

      alert("Redirecionando para pagamento...");
      window.open(data.url, "_blank");

    } else {

      alert("Erro ao gerar pagamento");

    }

  } catch (error) {
    alert("Erro ao conectar com servidor");
  }

}

// ===============================
// 🔄 AUTO CHECK VIP (TEMPO REAL)
// ===============================
setInterval(() => {
  if (userEmail) {
    verificarVIP();
  }
}, 5000);

// ===============================
// 🔥 AUTO LOGIN
// ===============================
if (userEmail) {
  verificarVIP();
}
