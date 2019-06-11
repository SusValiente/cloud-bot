import { Entity, Unique, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { IUser } from '../models/user.model';
import { Dropbox } from './dropbox.entity';
import { TaskList } from './taskList.entity';

@Entity()
@Unique(['username'])
export class User implements IUser {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 250, nullable: false, unique: true })
    username: string;

    @Column({ type: 'varchar', length: 250, nullable: false })
    password: string;

    @OneToOne(type => Dropbox, { cascade: true, onDelete: 'CASCADE' })
    @JoinColumn()
    dropbox: Dropbox;

    @OneToMany(type => TaskList, list => list.user)
    taskLists: TaskList[];
}
