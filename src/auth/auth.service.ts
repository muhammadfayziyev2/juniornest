import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService) { }

    async register(email: string, password: string) {
        const user = await this.usersService.createUser(email, password);
        const token = await this.jwtService.signAsync({ sub: user.id, email: user.email });
        return { token };
    }

    async login(email: string, password: string) {
        const user = await this.usersService.validateUser(email, password);
        if (!user) throw new UnauthorizedException('Email yoki parol xato');
        const token = await this.jwtService.signAsync({ sub: user.id, email: user.email });
        return { token };
    }
}
