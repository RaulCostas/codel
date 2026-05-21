import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Inventario } from '../../inventario/entities/inventario.entity';

@Entity('unidad_medida')
export class UnidadMedida {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text' })
    nombre: string;

    @Column({ type: 'text', default: 'activo' })
    estado: string; // 'activo' | 'inactivo'

    @OneToMany(() => Inventario, (inventario) => inventario.unidadMedida)
    inventarios: Inventario[];
}
