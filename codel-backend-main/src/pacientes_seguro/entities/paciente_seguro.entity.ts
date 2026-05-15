import { Entity, Column, PrimaryGeneratedColumn, OneToOne, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { FichaClinicaSeguro } from './ficha_clinica_seguro.entity';
import { Seguro } from '../../seguro/entities/seguro.entity';
import { User } from '../../users/entities/user.entity';

@Entity('pacientes_seguro')
export class PacienteSeguro {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'date', default: () => 'CURRENT_DATE' })
    fecha_ingreso: string;

    @Column({ type: 'text', nullable: true })
    paterno: string;

    @Column({ type: 'text', nullable: true })
    materno: string;

    @Column({ type: 'text', nullable: true })
    nombre: string;

    @Column({ type: 'date', nullable: true })
    fecha_nacimiento: string;

    @Column({ type: 'text', nullable: true })
    genero: string;

    @Column({ type: 'text', nullable: true })
    ci: string;

    @Column({ type: 'text', nullable: true })
    direccion: string;

    @Column({ type: 'text', nullable: true })
    celular: string;

    @Column({ type: 'text', nullable: true })
    telefono: string;

    // --- DATOS DE SEGURO ---
    @Column({ type: 'text', nullable: true })
    matricula_seguro: string;

    @Column({ type: 'boolean', default: false })
    es_trabajador: boolean;

    @Column({ type: 'boolean', default: false })
    es_beneficiario: boolean;

    @Column({ type: 'int', nullable: true })
    seguroId: number;

    @ManyToOne(() => Seguro, { nullable: true })
    @JoinColumn({ name: 'seguroId' })
    seguro: Seguro;

    // --- DATOS FISICOS ---
    @Column({ type: 'text', nullable: true })
    altura: string;

    @Column({ type: 'text', nullable: true })
    peso: string;

    @Column({ type: 'text', default: 'activo' })
    estado: string;

    @Column({ type: 'boolean', default: false })
    esta_firmado: boolean;

    @OneToOne(() => FichaClinicaSeguro, (ficha) => ficha.pacienteSeguro, { cascade: true, eager: false })
    fichaClinica: FichaClinicaSeguro;

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
