import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { IGoogleCredential } from '../models/googleToken.model';

@Entity()
export class GoogleCredential implements IGoogleCredential {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    access_token: string;

    @Column({ type: 'varchar' })
    refresh_token: string;

    @Column({ type: 'varchar' })
    scope: string;

    @Column({ type: 'varchar' })
    token_type: string;

    @Column({ type: 'varchar' })
    expiry_date: number;

    @OneToOne(type => User, user => user.googleCredential)
    @JoinColumn()
    user: User;
}
