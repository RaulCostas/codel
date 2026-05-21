import { Module } from '@nestjs/common';
import { UnidadMedidaService } from './unidad_medida.service';
import { UnidadMedidaController } from './unidad_medida.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnidadMedida } from './entities/unidad-medida.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UnidadMedida])],
  controllers: [UnidadMedidaController],
  providers: [UnidadMedidaService],
  exports: [UnidadMedidaService],
})
export class UnidadMedidaModule { }
