import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import { ProformaSeguro } from './entities/proforma_seguro.entity';
import { HistoriaClinicaSeguro } from '../pacientes_seguro/entities/historia_clinica_seguro.entity';

@Injectable()
export class ProformaSeguroService {
  constructor(
    @InjectRepository(ProformaSeguro)
    private readonly proformaRepo: Repository<ProformaSeguro>,
    @InjectRepository(HistoriaClinicaSeguro)
    private readonly historiaRepo: Repository<HistoriaClinicaSeguro>,
  ) {}

  async create(data: { 
    seguroId: number; 
    usuarioId?: number;
    periodo?: string;
    detalles: { id: number; fechaPlanilla?: string }[];
  }) {
    const historiaIds = data.detalles.map(d => d.id);
    
    if (historiaIds.length === 0) {
      throw new Error('Debe seleccionar al menos un tratamiento');
    }

    // Obtener los tratamientos
    const tratamientos = await this.historiaRepo.find({
      where: { id: In(historiaIds) },
      relations: ['pacienteSeguro']
    });

    if (tratamientos.length !== historiaIds.length) {
      throw new Error('Algunos tratamientos no fueron encontrados');
    }

    // Deducir seguroId si no viene o es 0
    let finalSeguroId = data.seguroId;
    if (!finalSeguroId || finalSeguroId === 0) {
      finalSeguroId = tratamientos[0]?.pacienteSeguro?.seguroId || 0;
    }

    if (!finalSeguroId || finalSeguroId === 0) {
      throw new Error('No se pudo determinar el seguro para estos tratamientos');
    }

    // Calcular el total
    const total = tratamientos.reduce((sum, t) => sum + Number(t.precio), 0);

    // Generar el siguiente numero_proforma
    const lastProforma = await this.proformaRepo.findOne({
      where: {},
      order: { numero_proforma: 'DESC' }
    });
    const nextNumero = lastProforma && lastProforma.numero_proforma ? lastProforma.numero_proforma + 1 : 1;

    // Crear la proforma
    const localDate = new Date();
    const offset = localDate.getTimezoneOffset() * 60000;
    const fechaActual = new Date(localDate.getTime() - offset).toISOString().split('T')[0];

    const nuevaProforma = this.proformaRepo.create({
      seguroId: finalSeguroId,
      usuarioId: data.usuarioId,
      periodo: data.periodo,
      numero_proforma: nextNumero,
      total: total,
      fecha: fechaActual,
      estado: 'generada'
    });

    const proformaGuardada = await this.proformaRepo.save(nuevaProforma);

    // Actualizar los tratamientos
    for (const tratamiento of tratamientos) {
      const detalleInfo = data.detalles.find(d => d.id === tratamiento.id);
      
      // Si el usuario modificó la fecha, la guardamos. Si no, usamos la fecha original del tratamiento.
      tratamiento.fechaPlanilla = detalleInfo?.fechaPlanilla || tratamiento.fecha;
      
      tratamiento.proformaSeguroId = proformaGuardada.id;
      tratamiento.cobrado = 'si';
    }

    await this.historiaRepo.save(tratamientos);

    return this.findOne(proformaGuardada.id);
  }

  async findAll(params?: { fecha?: string; startDate?: string; endDate?: string }) {
    const where: any = {};
    if (params?.fecha) {
        where.fecha_pago = params.fecha;
        where.estado = 'pagada';
    } else if (params?.startDate && params?.endDate) {
        where.fecha_pago = Between(params.startDate, params.endDate);
        where.estado = 'pagada';
    }

    return this.proformaRepo.find({
      where,
      relations: ['seguro', 'detalles', 'detalles.pacienteSeguro', 'detalles.arancel', 'usuario', 'formaPago'],
      order: { id: 'DESC' }
    });
  }

  findOne(id: number) {
    return this.proformaRepo.findOne({
      where: { id },
      relations: ['seguro', 'detalles', 'detalles.pacienteSeguro', 'detalles.arancel', 'usuario'],
    });
  }

