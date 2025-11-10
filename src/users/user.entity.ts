import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    nameUser: string;  

    @CreateDateColumn()
    createdAt: Date;

    @Column({ nullable: true })
    avatarUrl: string;

    @Column({ type: 'int', default: 10 })
    daily_limit: number;

    @Column({ type: 'date', default: () => 'CURRENT_DATE' })
    last_request_date: Date;
}