import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TurnosPersonalService } from './turnos_personal.service';
import { TurnosPersonalController } from './turnos_personal.controller';
import { TurnoPersonal } from './entities/turno_personal.entity';

@Module({
    imports: [TypeOrmModule.forFeature([TurnoPersonal])],
    controllers: [TurnosPersonalController],
    providers: [TurnosPersonalService],
    exports: [TurnosPersonalService],
})
export class TurnosPersonalModule { }
