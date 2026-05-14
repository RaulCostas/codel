import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { TurnosPersonalService } from './turnos_personal.service';

@Controller('turnos-personal')
export class TurnosPersonalController {
    constructor(private readonly turnosService: TurnosPersonalService) { }

    @Get()
    findAll(
        @Query('fechaInicio') fechaInicio?: string,
        @Query('fechaFinal') fechaFinal?: string,
    ) {
        return this.turnosService.findAll(fechaInicio, fechaFinal);
    }

    @Get('fecha/:fecha')
    findByFecha(@Param('fecha') fecha: string) {
        return this.turnosService.findByFecha(fecha);
    }

    @Post()
    upsert(@Body() data: { fecha: string; personalId: number; usuarioId?: number }) {
        return this.turnosService.upsert(data.fecha, data.personalId, data.usuarioId);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.turnosService.remove(+id);
    }
}
