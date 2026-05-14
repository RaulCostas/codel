import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Especialidad } from '../../especialidad/entities/especialidad.entity';
import { Seguro } from '../../seguro/entities/seguro.entity';

@Entity('arancel_seguro')
export class ArancelSeguro {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text' })
    detalle: string;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    precio: number;

    @Column({ type: 'varchar', length: 50, nullable: true })
    codigo: string;

    @Column({ type: 'varchar', length: 10, nullable: false })
    moneda: string;

    @Column({ type: 'text', default: 'activo' })
    estado: string;

    @Column({ type: 'int' })
    idEspecialidad: number;

    @ManyToOne(() => Especialidad)
    @JoinColumn({ name: 'idEspecialidad' })
    especialidad: Especialidad;

    @Column({ type: 'int', nullable: true })
    seguroId: number;

    @ManyToOne(() => Seguro)
    @JoinColumn({ name: 'seguroId' })
    seguro: Seguro;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
