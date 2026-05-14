import { Controller, Get, Post, Body, Param, Query, ParseIntPipe, Delete } from '@nestjs/common';
import { FichaEndodonciaService } from './ficha_endodoncia.service';
import { CreateFichaEndodonciaDto } from './dto/create-ficha_endodoncia.dto';

@Controller('ficha-endodoncia')
export class FichaEndodonciaController {
    constructor(private readonly fichaService: FichaEndodonciaService) {}

    @Get('proforma/:proformaId')
    findByProforma(
        @Param('proformaId', ParseIntPipe) proformaId: number,
        @Query('pieza') pieza?: string
    ) {
        return this.fichaService.findByProforma(proformaId, pieza);
    }

    @Get('proforma/:proformaId/piezas')
    findAllByProforma(@Param('proformaId', ParseIntPipe) proformaId: number) {
        return this.fichaService.findAllByProforma(proformaId);
    }

    @Post()
    upsert(@Body() createDto: CreateFichaEndodonciaDto) {
        return this.fichaService.upsert(createDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.fichaService.remove(id);
    }
}
