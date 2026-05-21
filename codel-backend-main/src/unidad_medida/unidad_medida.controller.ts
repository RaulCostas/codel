import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UnidadMedidaService } from './unidad_medida.service';
import { CreateUnidadMedidaDto } from './dto/create-unidad-medida.dto';
import { UpdateUnidadMedidaDto } from './dto/update-unidad-medida.dto';

@Controller('unidad-medida')
export class UnidadMedidaController {
  constructor(private readonly unidadMedidaService: UnidadMedidaService) { }

  @Post()
  create(@Body() createUnidadMedidaDto: CreateUnidadMedidaDto) {
    return this.unidadMedidaService.create(createUnidadMedidaDto);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.unidadMedidaService.findAll(search, page ? +page : 1, limit ? +limit : 10);
  }

  @Get('active')
  findActive() {
    return this.unidadMedidaService.findAllActive();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.unidadMedidaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUnidadMedidaDto: UpdateUnidadMedidaDto) {
    return this.unidadMedidaService.update(+id, updateUnidadMedidaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.unidadMedidaService.remove(+id);
  }
}
