import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';
import { InfrastructureModule } from './modules/infrastructure/infrastructure.module';
import { SoftwareCatalogModule } from './modules/software-catalog/software-catalog.module';
import { UserManagementModule } from './modules/user-management/user-management.module';
import { RequestManagementModule } from './modules/request-management/request-management.module';
import { AttestationModule } from './modules/attestation/attestation.module';
import { HistoryModule } from './modules/history/history.module';

@Module({
  imports: [
    // Configuration globale
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    // Base de données
    TypeOrmModule.forRootAsync({
      useFactory: () => databaseConfig(),
    }),
    // Modules métier
    InfrastructureModule,
    SoftwareCatalogModule,
    UserManagementModule,
    RequestManagementModule,
    AttestationModule,
    HistoryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

