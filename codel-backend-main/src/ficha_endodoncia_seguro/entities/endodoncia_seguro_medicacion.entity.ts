import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { FichaEndodonciaSeguro } from './ficha_endodoncia_seguro.entity';

@Entity('endodoncia_medicacion_seguro')
export class EndodonciaSeguroMedicacion {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fichaEndodonciaSeguroId: number;

    @ManyToOne(() => FichaEndodonciaSeguro, ficha => ficha.medicacion_intraconducto, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'fichaEndodonciaSeguroId' })
    fichaEndodonciaSeguro: FichaEndodonciaSeguro;

    @Column({ type: 'text', nullable: true })
    fecha: string;

    @Column({ type: 'text', nullable: true })
    medicacion: string;
}
