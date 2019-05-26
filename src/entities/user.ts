import { Entity, Unique, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { IUser } from '../models/user';
import { Task } from './task';
import { Dropbox } from './dropbox';

@Entity()
@Unique(['username'])
export class User implements IUser {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 250, nullable: false, unique: true })
    username: string;

    @Column({ type: 'varchar', length: 250, nullable: false })
    password: string;

    @OneToMany(type => Task, task => task.user)
    tasks: Task[];

    @OneToOne(type => Dropbox)
    @JoinColumn()
    dropbox: Dropbox;
}
