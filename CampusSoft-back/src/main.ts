import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix pour toutes les routes API
  app.setGlobalPrefix('api');

  // Validation globale avec class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Supprime les propriétés non définies dans le DTO
      forbidNonWhitelisted: true, // Rejette si propriétés non définies
      transform: true, // Transforme automatiquement les types
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Interceptor global pour logging
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Configuration CORS (pour développement)
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('CampusSoft API')
    .setDescription('API pour la gestion des logiciels pédagogiques - CampusSoft')
    .setVersion('1.0')
    .addTag('demandes', 'Gestion des demandes d\'installation logiciel')
    .addTag('logiciels', 'Catalogue des logiciels')
    .addTag('infrastructure', 'Gestion départements et salles')
    .addTag('utilisateurs', 'Gestion des utilisateurs')
    .addTag('attestations', 'Réattestation annuelle')
    .addTag('historique', 'Historique et traçabilité')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();

