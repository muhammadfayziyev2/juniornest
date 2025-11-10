import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser()); // 👈 cookie parser qo‘shildi

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://junioruz.vercel.app',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // 👈 cookie yuborish uchun
  });

  const port = process.env.PORT || 8000;
  await app.listen(port, () => console.log(`✅ Server running on port ${port}`));
}

bootstrap();
