import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
} from "typeorm";

import { Usuario } from "./Usuario";
import { Procedimento } from "./Procedimento";
import { Profissional } from "./Profissional";

@Entity("agendamento")
export class Agendamento {

    @PrimaryGeneratedColumn()
    codigo: number;

    @Column({ length: 30 })
    status: string;

    @Column({ type: "date" })
    data: Date;

    @Column({ length: 100 })
    especialidade: string;

    @Column({ length: 200 })
    endereco: string;

    @Column({ length: 100 })
    cidade: string;

    @Column({ length: 100 })
    bairro: string;

    @Column({ length: 9 })
    CEP: string;

    @Column({ length: 500, nullable: true })
    observacao: string;

    @ManyToOne(() => Usuario, usuario => usuario.agendamentos)
    @JoinColumn({ name: "codigopaciente" })
    paciente: Usuario;

    @ManyToOne(() => Procedimento, procedimento => procedimento.agendamentos)
    @JoinColumn({ name: "codigoprocedimento" })
    procedimento: Procedimento;

    @ManyToOne(() => Profissional, profissional => profissional.agendamentos)
    @JoinColumn({ name: "codigoprofissional" })
    profissional: Profissional;
}