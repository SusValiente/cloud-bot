import { Entity, Unique, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { IUser } from '../models/user.model';
import { TaskList } from './taskList.entity';
import { GoogleCredential } from './googleCredential.entity';

@Entity()
@Unique(['username'])
export class User implements IUser {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 250, nullable: false, unique: true })
    username: string;

    @Column({ type: 'varchar', length: 250, nullable: false })
    password: string;

    @Column({ type: 'varchar', nullable: true })
    dropboxToken: string;

    @Column({ type: 'varchar', nullable: true })
    googleEmail: string;

    @OneToMany(type => TaskList, list => list.user)
    taskLists: TaskList[];

    @OneToOne(type => GoogleCredential, credential => credential.user)
    @JoinColumn()
    googleCredential: GoogleCredential;
}
