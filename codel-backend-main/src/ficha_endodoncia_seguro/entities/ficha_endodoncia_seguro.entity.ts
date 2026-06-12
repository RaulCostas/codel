import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { PacienteSeguro } from '../../pacientes_seguro/entities/paciente_seguro.entity';
import { EndodonciaSeguroPruebaVitalidad } from './endodoncia_seguro_prueba_vitalidad.entity';
import { EndodonciaSeguroControlTcr } from './endodoncia_seguro_control_tcr.entity';
import { EndodonciaSeguroMedicacion } from './endodoncia_seguro_medicacion.entity';

@Entity('ficha_endodoncia_seguro')
export class FichaEndodonciaSeguro {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    pacienteSeguroId: number;

    @ManyToOne(() => PacienteSeguro, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'pacienteSeguroId' })
    pacienteSeguro: PacienteSeguro;

    @Column({ nullable: true })
    pieza_dental: string;

    // 1. Diagnóstico Clínico
    @Column({ default: false }) clinico_caries_dental: boolean;
    @Column({ default: false }) clinico_fractura_coronal: boolean;
    @Column({ default: false }) clinico_decoloracion_pieza: boolean;
    @Column({ default: false }) clinico_movilidad_dental: boolean;
    @Column({ default: false }) clinico_exposicion_pulpar: boolean;
    @Column({ default: false }) clinico_restauracion_deficiente: boolean;
    @Column({ default: false }) clinico_lesion_furca: boolean;
    @Column({ default: false }) clinico_recesion_gingival: boolean;
    @Column({ default: false }) clinico_atrision: boolean;
    @Column({ default: false }) clinico_abracion: boolean;
    @Column({ default: false }) clinico_abfraccion: boolean;
    @Column({ default: false }) clinico_alteracion_desarrollo: boolean;

    // 2. Diagnóstico Radiográfico
    @Column({ default: false }) radio_ligamento_ensanchado: boolean;
    @Column({ default: false }) radio_fractura_vertical: boolean;
    @Column({ default: false }) radio_fractura_horizontal: boolean;
    @Column({ default: false }) radio_apice_inmaduro: boolean;
    @Column({ default: false }) radio_caries_bajo_restauracion: boolean;
    @Column({ default: false }) radio_reabsorcion_externa: boolean;
    @Column({ default: false }) radio_reabsorcion_interna: boolean;
    @Column({ default: false }) radio_tcr_deficiente: boolean;
    @Column({ default: false }) radio_lesion_periapical: boolean;
    @Column({ default: false }) radio_lesion_lateral: boolean;
    @Column({ default: false }) radio_calcificacion_espacio: boolean;
    @Column({ default: false }) radio_perdida_osea: boolean;

    // 3. Dolor (Antes y Ahora) - Presencia
    @Column({ default: false }) dolor_pres_ninguno_antes: boolean;
    @Column({ default: false }) dolor_pres_ninguno_ahora: boolean;
    @Column({ default: false }) dolor_pres_leve_antes: boolean;
    @Column({ default: false }) dolor_pres_leve_ahora: boolean;
    @Column({ default: false }) dolor_pres_moderado_antes: boolean;
    @Column({ default: false }) dolor_pres_moderado_ahora: boolean;
    @Column({ default: false }) dolor_pres_severo_antes: boolean;
    @Column({ default: false }) dolor_pres_severo_ahora: boolean;

    // 3. Dolor (Antes y Ahora) - Tipo
    @Column({ default: false }) dolor_tipo_espontaneo_antes: boolean;
    @Column({ default: false }) dolor_tipo_espontaneo_ahora: boolean;
    @Column({ default: false }) dolor_tipo_estimulado_antes: boolean;
    @Column({ default: false }) dolor_tipo_estimulado_ahora: boolean;
    @Column({ default: false }) dolor_tipo_calor_antes: boolean;
    @Column({ default: false }) dolor_tipo_calor_ahora: boolean;
    @Column({ default: false }) dolor_tipo_frio_antes: boolean;
    @Column({ default: false }) dolor_tipo_frio_ahora: boolean;
    @Column({ default: false }) dolor_tipo_acidez_antes: boolean;
    @Column({ default: false }) dolor_tipo_acidez_ahora: boolean;
    @Column({ default: false }) dolor_tipo_dulce_antes: boolean;
    @Column({ default: false }) dolor_tipo_dulce_ahora: boolean;
    @Column({ default: false }) dolor_tipo_masticacion_antes: boolean;
    @Column({ default: false }) dolor_tipo_masticacion_ahora: boolean;
    @Column({ default: false }) dolor_tipo_constante_antes: boolean;
    @Column({ default: false }) dolor_tipo_constante_ahora: boolean;
    @Column({ default: false }) dolor_tipo_sordo_antes: boolean;
    @Column({ default: false }) dolor_tipo_sordo_ahora: boolean;
    @Column({ default: false }) dolor_tipo_palpitante_antes: boolean;
    @Column({ default: false }) dolor_tipo_palpitante_ahora: boolean;

    // 4. Diagnóstico Pulpar
    @Column({ default: false }) pulpar_sana: boolean;
    @Column({ default: false }) pulpar_reversible: boolean;
    @Column({ default: false }) pulpar_irreversible_sintomatica: boolean;
    @Column({ default: false }) pulpar_irreversible_asintomatica: boolean;
    @Column({ default: false }) pulpar_necrosis: boolean;
    @Column({ default: false }) pulpar_previamente_tratada: boolean;
    @Column({ default: false }) pulpar_tcr_sin_terminar: boolean;
    @Column({ default: false }) pulpar_conducto_no_sellado: boolean;

    // 5. Diagnóstico Periapical
    @Column({ default: false }) peri_saludable: boolean;
    @Column({ default: false }) peri_apical_sintomatica: boolean;
    @Column({ default: false }) peri_apical_asintomatica: boolean;
    @Column({ default: false }) peri_absceso_agudo: boolean;
    @Column({ default: false }) peri_absceso_cronico: boolean;
    @Column({ default: false }) peri_osteitis_condensante: boolean;

    // Secciones Adicionales
    @Column({ type: 'text', nullable: true }) observaciones: string;
    @Column({ type: 'text', nullable: true }) diagnostico: string;
    @Column({ default: false }) tratamiento_check: boolean;
    @Column({ type: 'text', nullable: true }) tratamiento_descripcion: string;
    @Column({ default: false }) retratamiento_check: boolean;
    @Column({ type: 'text', nullable: true }) retratamiento_descripcion: string;

    @OneToMany(() => EndodonciaSeguroPruebaVitalidad, p => p.fichaEndodonciaSeguro, { cascade: true, onUpdate: 'CASCADE', onDelete: 'CASCADE' })
    pruebas_vitalidad: EndodonciaSeguroPruebaVitalidad[];

    @OneToMany(() => EndodonciaSeguroControlTcr, c => c.fichaEndodonciaSeguro, { cascade: true, onUpdate: 'CASCADE', onDelete: 'CASCADE' })
    control_tcr: EndodonciaSeguroControlTcr[];

    @OneToMany(() => EndodonciaSeguroMedicacion, m => m.fichaEndodonciaSeguro, { cascade: true, onUpdate: 'CASCADE', onDelete: 'CASCADE' })
    medicacion_intraconducto: EndodonciaSeguroMedicacion[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