  async updateEstado(id: number, estado: string, pagoData?: { fecha_pago?: string, formaPagoId?: number, archivo_factura?: string }) {
    const proforma = await this.proformaRepo.findOne({
      where: { id },
      relations: ['detalles']
    });

    if (!proforma) throw new NotFoundException('Proforma no encontrada');

    if (proforma.estado === 'pagada' && estado === 'anulada') {
      throw new Error('No se puede anular una proforma que ya ha sido pagada');
    }

    proforma.estado = estado;
    
    if (estado === 'pagada' && pagoData) {
      proforma.fecha_pago = pagoData.fecha_pago || null;
      proforma.formaPagoId = pagoData.formaPagoId ? +pagoData.formaPagoId : null;
      proforma.archivo_factura = pagoData.archivo_factura || null;
    }

    await this.proformaRepo.save(proforma);

    // Si se marca como pagada, actualizamos los tratamientos
    if (estado === 'pagada' && proforma.detalles && proforma.detalles.length > 0) {
      for (const tratamiento of proforma.detalles) {
        tratamiento.pagado = 'si';
      }
      await this.historiaRepo.save(proforma.detalles);
    }
    
    // Si se marca como anulada, liberamos los tratamientos
    if (estado === 'anulada' && proforma.detalles && proforma.detalles.length > 0) {
      for (const tratamiento of proforma.detalles) {
        tratamiento.pagado = 'no';
        tratamiento.cobrado = 'no';
        tratamiento.proformaSeguroId = null;
        tratamiento.fechaPlanilla = null;
      }
      await this.historiaRepo.save(proforma.detalles);
    }

    // Si se marca como generada (reversión de pago), marcamos pagado = 'no'
    if (estado === 'generada' && proforma.detalles && proforma.detalles.length > 0) {
      for (const tratamiento of proforma.detalles) {
        tratamiento.pagado = 'no';
      }
      await this.historiaRepo.save(proforma.detalles);
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    const proforma = await this.proformaRepo.findOne({
      where: { id },
      relations: ['detalles']
    });

    if (!proforma) throw new NotFoundException('Proforma no encontrada');

    if (proforma.estado === 'pagada') {
      throw new Error('No se puede eliminar una proforma que ya ha sido pagada');
    }

    // Desvincular los tratamientos y marcarlos como no cobrados
    if (proforma.detalles && proforma.detalles.length > 0) {
      for (const tratamiento of proforma.detalles) {
        tratamiento.proformaSeguroId = null;
        tratamiento.cobrado = 'no';
      }
      await this.historiaRepo.save(proforma.detalles);
    }

    return this.proformaRepo.remove(proforma);
  }

  async removerTratamiento(proformaId: number, tratamientoId: number) {
    const proforma = await this.proformaRepo.findOne({
      where: { id: proformaId },
      relations: ['detalles']
    });

    if (!proforma) throw new NotFoundException('Proforma no encontrada');

    if (proforma.estado === 'pagada') {
      throw new Error('No se puede modificar una proforma que ya ha sido pagada');
    }

    const tratamiento = await this.historiaRepo.findOne({ where: { id: tratamientoId } });
    if (!tratamiento) throw new NotFoundException('Tratamiento no encontrado');

    // Desvincular
    tratamiento.proformaSeguroId = null;
    tratamiento.cobrado = 'no';
    tratamiento.fechaPlanilla = null;
    await this.historiaRepo.save(tratamiento);

    // Recalcular total y actualizar colección en memoria
    proforma.detalles = (proforma.detalles || []).filter(d => d.id !== tratamientoId);
    const newTotal = proforma.detalles.reduce((sum, t) => sum + Number(t.precio || 0), 0);
    
    let newEstado = proforma.estado;
    if (proforma.detalles.length === 0) {
      newEstado = 'anulada';
    }

    await this.proformaRepo.update(proformaId, { 
        total: newTotal,
        estado: newEstado
    });

    return this.findOne(proformaId);
  }

  async agregarTratamiento(proformaId: number, tratamientoId: number, fechaPlanilla?: string) {
    const proforma = await this.proformaRepo.findOne({
      where: { id: proformaId },
      relations: ['detalles']
    });

    if (!proforma) throw new NotFoundException('Proforma no encontrada');

    if (proforma.estado === 'pagada') {
      throw new Error('No se puede modificar una proforma que ya ha sido pagada');
    }

    const tratamiento = await this.historiaRepo.findOne({ where: { id: tratamientoId } });
    if (!tratamiento) throw new NotFoundException('Tratamiento no encontrado');

    if (tratamiento.proformaSeguroId && tratamiento.proformaSeguroId !== proformaId) {
      throw new Error('El tratamiento ya pertenece a otra proforma');
    }

    // Vincular
    await this.historiaRepo.update(tratamientoId, {
        proformaSeguroId: proformaId,
        cobrado: 'si',
        fechaPlanilla: fechaPlanilla || tratamiento.fechaPlanilla || tratamiento.fecha
    });

    // Recalcular total
    const updatedDetalles = await this.historiaRepo.find({ where: { proformaSeguroId: proformaId } });
    const newTotal = updatedDetalles.reduce((sum, t) => sum + Number(t.precio || 0), 0);
    
    let newEstado = proforma.estado;
    if (proforma.estado === 'anulada' && updatedDetalles.length > 0) {
      newEstado = 'generada';
    }

    await this.proformaRepo.update(proformaId, { 
        total: newTotal,
        estado: newEstado
    });

    return this.findOne(proformaId);
  }

  async actualizarTratamientoFecha(proformaId: number, tratamientoId: number, fechaPlanilla: string) {
    const tratamiento = await this.historiaRepo.findOne({ 
        where: { id: tratamientoId, proformaSeguroId: proformaId } 
    });
    
    if (!tratamiento) throw new NotFoundException('Tratamiento no encontrado en esta proforma');

    await this.historiaRepo.update(tratamientoId, { fechaPlanilla });
    
    return this.findOne(proformaId);
  }

  async syncProforma(id: number, data: { periodo: string, detalles: { id: number, fechaPlanilla: string }[] }) {
    const proforma = await this.proformaRepo.findOne({
      where: { id },
      relations: ['detalles']
    });

    if (!proforma) throw new NotFoundException('Proforma no encontrada');
    if (proforma.estado === 'pagada') {
      throw new Error('No se puede modificar una proforma que ya ha sido pagada');
    }

    const currentDetallesIds = proforma.detalles.map(d => d.id);
    const newDetallesIds = data.detalles.map(d => d.id);

    // 1. Tratamientos a remover
    const toRemove = currentDetallesIds.filter(cid => !newDetallesIds.includes(cid));
    if (toRemove.length > 0) {
      await this.historiaRepo.update({ id: In(toRemove) }, { 
        proformaSeguroId: null, 
        cobrado: 'no',
        fechaPlanilla: null 
      });
    }

    // 2. Tratamientos a agregar o actualizar
    for (const d of data.detalles) {
      // Verificar si es nuevo y si ya está en otra proforma
      if (!currentDetallesIds.includes(d.id)) {
        const tratamiento = await this.historiaRepo.findOne({ where: { id: d.id } });
        if (tratamiento?.proformaSeguroId && tratamiento.proformaSeguroId !== id) {
          throw new Error(`El tratamiento #${d.id} ya pertenece a otra proforma`);
        }
      }

      await this.historiaRepo.update(d.id, {
        proformaSeguroId: id,
        cobrado: 'si',
        fechaPlanilla: d.fechaPlanilla
      });
    }

    // 3. Recalcular total
    const finalDetalles = await this.historiaRepo.find({ where: { proformaSeguroId: id } });
    const total = finalDetalles.reduce((sum, t) => sum + Number(t.precio || 0), 0);

    // 4. Actualizar proforma
    await this.proformaRepo.update(id, { 
      periodo: data.periodo.toUpperCase(),
      total: total,
      estado: finalDetalles.length === 0 ? 'anulada' : (proforma.estado === 'anulada' ? 'generada' : proforma.estado)
    });

    return this.findOne(id);
  }

  async actualizarPeriodo(id: number, periodo: string) {
    await this.proformaRepo.update(id, { periodo: periodo.toUpperCase() });
    return this.findOne(id);
  }
}
