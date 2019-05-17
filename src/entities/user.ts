import { Entity, Unique, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IUser } from '../models/user';

@Entity()
@Unique(['username'])
export class User implements IUser {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 250, nullable: false, unique: true })
    username: string;

    @Column({ type: 'varchar', length: 250, nullable: false })
    password: string;
}
