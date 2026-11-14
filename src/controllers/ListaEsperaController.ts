import { Request, Response } from "express";
import { AppDataSource } from "../config/dataSource";
import { ListaEspera } from "../models/ListaEspera";

export class ListaEsperaController {

    async cadastrar(req: Request, res: Response) {

        try {

            const repository = AppDataSource.getRepository(ListaEspera);

            const {
                codigoPaciente,
                necessidade,
                nroOrdem,
                dataSolicitacao,
                situacao
            } = req.body;

            const solicitacao = repository.create({
                paciente: { codigo: Number(codigoPaciente) },
                necessidade,
                nroOrdem,
                dataSolicitacao,
                situacao
            });

            await repository.save(solicitacao);

            return res.status(201).json({
                mensagem: "Paciente adicionado à lista de espera!",
                solicitacao
            });

        } catch (erro) {

            console.error(erro);

            return res.status(500).json({
                mensagem: "Erro ao cadastrar na lista de espera."
            });
        }
    }

    async listar(req: Request, res: Response) {

        try {

            const repository = AppDataSource.getRepository(ListaEspera);

            const lista = await repository.find({
                relations: {
                    paciente: true
                },
                order: {
                    nroOrdem: "ASC"
                }
            });

            return res.status(200).json(lista);

        } catch (erro) {

            console.error(erro);

            return res.status(500).json({
                mensagem: "Erro ao listar fila de espera."
            });
        }
    }
}