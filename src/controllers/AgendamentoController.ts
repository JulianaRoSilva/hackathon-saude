import { Request, Response } from "express";
import { AppDataSource } from "../config/dataSource";
import { Agendamento } from "../models/Agendamento";

export class AgendamentoController {

    async cadastrar(req: Request, res: Response) {

        try {

            const repository = AppDataSource.getRepository(Agendamento);

            const {
                status,
                data,
                codigoPaciente,
                codigoProcedimento,
                codigoProfissional,
                especialidade,
                endereco,
                cidade,
                bairro,
                CEP,
                observacao
            } = req.body;

            const agendamento = repository.create({
                status,
                data,
                paciente: { codigo: Number(codigoPaciente) },
                procedimento: { codigo: Number(codigoProcedimento) },
                profissional: { codigo: Number(codigoProfissional) },
                especialidade,
                endereco,
                cidade,
                bairro,
                CEP,
                observacao
            });

            await repository.save(agendamento);

            return res.status(201).json({
                mensagem: "Agendamento realizado!",
                agendamento
            });

        } catch (erro) {

            console.error(erro);

            return res.status(500).json({
                mensagem: "Erro ao realizar agendamento."
            });
        }
    }

    async listar(req: Request, res: Response) {

        try {

            const repository = AppDataSource.getRepository(Agendamento);

            const agendamentos = await repository.find({
                relations: {
                    paciente: true,
                    procedimento: true,
                    profissional: true
                }
            });

            return res.status(200).json(agendamentos);

        } catch (erro) {

            console.error(erro);

            return res.status(500).json({
                mensagem: "Erro ao listar agendamentos."
            });
        }
    }

    async buscarPorCodigo(req: Request, res: Response) {

        try {

            const repository = AppDataSource.getRepository(Agendamento);

            const codigo = Number(req.params.codigo);

            if (!Number.isInteger(codigo) || codigo <= 0) {
                return res.status(400).json({
                    mensagem: "Código inválido."
                });
            }

            const agendamento = await repository.findOne({
                where: { codigo },
                relations: {
                    paciente: true,
                    procedimento: true,
                    profissional: true
                }
            });

            if (!agendamento) {
                return res.status(404).json({
                    mensagem: "Agendamento não encontrado."
                });
            }

            return res.status(200).json(agendamento);

        } catch (erro) {

            console.error(erro);

            return res.status(500).json({
                mensagem: "Erro ao buscar agendamento."
            });
        }
    }
}