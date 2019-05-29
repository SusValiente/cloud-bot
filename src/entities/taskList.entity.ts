import { Entity, ManyToOne, OneToMany, Unique, Column } from 'typeorm';
import { ITaskList } from '../models/taskList.model';
import { User } from './user.entity';
import { Task } from './task.entity';

@Entity()
export class TaskList implements ITaskList {
    @Column({ type: 'varchar', length: 250, nullable: false, unique: true })
    name: string;

    @ManyToOne(type => User, user => user.taskLists)
    user: User;

    @OneToMany(type => Task, task => task.taskList)
    tasks: Task[];
}
