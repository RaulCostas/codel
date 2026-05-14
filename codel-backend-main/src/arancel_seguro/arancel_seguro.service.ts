import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, IsNull, Not } from 'typeorm';
import { CreateArancelSeguroDto } from './dto/create-arancel_seguro.dto';
import { UpdateArancelSeguroDto } from './dto/update-arancel_seguro.dto';
import { UpdatePricesDto } from './dto/update-prices.dto';
import { Especialidad } from '../especialidad/entities/especialidad.entity';
import { ArancelSeguro } from './entities/arancel_seguro.entity';

@Injectable()
export class ArancelSeguroService {
    constructor(
        @InjectRepository(ArancelSeguro)
        private arancel_seguroRepository: Repository<ArancelSeguro>,
    ) { }

    async create(createArancelSeguroDto: CreateArancelSeguroDto) {
        try {
            const existing = await this.arancel_seguroRepository.findOne({
                where: {
                    detalle: ILike(createArancelSeguroDto.detalle.trim()),
                    seguroId: createArancelSeguroDto.seguroId
                }
            });

            if (existing) {
                throw new BadRequestException('Este tratamiento ya existe para el seguro seleccionado.');
            }

            const arancel_seguro = this.arancel_seguroRepository.create(createArancelSeguroDto);
            return await this.arancel_seguroRepository.save(arancel_seguro);
        } catch (error) {
            console.error('Error creating arancel_seguro:', error);
            if (error instanceof BadRequestException) throw error;
            const fs = require('fs');
            fs.appendFileSync('error_log.txt', 'CREATE ERROR: ' + error.message + '\n' + error.stack + '\n\n');
            throw error;
        }
    }

    async findAll(search?: string, page: number = 1, limit: number = 5, seguroId?: string) {
        try {
            const skip = (page - 1) * limit;
            let where: any = {};
            
            if (search) {
                where.detalle = ILike(`%${search}%`);
            }

            if (seguroId) {
                where.seguroId = +seguroId;
            }

            const [data, total] = await this.arancel_seguroRepository.findAndCount({
                where,
                skip,
                take: limit,
                order: { detalle: 'ASC' },
                relations: ['especialidad', 'seguro'],
            });

            return {
                data,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        } catch (error) {
            console.error('Error finding arancel_seguroes:', error);
            const fs = require('fs');
            fs.appendFileSync('error_log.txt', 'FINDALL ERROR: ' + error.message + '\n' + error.stack + '\n\n');
            throw error;
        }
    }

    findOne(id: number) {
        return this.arancel_seguroRepository.findOne({
            where: { id },
            relations: ['especialidad', 'seguro'],
        });
    }

    async update(id: number, updateArancelSeguroDto: UpdateArancelSeguroDto) {
        if (updateArancelSeguroDto.detalle || updateArancelSeguroDto.seguroId !== undefined) {
            const current = await this.findOne(id);
            const detalle = updateArancelSeguroDto.detalle ? updateArancelSeguroDto.detalle.trim() : current?.detalle;
            const seguroId = updateArancelSeguroDto.seguroId !== undefined ? updateArancelSeguroDto.seguroId : current?.seguroId;

            const existing = await this.arancel_seguroRepository.createQueryBuilder('arancel_seguro')
                .where('LOWER(arancel_seguro.detalle) = LOWER(:detalle)', { detalle })
                .andWhere('arancel_seguro.seguroId = :seguroId', { seguroId })
                .andWhere('arancel_seguro.id != :id', { id })
                .getOne();

            if (existing) {
                throw new BadRequestException('Ya existe otro tratamiento con este nombre para el seguro seleccionado.');
            }
        }
        return this.arancel_seguroRepository.update(id, updateArancelSeguroDto);
    }

    remove(id: number) {
        return this.arancel_seguroRepository.delete(id);
    }

    async updatePrices(dto: UpdatePricesDto) {
        const query = this.arancel_seguroRepository.createQueryBuilder('arancel_seguro');

        if (dto.especialidadId && Number(dto.especialidadId) > 0) {
            query.where('arancel_seguro.idEspecialidad = :especialidadId', { especialidadId: dto.especialidadId });
        }

        const arancel_seguroes = await query.getMany();
        const factor = 1 + (dto.porcentaje / 100);

        for (const arancel_seguro of arancel_seguroes) {
            arancel_seguro.precio = Number((Number(arancel_seguro.precio) * factor).toFixed(2));
        }

        return this.arancel_seguroRepository.save(arancel_seguroes);
    }

    async getUsedEspecialidades() {
        const arancel_seguroes = await this.arancel_seguroRepository
            .createQueryBuilder('arancel_seguro')
            .select('DISTINCT arancel_seguro.idEspecialidad', 'id')
            .where('arancel_seguro.idEspecialidad IS NOT NULL')
            .getRawMany();

        if (arancel_seguroes.length === 0) {
            return [];
        }

        const ids = arancel_seguroes.map(a => a.id);

        return this.arancel_seguroRepository.manager.createQueryBuilder()
            .select('especialidad.id', 'id')
            .addSelect('especialidad.especialidad', 'especialidad')
            .from(Especialidad, 'especialidad')
            .where('especialidad.id IN (:...ids)', { ids })
            .orderBy('especialidad.especialidad', 'ASC')
            .getRawMany();
    }
}
