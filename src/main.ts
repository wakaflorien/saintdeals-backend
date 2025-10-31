import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as expressBasicAuth from 'express-basic-auth';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const PORT = process.env.PORT || 3000;

  //  Always protect Swagger docs
  app.use(
    ['/api'],
    expressBasicAuth({
      challenge: true,
      users: { saintsAdmin: 'saintdeals' },
    }),
  );

  //  Swagger Configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Saintdeals API')
    .setDescription('Saintdeals Ecommerce System API Documentation')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
    })
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api', app, swaggerDocument, {
    swaggerOptions: { persistAuthorization: true },
  });

  //  Enable CORS
  app.enableCors({
    origin: '*',
    allowedHeaders: '*',
    credentials: true,
  });

  //  Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(PORT);

  const appUrl = await app.getUrl();

  console.log('🚀 Application is running at:', appUrl);
  console.log('📘 Swagger docs are available at:', `${appUrl}/api`);
  console.log(
    '🔐 Swagger credentials → username: saintsAdmin | password: saintdeals',
  );
}

bootstrap();
