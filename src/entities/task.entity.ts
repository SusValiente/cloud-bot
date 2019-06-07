import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ITask } from '../models/task.model';
import { TaskList } from './taskList.entity';
import { ITaskList } from '../models/taskList.model';

@Entity()
export class Task implements ITask {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 250, nullable: false })
    description: string;

    @Column({ type: 'boolean', nullable: false, default: false })
    completed: boolean;

    @ManyToOne(type => TaskList, list => list.tasks, { cascade: true, onDelete: 'CASCADE' })
    taskList: ITaskList;
}
