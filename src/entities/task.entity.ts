import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { ITask } from '../models/task.model';
import { TaskList } from './taskList.entity';

@Entity()
export class Task implements ITask {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 250, nullable: false, unique: true })
    name: string;

    @Column({ type: 'varchar', length: 250, nullable: false })
    description: string;

    @ManyToOne(type => TaskList, list => list.tasks)
    taskList: TaskList;
}
