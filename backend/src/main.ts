import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { HttpExceptionFilter } from './common/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Use helmet for security headers
  app.use(helmet());

  // Use versioning for the API : e.g., <domain>/v1/...
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(new ValidationPipe());

  // Global error filter for better error handling
  app.useGlobalFilters(new HttpExceptionFilter());

  // Enable CORS for the frontend application
  app.enableCors({
    // origin: ['http://localhost:5173', 'https://on-site360.vercel.app'], // Local and production frontend origins
    origin: '*', // allow all for testing
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  const config = new DocumentBuilder()
    .setTitle('OnSite360 API')
    .setDescription('API docs for the project management system')
    .setVersion('1.0')
    .addBearerAuth() // Add Bearer token authentication
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('debug', app, document);

  await app.listen(3000);
}
bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
