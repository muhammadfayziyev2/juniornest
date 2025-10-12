import { Injectable, ForbiddenException } from '@nestjs/common';
import { RateLimitService } from '../rate-limit/rate-limit.service';

@Injectable()
export class CodeService {
    constructor(private readonly rateLimit: RateLimitService) { }

    async analyzeCode(userId: string, code: string) {
        const allowed = await this.rateLimit.consume(userId);
        if (!allowed) throw new ForbiddenException('Kunlik limit tugagan.');

        // AI tahlil logikasi shu yerda bo‘ladi
        return { feedback: `Kod tahlil qilindi: ${code.length} belgilar.` };
    }
}
