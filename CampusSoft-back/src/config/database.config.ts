import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'dpg-d4gcvjp5pdvs73dth3b0-a.oregon-postgres.render.com',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'compussoft_user',
    password: process.env.DB_PASSWORD || '4PvK1LWif0JArzCcWCCpu7MKGTlgZWBF',
    database: process.env.DB_DATABASE || 'compussoft',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    synchronize: process.env.NODE_ENV === 'development' || !process.env.NODE_ENV, // Auto sync en dev uniquement
    logging: process.env.NODE_ENV === 'development',
    ssl: {
      rejectUnauthorized: false, // Pour Render PostgreSQL
    },
  }),
);

