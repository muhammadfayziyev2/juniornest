import { Controller, Post, Body, Req, Res, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // 🔹 Register
    @Post('register')
    async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
        const user = await this.authService.register(dto);

        // Login qilamiz va access + refresh token olamiz
        const { accessToken, refreshToken } = await this.authService.login({
            email: dto.email,
            password: dto.password
        });

        // Refresh tokenni HttpOnly cookie sifatida yuborish
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 kun
        });

        return { accessToken, user };
    }

    // 🔹 Login
    @Post('login')
    async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const { accessToken, refreshToken, user } = await this.authService.login(dto);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        return { accessToken, user };
    }

    // 🔹 Logout
    @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout(@Req() req) {
        const token = req.headers.authorization?.split(' ')[1];
        await this.authService.logout(token);
        return { message: 'Foydalanuvchi tizimdan chiqdi' };
    }

    // 🔹 Refresh token orqali access token olish
    @Post('refresh')
    async refresh(@Req() req, @Res({ passthrough: true }) res: Response) {
        const oldRefreshToken = req.cookies?.refreshToken;

        if (!oldRefreshToken) throw new UnauthorizedException('Refresh token yo‘q');

        const { accessToken, refreshToken, user } = await this.authService.refresh(oldRefreshToken);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        return { accessToken, user };
    }


}
