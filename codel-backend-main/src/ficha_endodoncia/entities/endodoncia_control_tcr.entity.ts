import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { FichaEndodoncia } from './ficha_endodoncia.entity';

@Entity('endodoncia_control_tcr')
export class EndodonciaControlTcr {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fichaEndodonciaId: number;

    @ManyToOne(() => FichaEndodoncia, ficha => ficha.control_tcr, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'fichaEndodonciaId' })
    fichaEndodoncia: FichaEndodoncia;

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
