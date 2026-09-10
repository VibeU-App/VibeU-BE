import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { AppModule } from './app.module';
import { EnvelopeInterceptor } from './core/envelope/envelope.interceptor';
import { EnvelopeExceptionFilter } from './core/envelope/envelope.filter';
import { JsonLogger } from './infrastructure/services/logger/json-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new JsonLogger(),
  });

  // Enable graceful shutdown hooks
  app.enableShutdownHooks();

  // Register global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Register envelope interceptor to wrap all successful responses
  app.useGlobalInterceptors(new EnvelopeInterceptor());

  // Register envelope exception filter to wrap all errors
  app.useGlobalFilters(new EnvelopeExceptionFilter());

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('VibeU API')
    .setDescription('VibeU Backend API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);

  // Scalar API Reference
  app.use(
    '/docs',
    apiReference({
      content: document,
      theme: 'kepler',
    }),
  );

  const port = process.env.PORT ?? 3005;
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`================================================================`);
  logger.log(`🚀 VibeU Backend Server running and listening on port: ${port}`);
  logger.log(`🌐 Local URL:         http://localhost:${port}`);
  logger.log(`📚 API Documentation: http://localhost:${port}/docs`);
  logger.log(`🔧 Environment:       ${process.env.NODE_ENV ?? 'development'}`);
  logger.log(`================================================================`);
}
bootstrap();
