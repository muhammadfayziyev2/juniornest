import { Body, Controller, Post } from '@nestjs/common';
import { CodeService } from './code.service';
import { AnalyzeCodeDto } from './dto/analyze-code.dto';

@Controller('code')
export class CodeController {
    constructor(private readonly codeService: CodeService) { }

    @Post('analyze')
    async analyze(@Body() dto: AnalyzeCodeDto) {
        return this.codeService.analyzeCode(dto);
    }
}
