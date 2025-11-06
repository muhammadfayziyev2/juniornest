import { Module } from '@nestjs/common';
import { CodeService } from './code.service';
import { CodeController } from './code.controller';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Analysis } from './entities/analysis.entity';

@Module({
    imports: [
        ConfigModule,
        UsersModule,
        TypeOrmModule.forFeature([Analysis]),
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'supersecretkey',
            signOptions: { expiresIn: '1d' },
        }),
    ],
    controllers: [CodeController],
    providers: [CodeService],
})
export class CodeModule { }
