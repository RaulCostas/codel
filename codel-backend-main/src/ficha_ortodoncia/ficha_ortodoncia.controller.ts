import { Controller, Get, Post, Body, Param, ParseIntPipe, Delete } from '@nestjs/common';
import { FichaOrtodonciaService } from './ficha_ortodoncia.service';
import { CreateFichaOrtodonciaDto } from './dto/create-ficha_ortodoncia.dto';

@Controller('ficha-ortodoncia')
export class FichaOrtodonciaController {
    constructor(private readonly fichaService: FichaOrtodonciaService) {}

    @Get('proforma/:proformaId')
    findByProforma(@Param('proformaId', ParseIntPipe) proformaId: number) {
        return this.fichaService.findByProforma(proformaId);
    }

    @Post()
    upsert(@Body() createDto: CreateFichaOrtodonciaDto) {
        return this.fichaService.upsert(createDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.fichaService.remove(id);
    }
}
