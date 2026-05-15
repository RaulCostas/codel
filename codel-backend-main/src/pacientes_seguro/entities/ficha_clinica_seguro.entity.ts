import { Entity, Column, PrimaryGeneratedColumn, OneToOne, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PacienteSeguro } from './paciente_seguro.entity';
import { User } from '../../users/entities/user.entity';

@Entity('ficha_clinica_seguro')
export class FichaClinicaSeguro {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    pacienteSeguroId: number;

    @OneToOne(() => PacienteSeguro, (paciente) => paciente.fichaClinica, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'pacienteSeguroId' })
    pacienteSeguro: PacienteSeguro;

    // --- VISITA DENTAL ---
    @Column({ type: 'text', nullable: true })
    motivo_consulta: string;

    @Column({ type: 'text', nullable: true })
    motivo_visita_anterior: string;

    @Column({ type: 'text', nullable: true })
    fecha_ultima_visita: string;

    // --- COMPLICACIONES ---
    @Column({ type: 'boolean', default: false })
    complicaciones: boolean;

    @Column({ type: 'text', nullable: true })
    complicaciones_detalle: string;

    // --- TRATAMIENTO MÉDICO ---
    @Column({ type: 'boolean', default: false })
    tratamiento_medico_actual: boolean;

    @Column({ type: 'text', nullable: true })
    tratamiento_medico_enfermedad: string;

    // --- MEDICAMENTOS ---
    @Column({ type: 'boolean', default: false })
    toma_medicamento: boolean;

    @Column({ type: 'text', nullable: true })
    medicamento_detalle: string;

    // --- ALERGIAS ---
    @Column({ type: 'boolean', default: false })
    alergia_medicamento: boolean;

    @Column({ type: 'text', nullable: true })
    alergia_medicamento_detalle: string;

    // --- ENFERMEDADES ---
    @Column({ type: 'boolean', default: false })
    enf_epilepsia: boolean;

    @Column({ type: 'text', nullable: true })
    enf_epilepsia_tratamiento: string;

    @Column({ type: 'boolean', default: false })
    enf_anemia: boolean;

    @Column({ type: 'text', nullable: true })
    enf_anemia_tratamiento: string;

    @Column({ type: 'boolean', default: false })
    enf_diabetes: boolean;

    @Column({ type: 'text', nullable: true })
    enf_diabetes_tratamiento: string;

    @Column({ type: 'boolean', default: false })
    enf_tiroidismo: boolean; // Hiper o Hipotiroidismo

    @Column({ type: 'text', nullable: true })
    enf_tiroidismo_tratamiento: string;

    @Column({ type: 'boolean', default: false })
    enf_hipertension: boolean;

    @Column({ type: 'text', nullable: true })
    enf_hipertension_tratamiento: string;

    @Column({ type: 'boolean', default: false })
    enf_infarto: boolean;

    @Column({ type: 'text', nullable: true })
    enf_infarto_tratamiento: string;

    @Column({ type: 'boolean', default: false })
    enf_asma: boolean;

    @Column({ type: 'text', nullable: true })
    enf_asma_tratamiento: string;

    @Column({ type: 'boolean', default: false })
    enf_renal: boolean; // Insuficiencia renal

    @Column({ type: 'text', nullable: true })
    enf_renal_tratamiento: string;

    @Column({ type: 'boolean', default: false })
    enf_gastritis: boolean;

    @Column({ type: 'text', nullable: true })
    enf_gastritis_tratamiento: string;

    @Column({ type: 'boolean', default: false })
    enf_otros: boolean;

    @Column({ type: 'text', nullable: true })
    enf_otros_detalle: string;

    @Column({ type: 'text', nullable: true })
    enf_otros_tratamiento: string;

    // --- EXAMEN CLÍNICO ---
    @Column({ type: 'text', nullable: true })
    examen_clinico_extraoral: string;

    @Column({ type: 'text', nullable: true })
    particularidad: string;

    @Column({ type: 'boolean', default: false })
    esta_firmado: boolean;

    @Column({ type: 'int', nullable: true })
    usuarioId: number | null;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'usuarioId' })
    usuario: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
