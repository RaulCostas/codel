import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FichaOrtodoncia } from './entities/ficha_ortodoncia.entity';
import { CreateFichaOrtodonciaDto } from './dto/create-ficha_ortodoncia.dto';
import { UpdateFichaOrtodonciaDto } from './dto/update-ficha_ortodoncia.dto';

@Injectable()
export class FichaOrtodonciaService {
    constructor(
        @InjectRepository(FichaOrtodoncia)
        private fichaRepository: Repository<FichaOrtodoncia>,
    ) {}

    async findByProforma(proformaId: number): Promise<FichaOrtodoncia> {
        const ficha = await this.fichaRepository.findOne({ where: { proformaId } });
        if (!ficha) {
            throw new NotFoundException(`Ficha de Ortodoncia para el plan de tratamiento #${proformaId} no encontrada`);
        }
        return ficha;
    }

    async upsert(dto: CreateFichaOrtodonciaDto): Promise<FichaOrtodoncia> {
        const existing = await this.fichaRepository.findOne({ where: { proformaId: dto.proformaId } });
        
        if (existing) {
            // Update
            const updated = this.fichaRepository.merge(existing, dto);
            return await this.fichaRepository.save(updated);
        } else {
            // Create
            const newFicha = this.fichaRepository.create(dto);
            return await this.fichaRepository.save(newFicha);
        }
    }

    async remove(id: number): Promise<void> {
        await this.fichaRepository.delete(id);
    }
}
