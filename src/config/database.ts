import { DataSource } from 'typeorm';
import { Usuario } from '../entities/Usuario';
import { RecuperacionPassword } from '../entities/RecuperacionPassword';
import { Rol } from '../entities/Rol';
import { ConfiguracionSistema } from '../entities/ConfiguracionSistema';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false,
  },
  synchronize: false,
  logging: true,
  entities: [Usuario, RecuperacionPassword, Rol, ConfiguracionSistema],
});
