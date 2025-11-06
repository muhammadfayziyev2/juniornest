import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/user.entity';

@Entity('analyses')
export class Analysis {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.analyses, { eager: false })
    user: User;

    @Column()
    userId: string;

    @Column('text')
    codeHash: string;

    @Column('text')
    feedback: string | null;

    @Column('text', { nullable: true })
    code?: string;

    @CreateDateColumn()
    createdAt: Date;
}
