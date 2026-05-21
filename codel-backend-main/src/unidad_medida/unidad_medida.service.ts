import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateUnidadMedidaDto } from './dto/create-unidad-medida.dto';
import { UpdateUnidadMedidaDto } from './dto/update-unidad-medida.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UnidadMedida } from './entities/unidad-medida.entity';
import { Repository, Like, ILike } from 'typeorm';

@Injectable()
export class UnidadMedidaService {
  constructor(
    @InjectRepository(UnidadMedida)
    private readonly unidadMedidaRepository: Repository<UnidadMedida>,
  ) { }

  async create(createUnidadMedidaDto: CreateUnidadMedidaDto) {
    const existing = await this.unidadMedidaRepository.findOne({
      where: { nombre: ILike(createUnidadMedidaDto.nombre.trim()) }
    });

    if (existing) {
      throw new BadRequestException('Esta unidad de medida ya se encuentra registrada.');
    }

    const unidad = this.unidadMedidaRepository.create({
      ...createUnidadMedidaDto,
      nombre: createUnidadMedidaDto.nombre.trim()
    });
    return this.unidadMedidaRepository.save(unidad);
  }

  async findAll(search?: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const whereCondition = search ? [
      { nombre: ILike(`%${search}%`) },
    ] : {};

    const [data, total] = await this.unidadMedidaRepository.findAndCount({
      where: whereCondition,
      take: limit,
      skip: skip,
      order: { id: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAllActive() {
    return this.unidadMedidaRepository.find({
      where: { estado: 'activo' },
      order: { nombre: 'ASC' }
    });
  }

  async findOne(id: number) {
    const unidad = await this.unidadMedidaRepository.findOneBy({ id });
    if (!unidad) throw new NotFoundException(`Unidad de medida con ID ${id} no encontrada`);
    return unidad;
  }

  async update(id: number, updateUnidadMedidaDto: UpdateUnidadMedidaDto) {
    if (updateUnidadMedidaDto.nombre) {
      const existing = await this.unidadMedidaRepository.createQueryBuilder('unidad')
        .where('LOWER(unidad.nombre) = LOWER(:nombre)', { nombre: updateUnidadMedidaDto.nombre.trim() })
        .andWhere('unidad.id != :id', { id })
        .getOne();

      if (existing) {
        throw new BadRequestException('Ya existe otra unidad de medida con este nombre.');
      }
    }
    const unidad = await this.findOne(id);

    const dataToSave = { ...updateUnidadMedidaDto };
    if (dataToSave.nombre) {
      dataToSave.nombre = dataToSave.nombre.trim();
    }

    this.unidadMedidaRepository.merge(unidad, dataToSave);
    return this.unidadMedidaRepository.save(unidad);
  }

  async remove(id: number) {
    const unidad = await this.findOne(id);
    return this.unidadMedidaRepository.remove(unidad);
  }
}
