import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { FichaEndodoncia } from './ficha_endodoncia.entity';

@Entity('endodoncia_prueba_vitalidad')
export class EndodonciaPruebaVitalidad {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fichaEndodonciaId: number;

    @ManyToOne(() => FichaEndodoncia, ficha => ficha.pruebas_vitalidad, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'fichaEndodonciaId' })
    fichaEndodoncia: FichaEndodoncia;

    @Column({ type: 'text', nullable: true })
    pieza: string;

    @Column({ type: 'text', nullable: true })
    frio: string;

    @Column({ type: 'text', nullable: true })
    calor: string;

    @Column({ type: 'text', nullable: true })
    electrica: string;

    @Column({ type: 'text', nullable: true })
    percusion: string;

    @Column({ type: 'text', nullable: true })
    palpacion: string;

    @Column({ type: 'text', nullable: true })
    estado: string;
}
