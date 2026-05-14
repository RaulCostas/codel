import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TurnoPersonal } from '../personal/entities/turno_personal.entity';

@Injectable()
export class TurnosPersonalService {
    constructor(
        @InjectRepository(TurnoPersonal)
        private readonly turnoRepository: Repository<TurnoPersonal>,
    ) { }

    async findAll(fechaInicio?: string, fechaFinal?: string): Promise<TurnoPersonal[]> {
        const query = this.turnoRepository.createQueryBuilder('turno')
            .leftJoinAndSelect('turno.personal', 'personal');

        if (fechaInicio) {
            query.andWhere('turno.fecha >= :fechaInicio', { fechaInicio });
        }
        if (fechaFinal) {
            query.andWhere('turno.fecha <= :fechaFinal', { fechaFinal });
        }

        return await query.getMany();
    }

    async findByFecha(fecha: string): Promise<TurnoPersonal | null> {
        return await this.turnoRepository.findOne({
            where: { fecha },
            relations: { personal: true }
        });
    }

    async upsert(fecha: string, personalId: number, usuarioId?: number): Promise<TurnoPersonal | null> {
        let turno = await this.turnoRepository.findOne({ where: { fecha } });
        
        if (turno) {
            turno.personalId = personalId;
            if (usuarioId) turno.usuarioId = usuarioId;
        } else {
            turno = this.turnoRepository.create({ fecha, personalId, usuarioId });
        }

        await this.turnoRepository.save(turno);
        return this.findByFecha(fecha);
    }

    async remove(id: number): Promise<void> {
        const result = await this.turnoRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Turno #${id} not found`);
        }
    }
}
