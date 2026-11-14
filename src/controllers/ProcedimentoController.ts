import { Request, Response } from "express";
import { AppDataSource } from "../config/dataSource";
import { Procedimento } from "../models/Procedimento";

export class ProcedimentoController {

    async cadastrar(req: Request, res: Response) {

        try {

            const repository = AppDataSource.getRepository(Procedimento);

            const { descricao } = req.body;

            const procedimento = repository.create({ descricao });

            await repository.save(procedimento);

            return res.status(201).json(procedimento);

        } catch (erro) {

            console.error(erro);

            return res.status(500).json({
                mensagem: "Erro ao cadastrar procedimento."
            });
        }
    }

    async listar(req: Request, res: Response) {

        try {

            const repository = AppDataSource.getRepository(Procedimento);

            const procedimentos = await repository.find();

            return res.status(200).json(procedimentos);

        } catch (erro) {

            console.error(erro);

            return res.status(500).json({
                mensagem: "Erro ao listar procedimentos."
            });
        }
    }

    async buscarPorCodigo(req: Request, res: Response) {

        try {

            const repository = AppDataSource.getRepository(Procedimento);

            const codigo = Number(req.params.codigo);

            if (!Number.isInteger(codigo) || codigo <= 0) {
                return res.status(400).json({
                    mensagem: "Código inválido."
                });
            }

            const procedimento = await repository.findOneBy({ codigo });

            if (!procedimento) {
                return res.status(404).json({
                    mensagem: "Procedimento não encontrado."
                });
            }

            return res.status(200).json(procedimento);

        } catch (erro) {

            console.error(erro);

            return res.status(500).json({
                mensagem: "Erro ao buscar procedimento."
            });
        }
    }
}