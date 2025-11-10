import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlacklistedToken } from './entities/blacklisted-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        @InjectRepository(BlacklistedToken)
        private readonly blacklistRepo: Repository<BlacklistedToken>,
    ) { }

    // 🔹 Register
    async register(dto: RegisterDto) {
        const existing = await this.usersService.findByEmail(dto.email);
        if (existing) throw new BadRequestException('Bu email allaqachon ro‘yxatdan o‘tgan');

        const hashed = await bcrypt.hash(dto.password, 10);
        const avatarUrl = `https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${encodeURIComponent(dto.email)}`;
        const user = await this.usersService.createUser(dto.email, hashed, avatarUrl, dto.nameUser);

        const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email);
        return { user, accessToken, refreshToken };
    }

    // 🔹 Login
    async login(dto: LoginDto) {
        const user = await this.usersService.findByEmail(dto.email);
        if (!user) throw new UnauthorizedException('Foydalanuvchi topilmadi');

        const match = await bcrypt.compare(dto.password, user.password);
        if (!match) throw new UnauthorizedException('Parol noto‘g‘ri');

        const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email);
        return { user, accessToken, refreshToken };
    }

    // 🔹 Logout
    async logout(token: string) {
        await this.blacklistRepo.save({ token });
        return { message: 'Foydalanuvchi tizimdan chiqdi' };
    }

    // 🔹 Tekshirish, blacklist
    async isTokenBlacklisted(token: string): Promise<boolean> {
        const exists = await this.blacklistRepo.findOne({ where: { token } });
        return !!exists;
    }

    // 🔹 Generate access + refresh token
    async generateTokens(userId: string, email: string) {
        const payload = { sub: userId, email };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });
        return { accessToken, refreshToken };
    }

    // 🔹 Refresh token orqali yangi token
    async refresh(oldRefreshToken: string) {
        try {
            const payload = this.jwtService.verify(oldRefreshToken); // agar token yaroqsiz bo‘lsa → error
            const user = await this.usersService.findById(payload.sub);
            if (!user) throw new UnauthorizedException('User topilmadi');

            const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email);
            return { accessToken, refreshToken, user };
        } catch (err) {
            console.error(err);
            throw new UnauthorizedException('Refresh token yaroqsiz');
        }
    }


    // 🔹 Validate refresh token va user
    async validateRefreshToken(token: string) {
        try {
            const payload = this.jwtService.verify(token);
            const user = await this.usersService.findById(payload.sub);
            return user;
        } catch (err) {
            throw new UnauthorizedException('Refresh token yaroqsiz');
        }
    }
}
