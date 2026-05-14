import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { HistoriaClinicaSeguroService } from './historia_clinica_seguro.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { SupabaseStorageService } from '../common/storage/supabase-storage.service';

@Controller('historia-clinica-seguro')
export class HistoriaClinicaSeguroController {
    constructor(
        private readonly service: HistoriaClinicaSeguroService,
        private readonly storageService: SupabaseStorageService
    ) {}

    @Post()
    create(@Body() data: any) {
        return this.service.create(data);
    }

    @Get()
    findAll(@Query('pacienteSeguroId') pacienteSeguroId?: string) {
        if (pacienteSeguroId) {
            return this.service.findByPaciente(+pacienteSeguroId);
        }
        return this.service.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() data: any) {
        return this.service.update(+id, data);
    }

    @Post(':id/upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: memoryStorage()
    }))
    async uploadImage(
        @Param('id') id: string,
        @UploadedFile() file: any
    ) {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        const fileName = `${randomName}-${file.originalname}`;
        const publicUrl = await this.storageService.uploadFile('seguimiento-seguro', fileName, file.buffer, file.mimetype);
        return this.service.updateImage(+id, publicUrl);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.remove(+id);
    }
}
