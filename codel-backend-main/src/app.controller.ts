import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly usersService: UsersService,
    
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('seed-admin')
  async seedAdmin() {
    // 1. Crear clínica inicial si no hay ninguna
    let clinica: any = { nombre: 'CODEL' };
    // 2. Crear usuario administrador si no existe
    const existingUser = await this.usersService.findOneByEmail('raul@gmail.com');
    if (!existingUser) {
      await this.usersService.create({
        name: 'Raul Admin',
        email: 'raul@gmail.com',
        password: '123456',
        estado: 'ACTIVO',
        permisos: ['*'], // Permisos totales
      } as any);
    }

    return {
      message: 'Base de datos inicializada con éxito.',
      user: 'raul@gmail.com',
      password: '123456 (Cámbiela después de entrar)',
      clinic: clinica.nombre
    };
  }
}
