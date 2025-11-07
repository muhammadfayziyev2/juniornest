import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,
    ) { }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepo.findOne({ where: { email } });
    }

    async createUser(email: string, password: string, avatarUrl?: string, nameUser?:string): Promise<User> {
        const user = this.userRepo.create({ email, password, avatarUrl,  nameUser});
        return this.userRepo.save(user);
    }

    async save(user: User): Promise<User> {
        return this.userRepo.save(user);
    }
}
