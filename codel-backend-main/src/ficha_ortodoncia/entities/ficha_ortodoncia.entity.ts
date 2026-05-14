import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { Paciente } from '../../pacientes/entities/paciente.entity';
import { Proforma } from '../../proformas/entities/proforma.entity';

@Entity('ficha_ortodoncia')
export class FichaOrtodoncia {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    pacienteId: number;

    @ManyToOne(() => Paciente, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'pacienteId' })
    paciente: Paciente;

    @Column({ unique: true })
    proformaId: number;

    @OneToOne(() => Proforma, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'proformaId' })
    proforma: Proforma;

    @Column({ type: 'text', nullable: true })
    diagnostico: string;

    // Ortodoncia
    @Column({ default: false })
    ortodoncia_superior: boolean;

    @Column({ default: false })
    ortodoncia_inferior: boolean;

    @Column({ default: false })
    ortodoncia_bimaxilar: boolean;

    // Ortopedia
    @Column({ default: false })
    ortopedia: boolean;

    @Column({ default: false })
    ap_ortodontico_ortopedico: boolean;

    @Column({ type: 'text', nullable: true })
    ap_descripcion: string;

    // Bandas/Tubos
    @Column({ default: false })
    bandas_superior: boolean;

    @Column({ default: false })
    bandas_inferior: boolean;

    @Column({ default: false })
    bandas_ambos: boolean;

    @Column({ default: false })
    tubos_superior: boolean;

    @Column({ default: false })
    tubos_inferior: boolean;

    @Column({ default: false })
    tubos_ambos: boolean;

    // Brackets Convencional
    @Column({ default: false })
    brackets_conv_metalicos: boolean;

    @Column({ default: false })
    brackets_conv_esteticos: boolean;

    @Column({ default: false })
    brackets_conv_combinados: boolean;

    // Brackets Autoligado
    @Column({ default: false })
    brackets_auto_metalicos: boolean;

    @Column({ default: false })
    brackets_auto_esteticos: boolean;

    @Column({ default: false })
    brackets_auto_combinados: boolean;

    // Alineadores
    @Column({ default: false })
    alineadores_superior: boolean;

    @Column({ default: false })
    alineadores_inferior: boolean;

    @Column({ default: false })
    alineadores_ambos: boolean;

    // Additional Components
    @Column({ default: false })
    atp: boolean;

    @Column({ default: false })
    arco_lingual: boolean;

    @Column({ default: false })
    mascara_traccion_frontal: boolean;

    @Column({ default: false })
    disyuntor_palatino_hirax: boolean;

    @Column({ default: false })
    componentes_otros: boolean;

    @Column({ type: 'text', nullable: true })
    componentes_otros_texto: string;

    @Column({ default: false })
    identificador_levantamiento_mordida: boolean; // Renamed to avoid confusion

    @Column({ type: 'text', nullable: true })
    levantamiento_tipo: string;

    @Column({ default: false })
    exodoncia_ortodoncia: boolean;

    @Column({ type: 'text', nullable: true })
    exodoncia_piezas: string;

    @Column({ type: 'text', nullable: true })
    tiempo_aproximado: string;

    @Column({ type: 'text', nullable: true })
    otros: string;

    @Column({ type: 'text', nullable: true })
    observaciones: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
