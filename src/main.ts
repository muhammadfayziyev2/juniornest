import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔹 CORS ni yoqish (frontend bilan backendni bog‘lash uchun)
  app.enableCors({
    origin: [
      'http://localhost:3000', // localda ishlaganda
      'https://juniornest.vercel.app', // agar fronting Vercelda bo‘lsa shu manzilni yoz
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = process.env.PORT || 8000;
  await app.listen(port, () => console.log(`✅ Server running on port ${port}`));
}

bootstrap();
