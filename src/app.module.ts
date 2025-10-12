import { Module } from '@nestjs/common';
import { AuthModule } from '././auth/auth.module';
import { UsersModule } from '././users/users.module';
import { CodeModule } from './code/code.module';
import { RateLimitService } from '././rate-limit/rate-limit.service';

@Module({
  imports: [AuthModule, UsersModule, CodeModule],
  providers: [RateLimitService],
  exports: [RateLimitService],
})
export class AppModule { }
