import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistoriaClinicaSeguro } from '../pacientes_seguro/entities/historia_clinica_seguro.entity';

@Injectable()
export class HistoriaClinicaSeguroService {
    constructor(
        @InjectRepository(HistoriaClinicaSeguro)
        private repo: Repository<HistoriaClinicaSeguro>,
    ) {}

    findAll() {
        return this.repo.find({ relations: ['pacienteSeguro', 'pacienteSeguro.seguro', 'arancel', 'doctor', 'proformaSeguro'] });
    }

    findByPaciente(pacienteSeguroId: number) {
        return this.repo.find({
            where: { pacienteSeguroId },
            relations: ['arancel', 'doctor', 'proformaSeguro'],
            order: { fecha: 'DESC', id: 'DESC' },
        });
    }

    findOne(id: number) {
        return this.repo.findOne({ where: { id }, relations: ['pacienteSeguro', 'pacienteSeguro.seguro', 'arancel', 'doctor', 'proformaSeguro'] });
    }

    create(data: any) {
        const h = this.repo.create(data);
        return this.repo.save(h);
    }

    async update(id: number, data: any) {
        await this.repo.update(id, data);
        return this.findOne(id);
    }

    async updateImage(id: number, filePath: string) {
        await this.repo.update(id, { imagen: filePath });
        return this.findOne(id);
    }

    async remove(id: number) {
        const h = await this.findOne(id);
        if (!h) throw new NotFoundException('Registro no encontrado');
        return this.repo.remove(h);
    }
}
