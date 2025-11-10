import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CodeModule } from './code/code.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';
import { BlacklistedToken } from './auth/entities/blacklisted-token.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL, // Railway URL shu yerda ishlatiladi
      autoLoadEntities: true,
      synchronize: true, // ⚠️ faqat development uchun! Prod uchun false qiling
      ssl: {
        rejectUnauthorized: false, // Railway SSL ni talab qiladi
      },
    }),
    UsersModule,
    AuthModule,
    CodeModule,
  ],
})
export class AppModule { }
