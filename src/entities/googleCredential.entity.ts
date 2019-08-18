import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { User } from './user.entity';
import { IGoogleCredential } from '../models/googleToken.model';

@Entity()
export class GoogleCredential implements IGoogleCredential {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', nullable: false })
    access_token: string;

    @Column({ type: 'varchar', nullable: false })
    refresh_token: string;

    @Column({ type: 'varchar', nullable: false })
    scope: string;

    @Column({ type: 'varchar', nullable: false })
    token_type: string;

    @Column({ type: 'varchar', nullable: true })
    id_token: string;

    @Column({ type: 'varchar', nullable: false })
    expiry_date: number;

    @OneToOne(type => User, user => user.googleCredential, { cascade: true, onDelete: 'CASCADE' })
    user: User;
}
