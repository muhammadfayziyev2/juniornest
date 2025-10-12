import { Injectable } from '@nestjs/common';
import { RateLimiterMemory } from 'rate-limiter-flexible';

@Injectable()
export class RateLimitService {
    private limiter = new RateLimiterMemory({
        points: 20, // 1 kunda 20 so‘rov
        duration: 86400, // 1 kun
    });

    async consume(userId: string) {
        try {
            await this.limiter.consume(userId);
            return true;
        } catch {
            return false;
        }
    }
}
