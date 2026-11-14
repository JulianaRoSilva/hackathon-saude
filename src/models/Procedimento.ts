import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany
} from "typeorm";

import { Agendamento } from "./Agendamento";

@Entity("procedimento")
export class Procedimento {

    @PrimaryGeneratedColumn()
    codigo: number;

    @Column({ length: 200 })
    descricao: string;

    @OneToMany(() => Agendamento, agendamento => agendamento.procedimento)
    agendamentos: Agendamento[];
}