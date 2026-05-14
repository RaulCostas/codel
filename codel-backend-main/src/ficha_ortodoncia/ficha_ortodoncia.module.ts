import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FichaOrtodoncia } from './entities/ficha_ortodoncia.entity';
import { FichaOrtodonciaService } from './ficha_ortodoncia.service';
import { FichaOrtodonciaController } from './ficha_ortodoncia.controller';

@Module({
    imports: [TypeOrmModule.forFeature([FichaOrtodoncia])],
    controllers: [FichaOrtodonciaController],
    providers: [FichaOrtodonciaService],
    exports: [FichaOrtodonciaService]
})
export class FichaOrtodonciaModule {}
