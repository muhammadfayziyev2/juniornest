import { Injectable, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { AnalyzeCodeDto } from './dto/analyze-code.dto';

@Injectable()
export class CodeService {
    private openai: OpenAI;

    constructor(private configService: ConfigService) {
        this.openai = new OpenAI({
            apiKey: this.configService.get<string>('OPENAI_API_KEY'),
        });
    }

    async analyzeCode(dto: AnalyzeCodeDto) {
        const { code } = dto;

        const prompt = `
Quyidagi dastur kodini tahlil qil:
Kod:
${code}

Tahlil:
- Professional darajasi
- Yaxshi tomonlari
- Xatoliklar yoki kamchiliklar
- Yaxshilash bo‘yicha tavsiyalar
`;

        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
            });

            const feedback = response.choices[0].message.content;
            return { feedback };

        } catch (error) {
            console.error('❌ OpenAI xatosi:', error);

            if (error.status === 500 || error.code === 'insufficient_quota') {
                throw new InternalServerErrorException(
                    'Hisobingizdagi API limiti tugagan. Iltimos, OpenAI billing bo‘limida to‘lovni yangilang.',
                );
            }

            if (error.status === 401) {
                throw new InternalServerErrorException(
                    'Noto‘g‘ri yoki muddati o‘tgan API kalit. Iltimos, .env faylni tekshiring.',
                );
            }

            throw new InternalServerErrorException(
                'AI bilan bog‘liq ichki xatolik yuz berdi. Keyinroq urinib ko‘ring.',
            );
        }
    }
}
