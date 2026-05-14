import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { PacientesSeguroService } from './pacientes_seguro.service';
import { CreatePacienteSeguroDto } from './dto/create-paciente-seguro.dto';
import { UpdatePacienteSeguroDto } from './dto/update-paciente-seguro.dto';

@Controller('pacientes-seguro')
export class PacientesSeguroController {
    constructor(private readonly pacientesSeguroService: PacientesSeguroService) { }

    @Post()
    create(@Body() createDto: CreatePacienteSeguroDto) {
        return this.pacientesSeguroService.create(createDto);
    }

    @Get()
    findAll(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
        @Query('search') search: string = '',
    ) {
        return this.pacientesSeguroService.findAll(+page, +limit, search);
    }

    @Get('dashboard-stats')
    getDashboardStats() {
        return this.pacientesSeguroService.getDashboardStats();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.pacientesSeguroService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdatePacienteSeguroDto) {
        return this.pacientesSeguroService.update(id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.pacientesSeguroService.remove(id);
    }

    @Get(':id/examen-dental')
    getExamenDental(@Param('id', ParseIntPipe) id: number) {
        return this.pacientesSeguroService.getExamenDental(id);
    }

    @Post(':id/examen-dental')
    updateExamenDental(@Param('id', ParseIntPipe) id: number, @Body() body: { detalle: any }) {
        return this.pacientesSeguroService.updateExamenDental(id, body.detalle);
    }
}
