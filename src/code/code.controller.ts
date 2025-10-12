import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { CodeService } from './code.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('code')
export class CodeController {
    constructor(private readonly codeService: CodeService) { }

    // @UseGuards(AuthGuard('jwt'))
    @Post('analyze')
    async analyze(@Body('code') code: string, @Request() req: any) {
        const userId = req.user.userId;
        return this.codeService.analyzeCode(userId, code);
    }
}
