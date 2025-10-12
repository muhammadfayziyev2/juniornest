import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User } from './users.entity';
import { v4 as uuid } from 'uuid';

@Injectable()
export class UsersService {
    private users: User[] = [];

    async createUser(email: string, password: string) {
        const hashed = await bcrypt.hash(password, 10);
        const user: User = { id: uuid(), email, password: hashed };
        this.users.push(user);
        return user;
    }

    async findByEmail(email: string): Promise<User | undefined> {
        return this.users.find((u) => u.email === email);
    }

    async validateUser(email: string, password: string): Promise<User | null> {
        const user = await this.findByEmail(email);
        if (user && (await bcrypt.compare(password, user.password))) {
            return user;
        }
        return null;
    }
}
