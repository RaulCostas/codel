import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FichaEndodoncia } from './entities/ficha_endodoncia.entity';
import { EndodonciaPruebaVitalidad } from './entities/endodoncia_prueba_vitalidad.entity';
import { EndodonciaControlTcr } from './entities/endodoncia_control_tcr.entity';
import { EndodonciaMedicacion } from './entities/endodoncia_medicacion.entity';
import { FichaEndodonciaService } from './ficha_endodoncia.service';
import { FichaEndodonciaController } from './ficha_endodoncia.controller';

@Module({
    imports: [TypeOrmModule.forFeature([
        FichaEndodoncia,
        EndodonciaPruebaVitalidad,
        EndodonciaControlTcr,
        EndodonciaMedicacion
    ])],
    controllers: [FichaEndodonciaController],
    providers: [FichaEndodonciaService],
    exports: [FichaEndodonciaService]
})
export class FichaEndodonciaModule {}
