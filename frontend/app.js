const API = "https://ominous-adventure-pj4j64659p7gf9496-8082.app.github.dev/api";
let usuario = null;       
let timeEditandoId = null;  

async function carregarTimes() {
  const status = document.getElementById("status");
  const lista = document.getElementById("lista-times");

  try {
    const resposta = await fetch(API + "/times", { credentials: "include" });
    const dados = await resposta.json();

    if (!resposta.ok) {
      status.textContent = dados.erro;
      return;
    }

    lista.innerHTML = "";
    if (dados.length === 0) {
      status.textContent = "Nenhum time cadastrado ainda.";
      return;
    }

    status.textContent = "";
   dados.forEach(time => {
  const li = document.createElement("li");
  li.textContent = time.nome + " (" + time.cor + ") ";

  if (usuario && usuario.tipo === "ORGANIZADOR") {
    const btnEditar = document.createElement("button");
    btnEditar.textContent = "Editar";
    btnEditar.addEventListener("click", () => editarTime(time));

    const btnExcluir = document.createElement("button");
    btnExcluir.textContent = "Excluir";
    btnExcluir.addEventListener("click", () => excluirTime(time));

    li.append(btnEditar, btnExcluir);
  }

  lista.appendChild(li);
});
  } catch (erro) {
    status.textContent = "Não consegui falar com a API.";
  }
}
document.getElementById("form-time").addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const novoTime = {
    nome: document.getElementById("nome").value.trim(),
    cor: document.getElementById("cor").value.trim(),
    responsavel: document.getElementById("responsavel").value.trim(),
    contato: document.getElementById("contato").value.trim()
  };

  try {
    // ---- trecho novo (substitui o fetch antigo) ----
    const editando = timeEditandoId !== null;
    const url = API + "/times" + (editando ? "?id=" + timeEditandoId : "");

    const resposta = await fetch(url, {
      method: editando ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(novoTime)
    });
    // -------------------------------------------------

    const dados = await resposta.json();

    if (!resposta.ok) {
      document.getElementById("status").textContent = dados.erro;
      return;
    }

    evento.target.reset();
    timeEditandoId = null;
document.querySelector("#form-time button[type=submit]").textContent = "Cadastrar";
    carregarTimes();
  } catch (erro) {
    document.getElementById("status").textContent = "Não consegui falar com a API.";
  }
});
async function verificarLogin() {
  const resposta = await fetch(API + "/auth/me", { credentials: "include" });
  const campo = document.getElementById("usuario");
  if (resposta.ok) {
    const u = await resposta.json() 
    usuario = u;
    campo.textContent = "Logado como " + u.nome + " (" + u.tipo + ")";
    document.getElementById("btn-sair").hidden = false;
    document.getElementById("form-login").hidden = true;
    document.getElementById("form-time").hidden = u.tipo !== "ORGANIZADOR";   // nova
} else {
    usuario = null;
    campo.textContent = "Você não está logado.";
    document.getElementById("btn-sair").hidden = true;
    document.getElementById("form-login").hidden = false;
    document.getElementById("form-time").hidden = true;                        // nova
}
 carregarTimes();
}

document.getElementById("form-login").addEventListener("submit", async (e) => {
  e.preventDefault();
  const resposta = await fetch(API + "/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      email: document.getElementById("email").value.trim(),
      senha: document.getElementById("senha").value
    })
  });
  const dados = await resposta.json();
  if (!resposta.ok) {
    document.getElementById("usuario").textContent = dados.erro;
    return;
  }
  e.target.reset();
  verificarLogin();
});

document.getElementById("btn-sair").addEventListener("click", async () => {
  await fetch(API + "/auth/logout", { method: "POST", credentials: "include" });
  verificarLogin();
});
async function excluirTime(time) {
  if (!confirm("Excluir o time " + time.nome + "?")) return;

  const resposta = await fetch(API + "/times?id=" + time.id, {
    method: "DELETE",
    credentials: "include"
  });
  const dados = await resposta.json();

  if (!resposta.ok) {
    document.getElementById("status").textContent = dados.erro;
    return;
  }
  carregarTimes();
}

function editarTime(time) {
  timeEditandoId = time.id;
  document.getElementById("nome").value = time.nome || "";
  document.getElementById("cor").value = time.cor || "";
  document.getElementById("responsavel").value = time.responsavel || "";
  document.getElementById("contato").value = time.contato || "";
  document.querySelector("#form-time button[type=submit]").textContent = "Salvar alterações";
}

verificarLogin();