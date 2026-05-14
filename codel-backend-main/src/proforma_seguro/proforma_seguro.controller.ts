import { Controller, Get, Post, Body, Param, Delete, Patch, UseInterceptors, UploadedFile, UploadedFiles, Query } from '@nestjs/common';
import { ProformaSeguroService } from './proforma_seguro.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { SupabaseStorageService } from '../common/storage/supabase-storage.service';

@Controller('proforma-seguro')
export class ProformaSeguroController {
  constructor(
    private readonly proformaSeguroService: ProformaSeguroService,
    private readonly storageService: SupabaseStorageService
  ) {}

  @Post(':id/sync-data')
  syncProforma(
    @Param('id') id: string,
    @Body() data: { periodo: string, detalles: { id: number, fechaPlanilla: string }[] }
  ) {
    return this.proformaSeguroService.syncProforma(+id, data);
  }

  @Post()
  create(@Body() data: { seguroId: number; detalles: { id: number; fechaPlanilla?: string }[]; usuarioId?: number; periodo?: string }) {
    return this.proformaSeguroService.create(data);
  }

  @Get()
  findAll(
    @Query('fecha') fecha?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.proformaSeguroService.findAll({ fecha, startDate, endDate });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.proformaSeguroService.findOne(+id);
  }

  @Patch(':id/estado')
  @UseInterceptors(FilesInterceptor('archivos', 10, { 
    storage: memoryStorage()
  }))
  async updateEstado(
    @Param('id') id: string, 
    @Body() body: any,
    @UploadedFiles() files?: any[]
  ) {
    const { estado, fecha_pago, formaPagoId } = body;
    
    let filePaths: string | undefined = undefined;
    if (files && files.length > 0) {
      const uploadPromises = files.map(file => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        const fileName = `${randomName}-${file.originalname}`;
        return this.storageService.uploadFile('facturas-seguro', fileName, file.buffer, file.mimetype);
      });
      const uploadedUrls = await Promise.all(uploadPromises);
      filePaths = uploadedUrls.join(',');
    }

    const pagoData = {
      fecha_pago,
      formaPagoId: formaPagoId ? +formaPagoId : undefined,
      archivo_factura: filePaths
    };
    return this.proformaSeguroService.updateEstado(+id, estado, pagoData);
  }

  @Delete(':id/tratamiento/:tratamientoId')
  removerTratamiento(@Param('id') id: string, @Param('tratamientoId') tratamientoId: string) {
    return this.proformaSeguroService.removerTratamiento(+id, +tratamientoId);
  }

  @Post(':id/tratamiento/:tratamientoId')
  agregarTratamiento(
    @Param('id') id: string, 
    @Param('tratamientoId') tratamientoId: string,
    @Body('fechaPlanilla') fechaPlanilla?: string
  ) {
    return this.proformaSeguroService.agregarTratamiento(+id, +tratamientoId, fechaPlanilla);
  }

  @Patch(':id/tratamiento/:tratamientoId/fecha')
  actualizarTratamientoFecha(
    @Param('id') id: string,
    @Param('tratamientoId') tratamientoId: string,
    @Body('fechaPlanilla') fechaPlanilla: string
  ) {
    return this.proformaSeguroService.actualizarTratamientoFecha(+id, +tratamientoId, fechaPlanilla);
  }


  @Patch(':id/periodo')
  actualizarPeriodo(
    @Param('id') id: string,
    @Body('periodo') periodo: string
  ) {
    return this.proformaSeguroService.actualizarPeriodo(+id, periodo);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.proformaSeguroService.remove(+id);
  }
}
