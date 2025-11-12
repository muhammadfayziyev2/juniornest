import { Controller, Post, Body, Req, Res, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
        const user = await this.authService.register(dto);

        const { accessToken, refreshToken } = await this.authService.login({
            email: dto.email,
            password: dto.password
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        return { accessToken, user };
    }

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

    @Post('logout')
    async logout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
        @Body('password') password: string
    ) {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token topilmadi');
        }

        // refresh token orqali foydalanuvchini topamiz
        const payload = await this.authService.verifyRefresh(refreshToken);
        const user = await this.authService.validateUserByPassword(payload.email, password);

        // cookie’ni o‘chir
        res.clearCookie('refreshToken', { path: '/' });

        // logout javobi
        return { message: `Foydalanuvchi ${user.email} tizimdan chiqdi` };
    }

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
