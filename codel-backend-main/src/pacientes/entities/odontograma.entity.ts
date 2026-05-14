import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Paciente } from './paciente.entity';
import { PacienteSeguro } from '../../pacientes_seguro/entities/paciente_seguro.entity';

@Entity('odontogramas')
export class Odontograma {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: true })
    pacienteSeguroId: number;

    @ManyToOne(() => PacienteSeguro, { nullable: true })
    @JoinColumn({ name: 'pacienteSeguroId' })
    pacienteSeguro: PacienteSeguro;

    @Column({ type: 'text', nullable: true })
    notas: string;

    @Column({ type: 'jsonb', nullable: true })
    mapa_dientes: any; // Object mapping tooth key (e.g. "11") to state { state: 0-9, surfaces: {O: bool, M: bool, ...} }

    @Column({ type: 'timestamp', default: () => "timezone('America/La_Paz', now())" })
    fecha: Date;

    @Column({ type: 'int', nullable: true })
    usuarioId: number; // Who created it
}
