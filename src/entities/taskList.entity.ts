import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { ITask } from '../models/task.model';
import { IUser } from '../models/user.model';
import { User } from './user.entity';
import { Task } from './task.entity';
import { ITaskList } from '../models/taskList.model';

@Entity()
export class TaskList implements ITaskList {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 250, nullable: false, unique: true })
    name: string;

    @ManyToOne(type => User, user => user.taskLists, { cascade: true, onDelete: 'CASCADE' })
    user: IUser;

    @OneToMany(type => Task, task => task.taskList)
    tasks: ITask[];
}
