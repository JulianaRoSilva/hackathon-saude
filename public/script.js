// Todas as rotas da API ficam em /api no mesmo servidor.
const API = "/api";
let usuario = null;

const $ = (id) => document.getElementById(id);
const mensagem = (texto) => { $("mensagem").textContent = texto; };

async function requisicao(caminho, metodo = "GET", dados) {
  const opcoes = { method: metodo, headers: { "Content-Type": "application/json" } };
  if (dados !== undefined) opcoes.body = JSON.stringify(dados);
  let resposta;
  try {
    resposta = await fetch(API + caminho, opcoes);
  } catch {
    throw new Error("Não foi possível conectar à API. Verifique se o servidor está rodando.");
  }
  const resultado = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(resultado.mensagem || "Erro HTTP " + resposta.status);
  return resultado;
}

function formulario(id) {
  return Object.fromEntries(new FormData($(id)).entries());
}

function textoElemento(tag, texto) {
  const elemento = document.createElement(tag);
  elemento.textContent = String(texto ?? "-"); // evita inserir HTML vindo da API
  return elemento;
}

function mostrarUsuario() {
  $("acesso").hidden = !!usuario;
  $("portal").hidden = !usuario;
  if (usuario) {
    $("nomeUsuario").textContent = usuario.login;
    $("codigoUsuario").textContent = usuario.codigo;
  }
}

$("formLogin").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  try {
    const resultado = await requisicao("/usuarios/login", "POST", formulario("formLogin"));
    usuario = resultado.usuario;
    mostrarUsuario();
    mensagem(resultado.mensagem);
    await atualizarTudo();
  } catch (erro) { mensagem(erro.message); }
});

$("formCadastro").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  try {
    const resultado = await requisicao("/usuarios", "POST", formulario("formCadastro"));
    mensagem(resultado.mensagem + " Agora faça login.");
    $("formCadastro").reset();
  } catch (erro) { mensagem(erro.message); }
});

$("sair").addEventListener("click", () => {
  usuario = null;
  mostrarUsuario();
  mensagem("Você saiu do portal.");
});

function adicionarItem(container, campos) {
  const div = document.createElement("div");
  div.className = "item";
  for (const [rotulo, valor] of Object.entries(campos)) {
    const linha = document.createElement("p");
    linha.append(textoElemento("strong", rotulo + ": "), textoElemento("span", valor));
    div.appendChild(linha);
  }
  container.appendChild(div);
}

async function carregarConsultas() {
  const [agendamentos, lista] = await Promise.all([
    requisicao("/agendamentos"), requisicao("/lista-espera")
  ]);
  const meusAgendamentos = agendamentos.filter(a => Number(a.paciente?.codigo) === Number(usuario.codigo));
  const minhaEspera = lista.filter(e => Number(e.paciente?.codigo) === Number(usuario.codigo));
  $("agendamentos").replaceChildren();
  $("espera").replaceChildren();
  if (!meusAgendamentos.length) $("agendamentos").append(textoElemento("p", "Nenhum agendamento encontrado."));
  if (!minhaEspera.length) $("espera").append(textoElemento("p", "Você não está na lista de espera."));
  meusAgendamentos.forEach(a => adicionarItem($("agendamentos"), {
    "Data": String(a.data ?? "-").slice(0, 10).split("-").reverse().join("/"),
    "Procedimento": a.procedimento?.descricao,
    "Profissional": a.profissional?.nome,
    "Status": a.status,
    "Especialidade": a.especialidade,
    "Local": [a.endereco, a.bairro, a.cidade, a.CEP].filter(Boolean).join(" - "),
    "Observação": a.observacao
  }));
  minhaEspera.forEach(e => adicionarItem($("espera"), {
    "Necessidade": e.necessidade,
    "Posição": e.nroOrdem,
    "Data da solicitação": String(e.dataSolicitacao ?? "-").slice(0, 10).split("-").reverse().join("/"),
    "Situação": e.situacao
  }));
}

async function carregarOpcoes() {
  const [procedimentos, profissionais] = await Promise.all([
    requisicao("/procedimentos"), requisicao("/profissionais")
  ]);
  preencherSelect("procedimentoSelect", procedimentos, p => p.descricao);
  preencherSelect("profissionalSelect", profissionais, p => p.nome + " - " + (p.especialidade || "Sem especialidade"));
}

function preencherSelect(id, itens, descricao) {
  const select = $(id);
  select.replaceChildren(new Option("Selecione", ""));
  itens.forEach(item => select.add(new Option(descricao(item), String(item.codigo))));
}

async function atualizarTudo() {
  try {
    await Promise.all([carregarConsultas(), carregarOpcoes()]);
  } catch (erro) { mensagem(erro.message); }
}
$("atualizar").addEventListener("click", atualizarTudo);

function configurarCadastro(id, rota, transformar) {
  $(id).addEventListener("submit", async evento => {
    evento.preventDefault();
    try {
      const dados = transformar ? transformar(formulario(id)) : formulario(id);
      const resultado = await requisicao(rota, "POST", dados);
      mensagem(resultado.mensagem || "Cadastro realizado com sucesso!");
      $(id).reset();
      await atualizarTudo();
    } catch (erro) { mensagem(erro.message); }
  });
}

configurarCadastro("formProcedimento", "/procedimentos");
configurarCadastro("formProfissional", "/profissionais");
configurarCadastro("formAgendamento", "/agendamentos", dados => ({
  ...dados,
  codigoPaciente: usuario.codigo,
  codigoProcedimento: Number(dados.codigoProcedimento),
  codigoProfissional: Number(dados.codigoProfissional)
}));
configurarCadastro("formEspera", "/lista-espera", dados => ({
  ...dados,
  codigoPaciente: usuario.codigo,
  nroOrdem: Number(dados.nroOrdem)
}));

mostrarUsuario();
