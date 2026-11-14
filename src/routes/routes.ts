import { Router } from "express";

import { UsuarioController } from "../controllers/UsuarioController";
import { ProcedimentoController } from "../controllers/ProcedimentoController";
import { ProfissionalController } from "../controllers/ProfissionalController";
import { AgendamentoController } from "../controllers/AgendamentoController";
import { ListaEsperaController } from "../controllers/ListaEsperaController";

const routes = Router();

const usuarioController = new UsuarioController();
const procedimentoController = new ProcedimentoController();
const profissionalController = new ProfissionalController();
const agendamentoController = new AgendamentoController();
const listaEsperaController = new ListaEsperaController();

// USUÁRIO
routes.post("/usuarios", usuarioController.cadastrar);
routes.post("/usuarios/login", usuarioController.login);
routes.get("/usuarios", usuarioController.listar);
routes.get("/usuarios/:codigo", usuarioController.buscarPorCodigo);
routes.patch("/usuarios/:codigo/situacao", usuarioController.atualizarSituacao);

// PROCEDIMENTO
routes.post("/procedimentos", procedimentoController.cadastrar);
routes.get("/procedimentos", procedimentoController.listar);
routes.get("/procedimentos/:codigo", procedimentoController.buscarPorCodigo);

// PROFISSIONAL
routes.post("/profissionais", profissionalController.cadastrar);
routes.get("/profissionais", profissionalController.listar);
routes.get("/profissionais/:codigo", profissionalController.buscarPorCodigo);

// AGENDAMENTO
routes.post("/agendamentos", agendamentoController.cadastrar);
routes.get("/agendamentos", agendamentoController.listar);
routes.get("/agendamentos/:codigo", agendamentoController.buscarPorCodigo);

// LISTA DE ESPERA
routes.post("/lista-espera", listaEsperaController.cadastrar);
routes.get("/lista-espera", listaEsperaController.listar);

export default routes;