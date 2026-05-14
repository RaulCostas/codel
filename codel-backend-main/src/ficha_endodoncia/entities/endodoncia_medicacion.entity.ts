import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { FichaEndodoncia } from './ficha_endodoncia.entity';

@Entity('endodoncia_medicacion')
export class EndodonciaMedicacion {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fichaEndodonciaId: number;

    @ManyToOne(() => FichaEndodoncia, ficha => ficha.medicacion_intraconducto, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'fichaEndodonciaId' })
    fichaEndodoncia: FichaEndodoncia;

    @Column({ type: 'text', nullable: true })
    fecha: string;

    @Column({ type: 'text', nullable: true })
    medicacion: string;
}
