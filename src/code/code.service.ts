import { Injectable, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { AnalyzeCodeDto } from './dto/analyze-code.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class CodeService {
    private openai: OpenAI;

    constructor(
        private configService: ConfigService,
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {
        this.openai = new OpenAI({
            apiKey: this.configService.get<string>('OPENAI_API_KEY'),
        });
    }

    async analyzeCode(dto: AnalyzeCodeDto, token: string) {
        try {
            const decoded = this.jwtService.decode(token) as any;
            if (!decoded?.email) throw new ForbiddenException('Token yaroqsiz');

            const user = await this.usersService.findByEmail(decoded.email);
            if (!user) throw new ForbiddenException('Foydalanuvchi topilmadi');

            const today = new Date().toISOString().split("T")[0];
            const lastRequest =
                user.last_request_date instanceof Date
                    ? user.last_request_date.toISOString().split("T")[0]
                    : user.last_request_date
                        ? new Date(user.last_request_date).toISOString().split("T")[0]
                        : null;
                        
            if (lastRequest !== today) {
                user.daily_limit = 10;
                user.last_request_date = new Date();
                await this.usersService.save(user);
            }


            if (user.daily_limit <= 0) {
                throw new ForbiddenException('Sizning bugungi limit tugagan. Iltimos, ertaga urinib ko‘ring.');
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

            return {
                success: true,
                remaining_limit: user.daily_limit,
                feedback,
            };
        } catch (error) {

            if (error.status === 500 || error.code === 'insufficient_quota') {
                throw new InternalServerErrorException(
                    'Hisobingizdagi API limiti tugagan. Iltimos, OpenAI billing bo‘limida to‘lovni yangilang.',
                );
            }
            if (error.status === 403) throw error;

            throw new InternalServerErrorException(
                'Kod tahlil qilinmadi. Iltimos, keyinroq urinib ko‘ring.',
            );
        }
    }
}




