import { Controller, Post, Body, Req, UseGuards, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
        const user = await this.authService.register(dto);

        const { accessToken, refreshToken } = await this.authService.login(dto);
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,                    
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',                  
            path: '/auth',                   
            maxAge: 30 * 24 * 60 * 60 * 1000,   
        });

        return { accessToken, user };
    }
    @Post('login')
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout(@Req() req) {
        const token = req.headers.authorization?.split(' ')[1];
        return this.authService.logout(token);
    }

}
