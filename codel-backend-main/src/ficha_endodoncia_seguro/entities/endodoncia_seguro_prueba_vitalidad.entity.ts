import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { FichaEndodonciaSeguro } from './ficha_endodoncia_seguro.entity';

@Entity('endodoncia_prueba_vitalidad_seguro')
export class EndodonciaSeguroPruebaVitalidad {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fichaEndodonciaSeguroId: number;

    @ManyToOne(() => FichaEndodonciaSeguro, ficha => ficha.pruebas_vitalidad, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'fichaEndodonciaSeguroId' })
    fichaEndodonciaSeguro: FichaEndodonciaSeguro;

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
