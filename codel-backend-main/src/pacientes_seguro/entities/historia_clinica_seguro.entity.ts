import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PacienteSeguro } from './paciente_seguro.entity';
import { ArancelSeguro } from '../../arancel_seguro/entities/arancel_seguro.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { ProformaSeguro } from '../../proforma_seguro/entities/proforma_seguro.entity';
import { User } from '../../users/entities/user.entity';

@Entity('historia_clinica_seguro')
export class HistoriaClinicaSeguro {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    pacienteSeguroId: number;

    @ManyToOne(() => PacienteSeguro, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'pacienteSeguroId' })
    pacienteSeguro: PacienteSeguro;

    @Column({ type: 'date', default: () => 'CURRENT_DATE' })
    fecha: string;

    @Column({ name: 'fecha_planilla', type: 'date', nullable: true })
    fechaPlanilla: string | null;

    @Column({ type: 'int', nullable: true })
    arancelId: number | null;

    @ManyToOne(() => ArancelSeguro, { nullable: true })
    @JoinColumn({ name: 'arancelId' })
    arancel: ArancelSeguro;

    @Column({ type: 'text', nullable: true })
    pieza: string;

    @Column({ type: 'int', default: 1 })
    cantidad: number;

    @Column({ type: 'text', nullable: true })
    observaciones: string;

    @Column({ type: 'int', nullable: true })
    doctorId: number | null;

    @ManyToOne(() => Doctor, { nullable: true })
    @JoinColumn({ name: 'doctorId' })
    doctor: Doctor;

    @Column({ type: 'text', nullable: true })
    diagnostico: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    precio: number;

    @Column({ type: 'text', default: 'no terminado' }) // 'terminado' | 'no terminado'
    estadoTratamiento: string;

    @Column({ type: 'text', default: 'no' }) // 'si' | 'no'
    pagado: string;

    @Column({ type: 'boolean', default: false })
    casoClinico: boolean;

    @Column({ type: 'text', default: 'no' }) // 'si' | 'no'
    cobrado: string;

    @Column({ type: 'int', nullable: true })
    proformaSeguroId: number | null;

    @ManyToOne(() => ProformaSeguro, (proforma) => proforma.detalles, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'proformaSeguroId' })
    proformaSeguro: ProformaSeguro;

    @Column({ type: 'text', nullable: true })
    imagen: string;

    @Column({ type: 'text', nullable: true })
    imagen_descripcion: string;

    @Column({ type: 'int', nullable: true })
    usuarioId: number | null;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'usuarioId' })
    usuario: User;

    @Column({ type: 'timestamp', default: () => "timezone('America/La_Paz', now())" })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => "timezone('America/La_Paz', now())", onUpdate: "timezone('America/La_Paz', now())" })
    updatedAt: Date;
}