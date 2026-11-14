import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany
} from "typeorm";

import { Agendamento } from "./Agendamento";

@Entity("profissional")
export class Profissional {

    @PrimaryGeneratedColumn()
    codigo: number;

    @Column({ length: 100 })
    nome: string;

    @Column({ length: 100, nullable: true })
    especialidade: string;

    @OneToMany(() => Agendamento, agendamento => agendamento.profissional)
    agendamentos: Agendamento[];
}