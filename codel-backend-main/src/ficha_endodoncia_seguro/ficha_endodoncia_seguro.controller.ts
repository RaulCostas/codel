import { Controller, Get, Post, Body, Param, Query, ParseIntPipe, Delete } from '@nestjs/common';
import { FichaEndodonciaSeguroService } from './ficha_endodoncia_seguro.service';
import { CreateFichaEndodonciaSeguroDto } from './dto/create-ficha_endodoncia_seguro.dto';

@Controller('ficha-endodoncia-seguro')
export class FichaEndodonciaSeguroController {
    constructor(private readonly fichaService: FichaEndodonciaSeguroService) {}

    @Get('paciente/:pacienteSeguroId')
    findByPaciente(
        @Param('pacienteSeguroId', ParseIntPipe) pacienteSeguroId: number,
        @Query('pieza') pieza?: string
    ) {
        return this.fichaService.findByPaciente(pacienteSeguroId, pieza);
    }

    @Get('paciente/:pacienteSeguroId/piezas')
    findAllByPaciente(@Param('pacienteSeguroId', ParseIntPipe) pacienteSeguroId: number) {
        return this.fichaService.findAllByPaciente(pacienteSeguroId);
    }

    @Post()
    upsert(@Body() createDto: CreateFichaEndodonciaSeguroDto) {
        return this.fichaService.upsert(createDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.fichaService.remove(id);
    }
}
