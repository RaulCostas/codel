import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('unidad_medida')
export class UnidadMedida {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text' })
    nombre: string;

    @Column({ type: 'text', default: 'activo' })
    estado: string; // 'activo' | 'inactivo'
}
