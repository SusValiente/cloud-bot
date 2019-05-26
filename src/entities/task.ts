import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { ITask } from '../models/task';
import { User } from '../entities/user';

@Entity()
export class Task implements ITask {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 250, nullable: false, unique: true })
    name: string;

    @Column({ type: 'varchar', length: 250, nullable: false })
    description: string;

    @ManyToOne(type => User, user => user.tasks)
    user: User;
}
