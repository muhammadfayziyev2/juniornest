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
      url: process.env.DATABASE_URL, // 🔑 Railway dan o'qiydi
      entities: [User, BlacklistedToken],
      autoLoadEntities: true,
      synchronize: true, // 🚨 Productionda migration ishlatish tavsiya qilinadi
      ssl: {
        rejectUnauthorized: false, // Railway uchun kerak
      },
    }),

    UsersModule,
    AuthModule,
    CodeModule,
  ],
})
export class AppModule { }
