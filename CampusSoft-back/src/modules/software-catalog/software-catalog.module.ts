import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Logiciel } from './entities/logiciel.entity';
import { LogicielService } from './services/logiciel.service';
import { LogicielController } from './controllers/logiciel.controller';

/**
 * Module Software Catalog
 * Gère le catalogue des logiciels pédagogiques
 */
@Module({
  imports: [TypeOrmModule.forFeature([Logiciel])],
  controllers: [LogicielController],
  providers: [LogicielService],
  exports: [LogicielService, TypeOrmModule],
})
export class SoftwareCatalogModule {}

