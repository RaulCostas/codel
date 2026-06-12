import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { FichaEndodonciaSeguro } from './entities/ficha_endodoncia_seguro.entity';
import { CreateFichaEndodonciaSeguroDto } from './dto/create-ficha_endodoncia_seguro.dto';

@Injectable()
export class FichaEndodonciaSeguroService {
    constructor(
        @InjectRepository(FichaEndodonciaSeguro)
        private fichaRepository: Repository<FichaEndodonciaSeguro>,
    ) {}

    async findByPaciente(pacienteSeguroId: number, pieza_dental?: string): Promise<FichaEndodonciaSeguro | null> {
        const where: FindOptionsWhere<FichaEndodonciaSeguro> = { pacienteSeguroId };
        if (pieza_dental) where.pieza_dental = pieza_dental;
        
        return await this.fichaRepository.findOne({ 
            where,
            relations: ['pruebas_vitalidad', 'control_tcr', 'medicacion_intraconducto']
        });
    }

    async findAllByPaciente(pacienteSeguroId: number): Promise<FichaEndodonciaSeguro[]> {
        return await this.fichaRepository.find({ 
            where: { pacienteSeguroId },
            relations: ['pruebas_vitalidad', 'control_tcr', 'medicacion_intraconducto']
        });
    }

    async upsert(dto: CreateFichaEndodonciaSeguroDto): Promise<FichaEndodonciaSeguro> {
        const where: FindOptionsWhere<FichaEndodonciaSeguro> = { 
            pacienteSeguroId: dto.pacienteSeguroId 
        };
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
