import { Module } from '@nestjs/common'; // Rebuild
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArancelSeguroService } from './arancel_seguro.service';
import { ArancelSeguroController } from './arancel_seguro.controller';
import { ArancelSeguro } from './entities/arancel_seguro.entity';
import { EspecialidadModule } from '../especialidad/especialidad.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([ArancelSeguro]),
        EspecialidadModule,
    ],
    controllers: [ArancelSeguroController],
    providers: [ArancelSeguroService],
})
export class ArancelSeguroModule { }
