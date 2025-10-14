import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    async register(dto: RegisterDto) {
        const existing = await this.usersService.findByEmail(dto.email);
        if (existing) throw new BadRequestException('Bu email allaqachon ro‘yxatdan o‘tgan');

        const hashed = await bcrypt.hash(dto.password, 10);
        const user = await this.usersService.createUser(dto.email, hashed);

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

    async generateToken(userId: string, email: string) {
        return this.jwtService.sign({ sub: userId, email });
    }
}
