import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Seguro } from '../../seguro/entities/seguro.entity';
import { HistoriaClinicaSeguro } from '../../pacientes_seguro/entities/historia_clinica_seguro.entity';
import { User } from '../../users/entities/user.entity';
import { FormaPago } from '../../forma_pago/entities/forma_pago.entity';

@Entity('proforma_seguro')
export class ProformaSeguro {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: true })
    numero_proforma: number | null;

    @Column({ type: 'date', default: () => 'CURRENT_DATE' })
    fecha: string;

    @Column({ type: 'text', nullable: true })
    periodo: string;

    @Column({ type: 'int', nullable: true })
    seguroId: number | null;

    @ManyToOne(() => Seguro, { nullable: true })
    @JoinColumn({ name: 'seguroId' })
    seguro: Seguro;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    total: number;

    @Column({ type: 'text', default: 'generada' })
    estado: string; // 'generada', 'pagada', 'anulada'

    @Column({ type: 'date', nullable: true })
    fecha_pago: string | null;

    @Column({ type: 'int', nullable: true })
    formaPagoId: number | null;

    @ManyToOne(() => FormaPago, { nullable: true })
    @JoinColumn({ name: 'formaPagoId' })
    formaPago: FormaPago;

    @Column({ type: 'text', nullable: true })
    archivo_factura: string | null;

    @Column({ type: 'int', nullable: true })
    usuarioId: number;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'usuarioId' })
    usuario: User;

    @OneToMany(() => HistoriaClinicaSeguro, (historia) => historia.proformaSeguro)
    detalles: HistoriaClinicaSeguro[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
