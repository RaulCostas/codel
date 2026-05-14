import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, ILike } from 'typeorm';
import { PacienteSeguro } from './entities/paciente_seguro.entity';
import { FichaClinicaSeguro } from './entities/ficha_clinica_seguro.entity';
import { CreatePacienteSeguroDto } from './dto/create-paciente-seguro.dto';
import { UpdatePacienteSeguroDto } from './dto/update-paciente-seguro.dto';
import { ExamenDentalSeguro } from './entities/examen_dental_seguro.entity';

@Injectable()
export class PacientesSeguroService {
    constructor(
        @InjectRepository(PacienteSeguro)
        private pacientesSeguroRepository: Repository<PacienteSeguro>,
        @InjectRepository(FichaClinicaSeguro)
        private fichaSeguroRepository: Repository<FichaClinicaSeguro>,
        @InjectRepository(ExamenDentalSeguro)
        private examenDentalRepository: Repository<ExamenDentalSeguro>,
        private dataSource: DataSource,
    ) { }

    private readonly fichaFields = [
        'motivo_consulta',
        'motivo_visita_anterior',
        'fecha_ultima_visita',
        'complicaciones', 'complicaciones_detalle',
        'tratamiento_medico_actual', 'tratamiento_medico_enfermedad',
        'toma_medicamento', 'medicamento_detalle',
        'alergia_medicamento', 'alergia_medicamento_detalle',
        'enf_epilepsia', 'enf_epilepsia_tratamiento',
        'enf_anemia', 'enf_anemia_tratamiento',
        'enf_diabetes', 'enf_diabetes_tratamiento',
        'enf_tiroidismo', 'enf_tiroidismo_tratamiento',
        'enf_hipertension', 'enf_hipertension_tratamiento',
        'enf_infarto', 'enf_infarto_tratamiento',
        'enf_asma', 'enf_asma_tratamiento',
        'enf_renal', 'enf_renal_tratamiento',
        'enf_gastritis', 'enf_gastritis_tratamiento',
        'enf_otros', 'enf_otros_detalle', 'enf_otros_tratamiento',
        'examen_clinico_extraoral', 'particularidad',
    ];

    private splitDto(dto: any): { pacienteData: any; fichaData: any } {
        const pacienteData: any = {};
        const fichaData: any = {};
        for (const [key, value] of Object.entries(dto)) {
            if (this.fichaFields.includes(key)) {
                fichaData[key] = value;
            } else {
                pacienteData[key] = value;
            }
        }
        return { pacienteData, fichaData };
    }

    async create(dto: CreatePacienteSeguroDto): Promise<PacienteSeguro> {
        const { pacienteData, fichaData } = this.splitDto(dto);

        // --- DUPLICATE CHECK ---
        const whereConditions: any[] = [];
        
        if (pacienteData.ci) {
            whereConditions.push({ ci: pacienteData.ci });
        }

        if (pacienteData.nombre && pacienteData.paterno && pacienteData.fecha_nacimiento) {
            whereConditions.push({
                nombre: pacienteData.nombre,
                paterno: pacienteData.paterno,
                fecha_nacimiento: pacienteData.fecha_nacimiento
            });
        }

        if (whereConditions.length > 0) {
            const existing = await this.pacientesSeguroRepository.findOne({
                where: whereConditions
            });
            if (existing) {
                const dupField = existing.ci === pacienteData.ci ? `CI: ${existing.ci}` : `Nombre y Fecha Nac.`;
                throw new BadRequestException(`Ya existe un paciente de SEGURO registrado con estos datos (${dupField}). Registrado como: ${existing.nombre} ${existing.paterno}`);
            }
        }
        // -----------------------

        return await this.dataSource.transaction(async (manager) => {
            const paciente = manager.create(PacienteSeguro, pacienteData);
            const saved = await manager.save(PacienteSeguro, paciente);

            const ficha = manager.create(FichaClinicaSeguro, {
                ...fichaData,
                pacienteSeguroId: saved.id,
            });
            await manager.save(FichaClinicaSeguro, ficha);

            return (await manager.findOne(PacienteSeguro, {
                where: { id: saved.id },
                relations: ['fichaClinica'],
            }))!;
        });
    }

