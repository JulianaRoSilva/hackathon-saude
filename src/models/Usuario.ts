import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany
} from "typeorm";

export enum Situacao {
    ATIVO = "A",
    INATIVO = "I"
}

import { Agendamento } from "./Agendamento";
import { ListaEspera } from "./ListaEspera";

@Entity("usuario")
export class Usuario {

    @PrimaryGeneratedColumn()
    codigo: number;

    @Column({ length: 11, unique: true })
    login: string;

    @Column({ length: 255 })
    senha: string;

    @Column({ type: "enum", enum: Situacao, default: Situacao.ATIVO })
    situacao: string;

    @OneToMany(() => Agendamento, agendamento => agendamento.paciente)
    agendamentos: Agendamento[];

    @OneToMany(() => ListaEspera, espera => espera.paciente)
    listaEspera: ListaEspera[];
}