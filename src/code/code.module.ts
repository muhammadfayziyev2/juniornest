import { Module } from '@nestjs/common';
import { CodeController } from './code.controller';
import { CodeService } from './code.service';
import { RateLimitModule } from '../rate-limit/rate-limit.module'; 

@Module({
    imports: [RateLimitModule], 
    controllers: [CodeController],
    providers: [CodeService],
})
export class CodeModule { }
