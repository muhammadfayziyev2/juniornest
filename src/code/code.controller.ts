import { Body, Controller, Post, Req, UseGuards, Get } from '@nestjs/common';
import { CodeService } from './code.service';
import { AnalyzeCodeDto } from './dto/analyze-code.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('code')
export class CodeController {
    constructor(private readonly codeService: CodeService) { }

    @UseGuards(JwtAuthGuard)
    @Post('analyze')
    async analyze(@Body() dto: AnalyzeCodeDto, @Req() req) {
        const token = req.headers.authorization?.split(' ')[1];
        return this.codeService.analyzeCode(dto, token);
    }

    @UseGuards(JwtAuthGuard)
    @Get('last')
    async getLastAnalysis(@Req() req) {
        const token = req.headers.authorization?.split(' ')[1];
        return this.codeService.getLastAnalysis(token);
    }
}
