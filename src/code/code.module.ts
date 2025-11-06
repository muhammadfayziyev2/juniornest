import { Module } from '@nestjs/common';
import { CodeService } from './code.service';
import { CodeController } from './code.controller';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        ConfigModule,
        UsersModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'supersecretkey',
            signOptions: { expiresIn: '1d' },
        }),
    ],
    controllers: [CodeController],
    providers: [CodeService],
})
export class CodeModule { }
