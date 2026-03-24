const API = "https://cryptoauto-backend.onrender.com";

async function loadOpportunities() {

  const response = await fetch(API + "/ai/opportunities-public");
  const data = await response.json();

  const results = document.getElementById("results");
  results.innerHTML = "";

  data.data.forEach(coin => {

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

}

// 🔥 BOTÃO VIP
async function virarVIP() {

  const res = await fetch(API + "/payment/boleto");
  const data = await res.json();

  if (data.boletoUrl) {

    alert("Gerando pagamento...");

    window.open(data.boletoUrl, "_blank");

  } else {

    alert("Erro ao gerar pagamento");

  }

}
