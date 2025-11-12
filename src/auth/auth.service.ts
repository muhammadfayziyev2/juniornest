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

    async register(dto: RegisterDto) {
        const existing = await this.usersService.findByEmail(dto.email);
        if (existing) throw new BadRequestException('Bu email allaqachon ro‘yxatdan o‘tgan');

        const hashed = await bcrypt.hash(dto.password, 10);
        const avatarUrl = `https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${encodeURIComponent(dto.email)}`;
        const user = await this.usersService.createUser(dto.email, hashed, avatarUrl, dto.nameUser);

        const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email);
        return { user, accessToken, refreshToken };
    }

    async login(dto: LoginDto) {
        const user = await this.usersService.findByEmail(dto.email);
        if (!user) throw new UnauthorizedException('Foydalanuvchi topilmadi');

        const match = await bcrypt.compare(dto.password, user.password);
        if (!match) throw new UnauthorizedException('Parol noto‘g‘ri');

        const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email);
        return { user, accessToken, refreshToken };
    }

    async logoutWithPassword(userId: string, password: string, refreshToken: string) {
        const user = await this.usersService.findById(userId);
        if (!user) throw new UnauthorizedException('Foydalanuvchi topilmadi');

        const match = await bcrypt.compare(password, user.password);
        if (!match) throw new UnauthorizedException('Parol noto‘g‘ri');

        await this.blacklistRepo.save({ token: refreshToken });
        return { message: 'Parol to‘g‘ri, foydalanuvchi chiqdi' };
    }
    verifyRefreshToken(token: string) {
        try {
            return this.jwtService.verify(token);
        } catch (err) {
            throw new UnauthorizedException('Refresh token yaroqsiz');
        }
    }

    async isTokenBlacklisted(token: string): Promise<boolean> {
        const exists = await this.blacklistRepo.findOne({ where: { token } });
        return !!exists;
    }

    async generateTokens(userId: string, email: string) {
        const payload = { sub: userId, email };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });
        return { accessToken, refreshToken };
    }

    async refresh(oldRefreshToken: string) {
        try {
            const payload = this.jwtService.verify(oldRefreshToken); 
            const user = await this.usersService.findById(payload.sub);
            if (!user) throw new UnauthorizedException('User topilmadi');

            const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email);
            return { accessToken, refreshToken, user };
        } catch (err) {
            console.error(err);
            throw new UnauthorizedException('Refresh token yaroqsiz');
        }
    }

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
