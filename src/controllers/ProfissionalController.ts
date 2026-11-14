import { Request, Response } from "express";
import { AppDataSource } from "../config/dataSource";
import { Profissional } from "../models/Profissional";

export class ProfissionalController {

    async cadastrar(req: Request, res: Response) {

        try {

            const repository = AppDataSource.getRepository(Profissional);

            const { nome, especialidade } = req.body;

            const profissional = repository.create({
                nome,
                especialidade
            });

            await repository.save(profissional);

            return res.status(201).json(profissional);

        } catch (erro) {

            console.error(erro);

            return res.status(500).json({
                mensagem: "Erro ao cadastrar profissional."
            });
        }
    }

    async listar(req: Request, res: Response) {

        try {

            const repository = AppDataSource.getRepository(Profissional);

            const profissionais = await repository.find();

            return res.status(200).json(profissionais);

        } catch (erro) {

            console.error(erro);

            return res.status(500).json({
                mensagem: "Erro ao listar profissionais."
            });
        }
    }

    async buscarPorCodigo(req: Request, res: Response) {

        try {

            const repository = AppDataSource.getRepository(Profissional);

            const codigo = Number(req.params.codigo);

            if (!Number.isInteger(codigo) || codigo <= 0) {
                return res.status(400).json({
                    mensagem: "Código inválido."
                });
            }

            const profissional = await repository.findOneBy({ codigo });

            if (!profissional) {
                return res.status(404).json({
                    mensagem: "Profissional não encontrado."
                });
            }

            return res.status(200).json(profissional);

        } catch (erro) {

            console.error(erro);

            return res.status(500).json({
                mensagem: "Erro ao buscar profissional."
            });
        }
    }
}