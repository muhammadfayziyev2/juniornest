import { Injectable } from '@nestjs/common';

@Injectable()
export class RateLimitService {
    private limits = new Map<string, { count: number; lastReset: number }>();
    private readonly LIMIT = 5; // har foydalanuvchiga 5 marta ruxsat
    private readonly WINDOW = 60 * 60 * 1000; // 1 soat

    checkLimit(userId: string): boolean {
        const now = Date.now();
        const userData = this.limits.get(userId);

        if (!userData) {
            this.limits.set(userId, { count: 1, lastReset: now });
            return true;
        }

        if (now - userData.lastReset > this.WINDOW) {
            this.limits.set(userId, { count: 1, lastReset: now });
            return true;
        }

        if (userData.count < this.LIMIT) {
            userData.count++;
            this.limits.set(userId, userData);
            return true;
        }

        return false; // limitdan oshgan
    }
}
