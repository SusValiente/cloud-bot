import { Entity, Unique, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { IDropbox } from '../models/dropbox';
import { User } from '../entities/user';

@Entity()
@Unique(['email'])
export class Dropbox implements IDropbox {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 250, nullable: false, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 250, nullable: false })
    password: string;

    @OneToOne(type => User)
    @JoinColumn()
    user: User;
}
