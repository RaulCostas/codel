import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FichaEndodonciaSeguro } from './entities/ficha_endodoncia_seguro.entity';
import { EndodonciaSeguroPruebaVitalidad } from './entities/endodoncia_seguro_prueba_vitalidad.entity';
import { EndodonciaSeguroControlTcr } from './entities/endodoncia_seguro_control_tcr.entity';
import { EndodonciaSeguroMedicacion } from './entities/endodoncia_seguro_medicacion.entity';
import { FichaEndodonciaSeguroService } from './ficha_endodoncia_seguro.service';
import { FichaEndodonciaSeguroController } from './ficha_endodoncia_seguro.controller';

@Module({
    imports: [TypeOrmModule.forFeature([
        FichaEndodonciaSeguro,
        EndodonciaSeguroPruebaVitalidad,
        EndodonciaSeguroControlTcr,
        EndodonciaSeguroMedicacion
    ])],
    controllers: [FichaEndodonciaSeguroController],
    providers: [FichaEndodonciaSeguroService],
    exports: [FichaEndodonciaSeguroService]
})
export class FichaEndodonciaSeguroModule {}
