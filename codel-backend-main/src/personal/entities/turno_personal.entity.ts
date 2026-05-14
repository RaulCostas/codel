import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Personal } from '../../personal/entities/personal.entity';
import { User } from '../../users/entities/user.entity';

@Entity('turnos_personal')
export class TurnoPersonal {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'date', unique: true })
    fecha: string;

    @Column({ type: 'int' })
    personalId: number;

    @ManyToOne(() => Personal, { eager: true })
    @JoinColumn({ name: 'personalId' })
    personal: Personal;

    @Column({ type: 'int', nullable: true })
    usuarioId: number;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'usuarioId' })
    usuario: User;
}
