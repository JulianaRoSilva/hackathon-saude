import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
} from "typeorm";

import { Usuario } from "./Usuario";

@Entity("listaespera")
export class ListaEspera {

    @PrimaryGeneratedColumn()
    codigo: number;

    @Column({ length: 200 })
    necessidade: string;

    @Column({ type: "int" })
    nroOrdem: number;

    @Column({ type: "date" })
    dataSolicitacao: Date;

    @Column({ length: 30 })
    situacao: string;

    @ManyToOne(() => Usuario, usuario => usuario.listaEspera)
    @JoinColumn({ name: "codigopaciente" })
    paciente: Usuario;
}