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
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // Reconstruire les tags uniquement à partir des opérations réelles
  const tagsWithOperations = new Set<string>();
  if (document.paths) {
    Object.values(document.paths).forEach((path: any) => {
      if (path && typeof path === 'object') {
        Object.values(path).forEach((method: any) => {
          if (method && typeof method === 'object' && method.tags && Array.isArray(method.tags)) {
            method.tags.forEach((tag: string) => tagsWithOperations.add(tag));
          }
        });
      }
    });
  }
  
  // Reconstruire complètement le tableau des tags à partir des opérations
  document.tags = Array.from(tagsWithOperations)
    .sort()
    .map((tagName) => ({ name: tagName }));
  
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();

