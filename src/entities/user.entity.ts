import { Entity, Unique, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { IUser } from '../models/user.model';
import { TaskList } from './taskList.entity';
import { Dropbox } from './dropbox.entity';

@Entity()
@Unique(['username'])
export class User implements IUser {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 250, nullable: false, unique: true })
    username: string;

    @Column({ type: 'varchar', length: 250, nullable: false })
    password: string;

    @OneToOne(type => Dropbox)
    @JoinColumn()
    dropbox: Dropbox;

    @OneToMany(type => TaskList, list => list.user)
    taskLists: TaskList[];
}
