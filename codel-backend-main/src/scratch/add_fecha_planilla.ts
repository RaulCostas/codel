import { DataSource } from 'typeorm';
import { HistoriaClinicaSeguro } from '../pacientes_seguro/entities/historia_clinica_seguro.entity';
import { PacienteSeguro } from '../pacientes_seguro/entities/paciente_seguro.entity';
import { Seguro } from '../seguro/entities/seguro.entity';
import { ArancelSeguro } from '../arancel_seguro/entities/arancel_seguro.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { ProformaSeguro } from '../proforma_seguro/entities/proforma_seguro.entity';
import { User } from '../users/entities/user.entity';
import { ExamenDentalSeguro } from '../pacientes_seguro/entities/examen_dental_seguro.entity';
import * as dotenv from 'dotenv';

dotenv.config();

async function run() {
    const AppDataSource = new DataSource({
        type: "postgres",
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5433"),
        username: process.env.DB_USERNAME || "postgres",
        password: process.env.DB_PASSWORD || "postgrespg",
        database: process.env.DB_DATABASE || "codel",
        entities: [HistoriaClinicaSeguro, PacienteSeguro, Seguro, ArancelSeguro, Doctor, ProformaSeguro, User, ExamenDentalSeguro],
        synchronize: false,
    });

    try {
        await AppDataSource.initialize();
        console.log("Data Source has been initialized!");

        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();

        console.log("Checking if column 'fecha_planilla' exists...");
        const table = await queryRunner.getTable("historia_clinica_seguro");
        const hasColumn = table?.findColumnByName("fecha_planilla");

        if (!hasColumn) {
            console.log("Adding column 'fecha_planilla' to 'historia_clinica_seguro'...");
            await queryRunner.query('ALTER TABLE "historia_clinica_seguro" ADD COLUMN "fecha_planilla" DATE');
            console.log("Column added successfully.");
        } else {
            console.log("Column 'fecha_planilla' already exists.");
        }

        await queryRunner.release();
        await AppDataSource.destroy();
    } catch (err) {
        console.error("Error during Data Source initialization", err);
    }
}

run();
