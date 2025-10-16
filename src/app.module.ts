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
    TypeOrmModule.forFeature([User, BlacklistedToken]),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT!, 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [User],
      synchronize: true,
      ssl: {
        rejectUnauthorized: false, 
      },
    }),

    UsersModule,
    AuthModule,
    CodeModule,
  ],
})
export class AppModule { }
