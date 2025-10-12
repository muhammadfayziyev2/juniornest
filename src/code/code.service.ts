import { Injectable } from '@nestjs/common';
import { RateLimitService } from '../rate-limit/rate-limit.service';

@Injectable()
export class CodeService {
    constructor(private readonly rateLimitService: RateLimitService) { }

    async analyzeCode(userId: string, code: string) {
        const allowed = this.rateLimitService.checkLimit(userId);
        if (!allowed) {
            return { error: 'Limit oshib ketgan. Keyinroq urinib ko‘ring.' };
        }

        // bu yerda OpenAI yoki boshqa AI tekshiruv kodi
        return { message: 'Kod tahlil qilindi ✅' };
    }
}
