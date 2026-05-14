import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { FichaEndodoncia } from './entities/ficha_endodoncia.entity';
import { CreateFichaEndodonciaDto } from './dto/create-ficha_endodoncia.dto';

@Injectable()
export class FichaEndodonciaService {
    constructor(
        @InjectRepository(FichaEndodoncia)
        private fichaRepository: Repository<FichaEndodoncia>,
    ) {}

    async findByProforma(proformaId: number, pieza_dental?: string): Promise<FichaEndodoncia | null> {
        const where: FindOptionsWhere<FichaEndodoncia> = { proformaId };
        if (pieza_dental) where.pieza_dental = pieza_dental;
        
        return await this.fichaRepository.findOne({ 
            where,
            relations: ['pruebas_vitalidad', 'control_tcr', 'medicacion_intraconducto']
        });
    }

    async findAllByProforma(proformaId: number): Promise<FichaEndodoncia[]> {
        return await this.fichaRepository.find({ 
            where: { proformaId },
            relations: ['pruebas_vitalidad', 'control_tcr', 'medicacion_intraconducto']
        });
    }

    async upsert(dto: CreateFichaEndodonciaDto): Promise<FichaEndodoncia> {
        const where: FindOptionsWhere<FichaEndodoncia> = { proformaId: dto.proformaId };
        if (dto.pieza_dental) where.pieza_dental = dto.pieza_dental;

        const existing = await this.fichaRepository.findOne({ 
            where,
            relations: ['pruebas_vitalidad', 'control_tcr', 'medicacion_intraconducto']
        });
        
        if (existing) {
            const updated = this.fichaRepository.merge(existing, dto);
            return await this.fichaRepository.save(updated);
        } else {
            const newFicha = this.fichaRepository.create(dto);
            return await this.fichaRepository.save(newFicha);
        }
    }

    async remove(id: number): Promise<void> {
        await this.fichaRepository.delete(id);
    }
}
