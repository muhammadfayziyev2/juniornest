import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CodeModule } from './code/code.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CodeModule,
  ],
})
export class AppModule { }
