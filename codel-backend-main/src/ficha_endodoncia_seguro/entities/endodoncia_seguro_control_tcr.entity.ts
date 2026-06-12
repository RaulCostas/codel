import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { FichaEndodonciaSeguro } from './ficha_endodoncia_seguro.entity';

@Entity('endodoncia_control_tcr_seguro')
export class EndodonciaSeguroControlTcr {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fichaEndodonciaSeguroId: number;

    @ManyToOne(() => FichaEndodonciaSeguro, ficha => ficha.control_tcr, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'fichaEndodonciaSeguroId' })
    fichaEndodonciaSeguro: FichaEndodonciaSeguro;

    @Column({ type: 'text', nullable: true })
    conductos_radiculares: string;

    @Column({ type: 'text', nullable: true })
    punto_referencia: string;

    @Column({ type: 'text', nullable: true })
    medida_provisional: string;

    @Column({ type: 'text', nullable: true })
    medida_trabajo: string;

    @Column({ type: 'text', nullable: true })
    lima_inicial: string;

    @Column({ type: 'text', nullable: true })
    lima_maestra: string;
}
