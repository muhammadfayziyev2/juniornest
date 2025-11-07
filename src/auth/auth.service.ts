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

        const token = await this.generateToken(user.id, user.email);
        
        return { user, access_token: token };
    }

    async login(dto: LoginDto) {
        const user = await this.usersService.findByEmail(dto.email);
        if (!user) throw new UnauthorizedException('Foydalanuvchi topilmadi');

        const match = await bcrypt.compare(dto.password, user.password);
        if (!match) throw new UnauthorizedException('Parol noto‘g‘ri');

        const token = await this.generateToken(user.id, user.email);
        return { user, access_token: token };
    }

    async logout(token: string) {
        await this.blacklistRepo.save({ token });
        return { message: 'Foydalanuvchi tizimdan chiqdi' };
    }

    async isTokenBlacklisted(token: string): Promise<boolean> {
        const exists = await this.blacklistRepo.findOne({ where: { token } });
        return !!exists;
    }

    async generateToken(userId: string, email: string) {
        return this.jwtService.sign({ sub: userId, email });
    }
}