    async findAll(page: number = 1, limit: number = 10, search: string = ''): Promise<{ data: PacienteSeguro[], total: number, page: number, limit: number, totalPages: number }> {
        const skip = (page - 1) * limit;
        const queryBuilder = this.pacientesSeguroRepository.createQueryBuilder('ps');

        if (search) {
            const searchTerm = `%${search}%`;
            queryBuilder.where(
                "(ps.nombre ILIKE :search OR ps.paterno ILIKE :search OR ps.materno ILIKE :search OR CONCAT(ps.nombre, ' ', ps.paterno, ' ', ps.materno) ILIKE :search OR CONCAT(ps.paterno, ' ', ps.materno, ' ', ps.nombre) ILIKE :search OR ps.matricula_seguro ILIKE :search OR ps.ci ILIKE :search)",
                { search: searchTerm }
            );
        }

        queryBuilder
            .orderBy('ps.paterno', 'ASC')
            .addOrderBy('ps.materno', 'ASC')
            .addOrderBy('ps.nombre', 'ASC')
            .skip(skip)
            .take(limit);

        const [data, total] = await queryBuilder.getManyAndCount();
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async findOne(id: number): Promise<PacienteSeguro> {
        const paciente = await this.pacientesSeguroRepository.findOne({
            where: { id },
            relations: ['fichaClinica'],
        });
        if (!paciente) throw new NotFoundException(`Paciente Seguro #${id} not found`);
        return paciente;
    }

    async update(id: number, dto: UpdatePacienteSeguroDto): Promise<PacienteSeguro> {
        return await this.dataSource.transaction(async (manager) => {
            const { pacienteData, fichaData } = this.splitDto(dto);

            const paciente = await manager.findOne(PacienteSeguro, { where: { id } });
            if (!paciente) throw new NotFoundException(`Paciente Seguro #${id} not found`);

            manager.merge(PacienteSeguro, paciente, pacienteData);
            await manager.save(PacienteSeguro, paciente);

            if (Object.keys(fichaData).length > 0) {
                let ficha = await manager.findOne(FichaClinicaSeguro, { where: { pacienteSeguroId: id } });
                if (ficha) {
                    manager.merge(FichaClinicaSeguro, ficha, fichaData);
                    await manager.save(FichaClinicaSeguro, ficha);
                } else {
                    const newFicha = manager.create(FichaClinicaSeguro, { ...fichaData, pacienteSeguroId: id });
                    await manager.save(FichaClinicaSeguro, newFicha);
                }
            }

            return (await manager.findOne(PacienteSeguro, {
                where: { id },
                relations: ['fichaClinica'],
            }))!;
        });
    }

    async remove(id: number): Promise<void> {
        await this.pacientesSeguroRepository.delete(id);
    }

    async getDashboardStats(): Promise<{ totalPacientes: number; birthdayPacientes: PacienteSeguro[] }> {
        const totalPacientes = await this.pacientesSeguroRepository.count({ where: { estado: 'activo' } });
        const today = new Date();
        const month = today.getMonth() + 1;
        const day = today.getDate();

        const birthdayPacientes = await this.pacientesSeguroRepository
            .createQueryBuilder('ps')
            .where('EXTRACT(MONTH FROM ps.fecha_nacimiento) = :month', { month })
            .andWhere('EXTRACT(DAY FROM ps.fecha_nacimiento) = :day', { day })
            .andWhere('ps.estado = :estado', { estado: 'activo' })
            .getMany();

        return { totalPacientes, birthdayPacientes };
    }

    async getExamenDental(pacienteSeguroId: number) {
        let examen = await this.examenDentalRepository.findOne({ where: { pacienteSeguroId } });
        if (!examen) {
            examen = this.examenDentalRepository.create({ pacienteSeguroId, detalle: {} });
            await this.examenDentalRepository.save(examen);
        }
        return examen;
    }

    async updateExamenDental(pacienteSeguroId: number, detalle: any) {
        let examen = await this.examenDentalRepository.findOne({ where: { pacienteSeguroId } });
        if (!examen) {
            examen = this.examenDentalRepository.create({ pacienteSeguroId, detalle });
        } else {
            examen.detalle = detalle;
        }
        return await this.examenDentalRepository.save(examen);
    }
}
