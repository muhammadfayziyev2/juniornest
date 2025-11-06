import {
    Injectable,
    ForbiddenException,
    InternalServerErrorException,
} from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { AnalyzeCodeDto } from './dto/analyze-code.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Analysis } from './entities/analysis.entity';
import * as crypto from 'crypto';

@Injectable()
export class CodeService {
    private openai: OpenAI;

    constructor(
        private configService: ConfigService,
        private usersService: UsersService,
        private jwtService: JwtService,
        @InjectRepository(Analysis)
        private readonly analysisRepo: Repository<Analysis>,
    ) {
        this.openai = new OpenAI({
            apiKey: this.configService.get<string>('OPENAI_API_KEY'),
        });
    }

    private hashCode(code: string): string {
        return crypto.createHash('sha256').update(code).digest('hex');
    }

    async analyzeCode(dto: AnalyzeCodeDto, token: string) {
        try {
            const decoded = this.jwtService.decode(token) as any;
            if (!decoded?.email) throw new ForbiddenException('Token yaroqsiz');

            const user = await this.usersService.findByEmail(decoded.email);
            if (!user) throw new ForbiddenException('Foydalanuvchi topilmadi');

            const today = new Date().toISOString().split('T')[0];
            const lastRequest = user.last_request_date
                ? new Date(user.last_request_date).toISOString().split('T')[0]
                : null;

            if (lastRequest !== today) {
                user.daily_limit = 10;
                user.last_request_date = new Date();
                await this.usersService.save(user);
            }

            if (user.daily_limit <= 0) {
                throw new ForbiddenException(
                    'Bugungi limit tugagan. Ertaga urinib ko‘ring.',
                );
            }

            const codeHash = this.hashCode(dto.code);
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

            const existing = await this.analysisRepo.findOne({
                where: { user: { id: user.id }, codeHash },
                relations: ['user'],
                order: { createdAt: 'DESC' },
            });

            if (existing && existing.createdAt > twentyFourHoursAgo) {
                return {
                    success: true,
                    fromCache: true,
                    remaining_limit: user.daily_limit,
                    feedback: existing.feedback,
                };
            }

            const prompt = `
Quyidagi dastur kodini tahlil qil:
Kod:
${dto.code}

Tahlil:
- Professional darajasi
- Yaxshi tomonlari
- Xatoliklar yoki kamchiliklar
- Yaxshilash bo‘yicha tavsiyalar
`;

            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
            });

            const feedback = response.choices[0].message.content;

            user.daily_limit -= 1;
            await this.usersService.save(user);

            const analysis = this.analysisRepo.create({
                user,
                codeHash,
                feedback,
                code: dto.code,
            });

            await this.analysisRepo.save(analysis);

            return {
                success: true,
                fromCache: false,
                remaining_limit: user.daily_limit,
                feedback,
            };
        } catch (error) {
            console.error('❌ analyzeCode error:', error);

            if (error instanceof ForbiddenException) throw error;

            throw new InternalServerErrorException(
                'Kod tahlil qilinmadi. Iltimos, keyinroq urinib ko‘ring.',
            );
        }
    }

    async getLastAnalysis(token: string) {
        const decoded = this.jwtService.decode(token) as any;
        if (!decoded?.email) throw new ForbiddenException('Token yaroqsiz');

        const user = await this.usersService.findByEmail(decoded.email);
        if (!user) throw new ForbiddenException('Foydalanuvchi topilmadi');

        const lastAnalysis = await this.analysisRepo.findOne({
            where: { user: { id: user.id } },
            order: { createdAt: 'DESC' },
        });

        if (!lastAnalysis) {
            return { success: false, message: 'Hech qanday tahlil topilmadi.' };
        }

        const now = new Date();
        const diffHours =
            (now.getTime() - new Date(lastAnalysis.createdAt).getTime()) /
            (1000 * 60 * 60);

        if (diffHours > 24) {
            return { success: false, message: 'Tahlil muddati tugagan.' };
        }

        return {
            success: true,
            fromCache: true,
            feedback: lastAnalysis.feedback,
        };
    }
}
