import { Request, Response } from "express";
import { AppDataSource } from "../config/dataSource";
import { Usuario } from "../models/Usuario";
import { Situacao } from "../models/Usuario";

export class UsuarioController {

    async cadastrar(req: Request, res: Response) {

        try {

            const repository = AppDataSource.getRepository(Usuario);

            const { login, senha } = req.body;

            const existente = await repository.findOneBy({ login });

            if (existente) {
                return res.status(409).json({
                    mensagem: "Login já cadastrado!"
                });
            }

            const usuario = repository.create({
                login,
                senha,
                situacao: Situacao.ATIVO
            });

            await repository.save(usuario);

            return res.status(201).json({
                mensagem: "Usuário cadastrado!",
                usuario: {
                    codigo: usuario.codigo,
                    login: usuario.login,
                    situacao: usuario.situacao
                }
            });

        } catch (erro) {

            console.error(erro);

            return res.status(500).json({
                mensagem: "Erro ao cadastrar usuário."
            });
        }
    }

    async listar(req: Request, res: Response) {

        try {

            const repository = AppDataSource.getRepository(Usuario);

            const usuarios = await repository.find({
                select: {
                    codigo: true,
                    login: true,
                    situacao: true
                }
            });

            return res.status(200).json(usuarios);

        } catch (erro) {

            console.error(erro);

            return res.status(500).json({
                mensagem: "Erro ao listar usuários."
            });
        }
    }

    async buscarPorCodigo(req: Request, res: Response) {

        try {

            const repository = AppDataSource.getRepository(Usuario);

            const codigo = Number(req.params.codigo);

            if (!Number.isInteger(codigo) || codigo <= 0) {
                return res.status(400).json({
                    mensagem: "Código inválido."
                });
            }

            const usuario = await repository.findOne({
                where: { codigo },
                select: {
                    codigo: true,
                    login: true,
                    situacao: true
                }
            });

            if (!usuario) {
                return res.status(404).json({
                    mensagem: "Usuário não encontrado."
                });
            }

            return res.status(200).json(usuario);

        } catch (erro) {

            console.error(erro);

            return res.status(500).json({
                mensagem: "Erro ao buscar usuário."
            });
        }
    }

    async atualizarSituacao(req: Request, res: Response) {

        try {

            const repository = AppDataSource.getRepository(Usuario);

            const codigo = Number(req.params.codigo);
            const { situacao } = req.body;

            if (!Number.isInteger(codigo) || codigo <= 0) {
                return res.status(400).json({
                    mensagem: "Código inválido."
                });
            }

            if (!Object.values(Situacao).includes(situacao)) {
                return res.status(400).json({
                    mensagem: "Situação inválida."
                });
            }

            const usuario = await repository.findOneBy({ codigo });

            if (!usuario) {
                return res.status(404).json({
                    mensagem: "Usuário não encontrado."
                });
            }

            usuario.situacao = situacao;

            await repository.save(usuario);

            return res.status(200).json({
                mensagem: "Situação atualizada!",
                usuario: {
                    codigo: usuario.codigo,
                    situacao: usuario.situacao
                }
            });

        } catch (erro) {

            console.error(erro);

            return res.status(500).json({
                mensagem: "Erro ao atualizar situação."
            });
        }
    }

    async login(req: Request, res: Response) {

        try {

            const repository = AppDataSource.getRepository(Usuario);

            const { login, senha } = req.body;

            const usuario = await repository.findOneBy({
                login,
                senha
            });

            if (!usuario || usuario.situacao === Situacao.INATIVO) {
                return res.status(401).json({
                    mensagem: "Login ou senha inválidos."
                });
            }

            return res.status(200).json({
                mensagem: "Login realizado!",
                usuario: {
                    codigo: usuario.codigo,
                    login: usuario.login
                }
            });

        } catch (erro) {

            console.error(erro);

            return res.status(500).json({
                mensagem: "Erro ao realizar login."
            });
        }
    }
}