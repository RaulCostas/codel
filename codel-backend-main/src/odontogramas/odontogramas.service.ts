import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Odontograma } from '../pacientes/entities/odontograma.entity';
import { CreateOdontogramaDto } from './dto/create-odontograma.dto';

@Injectable()
export class OdontogramasService {
    constructor(
        @InjectRepository(Odontograma)
        private readonly repository: Repository<Odontograma>,
    ) {}

    async create(createDto: CreateOdontogramaDto): Promise<Odontograma> {
        const odontograma = this.repository.create(createDto);
        return await this.repository.save(odontograma);
    }

    async findAllByPacienteSeguro(pacienteSeguroId: number): Promise<Odontograma[]> {
        return await this.repository.find({
            where: { pacienteSeguroId },
            order: { fecha: 'DESC', id: 'DESC' },
        });
    }

    async findLatestByPaciente(pacienteSeguroId?: number): Promise<Odontograma | null> {
        return await this.repository.findOne({
            where: { pacienteSeguroId },
            order: { fecha: 'DESC', id: 'DESC' },
        });
    }

    async findOne(id: number): Promise<Odontograma> {
        const odontograma = await this.repository.findOneBy({ id });
        if (!odontograma) {
            throw new NotFoundException(`Odontograma #${id} no encontrado`);
        }
        return odontograma;
    }

    async remove(id: number): Promise<void> {
        const result = await this.repository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Odontograma #${id} no encontrado`);
        }
    }
}
