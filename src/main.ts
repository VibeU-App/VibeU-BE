import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  console.log(`Server is running on port ${process.env.PORT ?? 3005}`);
  console.log(`API Documentation: http://localhost:${process.env.PORT ?? 3005}/docs`);
  await app.listen(process.env.PORT ?? 3005);
}
bootstrap();
