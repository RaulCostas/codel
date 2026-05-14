import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ArancelSeguroService } from './arancel_seguro.service';
import { CreateArancelSeguroDto } from './dto/create-arancel_seguro.dto';
import { UpdateArancelSeguroDto } from './dto/update-arancel_seguro.dto';
import { UpdatePricesDto } from './dto/update-prices.dto';

@Controller('arancel-seguro')
export class ArancelSeguroController {
    constructor(private readonly arancel_seguroService: ArancelSeguroService) { }

    @Post()
    create(@Body() createArancelSeguroDto: CreateArancelSeguroDto) {
        return this.arancel_seguroService.create(createArancelSeguroDto);
    }

    @Get('used-specialties')
    getUsedEspecialidades() {
        return this.arancel_seguroService.getUsedEspecialidades();
    }

    @Post('update-prices')
    updatePrices(@Body() updatePricesDto: UpdatePricesDto) {
        return this.arancel_seguroService.updatePrices(updatePricesDto);
    }

    @Get()
    findAll(
        @Query('search') search?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('seguroId') seguroId?: string,
    ) {
        return this.arancel_seguroService.findAll(
            search,
            page ? +page : 1,
            limit ? +limit : 5,
            seguroId,
        );
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.arancel_seguroService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateArancelSeguroDto: UpdateArancelSeguroDto) {
        return this.arancel_seguroService.update(+id, updateArancelSeguroDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.arancel_seguroService.remove(+id);
    }
}
