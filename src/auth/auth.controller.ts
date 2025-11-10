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
        // 1️⃣ Foydalanuvchini ro‘yxatdan o‘tkazish
        const user = await this.authService.register(dto);

        // 2️⃣ Ro‘yxatdan o‘tgan foydalanuvchini darhol login qilish
        const { accessToken, refreshToken } = await this.authService.login(dto);

        // 3️⃣ Refresh tokenni HttpOnly cookie sifatida jo‘natish
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,                     // JS orqali o‘qib bo‘lmaydi
            secure: process.env.NODE_ENV === 'production', // HTTPS faqat productionda
            sameSite: 'lax',                    // CSRF dan himoya
            path: '/auth',                      // cookie faqat /auth route’larda ishlaydi
            maxAge: 30 * 24 * 60 * 60 * 1000,   // 30 kun
        });

        // 4️⃣ Access tokenni javobga qaytarish (frontend memory’da saqlanadi)
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
