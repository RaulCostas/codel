import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Paciente } from './paciente.entity';

@Entity('ficha_clinica_particular')
export class FichaClinicaParticular {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    pacienteId: number;

    @OneToOne(() => Paciente, (paciente) => paciente.fichaClinica, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'pacienteId' })
    paciente: Paciente;

    // --- MOTIVO CONSULTA ---
    @Column({ type: 'text', nullable: true })
    motivo_consulta: string;

    // --- ANTECEDENTES FAMILIARES ---
    @Column({ type: 'text', nullable: true })
    ant_familiares_abuelos: string;

    @Column({ type: 'text', nullable: true })
    ant_familiares_padres: string;

    @Column({ type: 'text', nullable: true })
    ant_familiares_hermanos: string;

    // --- ANTECEDENTES PERSONALES PATOLOGICOS ---
    @Column({ type: 'boolean', default: false })
    ant_pat_tratamiento_medico: boolean;

    @Column({ type: 'text', nullable: true })
    tratamiento_medico_detalle: string;

    @Column({ type: 'boolean', default: false })
    ant_pat_hemorragias: boolean;

    @Column({ type: 'boolean', default: false })
    ant_pat_intervencion_quirurgica: boolean;

    @Column({ type: 'boolean', default: false })
    ant_pat_reaccion_anestesia: boolean;

    @Column({ type: 'text', nullable: true })
    reaccion_anestesia_detalle: string;

    @Column({ type: 'boolean', default: false })
    ant_pat_toma_medicamentos: boolean;

    @Column({ type: 'text', nullable: true })
    medicamento_72h_detalle: string;

    @Column({ type: 'boolean', default: false })
    ant_pat_alteraciones_cicatrizacion: boolean;

    @Column({ type: 'boolean', default: false })
    ant_pat_alergias: boolean;

    @Column({ type: 'text', nullable: true })
    alergia_medicamento_detalle: string;

    @Column({ type: 'text', nullable: true })
    ant_pat_otros: string;

    // --- ANTECEDENTES PERSONALES NO PATOLOGICOS ---
    @Column({ type: 'boolean', default: false })
    ant_no_pat_fuma: boolean;

    @Column({ type: 'text', nullable: true })
    fuma_cantidad: string;

    @Column({ type: 'boolean', default: false })
    ant_no_pat_bruxismo: boolean;

    @Column({ type: 'boolean', default: false })
    ant_no_pat_bebe: boolean;

    @Column({ type: 'boolean', default: false })
    ant_no_pat_succion_digital: boolean;

    @Column({ type: 'boolean', default: false })
    ant_no_pat_onicofagia: boolean;

    @Column({ type: 'boolean', default: false })
    ant_no_pat_mordisqueo_objetos: boolean;

    @Column({ type: 'boolean', default: false })
    ant_no_pat_queilofagia: boolean;

    @Column({ type: 'text', nullable: true })
    ant_no_pat_otros: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    recomendado_por: string;

    @Column({ type: 'boolean', default: false })
    esta_firmado: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
