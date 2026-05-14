import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { PacienteSeguro } from './paciente_seguro.entity';

@Entity('examen_dental_seguro')
export class ExamenDentalSeguro {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    pacienteSeguroId: number;

    @OneToOne(() => PacienteSeguro, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'pacienteSeguroId' })
    pacienteSeguro: PacienteSeguro;

    @Column({ type: 'jsonb', nullable: true })
    detalle: any; // { "1.8": "CO", "1.7": "ROF", ... }

    @UpdateDateColumn()
    updatedAt: Date;
}
